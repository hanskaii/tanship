import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { ApiResponse } from "@/helpers/response.helper";
import { ApiError } from "@/helpers/errors.helper";
import type { HonoEnv } from "@/types/hono.types";

const KV_MAX_TTL_S = 2_592_000; // 30 days
const MAX_STEPS = 50;
const MAX_RUNS = 50;
const MAX_RUN_HISTORY = 10;

const WorkflowStepSchema = z.object({
	id: z.string().min(1).max(64),
	path: z.string().min(1).startsWith("/"),
	method: z.enum(["GET", "POST", "DELETE"]).default("POST"),
	body: z.record(z.string(), z.unknown()).optional()
});

const CreateSchema = z.object({
	name: z.string().min(1).max(256),
	description: z.string().max(2000).optional(),
	steps: z.array(WorkflowStepSchema).min(1).max(MAX_STEPS)
});

interface WorkflowDef {
	id: string;
	name: string;
	description: string | null;
	steps: z.infer<typeof WorkflowStepSchema>[];
	created_at: number;
}

interface RunMeta {
	id: string;
	workflow_id: string;
	step_ids: string[];
	status: "running" | "completed" | "failed";
	started_at: number;
	completed_at: number | null;
	total_steps: number;
	completed_steps: number;
}

interface StepResult {
	step_id: string;
	index: number;
	status: number;
	duration_ms: number;
	result: unknown;
	error: string | null;
	completed_at: number;
}

function wfKey(id: string): string {
	return `wf:${id}`;
}
function wfRunsKey(id: string): string {
	return `wf:${id}:runs`;
}
function runKey(runId: string): string {
	return `wfrun:${runId}`;
}
function stepKey(runId: string, stepId: string): string {
	return `wfrun:${runId}:step:${stepId}`;
}

function newId(): string {
	return (
		crypto.randomUUID().split("-")[0] +
		Date.now().toString(36) +
		Math.random().toString(36).slice(2, 6)
	);
}

/** Fire-and-forget step executor — writes results to KV, caller polls run status. */
async function executeSteps(
	steps: z.infer<typeof WorkflowStepSchema>[],
	runId: string,
	kv: KVNamespace,
	baseUrl: string
): Promise<void> {
	const meta: RunMeta = {
		id: runId,
		workflow_id: "",
		step_ids: steps.map((s) => s.id),
		status: "running",
		started_at: Date.now(),
		completed_at: null,
		total_steps: steps.length,
		completed_steps: 0
	};

	for (let i = 0; i < steps.length; i++) {
		const step = steps[i];
		const stepStart = Date.now();
		let status = 200;
		let result: unknown = null;
		let error: string | null = null;

		try {
			const fetchOpts: RequestInit = {
				method: step.method,
				headers: {
					"Content-Type": "application/json",
					Accept: "application/json"
				}
			};
			if (step.body && step.method !== "GET") {
				fetchOpts.body = JSON.stringify(step.body);
			}
			const resp = await fetch(`${baseUrl}${step.path}`, fetchOpts);
			status = resp.status;
			const text = await resp.text();
			try {
				result = JSON.parse(text);
			} catch {
				result = text;
			}
		} catch (err: any) {
			error = err?.message ?? "Unknown error";
			status = 0;
		}

		const stepResult: StepResult = {
			step_id: step.id,
			index: i,
			status,
			duration_ms: Date.now() - stepStart,
			result,
			error,
			completed_at: Date.now()
		};

		await kv.put(stepKey(runId, step.id), JSON.stringify(stepResult), {
			expirationTtl: KV_MAX_TTL_S
		});

		meta.completed_steps = i + 1;
		await kv.put(runKey(runId), JSON.stringify(meta), {
			expirationTtl: KV_MAX_TTL_S
		});

		// Fail-fast on error
		if (error) {
			meta.status = "failed";
			meta.completed_at = Date.now();
			await kv.put(runKey(runId), JSON.stringify(meta), {
				expirationTtl: KV_MAX_TTL_S
			});
			return;
		}
	}

	meta.status = "completed";
	meta.completed_at = Date.now();
	await kv.put(runKey(runId), JSON.stringify(meta), {
		expirationTtl: KV_MAX_TTL_S
	});
}

const handler = new Hono<HonoEnv>()
	// POST /v1/agent/workflow — create a workflow definition
	.post(
		"/",
		zValidator("json", CreateSchema, (result, c) => {
			if (!result.success) {
				return ApiResponse.error(c, result.error.message, 400);
			}
		}),
		async (c) => {
			const { name, description, steps } = c.req.valid("json");
			const id = newId();
			const now = Date.now();
			const def: WorkflowDef = {
				id,
				name,
				description: description ?? null,
				steps,
				created_at: now
			};
			await c.env.KV.put(wfKey(id), JSON.stringify(def), {
				expirationTtl: KV_MAX_TTL_S
			});
			await c.env.KV.put(wfRunsKey(id), JSON.stringify([]), {
				expirationTtl: KV_MAX_TTL_S
			});
			return ApiResponse.created(c, "Workflow created", {
				workflow_id: id,
				name,
				step_count: steps.length,
				define_url: `/v1/agent/workflow/${id}`,
				run_url: `/v1/agent/workflow/${id}/run`
			});
		}
	)

	// GET /v1/agent/workflow/:id — get workflow definition
	.get("/:id", async (c) => {
		const id = c.req.param("id");
		const raw = await c.env.KV.get(wfKey(id), "json");
		if (!raw) throw ApiError.notFound(`Workflow ${id} not found`);
		return ApiResponse.ok(c, "Workflow definition", raw as WorkflowDef);
	})

	// POST /v1/agent/workflow/:id/run — execute workflow (fire-and-forget)
	.post("/:id/run", async (c) => {
		const workflowId = c.req.param("id");
		const raw = await c.env.KV.get(wfKey(workflowId), "json");
		if (!raw) throw ApiError.notFound(`Workflow ${workflowId} not found`);
		const workflow = raw as WorkflowDef;

		const runsRaw = await c.env.KV.get(wfRunsKey(workflowId));
		const runs: RunMeta[] = runsRaw ? JSON.parse(runsRaw) : [];
		if (runs.filter((r) => r.status === "running").length >= 3) {
			throw ApiError.badRequest(
				"Max 3 concurrent runs per workflow (3 already running)"
			);
		}

		const runId = newId();
		const now = Date.now();
		const meta: RunMeta = {
			id: runId,
			workflow_id: workflowId,
			step_ids: workflow.steps.map((s) => s.id),
			status: "running",
			started_at: now,
			completed_at: null,
			total_steps: workflow.steps.length,
			completed_steps: 0
		};

		await c.env.KV.put(runKey(runId), JSON.stringify(meta), {
			expirationTtl: KV_MAX_TTL_S
		});

		const updatedRuns: RunMeta[] = [meta, ...runs].slice(0, MAX_RUNS);
		await c.env.KV.put(wfRunsKey(workflowId), JSON.stringify(updatedRuns), {
			expirationTtl: KV_MAX_TTL_S
		});

		// Derive base URL from incoming request
		const reqUrl = c.req.url;
		const baseUrl = reqUrl.replace(
			/\/v1\/agent\/workflow\/[^/]+\/run$/,
			""
		);

		c.executionCtx.waitUntil(
			executeSteps(workflow.steps, runId, c.env.KV, baseUrl)
		);

		return ApiResponse.created(c, "Workflow run started", {
			run_id: runId,
			workflow_id: workflowId,
			status: "running",
			total_steps: workflow.steps.length,
			poll_url: `/v1/agent/workflow/run/${runId}`
		});
	})

	// GET /v1/agent/workflow/:id/runs — list runs for a workflow
	.get("/:id/runs", async (c) => {
		const id = c.req.param("id");
		const raw = await c.env.KV.get(wfKey(id), "json");
		if (!raw) throw ApiError.notFound(`Workflow ${id} not found`);
		const runsRaw = await c.env.KV.get(wfRunsKey(id));
		const runs: RunMeta[] = runsRaw ? JSON.parse(runsRaw) : [];
		return ApiResponse.ok(c, "Workflow runs", {
			workflow_id: id,
			count: runs.length,
			runs: runs.slice(0, MAX_RUN_HISTORY)
		});
	})

	// GET /v1/agent/workflow/run/:run_id — get run + step results
	.get("/run/:run_id", async (c) => {
		const runId = c.req.param("run_id");
		const raw = await c.env.KV.get(runKey(runId), "json");
		if (!raw) throw ApiError.notFound(`Run ${runId} not found`);
		const meta = raw as RunMeta;

		const steps: StepResult[] = [];
		for (const sid of meta.step_ids) {
			const stepRaw = await c.env.KV.get(stepKey(runId, sid));
			if (stepRaw) steps.push(JSON.parse(stepRaw));
		}

		return ApiResponse.ok(c, `Run ${meta.status}`, {
			...meta,
			steps
		});
	});

export default handler;

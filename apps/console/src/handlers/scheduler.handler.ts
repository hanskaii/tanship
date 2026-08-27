import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

import { ApiError } from "@/helpers/errors.helper";
import { ApiResponse } from "@/helpers/response.helper";
import type { HonoEnv } from "@/types/hono.types";
import type { Scheduler } from "@/durable-objects/scheduler";

const NAME_RE = /^[a-zA-Z0-9_-]{1,64}$/;

const ScheduleSchema = z.object({
	name: z.string().regex(NAME_RE),
	url: z.string().url(),
	method: z.enum(["GET", "POST", "PUT"]).default("POST"),
	headers: z.record(z.string(), z.string()).optional(),
	payload: z.unknown().optional(),
	delaySeconds: z.number().int().min(0).max(2592000).default(0),
	executeAt: z.number().int().min(0).optional()
});

const NameSchema = z.object({
	name: z.string().regex(NAME_RE)
});

const JobIdSchema = z.object({
	name: z.string().regex(NAME_RE),
	jobId: z.string().min(1).max(128)
});

const RecurringSchema = z.object({
	name: z.string().regex(NAME_RE),
	url: z.string().url(),
	method: z.enum(["GET", "POST", "PUT"]).default("POST"),
	headers: z.record(z.string(), z.string()).optional(),
	payload: z.unknown().optional(),
	cron: z.string().min(9).max(64)
});

function stub(env: HonoEnv["Bindings"], name: string) {
	const id = env.SCHEDULER.idFromName(name);
	return env.SCHEDULER.get(id) as DurableObjectStub<Scheduler>;
}

const schedulerHandler = new Hono<HonoEnv>()
	.post("/schedule", zValidator("json", ScheduleSchema), async (c) => {
		const { name, url, method, headers, payload, delaySeconds, executeAt } =
			c.req.valid("json");

		const dueAt =
			executeAt && executeAt > Date.now()
				? executeAt
				: Date.now() + delaySeconds * 1000;

		if (dueAt - Date.now() > 30 * 24 * 60 * 60 * 1000) {
			throw ApiError.badRequest(
				"executeAt/delaySeconds > 30d not supported"
			);
		}

		const jobId = crypto.randomUUID();
		const scheduler = stub(c.env, name);
		const job = (await scheduler.schedule({
			id: jobId,
			url,
			method,
			headers,
			payload,
			dueAt
		})) as any;

		return ApiResponse.ok(c, "Job scheduled", {
			name,
			jobId: job.id,
			dueAt: job.dueAt,
			url: job.url,
			method: job.method
		});
	})

	.post("/list", zValidator("json", NameSchema), async (c) => {
		const { name } = c.req.valid("json");
		const scheduler = stub(c.env, name);
		const jobs = (await scheduler.list()) as any[];
		return ApiResponse.ok(c, "Jobs listed", {
			name,
			count: jobs.length,
			jobs: jobs.map((j) => ({
				id: j.id,
				url: j.url,
				method: j.method,
				dueAt: j.dueAt,
				status: j.status,
				fireCount: j.fireCount,
				lastError: j.lastError ?? null
			}))
		});
	})

	.post("/get", zValidator("json", JobIdSchema), async (c) => {
		const { name, jobId } = c.req.valid("json");
		const scheduler = stub(c.env, name);
		const job = (await scheduler.get(jobId)) as any;
		if (!job) throw ApiError.notFound(`Job "${jobId}" not found`);
		return ApiResponse.ok(c, "Job retrieved", { name, job });
	})

	.post("/cancel", zValidator("json", JobIdSchema), async (c) => {
		const { name, jobId } = c.req.valid("json");
		const scheduler = stub(c.env, name);
		const removed = await scheduler.cancel(jobId);
		if (!removed) throw ApiError.notFound(`Job "${jobId}" not found`);
		return ApiResponse.ok(c, "Job cancelled", { name, jobId });
	})

	.post("/recurring", zValidator("json", RecurringSchema), async (c) => {
		const { name, url, method, headers, payload, cron } =
			c.req.valid("json");

		// Quick reject malformed cron before the DO round-trip
		if (cron.trim().split(/\s+/).length !== 5) {
			throw ApiError.badRequest(
				"cron must be a 5-field expression: 'minute hour day month dow'"
			);
		}

		const jobId = crypto.randomUUID();
		const scheduler = stub(c.env, name);
		const job = (await scheduler.scheduleRecurring({
			id: jobId,
			url,
			method,
			headers,
			payload,
			cron
		})) as any;

		return ApiResponse.ok(c, "Recurring job scheduled", {
			name,
			jobId: job.id,
			cron: job.cron,
			dueAt: job.dueAt,
			nextRunAt: job.nextRunAt,
			url: job.url,
			method: job.method
		});
	});

export default schedulerHandler;

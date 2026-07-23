import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

import { ApiError } from "@/helpers/errors.helper";
import { ApiResponse } from "@/helpers/response.helper";
import type { HonoEnv } from "@/types/hono.types";

const CreateSandboxSchema = z.object({
	image: z.string().default("python:3.11-slim"),
	timeout: z.number().int().min(10).max(3600).default(300),
	cpu: z.number().min(0.25).max(8).default(1),
	memory: z.number().int().min(128).max(16384).default(512),
	env: z.record(z.string(), z.string()).optional(),
	workdir: z.string().optional()
});

const ExecSchema = z.object({
	sandbox_id: z.string().min(1),
	command: z.union([z.string().min(1), z.array(z.string().min(1)).min(1)])
});

const SandboxIdSchema = z.object({
	sandbox_id: z.string().min(1)
});

/** Forward a request to the Modal relay and return the parsed JSON. */
async function relay(
	baseUrl: string,
	apiToken: string,
	path: string,
	body: unknown
): Promise<unknown> {
	const res = await fetch(`${baseUrl}${path}`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${apiToken}`
		},
		body: JSON.stringify(body)
	});

	if (!res.ok) {
		const text = await res.text().catch(() => res.statusText);
		throw ApiError.badGateway(`Modal relay error (${res.status}): ${text}`);
	}

	return res.json();
}

const modalHandler = new Hono<HonoEnv>()
	.post(
		"/sandbox/create",
		zValidator("json", CreateSandboxSchema),
		async (c) => {
			const input = c.req.valid("json");

			const result = (await relay(
				c.env.MODAL_API_URL,
				c.env.MODAL_API_TOKEN,
				"/sandbox/create",
				input
			)) as { sandbox_id: string; status: string };

			return ApiResponse.ok(c, "Sandbox created", result);
		}
	)
	.post("/sandbox/exec", zValidator("json", ExecSchema), async (c) => {
		const input = c.req.valid("json");

		const result = (await relay(
			c.env.MODAL_API_URL,
			c.env.MODAL_API_TOKEN,
			"/sandbox/exec",
			input
		)) as { stdout: string; stderr: string; exit_code: number };

		return ApiResponse.ok(c, "Command executed", result);
	})
	.post("/sandbox/status", zValidator("json", SandboxIdSchema), async (c) => {
		const input = c.req.valid("json");

		const result = (await relay(
			c.env.MODAL_API_URL,
			c.env.MODAL_API_TOKEN,
			"/sandbox/status",
			input
		)) as { sandbox_id: string; status: string; exit_code?: number };

		return ApiResponse.ok(c, "Sandbox status retrieved", result);
	})
	.post(
		"/sandbox/terminate",
		zValidator("json", SandboxIdSchema),
		async (c) => {
			const input = c.req.valid("json");

			const result = (await relay(
				c.env.MODAL_API_URL,
				c.env.MODAL_API_TOKEN,
				"/sandbox/terminate",
				input
			)) as { sandbox_id: string; terminated: boolean };

			return ApiResponse.ok(c, "Sandbox terminated", result);
		}
	);

export default modalHandler;

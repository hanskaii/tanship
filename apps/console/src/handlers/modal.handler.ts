import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { getSandbox } from "@cloudflare/sandbox";

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
	command: z.string().min(1)
});

const SandboxIdSchema = z.object({
	sandbox_id: z.string().min(1)
});

const modalHandler = new Hono<HonoEnv>()
	.post(
		"/sandbox/create",
		zValidator("json", CreateSandboxSchema),
		async (c) => {
			const { timeout } = c.req.valid("json");

			const id = `sb-${crypto.randomUUID()}`;
			const sandbox = getSandbox(c.env.Sandbox, id, {
				sleepAfter: `${timeout}s`
			});

			try {
				// Mark as active
				await sandbox.writeFile("/workspace/.active", "true");
			} catch (err: any) {
				throw ApiError.server(
					`Failed to initialize sandbox: ${err.message}`
				);
			}

			return ApiResponse.ok(c, "Sandbox created", {
				sandbox_id: id,
				status: "running"
			});
		}
	)
	.post("/sandbox/exec", zValidator("json", ExecSchema), async (c) => {
		const { sandbox_id, command } = c.req.valid("json");

		const sandbox = getSandbox(c.env.Sandbox, sandbox_id);

		// Check if active first
		try {
			const file = await sandbox.readFile("/workspace/.active");
			if (file.content !== "true") {
				throw new Error("Inactive");
			}
		} catch {
			await sandbox.destroy();
			throw ApiError.notFound("Sandbox not found or terminated");
		}

		try {
			const res = await sandbox.exec(command);
			return ApiResponse.ok(c, "Command executed", {
				stdout: res.stdout,
				stderr: res.stderr,
				exit_code: res.exitCode
			});
		} catch (err: any) {
			throw ApiError.server(`Execution failed: ${err.message}`);
		}
	})
	.post("/sandbox/status", zValidator("json", SandboxIdSchema), async (c) => {
		const { sandbox_id } = c.req.valid("json");

		const sandbox = getSandbox(c.env.Sandbox, sandbox_id);

		try {
			const file = await sandbox.readFile("/workspace/.active");
			if (file.content === "true") {
				return ApiResponse.ok(c, "Sandbox status retrieved", {
					sandbox_id,
					status: "running"
				});
			}
		} catch {
			// Clean up the lazily created empty instance if it wasn't active
			await sandbox.destroy();
		}

		return ApiResponse.ok(c, "Sandbox status retrieved", {
			sandbox_id,
			status: "terminated"
		});
	})
	.post(
		"/sandbox/terminate",
		zValidator("json", SandboxIdSchema),
		async (c) => {
			const { sandbox_id } = c.req.valid("json");

			const sandbox = getSandbox(c.env.Sandbox, sandbox_id);

			try {
				await sandbox.destroy();
			} catch (err: any) {
				throw ApiError.server(
					`Failed to terminate sandbox: ${err.message}`
				);
			}

			return ApiResponse.ok(c, "Sandbox terminated", {
				sandbox_id,
				terminated: true
			});
		}
	);

export default modalHandler;

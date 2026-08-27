import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

import { ApiResponse } from "@/helpers/response.helper";
import type { HonoEnv } from "@/types/hono.types";

const LockSchema = z.object({
	name: z.string().min(1).max(256)
});

const HeartbeatSchema = z.object({
	name: z.string().min(1).max(256),
	owner: z.string().min(1).max(256),
	ttlMs: z
		.number()
		.int()
		.min(1000)
		.max(7 * 24 * 60 * 60 * 1000)
});

const LockHandler = new Hono<HonoEnv>()

	.post("/lock/acquire", zValidator("json", LockSchema), async (c) => {
		const { name } = c.req.valid("json");
		const id = c.env.LOCK.idFromName(name);
		const stub = c.env.LOCK.get(id);

		// For simplicity, we always use a fixed owner "api" for the demo.
		// In production, the owner would come from the authenticated payer identity.
		const result = await stub.acquire("api");

		return ApiResponse.ok(c, "Lock acquired", result);
	})
	.post("/lock/release", zValidator("json", LockSchema), async (c) => {
		const { name } = c.req.valid("json");
		const id = c.env.LOCK.idFromName(name);
		const stub = c.env.LOCK.get(id);

		// For simplicity, we always use a fixed owner "api" for the demo.
		const released = await stub.release("api");

		return ApiResponse.ok(c, "Lock released", { released });
	})
	.post("/lock/status", zValidator("json", LockSchema), async (c) => {
		const { name } = c.req.valid("json");
		const id = c.env.LOCK.idFromName(name);
		const stub = c.env.LOCK.get(id);

		const state = await stub.status();

		return ApiResponse.ok(c, "Lock status", state);
	})
	.post("/lock/heartbeat", zValidator("json", HeartbeatSchema), async (c) => {
		const { name, owner, ttlMs } = c.req.valid("json");
		const id = c.env.LOCK.idFromName(name);
		const stub = c.env.LOCK.get(id);

		const result = await stub.heartbeat(owner, ttlMs);

		return ApiResponse.ok(c, "Lock heartbeat", result);
	});

export default LockHandler;

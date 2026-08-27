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

const LeaderElectSchema = z.object({
	name: z.string().min(1).max(256),
	candidateId: z.string().min(1).max(256),
	ttlMs: z
		.number()
		.int()
		.min(1000)
		.max(7 * 24 * 60 * 60 * 1000)
});

const LeaderResignSchema = z.object({
	name: z.string().min(1).max(256),
	candidateId: z.string().min(1).max(256),
	token: z.string().min(1).max(256)
});

const BarrierCreateSchema = z.object({
	name: z.string().min(1).max(256),
	required: z.number().int().min(1).max(10_000)
});

const BarrierJoinSchema = z.object({
	name: z.string().min(1).max(256),
	participantId: z.string().min(1).max(256)
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
	})
	// Leader election endpoints
	.post("/leader/elect", zValidator("json", LeaderElectSchema), async (c) => {
		const { name, candidateId, ttlMs } = c.req.valid("json");
		const id = c.env.LEADER.idFromName(name);
		const stub = c.env.LEADER.get(id);

		const result = await stub.tryAcquire(candidateId, ttlMs);

		return ApiResponse.ok(
			c,
			result.elected ? "Elected as leader" : "Election lost",
			result
		);
	})
	.post(
		"/leader/resign",
		zValidator("json", LeaderResignSchema),
		async (c) => {
			const { name, candidateId, token } = c.req.valid("json");
			const id = c.env.LEADER.idFromName(name);
			const stub = c.env.LEADER.get(id);

			const result = await stub.resign(candidateId, token);

			return ApiResponse.ok(
				c,
				result.resigned ? "Leader resigned" : "Resign rejected",
				result
			);
		}
	)
	.post(
		"/leader/status",
		zValidator("json", z.object({ name: z.string().min(1).max(256) })),
		async (c) => {
			const { name } = c.req.valid("json");
			const id = c.env.LEADER.idFromName(name);
			const stub = c.env.LEADER.get(id);

			const state = await stub.status();

			return ApiResponse.ok(c, "Leader status", state);
		}
	)
	// Barrier sync endpoints
	.post(
		"/barrier/create",
		zValidator("json", BarrierCreateSchema),
		async (c) => {
			const { name, required } = c.req.valid("json");
			const id = c.env.BARRIER.idFromName(name);
			const stub = c.env.BARRIER.get(id);

			const result = await stub.create(required);

			return ApiResponse.ok(c, "Barrier initialised", result);
		}
	)
	.post("/barrier/join", zValidator("json", BarrierJoinSchema), async (c) => {
		const { name, participantId } = c.req.valid("json");
		const id = c.env.BARRIER.idFromName(name);
		const stub = c.env.BARRIER.get(id);

		const result = await stub.join(participantId);

		return ApiResponse.ok(
			c,
			result.tripped ? "Barrier tripped" : "Participant recorded",
			result
		);
	})
	.post(
		"/barrier/status",
		zValidator("json", z.object({ name: z.string().min(1).max(256) })),
		async (c) => {
			const { name } = c.req.valid("json");
			const id = c.env.BARRIER.idFromName(name);
			const stub = c.env.BARRIER.get(id);

			const state = await stub.status();

			return ApiResponse.ok(c, "Barrier status", state);
		}
	);

export default LockHandler;

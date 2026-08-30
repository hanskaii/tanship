import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { ApiResponse } from "@/helpers/response.helper";
import type { HonoEnv } from "@/types/hono.types";
import { STATUS_CODES } from "@/constants/status.constants";

const ElectSchema = z.object({
	leaderId: z.string().min(1).max(256),
	ttlMs: z.number().int().min(1).max(86400).default(300000),
	token: z.string().optional()
});

const durableLeaderHandler = new Hono<HonoEnv>()
	.post("/elect", zValidator("json", ElectSchema), async (c) => {
		const { leaderId, ttlMs } = c.req.valid("json");
		const id = c.env.LEADER.idFromName(leaderId);
		const stub = c.env.LEADER.get(id);
		const result = await stub.tryAcquire(leaderId, ttlMs);
		if (!result.elected) {
			return ApiResponse.error(
				c,
				`Could not elect leader for ${leaderId}`,
				STATUS_CODES.CONFLICT
			);
		}
		return ApiResponse.ok(c, "Leader elected", {
			leaderId,
			token: result.token,
			generation: result.generation,
			expiresAt: result.expiresAt
		});
	})
	.post("/status", zValidator("json", ElectSchema), async (c) => {
		const { leaderId } = c.req.valid("json");
		const id = c.env.LEADER.idFromName(leaderId);
		const stub = c.env.LEADER.get(id);
		const state = await stub.status();
		return ApiResponse.ok(c, "Leader status", state);
	})
	.post("/renew", zValidator("json", ElectSchema), async (c) => {
		const { leaderId, ttlMs, token } = c.req.valid("json");
		const id = c.env.LEADER.idFromName(leaderId);
		const stub = c.env.LEADER.get(id);
		const result = await stub.heartbeat(leaderId, token || "", ttlMs);
		if (!result.renewed) {
			return ApiResponse.error(
				c,
				`Failed to renew leader lease for ${leaderId}: ${result.reason}`,
				STATUS_CODES.CONFLICT
			);
		}
		return ApiResponse.ok(c, "Leader lease renewed", result);
	})
	.post("/resign", zValidator("json", ElectSchema), async (c) => {
		const { leaderId, token } = c.req.valid("json");
		const id = c.env.LEADER.idFromName(leaderId);
		const stub = c.env.LEADER.get(id);
		const result = await stub.resign(leaderId, token || "");
		if (!result.resigned) {
			return ApiResponse.error(
				c,
				`Failed to resign from leadership (${result.reason})`,
				STATUS_CODES.CONFLICT
			);
		}
		return ApiResponse.ok(c, "Resigned from leadership");
	});

export default durableLeaderHandler;

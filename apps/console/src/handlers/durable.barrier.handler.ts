import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { ApiResponse } from "@/helpers/response.helper";
import type { HonoEnv } from "@/types/hono.types";
import { STATUS_CODES } from "@/constants/status.constants";

const BarrierCreateSchema = z.object({
	name: z.string().min(1).max(256),
	required: z.number().int().min(1).max(1000)
});

const BarrierJoinSchema = z.object({
	name: z.string().min(1).max(256),
	participantId: z.string().min(1).max(256)
});

const durableBarrierHandler = new Hono<HonoEnv>()
	.post("/create", zValidator("json", BarrierCreateSchema), async (c) => {
		const { name, required } = c.req.valid("json");
		const id = c.env.BARRIER.idFromName(name);
		const stub = c.env.BARRIER.get(id);
		const result = await stub.create(required);
		return ApiResponse.ok(c, "Barrier created", { name, ...result });
	})
	.post("/join", zValidator("json", BarrierJoinSchema), async (c) => {
		const { name, participantId } = c.req.valid("json");
		const id = c.env.BARRIER.idFromName(name);
		const stub = c.env.BARRIER.get(id);
		try {
			const result = await stub.join(participantId);
			return ApiResponse.ok(c, "Participant joined barrier", {
				name,
				...result
			});
		} catch (err: unknown) {
			const msg = err instanceof Error ? err.message : String(err);
			if (msg.includes("not initialised")) {
				return ApiResponse.error(
					c,
					`Barrier "${name}" not initialised — call /durable/barrier/create first`,
					STATUS_CODES.BAD_REQUEST
				);
			}
			throw err;
		}
	})
	.post("/status", zValidator("json", BarrierCreateSchema), async (c) => {
		const { name } = c.req.valid("json");
		const id = c.env.BARRIER.idFromName(name);
		const stub = c.env.BARRIER.get(id);
		const state = await stub.status();
		return ApiResponse.ok(c, "Barrier status", { name, ...state });
	});

export default durableBarrierHandler;

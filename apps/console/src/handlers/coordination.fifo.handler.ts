import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

import { ApiResponse } from "@/helpers/response.helper";
import type { HonoEnv } from "@/types/hono.types";

/**
 * coordination.fifo — bare FIFO push/pop via DurableFIFOQueue DO.
 * Lightweight alternative to the full durable.queue handler (which adds
 * visibility timeout, ack/dead-letter/peek/stats/drain).
 * ponytail: extend with visibility timeout when customers ask for it.
 */

const NameSchema = z.object({
	name: z
		.string()
		.min(1)
		.max(64)
		.regex(/^[a-zA-Z0-9_-]+$/, "name may only contain [a-zA-Z0-9_-]")
});

const FifoPushSchema = NameSchema.extend({
	payload: z.unknown()
});

const FifoPopSchema = NameSchema.extend({
	max: z.number().int().min(1).max(100).default(1)
});

const FifoPeekSchema = NameSchema.extend({
	max: z.number().int().min(1).max(100).default(1)
});

const coordinationFifoHandler = new Hono<HonoEnv>()
	.post("/push", zValidator("json", FifoPushSchema), async (c) => {
		const { name, payload } = c.req.valid("json");

		let payloadStr: string;
		try {
			payloadStr = JSON.stringify(payload ?? null);
		} catch {
			payloadStr = String(payload ?? null);
		}
		if (payloadStr.length > 25_000) {
			throw new Error(
				`Payload too large: ${payloadStr.length} bytes (max 25,000)`
			);
		}

		const id = c.env.DURABLE_QUEUE.idFromName(name);
		const stub = c.env.DURABLE_QUEUE.get(id);
		const result = await stub.push(payloadStr);

		return ApiResponse.ok(c, "Message pushed to FIFO", {
			name,
			id: result.id,
			enqueuedAt: result.enqueuedAt
		});
	})
	.post("/pop", zValidator("json", FifoPopSchema), async (c) => {
		const { name, max } = c.req.valid("json");

		const id = c.env.DURABLE_QUEUE.idFromName(name);
		const stub = c.env.DURABLE_QUEUE.get(id);
		const items = await stub.pop(max, 60); // 60s visibility timeout

		const messages = items.map((item) => {
			let payload: unknown;
			try {
				payload = JSON.parse(item.payload);
			} catch {
				payload = item.payload;
			}
			return {
				id: item.id,
				payload,
				enqueuedAt: item.enqueuedAt,
				deliveryAttempts: item.deliveryAttempts
			};
		});

		return ApiResponse.ok(c, "Messages popped from FIFO", {
			name,
			count: messages.length,
			messages
		});
	})
	.post("/peek", zValidator("json", FifoPeekSchema), async (c) => {
		const { name, max } = c.req.valid("json");

		const id = c.env.DURABLE_QUEUE.idFromName(name);
		const stub = c.env.DURABLE_QUEUE.get(id);
		const items = await stub.peek(max);

		const messages = items.map((item) => {
			let payload: unknown;
			try {
				payload = JSON.parse(item.payload);
			} catch {
				payload = item.payload;
			}
			return {
				id: item.id,
				payload,
				enqueuedAt: item.enqueuedAt
			};
		});

		return ApiResponse.ok(c, "Messages peeked from FIFO", {
			name,
			count: messages.length,
			messages
		});
	});

export default coordinationFifoHandler;

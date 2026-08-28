import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

import { ApiError } from "@/helpers/errors.helper";
import { ApiResponse } from "@/helpers/response.helper";
import type { HonoEnv } from "@/types/hono.types";

// ponytail: visibilitySeconds default=30, max=3600 — bump when customers ask
const MAX_BATCH = 100;
const DEFAULT_VISIBILITY = 30;

const NameSchema = z.object({
	name: z
		.string()
		.min(1)
		.max(64)
		.regex(/^[a-zA-Z0-9_-]+$/, "name may only contain [a-zA-Z0-9_-]")
});

const PushSchema = NameSchema.extend({
	payload: z.unknown(),
	delaySeconds: z.number().int().min(0).max(86400).default(0)
});

const PopSchema = NameSchema.extend({
	max: z.number().int().min(1).max(MAX_BATCH).default(1),
	visibilitySeconds: z
		.number()
		.int()
		.min(1)
		.max(3600)
		.default(DEFAULT_VISIBILITY)
});

const PeekSchema = NameSchema.extend({
	max: z.number().int().min(1).max(MAX_BATCH).default(1)
});

const AckSchema = NameSchema.extend({
	id: z.string().min(1).max(128)
});

const durableQueueHandler = new Hono<HonoEnv>()
	.post("/push", zValidator("json", PushSchema), async (c) => {
		const { name, payload, delaySeconds } = c.req.valid("json");

		let payloadStr: string;
		try {
			payloadStr = JSON.stringify(payload ?? null);
		} catch {
			throw ApiError.badRequest("Payload must be JSON-serializable");
		}
		if (payloadStr.length > 25_000) {
			throw ApiError.badRequest(
				`Payload too large: ${payloadStr.length} bytes (max 25,000)`
			);
		}

		const id = c.env.DURABLE_QUEUE.idFromName(name);
		const stub = c.env.DURABLE_QUEUE.get(id);
		const result = await stub.push(payloadStr, delaySeconds);

		return ApiResponse.ok(c, "Message pushed", {
			name,
			id: result.id,
			enqueuedAt: result.enqueuedAt,
			delaySeconds
		});
	})

	.post("/pop", zValidator("json", PopSchema), async (c) => {
		const { name, max, visibilitySeconds } = c.req.valid("json");

		const id = c.env.DURABLE_QUEUE.idFromName(name);
		const stub = c.env.DURABLE_QUEUE.get(id);
		const items = await stub.pop(max, visibilitySeconds);

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

		return ApiResponse.ok(c, "Messages popped", {
			name,
			count: messages.length,
			messages,
			visibilitySeconds
		});
	})

	.post("/peek", zValidator("json", PeekSchema), async (c) => {
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

		return ApiResponse.ok(c, "Messages peeked", {
			name,
			count: messages.length,
			messages
		});
	})

	.post("/ack", zValidator("json", AckSchema), async (c) => {
		const { name, id } = c.req.valid("json");

		const queueId = c.env.DURABLE_QUEUE.idFromName(name);
		const stub = c.env.DURABLE_QUEUE.get(queueId);
		const found = await stub.ack(id);

		if (!found) {
			throw ApiError.notFound(
				`Message "${id}" not found or already acked`
			);
		}

		return ApiResponse.ok(c, "Message acked", { name, id });
	})

	.post("/dead-letter", zValidator("json", AckSchema), async (c) => {
		const { name, id } = c.req.valid("json");

		const queueId = c.env.DURABLE_QUEUE.idFromName(name);
		const stub = c.env.DURABLE_QUEUE.get(queueId);
		const found = await stub.deadLetter(id);

		if (!found) {
			throw ApiError.notFound(`Message "${id}" not found`);
		}

		return ApiResponse.ok(c, "Message dead-lettered", { name, id });
	})

	.post("/stats", zValidator("json", NameSchema), async (c) => {
		const { name } = c.req.valid("json");

		const id = c.env.DURABLE_QUEUE.idFromName(name);
		const stub = c.env.DURABLE_QUEUE.get(id);
		const stats = await stub.stats();

		return ApiResponse.ok(c, "Queue stats", { name, ...stats });
	})

	.post("/drain", zValidator("json", NameSchema), async (c) => {
		const { name } = c.req.valid("json");

		const id = c.env.DURABLE_QUEUE.idFromName(name);
		const stub = c.env.DURABLE_QUEUE.get(id);
		await stub.drain();

		return ApiResponse.ok(c, "Queue drained", { name });
	});

export default durableQueueHandler;

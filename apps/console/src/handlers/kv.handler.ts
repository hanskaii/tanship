import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

import { ApiError } from "@/helpers/errors.helper";
import { ApiResponse } from "@/helpers/response.helper";
import type { HonoEnv } from "@/types/hono.types";

const SetSchema = z.object({
	key: z.string().min(1).max(512),
	value: z.string().min(1).max(25_000),
	ttl: z.number().int().min(60).max(86400).optional()
});

const GetSchema = z.object({
	key: z.string().min(1).max(512)
});

const DeleteSchema = z.object({
	key: z.string().min(1).max(512)
});

const ListSchema = z.object({
	prefix: z.string().max(512).optional(),
	limit: z.number().int().min(1).max(1000).default(100),
	cursor: z.string().optional()
});

// Atomic increment schema
const AtomicIncrementSchema = z.object({
	key: z.string().min(1).max(512),
	amount: z.number().int().min(1).max(1_000_000).default(1)
});

const kvHandler = new Hono<HonoEnv>()
	.post("/set", zValidator("json", SetSchema), async (c) => {
		const { key, value, ttl } = c.req.valid("json");

		const opts: KVNamespacePutOptions = {};
		if (ttl) opts.expirationTtl = ttl;

		await c.env.KV.put(key, value, opts);

		return ApiResponse.ok(c, "Key set successfully", {
			key,
			ttl: ttl ?? null
		});
	})
	.post("/get", zValidator("json", GetSchema), async (c) => {
		const { key } = c.req.valid("json");

		const value = await c.env.KV.get(key);
		if (value === null) {
			throw ApiError.notFound(`Key "${key}" not found`);
		}

		return ApiResponse.ok(c, "Key retrieved", { key, value });
	})
	.post("/delete", zValidator("json", DeleteSchema), async (c) => {
		const { key } = c.req.valid("json");

		await c.env.KV.delete(key);

		return ApiResponse.ok(c, "Key deleted", { key });
	})
	.post("/list", zValidator("json", ListSchema), async (c) => {
		const { prefix, limit, cursor } = c.req.valid("json");

		const result = await c.env.KV.list({
			prefix: prefix ?? undefined,
			limit,
			cursor: cursor ?? undefined
		});

		return ApiResponse.ok(c, "Keys listed", {
			keys: result.keys.map((k) => ({
				name: k.name,
				expiration: k.expiration ?? null
			})),
			cursor: result.list_complete ? null : result.cursor,
			complete: result.list_complete
		});
	})
	// Atomic increment endpoint
	.post(
		"/atomic/increment",
		zValidator("json", AtomicIncrementSchema),
		async (c) => {
			const { key, amount } = c.req.valid("json");

			// Get current value (default to 0 if not exists)
			const currentValueStr = await c.env.KV.get(key);
			const currentValue = currentValueStr
				? parseInt(currentValueStr, 10)
				: 0;

			// Calculate new value
			const newValue = currentValue + amount;

			// Store new value as string
			await c.env.KV.put(key, newValue.toString());

			return ApiResponse.ok(c, "Counter incremented", {
				key,
				value: newValue,
				amount
			});
		}
	);

export default kvHandler;

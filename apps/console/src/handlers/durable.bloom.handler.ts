import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

import { ApiResponse } from "@/helpers/response.helper";
import type { HonoEnv } from "@/types/hono.types";

// ponytail: capacity ceiling 10M items (~1.2 MB at 1% FPR); bump when needed
const MAX_CAPACITY = 10_000_000;
const MAX_BATCH = 1000;

const NameSchema = z.object({
	name: z
		.string()
		.min(1)
		.max(64)
		.regex(/^[a-zA-Z0-9_-]+$/, "name may only contain [a-zA-Z0-9_-]")
});

const AddSchema = NameSchema.extend({
	item: z.string().min(1).max(1024),
	capacity: z.number().int().min(1000).max(MAX_CAPACITY).optional(),
	errorRate: z.number().min(0.0001).max(0.1).optional()
});

const HasSchema = NameSchema.extend({
	item: z.string().min(1).max(1024)
});

const HasManySchema = NameSchema.extend({
	items: z.array(z.string().min(1).max(1024)).min(1).max(MAX_BATCH)
});

const durableBloomHandler = new Hono<HonoEnv>()
	.post("/add", zValidator("json", AddSchema), async (c) => {
		const { name, item, capacity, errorRate } = c.req.valid("json");
		const id = c.env.DURABLE_BLOOM.idFromName(name);
		const stub = c.env.DURABLE_BLOOM.get(id);
		const result = await stub.add(item, capacity, errorRate);

		if ("recreated" in result) {
			return ApiResponse.ok(c, "Filter initialised with custom params", {
				name,
				...result
			});
		}
		return ApiResponse.ok(c, "Item added", { name, ...result });
	})

	.post("/has", zValidator("json", HasSchema), async (c) => {
		const { name, item } = c.req.valid("json");
		const id = c.env.DURABLE_BLOOM.idFromName(name);
		const stub = c.env.DURABLE_BLOOM.get(id);
		const result = await stub.has(item);
		return ApiResponse.ok(c, "Membership test", { name, item, ...result });
	})

	.post("/has-many", zValidator("json", HasManySchema), async (c) => {
		const { name, items } = c.req.valid("json");
		const id = c.env.DURABLE_BLOOM.idFromName(name);
		const stub = c.env.DURABLE_BLOOM.get(id);
		const result = await stub.hasMany(items);
		return ApiResponse.ok(c, "Batch membership test", {
			name,
			count: items.length,
			...result
		});
	})

	.post("/stats", zValidator("json", NameSchema), async (c) => {
		const { name } = c.req.valid("json");
		const id = c.env.DURABLE_BLOOM.idFromName(name);
		const stub = c.env.DURABLE_BLOOM.get(id);
		const stats = await stub.stats();
		return ApiResponse.ok(c, "Filter stats", { name, ...stats });
	})

	.post("/clear", zValidator("json", NameSchema), async (c) => {
		const { name } = c.req.valid("json");
		const id = c.env.DURABLE_BLOOM.idFromName(name);
		const stub = c.env.DURABLE_BLOOM.get(id);
		await stub.clear();
		return ApiResponse.ok(c, "Filter cleared", { name });
	});

export default durableBloomHandler;

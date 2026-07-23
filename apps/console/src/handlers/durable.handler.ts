import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

import { ApiResponse } from "@/helpers/response.helper";
import type { HonoEnv } from "@/types/hono.types";

const CounterSchema = z.object({
	name: z.string().min(1).max(256)
});

const CounterAmountSchema = z.object({
	name: z.string().min(1).max(256),
	amount: z.number().int().min(1).max(1_000_000).default(1)
});

const CounterSetSchema = z.object({
	name: z.string().min(1).max(256),
	value: z.number().int()
});

const RateLimitCheckSchema = z.object({
	key: z.string().min(1).max(256),
	limit: z.number().int().min(1).max(100_000).default(100),
	windowSeconds: z.number().int().min(1).max(86400).default(60)
});

const RateLimitResetSchema = z.object({
	key: z.string().min(1).max(256)
});

const durableHandler = new Hono<HonoEnv>()
	// Counter endpoints
	.post("/counter/get", zValidator("json", CounterSchema), async (c) => {
		const { name } = c.req.valid("json");
		const id = c.env.COUNTER.idFromName(name);
		const stub = c.env.COUNTER.get(id);
		const value = await stub.get();

		return ApiResponse.ok(c, "Counter value retrieved", { name, value });
	})
	.post(
		"/counter/increment",
		zValidator("json", CounterAmountSchema),
		async (c) => {
			const { name, amount } = c.req.valid("json");
			const id = c.env.COUNTER.idFromName(name);
			const stub = c.env.COUNTER.get(id);
			const value = await stub.increment(amount);

			return ApiResponse.ok(c, "Counter incremented", { name, value });
		}
	)
	.post(
		"/counter/decrement",
		zValidator("json", CounterAmountSchema),
		async (c) => {
			const { name, amount } = c.req.valid("json");
			const id = c.env.COUNTER.idFromName(name);
			const stub = c.env.COUNTER.get(id);
			const value = await stub.decrement(amount);

			return ApiResponse.ok(c, "Counter decremented", { name, value });
		}
	)
	.post("/counter/set", zValidator("json", CounterSetSchema), async (c) => {
		const { name, value } = c.req.valid("json");
		const id = c.env.COUNTER.idFromName(name);
		const stub = c.env.COUNTER.get(id);
		const result = await stub.set(value);

		return ApiResponse.ok(c, "Counter set", { name, value: result });
	})
	.post("/counter/reset", zValidator("json", CounterSchema), async (c) => {
		const { name } = c.req.valid("json");
		const id = c.env.COUNTER.idFromName(name);
		const stub = c.env.COUNTER.get(id);
		const value = await stub.reset();

		return ApiResponse.ok(c, "Counter reset", { name, value });
	})
	// Rate limiter endpoints
	.post(
		"/ratelimit/check",
		zValidator("json", RateLimitCheckSchema),
		async (c) => {
			const { key, limit, windowSeconds } = c.req.valid("json");
			const id = c.env.RATE_LIMITER.idFromName(key);
			const stub = c.env.RATE_LIMITER.get(id);
			const result = await stub.check(limit, windowSeconds * 1000);

			return ApiResponse.ok(c, "Rate limit checked", {
				key,
				...result,
				limit,
				windowSeconds
			});
		}
	)
	.post(
		"/ratelimit/reset",
		zValidator("json", RateLimitResetSchema),
		async (c) => {
			const { key } = c.req.valid("json");
			const id = c.env.RATE_LIMITER.idFromName(key);
			const stub = c.env.RATE_LIMITER.get(id);
			await stub.reset();

			return ApiResponse.ok(c, "Rate limit reset", { key });
		}
	);

export default durableHandler;

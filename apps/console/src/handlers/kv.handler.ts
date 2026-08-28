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

// Session create: ephemeral JSON blob with TTL. sessionId is namespaced under
// `session:` so it cannot collide with user keys.
const SessionIdParam = z
	.string()
	.min(1)
	.max(256)
	.regex(/^[a-zA-Z0-9_.-]+$/, "id must be alphanumeric/._-");

const SessionDataSchema = z.object({
	sessionId: SessionIdParam,
	data: z.record(z.string(), z.unknown()),
	ttlSeconds: z
		.number()
		.int()
		.min(60)
		.max(7 * 24 * 60 * 60)
		.default(3600)
});

const SessionIdOnlySchema = z.object({ sessionId: SessionIdParam });

// Lease: optimistic mutex with TTL. Owner-gated; heartbeat refreshes.
// Cheaper alternative to a full Durable Object lock — uses KV only.
const LeaseAcquireSchema = z.object({
	leaseId: SessionIdParam,
	owner: z.string().min(1).max(256),
	ttlSeconds: z
		.number()
		.int()
		.min(1)
		.max(7 * 24 * 60 * 60)
		.default(60)
});

const LeaseOwnerSchema = z.object({
	leaseId: SessionIdParam,
	owner: z.string().min(1).max(256)
});

const LeaseHeartbeatSchema = z.object({
	leaseId: SessionIdParam,
	owner: z.string().min(1).max(256),
	ttlSeconds: z
		.number()
		.int()
		.min(1)
		.max(7 * 24 * 60 * 60)
		.default(60)
});

const LeaseIdOnlySchema = z.object({ leaseId: SessionIdParam });

const SESSION_PREFIX = "session:";
const LEASE_PREFIX = "lease:";

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

			const currentValueStr = await c.env.KV.get(key);
			const currentValue = currentValueStr
				? parseInt(currentValueStr, 10)
				: 0;
			const newValue = currentValue + amount;
			await c.env.KV.put(key, newValue.toString());

			return ApiResponse.ok(c, "Counter incremented", {
				key,
				value: newValue,
				amount
			});
		}
	)
	// Session management: ephemeral JSON store with TTL
	.post(
		"/session/create",
		zValidator("json", SessionDataSchema),
		async (c) => {
			const { sessionId, data, ttlSeconds } = c.req.valid("json");
			const key = SESSION_PREFIX + sessionId;

			await c.env.KV.put(key, JSON.stringify(data), {
				expirationTtl: ttlSeconds
			});

			return ApiResponse.ok(c, "Session created", {
				sessionId,
				ttlSeconds,
				expiresAt: new Date(
					Date.now() + ttlSeconds * 1000
				).toISOString()
			});
		}
	)
	.post(
		"/session/get",
		zValidator("json", SessionIdOnlySchema),
		async (c) => {
			const { sessionId } = c.req.valid("json");
			const key = SESSION_PREFIX + sessionId;

			const raw = await c.env.KV.get(key);
			if (raw === null) {
				throw ApiError.notFound(
					`Session "${sessionId}" not found or expired`
				);
			}

			let data: Record<string, unknown>;
			try {
				data = JSON.parse(raw);
			} catch {
				throw ApiError.badRequest("Session data is not valid JSON");
			}

			return ApiResponse.ok(c, "Session retrieved", { sessionId, data });
		}
	)
	.post(
		"/session/update",
		zValidator("json", SessionDataSchema),
		async (c) => {
			const { sessionId, data, ttlSeconds } = c.req.valid("json");
			const key = SESSION_PREFIX + sessionId;

			const existing = await c.env.KV.get(key);
			if (existing === null) {
				throw ApiError.notFound(
					`Session "${sessionId}" not found or expired`
				);
			}

			await c.env.KV.put(key, JSON.stringify(data), {
				expirationTtl: ttlSeconds
			});

			return ApiResponse.ok(c, "Session updated", {
				sessionId,
				ttlSeconds,
				expiresAt: new Date(
					Date.now() + ttlSeconds * 1000
				).toISOString()
			});
		}
	)
	.post(
		"/session/delete",
		zValidator("json", SessionIdOnlySchema),
		async (c) => {
			const { sessionId } = c.req.valid("json");
			const key = SESSION_PREFIX + sessionId;
			await c.env.KV.delete(key);
			return ApiResponse.ok(c, "Session deleted", { sessionId });
		}
	)
	// Lease: optimistic mutex with TTL, owner-gated. Cheaper than a DO lock.
	.post(
		"/lease/acquire",
		zValidator("json", LeaseAcquireSchema),
		async (c) => {
			const { leaseId, owner, ttlSeconds } = c.req.valid("json");
			const key = LEASE_PREFIX + leaseId;

			const raw = await c.env.KV.get(key);
			if (raw !== null) {
				const lease = JSON.parse(raw) as {
					owner: string;
					expiresAt: number;
				};
				if (lease.expiresAt > Date.now() && lease.owner !== owner) {
					return ApiResponse.ok(c, "Lease held by another owner", {
						acquired: false,
						leaseId,
						currentOwner: lease.owner,
						expiresAt: new Date(lease.expiresAt).toISOString()
					});
				}
			}

			const expiresAt = Date.now() + ttlSeconds * 1000;
			await c.env.KV.put(key, JSON.stringify({ owner, expiresAt }), {
				expirationTtl: ttlSeconds + 60
			});

			return ApiResponse.ok(c, "Lease acquired", {
				acquired: true,
				leaseId,
				owner,
				expiresAt: new Date(expiresAt).toISOString()
			});
		}
	)
	.post("/lease/release", zValidator("json", LeaseOwnerSchema), async (c) => {
		const { leaseId, owner } = c.req.valid("json");
		const key = LEASE_PREFIX + leaseId;

		const raw = await c.env.KV.get(key);
		if (raw === null) {
			return ApiResponse.ok(c, "Lease already free", {
				released: true,
				leaseId
			});
		}

		const lease = JSON.parse(raw) as { owner: string };
		if (lease.owner !== owner) {
			throw ApiError.badRequest(
				"Only the current lease owner can release the lease"
			);
		}

		await c.env.KV.delete(key);
		return ApiResponse.ok(c, "Lease released", {
			released: true,
			leaseId
		});
	})
	.post(
		"/lease/heartbeat",
		zValidator("json", LeaseHeartbeatSchema),
		async (c) => {
			const { leaseId, owner, ttlSeconds } = c.req.valid("json");
			const key = LEASE_PREFIX + leaseId;

			const raw = await c.env.KV.get(key);
			if (raw === null) {
				throw ApiError.notFound(
					`Lease "${leaseId}" not found or expired`
				);
			}

			const lease = JSON.parse(raw) as {
				owner: string;
				expiresAt: number;
			};
			if (lease.owner !== owner) {
				throw ApiError.badRequest(
					"Only the current lease owner can send heartbeat"
				);
			}

			const expiresAt = Date.now() + ttlSeconds * 1000;
			await c.env.KV.put(key, JSON.stringify({ owner, expiresAt }), {
				expirationTtl: ttlSeconds + 60
			});

			return ApiResponse.ok(c, "Lease heartbeat renewed", {
				renewed: true,
				leaseId,
				expiresAt: new Date(expiresAt).toISOString()
			});
		}
	)
	.post("/lease/status", zValidator("json", LeaseIdOnlySchema), async (c) => {
		const { leaseId } = c.req.valid("json");
		const key = LEASE_PREFIX + leaseId;

		const raw = await c.env.KV.get(key);
		if (raw === null) {
			return ApiResponse.ok(c, "Lease free", {
				leaseId,
				held: false,
				owner: null,
				expiresAt: null
			});
		}

		const lease = JSON.parse(raw) as {
			owner: string;
			expiresAt: number;
		};
		const held = lease.expiresAt > Date.now();

		return ApiResponse.ok(c, held ? "Lease held" : "Lease expired", {
			leaseId,
			held,
			owner: held ? lease.owner : null,
			expiresAt: held ? new Date(lease.expiresAt).toISOString() : null
		});
	});

export default kvHandler;

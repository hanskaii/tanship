import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

import { ApiError } from "@/helpers/errors.helper";
import { ApiResponse } from "@/helpers/response.helper";
import type { HonoEnv } from "@/types/hono.types";

/**
 * Pull-based FIFO queue built on Cloudflare KV.
 *
 * Namespace per queue: `q:{name}`
 *   head          → next seq to read (monotonic counter)
 *   tail          → next seq to write (monotonic counter)
 *   item:{seq}    → message JSON { payload, enqueuedAt, visibleAt, lease? }
 *   inflight      → array of active leases { seq, leaseId, visibleAt }
 *   dlq:{seq}     → dead-letter messages
 *   stats         → { pushed, popped, acked, dead_lettered }
 *
 * Visibility timeout: when `pop` returns a message, it is held under a
 * lease until `ack` or until `visibilitySeconds` elapses (auto-requeue).
 */

const NAME_RE = /^[a-zA-Z0-9_-]{1,64}$/;
const MAX_PAYLOAD = 25_000; // 25 KB per message
const MAX_BATCH = 100;
const DEFAULT_VISIBILITY = 30; // seconds

const PushSchema = z.object({
	name: z.string().regex(NAME_RE),
	payload: z.unknown(),
	delaySeconds: z.number().int().min(0).max(86400).default(0)
});

const PopSchema = z.object({
	name: z.string().regex(NAME_RE),
	max: z.number().int().min(1).max(MAX_BATCH).default(1),
	visibilitySeconds: z
		.number()
		.int()
		.min(1)
		.max(3600)
		.default(DEFAULT_VISIBILITY)
});

const PeekSchema = z.object({
	name: z.string().regex(NAME_RE),
	max: z.number().int().min(1).max(MAX_BATCH).default(1)
});

const AckSchema = z.object({
	name: z.string().regex(NAME_RE),
	leaseId: z.string().min(1).max(128)
});

const DrainSchema = z.object({
	name: z.string().regex(NAME_RE),
	includeDeadLetter: z.boolean().default(false)
});

const SerializeSchema = z.object({
	name: z.string().regex(NAME_RE)
});

function meta(name: string) {
	return {
		head: `q:${name}:head`,
		tail: `q:${name}:tail`,
		inflight: `q:${name}:inflight`,
		stats: `q:${name}:stats`,
		item: (seq: number) => `q:${name}:item:${seq}`,
		dlq: (seq: number) => `q:${name}:dlq:${seq}`
	};
}

interface Stats {
	pushed: number;
	popped: number;
	acked: number;
	dead_lettered: number;
}

interface Lease {
	seq: number;
	leaseId: string;
	visibleAt: number;
}

function encodePayload(p: unknown): string {
	const s = JSON.stringify(p ?? null);
	if (s.length > MAX_PAYLOAD) {
		throw ApiError.badRequest(
			`Payload too large: ${s.length} bytes (max ${MAX_PAYLOAD})`
		);
	}
	return s;
}

function decodePayload(s: string): unknown {
	try {
		return JSON.parse(s);
	} catch {
		return s;
	}
}

async function loadStats(kv: KVNamespace, key: string): Promise<Stats> {
	return (
		(await kv.get<Stats>(key, "json")) ?? {
			pushed: 0,
			popped: 0,
			acked: 0,
			dead_lettered: 0
		}
	);
}

async function saveStats(
	kv: KVNamespace,
	key: string,
	stats: Stats
): Promise<void> {
	await kv.put(key, JSON.stringify(stats));
}

const kvQueueHandler = new Hono<HonoEnv>()
	.post("/push", zValidator("json", PushSchema), async (c) => {
		const { name, payload, delaySeconds } = c.req.valid("json");
		const kv = c.env.KV;
		const m = meta(name);

		const tail = Number((await kv.get(m.tail)) ?? "0");
		const seq = tail + 1;
		const visibleAt = Date.now() + delaySeconds * 1000;
		const body = encodePayload(payload);

		const item = {
			seq,
			payload: body,
			enqueuedAt: Date.now(),
			visibleAt
		};
		const stats = await loadStats(kv, m.stats);
		stats.pushed += 1;

		await Promise.all([
			kv.put(m.tail, String(seq)),
			kv.put(m.item(seq), JSON.stringify(item)),
			saveStats(kv, m.stats, stats)
		]);

		return ApiResponse.ok(c, "Message pushed", {
			name,
			seq,
			visibleAt,
			delaySeconds
		});
	})

	.post("/pop", zValidator("json", PopSchema), async (c) => {
		const { name, max, visibilitySeconds } = c.req.valid("json");
		const kv = c.env.KV;
		const m = meta(name);

		const headStr = await kv.get(m.head);
		const tailStr = await kv.get(m.tail);
		const head = Number(headStr ?? "0");
		const tail = Number(tailStr ?? "0");

		const inflight = (await kv.get<Lease[]>(m.inflight, "json")) ?? [];
		const now = Date.now();
		const visibleLeases = inflight.filter((l) => l.visibleAt > now);

		const result: {
			seq: number;
			payload: unknown;
			leaseId: string;
			visibleAt: number;
		}[] = [];
		const newLeases: Lease[] = [...visibleLeases];
		let cursor = head + 1;

		while (result.length < max && cursor <= tail) {
			const raw = await kv.get(m.item(cursor));
			if (!raw) {
				cursor += 1;
				continue;
			}
			const item = JSON.parse(raw) as {
				seq: number;
				payload: string;
				enqueuedAt: number;
				visibleAt: number;
			};
			if (item.visibleAt > now) {
				// not yet visible — stop scanning, rest of queue is also delayed
				break;
			}
			const leaseId = crypto.randomUUID();
			const visibleAt = now + visibilitySeconds * 1000;
			result.push({
				seq: item.seq,
				payload: decodePayload(item.payload),
				leaseId,
				visibleAt
			});
			newLeases.push({ seq: item.seq, leaseId, visibleAt });
			cursor += 1;
		}

		// Advance head past returned items (they live in-flight until ack).
		const newHead = cursor - 1;
		const stats = await loadStats(kv, m.stats);
		stats.popped += result.length;

		await Promise.all([
			kv.put(m.head, String(newHead)),
			kv.put(m.inflight, JSON.stringify(newLeases)),
			saveStats(kv, m.stats, stats)
		]);

		return ApiResponse.ok(c, "Messages popped", {
			name,
			count: result.length,
			messages: result,
			visibilitySeconds
		});
	})

	.post("/peek", zValidator("json", PeekSchema), async (c) => {
		const { name, max } = c.req.valid("json");
		const kv = c.env.KV;
		const m = meta(name);

		const head = Number((await kv.get(m.head)) ?? "0");
		const tail = Number((await kv.get(m.tail)) ?? "0");
		const now = Date.now();
		const result: { seq: number; payload: unknown; enqueuedAt: number }[] =
			[];
		let cursor = head + 1;

		while (result.length < max && cursor <= tail) {
			const raw = await kv.get(m.item(cursor));
			if (!raw) {
				cursor += 1;
				continue;
			}
			const item = JSON.parse(raw);
			if (item.visibleAt > now) break;
			result.push({
				seq: item.seq,
				payload: decodePayload(item.payload),
				enqueuedAt: item.enqueuedAt
			});
			cursor += 1;
		}

		return ApiResponse.ok(c, "Messages peeked", {
			name,
			count: result.length,
			messages: result
		});
	})

	.post("/ack", zValidator("json", AckSchema), async (c) => {
		const { name, leaseId } = c.req.valid("json");
		const kv = c.env.KV;
		const m = meta(name);

		const inflight = (await kv.get<Lease[]>(m.inflight, "json")) ?? [];
		const idx = inflight.findIndex((l) => l.leaseId === leaseId);
		if (idx === -1) {
			throw ApiError.notFound(
				`Lease "${leaseId}" not found or already acked`
			);
		}
		const lease = inflight[idx];
		inflight.splice(idx, 1);

		const stats = await loadStats(kv, m.stats);
		stats.acked += 1;

		await Promise.all([
			kv.delete(m.item(lease.seq)),
			kv.put(m.inflight, JSON.stringify(inflight)),
			saveStats(kv, m.stats, stats)
		]);

		return ApiResponse.ok(c, "Message acked", {
			name,
			seq: lease.seq,
			leaseId
		});
	})

	.post("/dead-letter", zValidator("json", AckSchema), async (c) => {
		const { name, leaseId } = c.req.valid("json");
		const kv = c.env.KV;
		const m = meta(name);

		const inflight = (await kv.get<Lease[]>(m.inflight, "json")) ?? [];
		const idx = inflight.findIndex((l) => l.leaseId === leaseId);
		if (idx === -1) {
			throw ApiError.notFound(`Lease "${leaseId}" not found`);
		}
		const lease = inflight[idx];
		inflight.splice(idx, 1);

		const raw = await kv.get(m.item(lease.seq));
		const stats = await loadStats(kv, m.stats);
		stats.dead_lettered += 1;

		const ops: Promise<unknown>[] = [
			kv.put(m.dlq(lease.seq), raw ?? ""),
			kv.delete(m.item(lease.seq)),
			kv.put(m.inflight, JSON.stringify(inflight)),
			saveStats(kv, m.stats, stats)
		];
		await Promise.all(ops);

		return ApiResponse.ok(c, "Message dead-lettered", {
			name,
			seq: lease.seq,
			leaseId
		});
	})

	.post("/drain", zValidator("json", DrainSchema), async (c) => {
		const { name, includeDeadLetter } = c.req.valid("json");
		const kv = c.env.KV;
		const m = meta(name);

		const tail = Number((await kv.get(m.tail)) ?? "0");
		const head = Number((await kv.get(m.head)) ?? "0");

		const ops: Promise<unknown>[] = [];
		for (let seq = head + 1; seq <= tail; seq += 1) {
			ops.push(kv.delete(m.item(seq)));
		}
		ops.push(kv.delete(m.head));
		ops.push(kv.delete(m.tail));
		ops.push(kv.delete(m.inflight));
		ops.push(
			saveStats(kv, m.stats, {
				pushed: 0,
				popped: 0,
				acked: 0,
				dead_lettered: 0
			})
		);

		await Promise.all(ops);

		return ApiResponse.ok(c, "Queue drained", { name, includeDeadLetter });
	})

	.post("/stats", zValidator("json", SerializeSchema), async (c) => {
		const { name } = c.req.valid("json");
		const kv = c.env.KV;
		const m = meta(name);

		const tail = Number((await kv.get(m.tail)) ?? "0");
		const head = Number((await kv.get(m.head)) ?? "0");
		const inflight = (await kv.get<Lease[]>(m.inflight, "json")) ?? [];
		const now = Date.now();
		const visibleLeases = inflight.filter((l) => l.visibleAt > now);
		const stats = await loadStats(kv, m.stats);

		// Cheap DLQ count via list with prefix; capped at 1000.
		const dlq = await kv.list({ prefix: `q:${name}:dlq:` });
		const ready = Math.max(0, tail - head - visibleLeases.length);

		return ApiResponse.ok(c, "Queue stats", {
			name,
			ready,
			in_flight: visibleLeases.length,
			dead_letter: dlq.keys.length,
			tail,
			head,
			stats
		});
	});

export default kvQueueHandler;

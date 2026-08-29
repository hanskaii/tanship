import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

import { ApiError } from "@/helpers/errors.helper";
import { ApiResponse } from "@/helpers/response.helper";
import type { HonoEnv } from "@/types/hono.types";

// ponytail: KV for metadata index + R2 for large payload storage.
// KV holds the lookup key -> {r2Key, namespace, tags, createdAt, expiresAt},
// R2 holds the actual value bytes. This keeps memory metadata indexed and
// queryable while allowing values up to 1MB per item.
const MAX_VALUE_BYTES = 1_048_576; // 1MB
const MAX_NAMESPACE = 64;
const MAX_KEY_LEN = 256;
const MAX_TAGS = 20;
const MAX_TTL_S = 31_536_000; // 1 year
const R2_PREFIX = "memory/longterm/";

const NamespaceSchema = z
	.string()
	.min(1)
	.max(MAX_NAMESPACE)
	.regex(/^[a-zA-Z0-9_-]+$/, "namespace may only contain [a-zA-Z0-9_-]");

const KeySchema = z.string().min(1).max(MAX_KEY_LEN);

const MemoryLongtermSchema = z.object({
	namespace: NamespaceSchema,
	key: KeySchema,
	value: z.unknown(),
	tags: z.array(z.string().max(64)).max(MAX_TAGS).optional(),
	ttlSeconds: z.number().int().min(1).max(MAX_TTL_S).optional()
});

type MemoryLongtermInput = z.infer<typeof MemoryLongtermSchema>;

function buildKVKey(namespace: string, key: string): string {
	return `${R2_PREFIX}${namespace}/${key}`;
}

function buildIndexKey(namespace: string, key: string): string {
	return `mem:${namespace}:${key}`;
}

function serializeValue(value: unknown): { bytes: Uint8Array } {
	let raw: string;
	try {
		raw = JSON.stringify(value);
	} catch {
		throw ApiError.badRequest("Memory value must be JSON-serializable");
	}
	const bytes = new TextEncoder().encode(raw);
	if (bytes.length > MAX_VALUE_BYTES) {
		throw ApiError.badRequest(
			`Memory value too large: ${bytes.length} bytes (max ${MAX_VALUE_BYTES})`
		);
	}
	return { bytes };
}

const agentMemoryHandler = new Hono<HonoEnv>().post(
	"/longterm",
	zValidator("json", MemoryLongtermSchema),
	async (c) => {
		const body = c.req.valid("json") as MemoryLongtermInput;
		const { namespace, key, value, tags, ttlSeconds } = body;

		const { bytes } = serializeValue(value);
		const r2Key = buildKVKey(namespace, key);
		const indexKey = buildIndexKey(namespace, key);

		// Store value in R2
		await c.env.R2.put(r2Key, bytes, {
			httpMetadata: { contentType: "application/json" }
		});

		const now = Date.now();
		const expiresAt = ttlSeconds ? now + ttlSeconds * 1000 : null;

		// Store metadata index in KV for fast lookups
		const index: Record<string, unknown> = {
			key,
			namespace,
			r2Key,
			tags: tags ?? [],
			createdAt: now,
			expiresAt,
			size: bytes.length
		};

		await c.env.KV.put(indexKey, JSON.stringify(index), {
			// KV TTL mirrors the memory TTL so stale metadata is auto-purged
			...(ttlSeconds ? { expirationTtl: ttlSeconds } : {})
		});

		return ApiResponse.ok(c, "Long-term memory stored", {
			namespace,
			key,
			createdAt: now,
			expiresAt,
			size: bytes.length
		});
	}
);

export default agentMemoryHandler;

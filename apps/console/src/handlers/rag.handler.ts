import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

import { ApiError } from "@/helpers/errors.helper";
import { ApiResponse } from "@/helpers/response.helper";
import type { HonoEnv } from "@/types/hono.types";

const EMBEDDING_MODEL = "@cf/baai/bge-m3";

// Per-call bounds — Vectorize returns 50M free dims/month, so cap to keep
// one caller from burning the index in a single request.
const MAX_TEXT_CHARS = 10_000;
const MAX_ID_CHARS = 64;
const MAX_METADATA_KV = 16;

const UpsertItem = z.object({
	id: z
		.string()
		.min(1)
		.max(MAX_ID_CHARS)
		.regex(/^[a-zA-Z0-9_\-:.]+$/, "id may only contain [a-zA-Z0-9_-:.]"),
	text: z.string().min(1).max(MAX_TEXT_CHARS),
	metadata: z
		.record(
			z.string().min(1).max(64),
			z.union([z.string(), z.number(), z.boolean()])
		)
		.optional()
});

const UpsertSchema = z.object({
	namespace: z.string().min(1).max(MAX_ID_CHARS).default("default"),
	items: z.array(UpsertItem).min(1).max(50)
});

const QuerySchema = z.object({
	namespace: z.string().min(1).max(MAX_ID_CHARS).default("default"),
	query: z.string().min(1).max(MAX_TEXT_CHARS),
	top_k: z.number().int().min(1).max(50).default(5),
	return_metadata: z.boolean().default(true)
});

const DeleteSchema = z.object({
	ids: z.array(z.string().min(1).max(MAX_ID_CHARS)).min(1).max(100)
});

async function embed(
	env: HonoEnv["Bindings"],
	text: string
): Promise<number[]> {
	const result = (await env.AI.run(EMBEDDING_MODEL as any, {
		text: [text]
	})) as { data?: number[][] };
	const values = result.data?.[0];
	if (!values || values.length === 0) {
		throw ApiError.badGateway("Embedding model returned an empty vector");
	}
	return values;
}

const ragHandler = new Hono<HonoEnv>()
	.post("/upsert", zValidator("json", UpsertSchema), async (c) => {
		const { namespace, items } = c.req.valid("json");

		const vectors: VectorizeVector[] = [];
		for (const item of items) {
			const values = await embed(c.env, item.text);
			const metadata: Record<string, string | number | boolean> = {
				namespace,
				text: item.text
			};
			if (item.metadata) {
				const keys = Object.keys(item.metadata).slice(
					0,
					MAX_METADATA_KV
				);
				for (const k of keys) metadata[k] = item.metadata[k];
			}
			vectors.push({
				id: `${namespace}:${item.id}`,
				values,
				metadata
			});
		}

		const result = await c.env.VECTORIZE.upsert(vectors);

		return ApiResponse.ok(c, "Vectors upserted", {
			namespace,
			count: vectors.length,
			ids: vectors.map((v) => v.id),
			mutationId: (result as { mutationId?: string }).mutationId ?? null
		});
	})
	.post("/query", zValidator("json", QuerySchema), async (c) => {
		const { namespace, query, top_k, return_metadata } =
			c.req.valid("json");

		const values = await embed(c.env, query);

		const result = (await c.env.VECTORIZE.query(values, {
			topK: top_k,
			returnValues: false,
			returnMetadata: return_metadata ? "all" : "none",
			filter: { namespace: { $eq: namespace } }
		} as any)) as {
			matches?: Array<{
				id: string;
				score: number;
				metadata?: Record<string, unknown> | null;
			}>;
		};

		const matches = (result.matches ?? []).map((m) => ({
			id: m.id,
			score: m.score,
			metadata: return_metadata ? (m.metadata ?? null) : undefined
		}));

		return ApiResponse.ok(c, "Vector query completed", {
			namespace,
			query,
			topK: top_k,
			count: matches.length,
			matches
		});
	})
	.post("/delete", zValidator("json", DeleteSchema), async (c) => {
		const { ids } = c.req.valid("json");
		await c.env.VECTORIZE.deleteByIds(ids);
		return ApiResponse.ok(c, "Vectors deleted", { count: ids.length, ids });
	});

export default ragHandler;

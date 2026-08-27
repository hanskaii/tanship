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

const HybridSearchSchema = z.object({
	namespace: z.string().min(1).max(MAX_ID_CHARS).default("default"),
	query: z.string().min(1).max(MAX_TEXT_CHARS),
	top_k: z.number().int().min(1).max(50).default(5),
	vector_weight: z.number().min(0).max(1).default(0.7)
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
	})
	.post(
		"/hybrid/search",
		zValidator("json", HybridSearchSchema),
		async (c) => {
			const { namespace, query, top_k, vector_weight } =
				c.req.valid("json");
			const lexWeight = 1 - vector_weight;

			// Dense retrieval: pull 4x candidates so lexical re-rank has headroom
			const values = await embed(c.env, query);
			const dense = (await c.env.VECTORIZE.query(values, {
				topK: Math.min(50, Math.max(10, top_k * 4)),
				returnValues: false,
				returnMetadata: "all",
				filter: { namespace: { $eq: namespace } }
			} as any)) as {
				matches?: Array<{
					id: string;
					score: number;
					metadata?: Record<string, unknown> | null;
				}>;
			};

			const candidates = dense.matches ?? [];
			if (candidates.length === 0) {
				return ApiResponse.ok(c, "Hybrid search completed", {
					namespace,
					query,
					topK: top_k,
					count: 0,
					matches: []
				});
			}

			// Lexical (BM25-lite) scoring on returned text. Tokenize once, score once.
			const queryTokens = new Set(
				query
					.toLowerCase()
					.split(/[^a-z0-9]+/u)
					.filter((t) => t.length > 1)
			);
			const docCount = candidates.length;
			// Document frequency per token (for IDF)
			const df = new Map<string, number>();
			const tfPerDoc: Array<Map<string, number>> = [];
			for (const m of candidates) {
				const text = String(m.metadata?.text ?? "").toLowerCase();
				const tokens = text
					.split(/[^a-z0-9]+/u)
					.filter((t) => t.length > 1);
				const tf = new Map<string, number>();
				for (const t of tokens) {
					tf.set(t, (tf.get(t) ?? 0) + 1);
					if (queryTokens.has(t)) {
						df.set(t, (df.get(t) ?? 0) + 1);
					}
				}
				tfPerDoc.push(tf);
			}

			// Normalize dense scores to [0, 1] (Vectorize cosine is already 0..1).
			const maxDense = Math.max(...candidates.map((c) => c.score), 1e-9);
			const minDense = Math.min(...candidates.map((c) => c.score));
			const denseRange = Math.max(maxDense - minDense, 1e-9);

			const fused = candidates.map((m, i) => {
				const tf = tfPerDoc[i];
				let bm25 = 0;
				for (const qt of queryTokens) {
					const f = tf.get(qt) ?? 0;
					if (f === 0) continue;
					const idf = Math.log(
						1 +
							(docCount - (df.get(qt) ?? 0) + 0.5) /
								((df.get(qt) ?? 0) + 0.5)
					);
					// length-normalized term frequency; k1=1.5, b=0.75
					bm25 += (idf * (f * 1.5)) / (f + 0.75);
				}
				const denseNorm = (m.score - minDense) / denseRange;
				const score =
					vector_weight * denseNorm +
					lexWeight * Math.min(1, bm25 / 5);
				return {
					id: m.id,
					score,
					dense_score: m.score,
					lexical_score: bm25,
					text: m.metadata?.text ?? null,
					metadata:
						m.metadata && typeof m.metadata === "object"
							? Object.fromEntries(
									Object.entries(m.metadata).filter(
										([k]) => k !== "text"
									)
								)
							: null
				};
			});
			fused.sort((a, b) => b.score - a.score);
			const matches = fused.slice(0, top_k);

			return ApiResponse.ok(c, "Hybrid search completed", {
				namespace,
				query,
				topK: top_k,
				count: matches.length,
				vector_weight,
				lexical_weight: lexWeight,
				matches
			});
		}
	);

export default ragHandler;

import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

import { ApiError } from "@/helpers/errors.helper";
import { ApiResponse } from "@/helpers/response.helper";
import type { HonoEnv } from "@/types/hono.types";

const EMBEDDING_MODEL = "@cf/baai/bge-m3";

// ponytail: Vectorize does not expose a native metadata-first "get by filter"
// endpoint. We scan a wide topK window then re-filter in-process — works for
// indexes <100K vectors. When Vectorize adds a metadata index primitive, swap
// this for the server-side filter to keep cost linear.
const MAX_INDEX_SCAN = 500;

const UpsertItemSchema = z.object({
	id: z
		.string()
		.min(1)
		.max(64)
		.regex(/^[a-zA-Z0-9_\-:.]+$/, "id: alphanumeric + _-:. only"),
	values: z
		.array(z.number())
		.min(1)
		.max(4096)
		.describe("Pre-computed dense vector (BGE-M3 = 1024 dims)"),
	metadata: z
		.record(
			z.string().min(1).max(64),
			z.union([z.string(), z.number(), z.boolean()])
		)
		.optional()
});

const UpsertSchema = z.object({
	namespace: z.string().min(1).max(64).default("default"),
	items: z.array(UpsertItemSchema).min(1).max(100)
});

const FilterSchema = z.object({
	query: z.string().min(1).max(10_000).optional(),
	values: z.array(z.number()).min(1).max(4096).optional(),
	filter: z.record(z.string(), z.unknown()),
	topK: z.number().int().min(1).max(50).default(5),
	namespace: z.string().min(1).max(64).optional(),
	returnMetadata: z.boolean().default(true)
});

const vectorizeHandler = new Hono<HonoEnv>()
	/**
	 * Raw Vectorize upsert — caller supplies pre-computed embedding vectors.
	 * No Workers AI embedding cost. 0 competitors on x402.
	 */
	.post("/upsert", zValidator("json", UpsertSchema), async (c) => {
		const { namespace, items } = c.req.valid("json");

		const vectors: VectorizeVector[] = items.map((item) => ({
			id: `${namespace}:${item.id}`,
			values: item.values,
			metadata: {
				namespace,
				...(item.metadata ?? {})
			}
		}));

		const result = (await c.env.VECTORIZE.upsert(vectors)) as {
			mutationId?: string;
		};

		return ApiResponse.created(c, "Vectors upserted", {
			count: vectors.length,
			ids: vectors.map((v) => v.id),
			mutationId: result.mutationId ?? null
		});
	})
	/**
	 * Metadata-first vector search — filter by metadata conditions, then
	 * rank by vector similarity. 0 competitors on x402 (Aug 2026 census).
	 */
	.post("/metadata/filter", zValidator("json", FilterSchema), async (c) => {
		const { query, values, filter, topK, namespace, returnMetadata } =
			c.req.valid("json");

		if (query == null && values == null) {
			throw ApiError.badRequest(
				"Provide either 'query' (string) or 'values' (number[]) for the vector to search by."
			);
		}

		const vectorFilter: Record<string, unknown> =
			namespace != null
				? { namespace: { $eq: namespace }, ...filter }
				: { ...filter };

		let queryVector: number[];
		if (values != null) {
			queryVector = values;
		} else {
			const result = (await c.env.AI.run(EMBEDDING_MODEL as any, {
				text: [query as string]
			})) as { data?: number[][] };
			const vals = result.data?.[0];
			if (!vals || vals.length === 0) {
				throw ApiError.badGateway(
					"Embedding model returned an empty vector"
				);
			}
			queryVector = vals;
		}

		const raw = (await c.env.VECTORIZE.query(queryVector, {
			topK: MAX_INDEX_SCAN,
			returnValues: false,
			returnMetadata: returnMetadata ? "all" : "none",
			filter: vectorFilter as any
		} as any)) as {
			matches?: Array<{
				id: string;
				score: number;
				metadata?: Record<string, unknown> | null;
			}>;
		};

		const matches = (raw.matches ?? []).slice(0, topK).map((m) => ({
			id: m.id,
			score: m.score,
			metadata: returnMetadata ? (m.metadata ?? null) : undefined
		}));

		return ApiResponse.ok(c, "Metadata filter query completed", {
			filter,
			namespace: namespace ?? null,
			topK,
			count: matches.length,
			totalScanned: raw.matches?.length ?? 0,
			matches
		});
	});

export default vectorizeHandler;

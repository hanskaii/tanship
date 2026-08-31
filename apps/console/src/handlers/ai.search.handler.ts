import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

import { ApiResponse } from "@/helpers/response.helper";
import { ApiError } from "@/helpers/errors.helper";
import type { HonoEnv } from "@/types/hono.types";

const SearchQuerySchema = z.object({
	query: z.string().min(1).max(1000),
	topK: z.number().int().min(1).max(100).default(10)
});

const SearchCreateSchema = z.object({
	name: z.string().min(1).max(256),
	description: z.string().max(2000).optional(),
	// Optional column config for structured data — maps field names to types
	columns: z
		.record(
			z.string(),
			z.enum(["text", "string", "number", "boolean", "date"])
		)
		.optional()
});

function indexKey(indexId: string): string {
	return `ai_search:${indexId}`;
}

function indexListKey(): string {
	return "ai_search:indexes";
}

const aiSearchHandler = new Hono<HonoEnv>()
	.post(
		"/ai/search/query",
		zValidator("json", SearchQuerySchema),
		async (c) => {
			const { query, topK } = c.req.valid("json");

			const result = await c.env.AI.run("@cf/agents/search", {
				query,
				top_k: topK
			});

			// Workers AI Search is free during open beta
			const results = Array.isArray(result) ? result : [];
			return ApiResponse.ok(c, "Search completed", {
				results,
				count: results.length,
				query,
				topK,
				usage: null
			});
		}
	)
	.post(
		"/ai/search/create",
		zValidator("json", SearchCreateSchema),
		async (c) => {
			const { name, description, columns } = c.req.valid("json");
			const indexId = crypto.randomUUID();
			const now = Date.now();

			const index = {
				id: indexId,
				name,
				description: description ?? null,
				columns: columns ?? null,
				createdAt: now
			};

			await c.env.KV.put(indexKey(indexId), JSON.stringify(index));

			// Append to index list (stored as newline-delimited IDs)
			const listRaw = await c.env.KV.get(indexListKey(), "text");
			const ids = listRaw ? listRaw.split("\n").filter(Boolean) : [];
			ids.unshift(indexId);
			await c.env.KV.put(indexListKey(), ids.slice(0, 1000).join("\n"), {
				expirationTtl: 365 * 24 * 60 * 60
			});

			return ApiResponse.created(c, "AI Search index created", {
				indexId,
				name,
				description: description ?? null,
				columns: columns ?? null,
				queryUrl: `/v1/ai/search/query`,
				ingestUrl: `/v1/ai/search/ingest`,
				createdAt: now
			});
		}
	)
	// Ingest documents into an AI Search index
	.post(
		"/ai/search/ingest",
		zValidator(
			"json",
			z.object({
				indexId: z.string().min(1),
				documents: z
					.array(z.record(z.string(), z.unknown()))
					.min(1)
					.max(1000)
			})
		),
		async (c) => {
			const { indexId, documents } = c.req.valid("json");

			const raw = await c.env.KV.get(indexKey(indexId), "text");
			if (!raw) {
				throw ApiError.notFound(`Index ${indexId} not found`);
			}

			const ingestedKey = `ai_search:${indexId}:ingested`;
			const countRaw = await c.env.KV.get(ingestedKey, "text");
			const count = countRaw ? parseInt(countRaw, 10) : 0;

			// Store documents in KV with compound key
			for (let i = 0; i < documents.length; i++) {
				const docKey = `ai_search:${indexId}:doc:${count + i}`;
				await c.env.KV.put(docKey, JSON.stringify(documents[i]), {
					expirationTtl: 365 * 24 * 60 * 60
				});
			}

			const newCount = count + documents.length;
			await c.env.KV.put(ingestedKey, String(newCount), {
				expirationTtl: 365 * 24 * 60 * 60
			});

			return ApiResponse.ok(c, "Documents ingested", {
				indexId,
				ingested: documents.length,
				totalDocuments: newCount
			});
		}
	);

export default aiSearchHandler;

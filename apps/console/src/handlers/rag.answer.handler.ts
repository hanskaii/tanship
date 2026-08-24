import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

import { ApiError } from "@/helpers/errors.helper";
import { ApiResponse } from "@/helpers/response.helper";
import type { HonoEnv } from "@/types/hono.types";

const EMBEDDING_MODEL = "@cf/baai/bge-m3";
const CHAT_MODEL = "@cf/meta/llama-3.3-70b-instruct-fp8-fast";

const MAX_TEXT_CHARS = 2_000;
const MAX_NAMESPACE = 64;
const MAX_PROMPT_CHARS = 512;
const MAX_TOP_K = 10;
const KV_CACHE_TTL_S = 60 * 60; // 1h — answers drift as index mutates
const PER_CHUNK_CHARS = 600; // trim matched docs so the prompt stays bounded

const AnswerSchema = z.object({
	namespace: z.string().min(1).max(MAX_NAMESPACE).default("default"),
	query: z.string().min(1).max(MAX_TEXT_CHARS),
	top_k: z.number().int().min(1).max(MAX_TOP_K).default(4),
	instructions: z.string().max(MAX_PROMPT_CHARS).optional(),
	cacheTtlSeconds: z.number().int().min(0).max(86_400).optional()
});

interface Match {
	id: string;
	score: number;
	text?: string;
}

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

function hashKey(parts: Record<string, unknown>): string {
	// Stable, short key for KV; FNV-1a 32-bit over JSON keeps the namespace
	// scoped without pulling in a full SHA-1 pass on every request.
	const json = JSON.stringify(parts);
	let hash = 0x811c9dc5;
	for (let i = 0; i < json.length; i++) {
		hash ^= json.charCodeAt(i);
		hash = Math.imul(hash, 0x01000193);
	}
	return `rag:answer:${(hash >>> 0).toString(16)}`;
}

const ragAnswerHandler = new Hono<HonoEnv>().post(
	"/answer",
	zValidator("json", AnswerSchema),
	async (c) => {
		const { namespace, query, top_k, instructions, cacheTtlSeconds } =
			c.req.valid("json");

		const cacheKey = hashKey({ namespace, query, top_k, instructions });

		const cached = await c.env.KV.get<{
			answer: string;
			matches: Match[];
		}>(cacheKey, "json");
		if (cached) {
			c.header("Cache-Control", `public, max-age=${KV_CACHE_TTL_S}`);
			return ApiResponse.ok(c, "RAG answer served from cache", {
				answer: cached.answer,
				matches: cached.matches,
				cached: true,
				namespace,
				query
			});
		}

		const values = await embed(c.env, query);

		const vectorResult = (await c.env.VECTORIZE.query(values, {
			topK: top_k,
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

		const matches: Match[] = (vectorResult.matches ?? []).map((m) => ({
			id: m.id,
			score: m.score,
			text:
				typeof m.metadata?.text === "string"
					? (m.metadata.text as string).slice(0, PER_CHUNK_CHARS)
					: undefined
		}));

		if (matches.length === 0) {
			throw ApiError.notFound(
				`No indexed chunks found for namespace "${namespace}"`
			);
		}

		const context = matches
			.map(
				(m, i) =>
					`[${i + 1}] (score=${m.score.toFixed(3)}) ${
						m.text ?? "(no preview)"
					}`
			)
			.join("\n\n");

		const systemPrompt = instructions
			? `Answer using only the indexed context below. ${instructions} If the context is insufficient, say so explicitly.`
			: "Answer using only the indexed context below. Cite sources as [n] and quote sparingly. If the context is insufficient, say so explicitly.";

		const chatResult = (await c.env.AI.run(CHAT_MODEL as any, {
			messages: [
				{ role: "system", content: systemPrompt },
				{
					role: "user",
					content: `Question: ${query}\n\nIndexed context:\n${context}`
				}
			],
			max_tokens: 1024
		})) as { response?: string };

		const answer = chatResult.response ?? "";

		const ttl = cacheTtlSeconds ?? KV_CACHE_TTL_S;
		if (ttl > 0) {
			c.env.KV.put(cacheKey, JSON.stringify({ answer, matches }), {
				expirationTtl: ttl
			});
		}

		c.header("Cache-Control", `public, max-age=${ttl}`);
		return ApiResponse.ok(c, "RAG answer generated", {
			answer,
			matches,
			cached: false,
			namespace,
			query
		});
	}
);

export default ragAnswerHandler;

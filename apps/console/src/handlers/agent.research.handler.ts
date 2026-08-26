import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import type { HonoEnv } from "@/types/hono.types";
import type { Ai } from "cloudflare:workers";
import { ApiResponse } from "@/helpers/response.helper";
import { ApiError } from "@/helpers/errors.helper";

const BodySchema = z.object({
	url: z.string().url().max(2048),
	focus: z.string().max(1000).optional(),
	max_tokens: z.number().int().min(64).max(2048).default(512)
});

const CACHE_TTL_S = 3 * 24 * 60 * 60; // 3 days

interface ResearchResult {
	url: string;
	title: string;
	content: string;
	focus: string | null;
	summary: string;
	related: Array<{ id: string; score: number; metadata?: unknown }>;
}

async function embed(ai: Ai, text: string): Promise<number[]> {
	const out = (await (ai as any).run("@cf/baai/bge-m3", {
		text
	})) as { data?: number[][] };
	const v = out.data?.[0];
	if (!Array.isArray(v) || v.length === 0) {
		throw ApiError.badGateway("Failed to generate embedding");
	}
	return v;
}

const agentResearchHandler = new Hono<HonoEnv>().post(
	"/research",
	zValidator("json", BodySchema),
	async (c) => {
		const { url, focus, max_tokens } = c.req.valid("json");
		const kv = c.env.KV;
		const vectorize = c.env.VECTORIZE;
		const ai = c.env.AI;

		// 1. Cheap cache: same URL + focus → same result for 3 days
		const cacheKey = `agent-research:${url}:${focus ?? ""}`;
		const cached = await kv.get(cacheKey, "json");
		if (cached) {
			return ApiResponse.ok(c, "Research result (cached)", {
				...(cached as ResearchResult),
				cached: true
			});
		}

		// 2. Fetch the page via the Browser Rendering binding.
		//    Falls back to a plain fetch if browser isn't available
		//    (e.g. mobile Safari, sandbox limits).
		let html = "";
		let title = url;
		try {
			const browser = (c.env as unknown as Record<string, unknown>)
				.BROWSER as { fetch: typeof fetch } | undefined;
			if (browser && typeof browser.fetch === "function") {
				const res = await browser.fetch(url, {
					headers: { "User-Agent": "TanshipAgent/1.0" }
				});
				if (res.ok) html = await res.text();
			}
		} catch {
			// Browser rendering not available or failed; fall back below.
		}
		if (!html) {
			try {
				const res = await fetch(url, {
					headers: { "User-Agent": "TanshipAgent/1.0" }
				});
				if (res.ok) html = await res.text();
			} catch (err) {
				throw ApiError.badGateway(
					`Failed to fetch URL: ${(err as Error).message}`
				);
			}
		}

		// 3. Pull <title> and strip to a manageable plain-text body.
		const titleMatch = html.match(/<title[^>]*>([^<]{1,300})<\/title>/i);
		if (titleMatch) title = titleMatch[1].trim();
		const text = html
			.replace(/<script\b[\s\S]*?<\/script>/gi, " ")
			.replace(/<style\b[\s\S]*?<\/style>/gi, " ")
			.replace(/<[^>]+>/g, " ")
			.replace(/&nbsp;/g, " ")
			.replace(/&amp;/g, "&")
			.replace(/&lt;/g, "<")
			.replace(/&gt;/g, ">")
			.replace(/&#39;/g, "'")
			.replace(/&quot;/g, '"')
			.replace(/\s+/g, " ")
			.trim()
			.slice(0, 12_000);

		// 4. Embed the page text, then ask Vectorize for semantically
		//    related items the agent has stored before.
		const queryVec = await embed(ai, focus ? `${title}\n${focus}` : title);
		const related = (await vectorize.query(queryVec, {
			topK: 5,
			returnMetadata: true
		})) as {
			matches?: Array<{ id: string; score: number; metadata?: unknown }>;
		};
		const relatedMatches = related.matches ?? [];

		// 5. Synthesize a 3-sentence grounded summary with the focus in
		//    mind. Inject the related context if any.
		const system =
			"You are a research assistant. Write exactly 3 sentences summarizing " +
			"the article for an AI agent. Ground every claim in the article body. " +
			"If a focus is provided, weight that aspect. Cite the page URL in " +
			"the final sentence. Output plain prose only, no markdown.";
		const userMsg = focus
			? `URL: ${url}\nTitle: ${title}\nFocus: ${focus}\n\nArticle:\n${text}`
			: `URL: ${url}\nTitle: ${title}\n\nArticle:\n${text}`;

		const aiRes = (await (ai as any).run(
			"@cf/meta/llama-3.3-70b-instruct-fp8-fast",
			{
				messages: [
					{ role: "system", content: system },
					{ role: "user", content: userMsg }
				],
				max_tokens
			}
		)) as { response?: string };
		const summary = aiRes.response?.trim() || text.slice(0, 400);

		const result: ResearchResult = {
			url,
			title,
			content: text.slice(0, 2000),
			focus: focus ?? null,
			summary,
			related: relatedMatches.map((m) => ({
				id: m.id,
				score: m.score,
				metadata: m.metadata
			}))
		};

		await kv.put(cacheKey, JSON.stringify(result), {
			expirationTtl: CACHE_TTL_S
		});

		return ApiResponse.ok(c, "Research complete", {
			...result,
			cached: false
		});
	}
);

export default agentResearchHandler;

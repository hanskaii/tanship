/**
 * browser.crawl — Multi-page web crawl with depth limit.
 * Bundles Browser Run links + markdown into a single paid call.
 * Blue ocean: 0 x402 competitors for multi-page crawl.
 * Price: $0.030 — covers ~3 Browser Run calls (1 + links + markdown per page).
 */
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { BrowserRenderingService } from "@/services/browser.service";
import { ApiResponse } from "@/helpers/response.helper";
import type { HonoEnv } from "@/types/hono.types";

const CrawlSchema = z.object({
	url: z.string().url(),
	max_depth: z.number().int().min(1).max(5).default(3),
	max_urls: z.number().int().min(1).max(50).default(20),
	include_content: z.boolean().default(true),
	filters: z
		.object({
			/** Only follow URLs matching these patterns */
			allow: z.array(z.string()).optional(),
			/** Skip URLs matching these patterns */
			deny: z.array(z.string()).optional()
		})
		.optional()
});

type CrawlResult = {
	url: string;
	status: "ok" | "error";
	httpStatus?: number;
	title?: string;
	content?: string;
	links?: string[];
	depth: number;
};

function urlMatchesFilter(
	url: string,
	filters?: { allow?: string[]; deny?: string[] }
): boolean {
	if (filters?.deny?.some((p) => url.includes(p))) return false;
	if (filters?.allow?.length && !filters.allow.some((p) => url.includes(p)))
		return false;
	return true;
}

function normalizeUrl(base: string, href: string): string | null {
	try {
		// Skip anchors, mailto, tel, javascript
		if (/^(#|mailto:|tel:|javascript:)/i.test(href)) return null;
		const baseObj = new URL(base);
		return new URL(href, baseObj).href;
	} catch {
		return null;
	}
}

export const browserCrawlHandler = new Hono<HonoEnv>().post(
	"/crawl",
	zValidator("json", CrawlSchema),
	async (c) => {
		const { url, max_depth, max_urls, include_content, filters } =
			c.req.valid("json");

		const browser = new BrowserRenderingService(
			c.env.CLOUDFLARE_ACCOUNT_ID,
			c.env.CLOUDFLARE_API_TOKEN
		);

		const visited = new Set<string>();
		const results: CrawlResult[] = [];

		// BFS queue: [url, depth]
		const queue: Array<[string, number]> = [[url, 0]];
		visited.add(url);

		while (queue.length > 0 && results.length < max_urls) {
			const [currentUrl, depth] = queue.shift()!;

			if (depth > max_depth) continue;

			// Fetch the page
			let pageResult: CrawlResult = {
				url: currentUrl,
				status: "error",
				depth
			};

			try {
				// Extract markdown content
				if (include_content) {
					const markdown = await browser.markdown(currentUrl);
					const titleMatch = markdown.match(/^#\s+(.+)$/m);
					pageResult.title =
						titleMatch?.[1]?.slice(0, 200) ?? undefined;
					pageResult.content = markdown.slice(0, 50_000); // cap content size
				}

				// Extract links for next level
				const links = await browser.links(currentUrl);
				pageResult.links = links;
				pageResult.status = "ok";

				// Enqueue next-level links (same-domain only to stay focused)
				if (depth < max_depth) {
					try {
						const baseHost = new URL(currentUrl).hostname;
						for (const href of links) {
							const next = normalizeUrl(currentUrl, href);
							if (!next) continue;
							let nextHost: string;
							try {
								nextHost = new URL(next).hostname;
							} catch {
								continue;
							}
							if (nextHost !== baseHost) continue; // stay same-domain
							if (!urlMatchesFilter(next, filters)) continue;
							if (visited.has(next)) continue;
							visited.add(next);
							queue.push([next, depth + 1]);
						}
					} catch {
						// Ignore URL parsing errors for link filtering
					}
				}
			} catch (err: unknown) {
				const msg = err instanceof Error ? err.message : String(err);
				if (
					msg.includes("403") ||
					msg.includes("404") ||
					msg.includes("blocked")
				) {
					pageResult.httpStatus = msg.includes("403")
						? 403
						: msg.includes("404")
							? 404
							: 0;
				}
				// still push the result (status = error)
			}

			results.push(pageResult);
		}

		const ok = results.filter((r) => r.status === "ok").length;
		return ApiResponse.ok(c, "Crawl completed", {
			startUrl: url,
			maxDepth: max_depth,
			maxUrls: max_urls,
			totalCrawled: results.length,
			successful: ok,
			failed: results.length - ok,
			results
		});
	}
);

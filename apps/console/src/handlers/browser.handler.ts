import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

import { BrowserRenderingService } from "@/services/browser.service";
import { ApiError } from "@/helpers/errors.helper";
import { ApiResponse } from "@/helpers/response.helper";
import { buildRssFeed, type FeedItem } from "@/helpers/rss.helper";
import type { HonoEnv } from "@/types/hono.types";

const UrlSchema = z.object({
	url: z.url()
});

const ScreenshotSchema = UrlSchema.extend({
	fullPage: z.boolean().default(false),
	width: z.number().int().min(320).max(3840).default(1280),
	height: z.number().int().min(240).max(2160).default(800)
});

const ScrapeSchema = UrlSchema.extend({
	selectors: z.array(z.string().min(1).max(500)).min(1).max(20)
});

const ExtractSchema = UrlSchema.extend({
	prompt: z.string().min(1).max(4096),
	schema: z.record(z.string(), z.unknown()).optional()
});

const RssSchema = UrlSchema.extend({
	limit: z.number().int().min(1).max(50).default(20)
});

const RSS_EXTRACTION_SCHEMA = {
	type: "object",
	properties: {
		title: { type: "string", description: "Title of the page or feed" },
		description: { type: "string", description: "Short feed description" },
		items: {
			type: "array",
			items: {
				type: "object",
				properties: {
					title: { type: "string" },
					link: {
						type: "string",
						description: "Absolute URL of the article"
					},
					description: { type: "string" },
					date: {
						type: "string",
						description: "Publish date if visible (ISO 8601)"
					}
				},
				required: ["title", "link"]
			}
		}
	},
	required: ["title", "items"]
} as const;

const browserHandler = new Hono<HonoEnv>()
	.post("/screenshot", zValidator("json", ScreenshotSchema), async (c) => {
		const input = c.req.valid("json");
		const browser = new BrowserRenderingService(
			c.env.CLOUDFLARE_ACCOUNT_ID,
			c.env.CLOUDFLARE_API_TOKEN
		);

		const image = await browser.screenshot(input);
		return c.body(image, 200, { "Content-Type": "image/png" });
	})
	.post("/pdf", zValidator("json", UrlSchema), async (c) => {
		const { url } = c.req.valid("json");
		const browser = new BrowserRenderingService(
			c.env.CLOUDFLARE_ACCOUNT_ID,
			c.env.CLOUDFLARE_API_TOKEN
		);

		const pdf = await browser.pdf(url);
		return c.body(pdf, 200, { "Content-Type": "application/pdf" });
	})
	.post("/markdown", zValidator("json", UrlSchema), async (c) => {
		const { url } = c.req.valid("json");
		const browser = new BrowserRenderingService(
			c.env.CLOUDFLARE_ACCOUNT_ID,
			c.env.CLOUDFLARE_API_TOKEN
		);

		const markdown = await browser.markdown(url);
		return ApiResponse.ok(c, "Markdown extracted", { url, markdown });
	})
	.post("/links", zValidator("json", UrlSchema), async (c) => {
		const { url } = c.req.valid("json");
		const browser = new BrowserRenderingService(
			c.env.CLOUDFLARE_ACCOUNT_ID,
			c.env.CLOUDFLARE_API_TOKEN
		);

		const links = await browser.links(url);
		return ApiResponse.ok(c, "Links extracted", {
			url,
			count: links.length,
			links
		});
	})
	.post("/snapshot", zValidator("json", UrlSchema), async (c) => {
		const { url } = c.req.valid("json");
		const browser = new BrowserRenderingService(
			c.env.CLOUDFLARE_ACCOUNT_ID,
			c.env.CLOUDFLARE_API_TOKEN
		);

		const snapshot = await browser.snapshot(url);
		return ApiResponse.ok(c, "Snapshot captured", {
			url,
			html: snapshot.content,
			screenshot: snapshot.screenshot
		});
	})
	.post("/scrape", zValidator("json", ScrapeSchema), async (c) => {
		const { url, selectors } = c.req.valid("json");
		const browser = new BrowserRenderingService(
			c.env.CLOUDFLARE_ACCOUNT_ID,
			c.env.CLOUDFLARE_API_TOKEN
		);

		const results = await browser.scrape(url, selectors);
		return ApiResponse.ok(c, "Elements scraped", { url, results });
	})
	.post("/json", zValidator("json", ExtractSchema), async (c) => {
		const { url, prompt, schema } = c.req.valid("json");
		const browser = new BrowserRenderingService(
			c.env.CLOUDFLARE_ACCOUNT_ID,
			c.env.CLOUDFLARE_API_TOKEN
		);

		const result = await browser.json(url, prompt, schema);
		return ApiResponse.ok(c, "Structured data extracted", { url, result });
	})
	.post("/rss", zValidator("json", RssSchema), async (c) => {
		const { url, limit } = c.req.valid("json");
		const browser = new BrowserRenderingService(
			c.env.CLOUDFLARE_ACCOUNT_ID,
			c.env.CLOUDFLARE_API_TOKEN
		);

		const extracted = (await browser.json(
			url,
			"Extract the articles or posts listed on this page as a feed. Include every visible article with its absolute URL, and the page title and description.",
			RSS_EXTRACTION_SCHEMA as unknown as Record<string, unknown>
		)) as {
			title?: string;
			description?: string;
			items?: FeedItem[];
		} | null;

		if (!extracted?.items?.length) {
			throw ApiError.badGateway(
				"Could not extract feed items from the page"
			);
		}

		const feed = buildRssFeed({
			title: extracted.title ?? url,
			description: extracted.description,
			sourceUrl: url,
			items: extracted.items.slice(0, limit)
		});

		return c.body(feed, 200, {
			"Content-Type": "application/rss+xml; charset=utf-8"
		});
	});

export default browserHandler;

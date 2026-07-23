import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

import { BrowserRenderingService } from "@/services/browser.service";
import { ApiError } from "@/helpers/errors.helper";
import { ApiResponse } from "@/helpers/response.helper";
import type { HonoEnv } from "@/types/hono.types";

const RedditSearchSchema = z.object({
	query: z.string().min(1).max(500),
	sort: z
		.enum(["relevance", "hot", "top", "new", "comments"])
		.default("relevance"),
	timeframe: z
		.enum(["all", "year", "month", "week", "day", "hour"])
		.default("all"),
	limit: z.number().int().min(1).max(50).default(10)
});

const RedditCommentsSchema = z.object({
	url: z
		.string()
		.url()
		.refine(
			(u) => u.includes("reddit.com"),
			"URL must be a reddit.com link"
		),
	limit: z.number().int().min(1).max(100).default(25)
});

const REDDIT_SEARCH_SCHEMA = {
	type: "object",
	properties: {
		results: {
			type: "array",
			items: {
				type: "object",
				properties: {
					title: { type: "string" },
					subreddit: { type: "string" },
					author: { type: "string" },
					url: {
						type: "string",
						description: "Absolute permalink to the Reddit post"
					},
					score: { type: "integer", description: "Upvote score" },
					commentCount: { type: "integer" },
					snippet: {
						type: "string",
						description: "Truncated preview of the post body"
					},
					date: {
						type: "string",
						description: "Post date if visible"
					}
				},
				required: ["title", "subreddit", "url"]
			}
		}
	},
	required: ["results"]
} as const;

const REDDIT_COMMENTS_SCHEMA = {
	type: "object",
	properties: {
		post: {
			type: "object",
			properties: {
				title: { type: "string" },
				author: { type: "string" },
				subreddit: { type: "string" },
				score: { type: "integer" },
				body: {
					type: "string",
					description: "Full post text content"
				},
				date: { type: "string" }
			},
			required: ["title", "body"]
		},
		comments: {
			type: "array",
			items: {
				type: "object",
				properties: {
					author: { type: "string" },
					body: { type: "string" },
					score: { type: "integer" },
					date: { type: "string" }
				},
				required: ["author", "body"]
			}
		}
	},
	required: ["post", "comments"]
} as const;

const redditHandler = new Hono<HonoEnv>()
	.post("/search", zValidator("json", RedditSearchSchema), async (c) => {
		const { query, sort, timeframe, limit } = c.req.valid("json");
		const browser = new BrowserRenderingService(
			c.env.CLOUDFLARE_ACCOUNT_ID,
			c.env.CLOUDFLARE_API_TOKEN
		);

		const targetUrl = `https://old.reddit.com/search?q=${encodeURIComponent(query)}&sort=${sort}&t=${timeframe}`;

		const extracted = (await browser.json(
			targetUrl,
			"Extract all search result posts from this Reddit search page. Include each post's title, subreddit, author, absolute permalink URL, score, comment count, snippet preview, and date.",
			REDDIT_SEARCH_SCHEMA as unknown as Record<string, unknown>
		)) as {
			results?: Array<{
				title: string;
				subreddit: string;
				author?: string;
				url: string;
				score?: number;
				commentCount?: number;
				snippet?: string;
				date?: string;
			}>;
		} | null;

		const results = (extracted?.results ?? []).slice(0, limit);

		return ApiResponse.ok(c, "Reddit search completed", {
			query,
			sort,
			timeframe,
			count: results.length,
			results
		});
	})
	.post("/comments", zValidator("json", RedditCommentsSchema), async (c) => {
		const { url, limit } = c.req.valid("json");
		const browser = new BrowserRenderingService(
			c.env.CLOUDFLARE_ACCOUNT_ID,
			c.env.CLOUDFLARE_API_TOKEN
		);

		// Use old.reddit.com for cleaner HTML extraction
		const oldUrl = url.replace("www.reddit.com", "old.reddit.com");

		const extracted = (await browser.json(
			oldUrl,
			`Extract the post content and all comments from this Reddit thread. Include the full post title, author, subreddit, score, body text, and date. For comments, include author, full body text, score, and date. Return up to ${limit} top-level comments.`,
			REDDIT_COMMENTS_SCHEMA as unknown as Record<string, unknown>
		)) as {
			post?: {
				title: string;
				author?: string;
				subreddit?: string;
				score?: number;
				body: string;
				date?: string;
			};
			comments?: Array<{
				author: string;
				body: string;
				score?: number;
				date?: string;
			}>;
		} | null;

		if (!extracted?.post) {
			throw ApiError.badGateway(
				"Could not extract post content from the Reddit thread"
			);
		}

		return ApiResponse.ok(c, "Reddit comments extracted", {
			url,
			post: extracted.post,
			commentCount: (extracted.comments ?? []).length,
			comments: (extracted.comments ?? []).slice(0, limit)
		});
	});

export default redditHandler;

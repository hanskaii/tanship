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
	height: z.number().int().min(240).max(2160).default(800),
	selector: z.string().optional()
});

const PdfSchema = UrlSchema.extend({
	scale: z.number().min(0.1).max(2.0).default(1.0),
	printBackground: z.boolean().default(false),
	landscape: z.boolean().default(false),
	pageRanges: z.string().optional(),
	format: z.string().default("Letter"),
	margin: z
		.object({
			top: z.string().default("0px"),
			bottom: z.string().default("0px"),
			left: z.string().default("0px"),
			right: z.string().default("0px")
		})
		.optional()
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

const SearchSchema = z.object({
	query: z.string().min(1).max(500),
	limit: z.number().int().min(1).max(50).default(10)
});
const SearchSummarySchema = z.object({
	query: z.string().min(1).max(500)
});
const NewsSchema = z.object({
	query: z.string().min(1).max(500),
	limit: z.number().int().min(1).max(50).default(10)
});

const SEARCH_EXTRACTION_SCHEMA = {
	type: "object",
	properties: {
		results: {
			type: "array",
			items: {
				type: "object",
				properties: {
					title: { type: "string" },
					url: {
						type: "string",
						description: "Absolute URL of the search result link"
					},
					snippet: { type: "string" }
				},
				required: ["title", "url", "snippet"]
			}
		}
	},
	required: ["results"]
} as const;

const ARTICLE_EXTRACTION_SCHEMA = {
	type: "object",
	properties: {
		title: { type: "string" },
		author: { type: "string" },
		date: { type: "string", description: "Publish date if visible" },
		readTimeMin: {
			type: "integer",
			description: "Estimated reading time in minutes"
		},
		excerpt: {
			type: "string",
			description: "Short summary or lead paragraph"
		},
		contentHtml: {
			type: "string",
			description: "Cleaned article body HTML, excluding ads/sidebars"
		},
		contentMarkdown: {
			type: "string",
			description: "Cleaned article body Markdown"
		}
	},
	required: ["title", "contentMarkdown"]
} as const;

const FORMS_EXTRACTION_SCHEMA = {
	type: "object",
	properties: {
		forms: {
			type: "array",
			items: {
				type: "object",
				properties: {
					action: { type: "string" },
					method: { type: "string" },
					inputs: {
						type: "array",
						items: {
							type: "object",
							properties: {
								name: { type: "string" },
								type: { type: "string" },
								placeholder: { type: "string" },
								required: { type: "boolean" }
							},
							required: ["name", "type"]
						}
					},
					submitButton: { type: "string" }
				},
				required: ["inputs"]
			}
		}
	},
	required: ["forms"]
} as const;

const CONTACTS_EXTRACTION_SCHEMA = {
	type: "object",
	properties: {
		emails: {
			type: "array",
			items: { type: "string" },
			description: "Email addresses found on the page"
		},
		phones: {
			type: "array",
			items: { type: "string" },
			description: "Phone numbers found on the page"
		},
		addresses: {
			type: "array",
			items: { type: "string" },
			description: "Physical or mailing addresses found on the page"
		},
		socialLinks: {
			type: "array",
			items: {
				type: "object",
				properties: {
					platform: {
						type: "string",
						description: "e.g. twitter, linkedin, github, facebook"
					},
					url: { type: "string", description: "Profile URL" }
				},
				required: ["platform", "url"]
			}
		}
	},
	required: ["emails", "phones", "socialLinks"]
} as const;

const SEO_EXTRACTION_SCHEMA = {
	type: "object",
	properties: {
		score: {
			type: "integer",
			description: "SEO Health Score from 0 to 100"
		},
		metadata: {
			type: "object",
			properties: {
				title: { type: "string" },
				description: { type: "string" },
				canonicalUrl: { type: "string" },
				robots: { type: "string" }
			},
			required: ["title"]
		},
		headingStructure: {
			type: "array",
			items: { type: "string" },
			description:
				"Sequence of heading tags on the page (e.g. h1, h2, h2, h3)"
		},
		imageCount: {
			type: "object",
			properties: {
				total: { type: "integer" },
				missingAlt: { type: "integer" }
			},
			required: ["total", "missingAlt"]
		},
		issues: {
			type: "array",
			items: {
				type: "object",
				properties: {
					severity: { type: "string", enum: ["critical", "warning"] },
					message: { type: "string" },
					recommendation: { type: "string" }
				},
				required: ["severity", "message", "recommendation"]
			}
		}
	},
	required: ["score", "metadata", "issues"]
} as const;

const METADATA_EXTRACTION_SCHEMA = {
	type: "object",
	properties: {
		title: { type: "string" },
		description: { type: "string" },
		ogTitle: { type: "string" },
		ogDescription: { type: "string" },
		ogImage: { type: "string" },
		canonicalUrl: { type: "string" },
		author: { type: "string" },
		keywords: { type: "array", items: { type: "string" } }
	},
	required: ["title"]
} as const;

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
	.post("/pdf", zValidator("json", PdfSchema), async (c) => {
		const input = c.req.valid("json");
		const browser = new BrowserRenderingService(
			c.env.CLOUDFLARE_ACCOUNT_ID,
			c.env.CLOUDFLARE_API_TOKEN
		);

		const pdf = await browser.pdf(input);
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
	})
	.post("/search", zValidator("json", SearchSchema), async (c) => {
		const { query, limit } = c.req.valid("json");
		const browser = new BrowserRenderingService(
			c.env.CLOUDFLARE_ACCOUNT_ID,
			c.env.CLOUDFLARE_API_TOKEN
		);

		const targetUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;

		const extracted = (await browser.json(
			targetUrl,
			"Extract the search result items listed on this page. Include every search result with its title, absolute URL, and snippet description.",
			SEARCH_EXTRACTION_SCHEMA as unknown as Record<string, unknown>
		)) as {
			results?: Array<{ title: string; url: string; snippet: string }>;
		} | null;

		const results = extracted?.results ?? [];

		return ApiResponse.ok(c, "Web search completed", {
			query,
			count: results.length,
			results: results.slice(0, limit)
		});
	})
	.post("/metadata", zValidator("json", UrlSchema), async (c) => {
		const { url } = c.req.valid("json");
		const browser = new BrowserRenderingService(
			c.env.CLOUDFLARE_ACCOUNT_ID,
			c.env.CLOUDFLARE_API_TOKEN
		);

		const result = await browser.json(
			url,
			"Extract the page SEO and OpenGraph metadata. Return an object with title, description, ogTitle, ogDescription, ogImage, canonicalUrl, author, and keywords.",
			METADATA_EXTRACTION_SCHEMA as unknown as Record<string, unknown>
		);

		return ApiResponse.ok(c, "Metadata extracted", {
			url,
			metadata: result
		});
	})
	.post("/article", zValidator("json", UrlSchema), async (c) => {
		const { url } = c.req.valid("json");
		const browser = new BrowserRenderingService(
			c.env.CLOUDFLARE_ACCOUNT_ID,
			c.env.CLOUDFLARE_API_TOKEN
		);

		const result = await browser.json(
			url,
			"Extract the main article content. Return an object with title, author, date, readTimeMin, excerpt, contentHtml, and contentMarkdown, cleaned from sidebars, navigations, and advertisements.",
			ARTICLE_EXTRACTION_SCHEMA as unknown as Record<string, unknown>
		);

		return ApiResponse.ok(c, "Article extracted", { url, article: result });
	})
	.post("/news", zValidator("json", NewsSchema), async (c) => {
		const { query, limit } = c.req.valid("json");

		const rssUrl =
			"https://news.google.com/rss/search?q=" +
			encodeURIComponent(query) +
			"&hl=en-US&gl=US&ceid=US:en";

		const res = await fetch(rssUrl, {
			headers: {
				"User-Agent":
					"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
			}
		});

		if (!res.ok) {
			throw ApiError.badGateway(
				"Failed to fetch news from Google RSS: " + res.statusText
			);
		}

		const xml = await res.text();
		const items = [];

		const itemMatches = xml.matchAll(/<item>([\s\S]*?)<\/item>/g);
		for (const match of itemMatches) {
			const itemXml = match[1];
			const title =
				(itemXml.match(/<title>([\s\S]*?)<\/title>/) || [])[1] || "";
			const link =
				(itemXml.match(/<link>([\s\S]*?)<\/link>/) || [])[1] || "";
			const pubDate =
				(itemXml.match(/<pubDate>([\s\S]*?)<\/pubDate>/) || [])[1] ||
				"";
			const source =
				(itemXml.match(/<source[^>]*>([\s\S]*?)<\/source>/) || [])[1] ||
				"";

			// Clean XML entities
			const cleanTitle = title
				.replace(/&amp;/g, "&")
				.replace(/&lt;/g, "<")
				.replace(/&gt;/g, ">")
				.replace(/&quot;/g, String.fromCharCode(34))
				.replace(/&apos;/g, String.fromCharCode(39))
				.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1");

			const cleanLink = link
				.replace(/&amp;/g, "&")
				.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1");

			const cleanSource = source
				.replace(/&amp;/g, "&")
				.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1");

			items.push({
				title: cleanTitle.trim(),
				link: cleanLink.trim(),
				pubDate: pubDate.trim(),
				source: cleanSource.trim()
			});
		}

		const results = items.slice(0, limit);

		return ApiResponse.ok(c, "Real-time news search completed", {
			query,
			count: results.length,
			results
		});
	})
	.post(
		"/search/summary",
		zValidator("json", SearchSummarySchema),
		async (c) => {
			const { query } = c.req.valid("json");
			const browser = new BrowserRenderingService(
				c.env.CLOUDFLARE_ACCOUNT_ID,
				c.env.CLOUDFLARE_API_TOKEN
			);

			const targetUrl =
				"https://html.duckduckgo.com/html/?q=" +
				encodeURIComponent(query);

			const extracted = (await browser.json(
				targetUrl,
				"Extract the search result items listed on this page. Include every search result with its title, absolute URL, and snippet description.",
				SEARCH_EXTRACTION_SCHEMA as unknown as Record<string, unknown>
			)) as {
				results?: Array<{
					title: string;
					url: string;
					snippet: string;
				}>;
			} | null;

			const results = (extracted?.results ?? []).slice(0, 5);

			if (results.length === 0) {
				return ApiResponse.ok(
					c,
					"No search results found to summarize",
					{
						query,
						answer: "No relevant search results were found.",
						sources: []
					}
				);
			}

			// Format sources context
			const context = results
				.map(
					(r, i) =>
						"[" +
						(i + 1) +
						"] Title: " +
						r.title +
						"\nURL: " +
						r.url +
						"\nSnippet: " +
						r.snippet
				)
				.join("\n\n");

			const systemPrompt =
				"You are a professional research assistant. Synthesize the provided search results to answer the user request accurately. Cite your sources using [1], [2], etc., corresponding to the indices of the search results. Keep your response concise, factual, and clear.";
			const userPrompt =
				"Query: " + query + "\n\nSearch Results:\n" + context;

			const aiResult = (await c.env.AI.run(
				"@cf/meta/llama-3.3-70b-instruct-fp8-fast",
				{
					messages: [
						{ role: "system", content: systemPrompt },
						{ role: "user", content: userPrompt }
					],
					max_tokens: 1024
				}
			)) as { response?: string };

			return ApiResponse.ok(c, "Search summary completed", {
				query,
				answer: aiResult.response ?? "",
				sources: results.map((r, i) => ({
					index: i + 1,
					title: r.title,
					url: r.url
				}))
			});
		}
	)
	.post("/seo", zValidator("json", UrlSchema), async (c) => {
		const { url } = c.req.valid("json");
		const browser = new BrowserRenderingService(
			c.env.CLOUDFLARE_ACCOUNT_ID,
			c.env.CLOUDFLARE_API_TOKEN
		);

		const result = await browser.json(
			url,
			"Perform an SEO audit of this webpage. Check the metadata (title, description, canonical link, robots meta tag), heading tags sequence (H1s, H2s), image counts, and missing alt tags. Evaluate and return a health score (0-100), structure, and a list of key issues/warnings with recommendations.",
			SEO_EXTRACTION_SCHEMA as unknown as Record<string, unknown>
		);

		return ApiResponse.ok(c, "SEO audit completed", { url, audit: result });
	})
	.post("/contacts", zValidator("json", UrlSchema), async (c) => {
		const { url } = c.req.valid("json");
		const browser = new BrowserRenderingService(
			c.env.CLOUDFLARE_ACCOUNT_ID,
			c.env.CLOUDFLARE_API_TOKEN
		);

		const result = await browser.json(
			url,
			"Extract all contact details. Return an object with emails, phones, addresses, and socialLinks (platform and profile URL) found on the page.",
			CONTACTS_EXTRACTION_SCHEMA as unknown as Record<string, unknown>
		);

		return ApiResponse.ok(c, "Contact details extracted", {
			url,
			contacts: result
		});
	})
	.post("/sitemap", zValidator("json", UrlSchema), async (c) => {
		const { url } = c.req.valid("json");
		const browser = new BrowserRenderingService(
			c.env.CLOUDFLARE_ACCOUNT_ID,
			c.env.CLOUDFLARE_API_TOKEN
		);

		const links = await browser.links(url);

		let origin;
		try {
			origin = new URL(url).origin;
		} catch (err) {
			throw ApiError.badRequest("Invalid website root URL");
		}

		const internalLinks = Array.from(
			new Set(
				links
					.map((link) => {
						try {
							const parsed = new URL(link, url);
							if (parsed.origin === origin) {
								parsed.hash = "";
								return parsed.toString();
							}
						} catch (e) {}
						return null;
					})
					.filter((link): link is string => link !== null)
			)
		);

		const accept = c.req.header("Accept");
		if (
			accept &&
			(accept.includes("application/xml") || accept.includes("text/xml"))
		) {
			const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${internalLinks.map((l) => `  <url>\n    <loc>${l.replace(/&/g, "&amp;")}</loc>\n  </url>`).join("\n")}\n</urlset>`;
			return c.body(xml, 200, {
				"Content-Type": "application/xml; charset=utf-8"
			});
		}

		return ApiResponse.ok(c, "XML sitemap links extracted", {
			url,
			origin,
			count: internalLinks.length,
			links: internalLinks
		});
	})
	.post("/forms", zValidator("json", UrlSchema), async (c) => {
		const { url } = c.req.valid("json");
		const browser = new BrowserRenderingService(
			c.env.CLOUDFLARE_ACCOUNT_ID,
			c.env.CLOUDFLARE_API_TOKEN
		);

		const result = await browser.json(
			url,
			"Extract all web forms and input elements from this page. Return an array of forms, each containing the action URL, method, inputs schema (name, type, placeholder, required), and submit button text.",
			FORMS_EXTRACTION_SCHEMA as unknown as Record<string, unknown>
		);

		return ApiResponse.ok(c, "Web forms extracted", { url, result });
	});
export default browserHandler;

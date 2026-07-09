import type { RoutesConfig } from "@x402/core/server";
import type { Network } from "@x402/hono";

import type { NetworkDef } from "@/networks";

export interface ServiceDef {
	id: string;
	method: "GET" | "POST";
	path: string;
	price: string;
	description: string;
	mimeType: string;
	input: Record<string, string>;
}

/**
 * Single source of truth for every paid endpoint: pricing, description and
 * discovery metadata. The x402 middleware and the public catalog are both
 * derived from this list.
 */
export const SERVICES: ServiceDef[] = [
	{
		id: "ai.chat",
		method: "POST",
		path: "/v1/ai/chat",
		price: "$0.005",
		description:
			"LLM chat completion via Cloudflare Workers AI (Llama 3.3 70B by default)",
		mimeType: "application/json",
		input: {
			messages:
				"Array of { role: system|user|assistant, content: string }",
			model: "Optional model id from the allowlist",
			max_tokens: "Optional max output tokens (default 1024)"
		}
	},
	{
		id: "ai.image",
		method: "POST",
		path: "/v1/ai/image",
		price: "$0.02",
		description:
			"Text-to-image generation via Workers AI (FLUX.1 schnell), returns JPEG",
		mimeType: "image/jpeg",
		input: {
			prompt: "Image description",
			steps: "Optional diffusion steps 1-8 (default 4)"
		}
	},
	{
		id: "ai.embeddings",
		method: "POST",
		path: "/v1/ai/embeddings",
		price: "$0.002",
		description:
			"Multilingual text embeddings via Workers AI (BGE-M3, 1024 dims)",
		mimeType: "application/json",
		input: {
			text: "A string or array of strings (max 100)"
		}
	},
	{
		id: "browser.screenshot",
		method: "POST",
		path: "/v1/browser/screenshot",
		price: "$0.01",
		description:
			"Screenshot any webpage — paste a URL, get a pixel-perfect picture of the live page (PNG)",
		mimeType: "image/png",
		input: {
			url: "Page URL",
			fullPage: "Optional boolean (default false)",
			width: "Optional viewport width (default 1280)",
			height: "Optional viewport height (default 800)"
		}
	},
	{
		id: "browser.pdf",
		method: "POST",
		path: "/v1/browser/pdf",
		price: "$0.01",
		description: "Render any URL to PDF via Cloudflare Browser Rendering",
		mimeType: "application/pdf",
		input: {
			url: "Page URL"
		}
	},
	{
		id: "browser.markdown",
		method: "POST",
		path: "/v1/browser/markdown",
		price: "$0.005",
		description:
			"Turn a page into Markdown — strip the ads and chrome, keep the readable content",
		mimeType: "application/json",
		input: {
			url: "Page URL"
		}
	},
	{
		id: "browser.snapshot",
		method: "POST",
		path: "/v1/browser/snapshot",
		price: "$0.012",
		description:
			"Snapshot a page — rendered HTML and a screenshot, in a single call",
		mimeType: "application/json",
		input: {
			url: "Page URL"
		}
	},
	{
		id: "browser.scrape",
		method: "POST",
		path: "/v1/browser/scrape",
		price: "$0.006",
		description:
			"Scrape elements — pull specific elements off a page with CSS selectors",
		mimeType: "application/json",
		input: {
			url: "Page URL",
			selectors: "Array of CSS selectors (max 20)"
		}
	},
	{
		id: "browser.extract",
		method: "POST",
		path: "/v1/browser/json",
		price: "$0.015",
		description:
			"Extract structured data — describe what you want, get clean JSON back via AI",
		mimeType: "application/json",
		input: {
			url: "Page URL",
			prompt: "What to extract, in plain language",
			schema: "Optional JSON Schema for the response shape"
		}
	},
	{
		id: "browser.links",
		method: "POST",
		path: "/v1/browser/links",
		price: "$0.003",
		description:
			"Get every link — pull all the links off a page, internal or external",
		mimeType: "application/json",
		input: {
			url: "Page URL"
		}
	},
	{
		id: "browser.rss",
		method: "POST",
		path: "/v1/browser/rss",
		price: "$0.015",
		description:
			"Turn a page into an RSS feed — point it at any blog or news page, get a subscribable feed",
		mimeType: "application/rss+xml",
		input: {
			url: "Page URL",
			limit: "Optional max items (default 20)"
		}
	}
];

export function buildRoutesConfig(
	networks: NetworkDef[],
	evmPayTo: string,
	svmPayTo?: string
): RoutesConfig {
	return Object.fromEntries(
		SERVICES.map((service) => [
			`${service.method} ${service.path}`,
			{
				accepts: networks.map((network) => ({
					scheme: "exact",
					price: service.price,
					network: network.caip2 as Network,
					payTo: network.namespace === "solana" ? svmPayTo! : evmPayTo
				})),
				description: service.description,
				mimeType: service.mimeType
			}
		])
	) as RoutesConfig;
}

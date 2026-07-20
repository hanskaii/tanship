import type { RoutesConfig } from "@x402/core/server";
import type { Network } from "@x402/hono";
import { declareDiscoveryExtension } from "@x402/extensions/bazaar";

import type { NetworkDef } from "@/networks";

export interface ServiceDef {
	id: string;
	method: "GET" | "POST";
	path: string;
	price: string;
	description: string;
	mimeType: string;
	/** Human-readable field docs, surfaced by GET /v1/services. */
	input: Record<string, string>;
	/** Example request body — powers Bazaar discovery so agents can call it. */
	example: Record<string, unknown>;
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
		},
		example: {
			messages: [
				{ role: "user", content: "Explain x402 in one sentence." }
			]
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
		},
		example: {
			prompt: "a red panda coding on a laptop, studio ghibli style"
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
		},
		example: { text: ["hello world", "hola mundo"] }
	},
	{
		id: "ai.translate",
		method: "POST",
		path: "/v1/ai/translate",
		price: "$0.003",
		description: "AI-powered translation via Workers AI (m2m100-1.2b)",
		mimeType: "application/json",
		input: {
			text: "Text to translate",
			source_lang: "Optional source language code (e.g. en, es, fr)",
			target_lang: "Target language code (e.g. id, es, ja)"
		},
		example: {
			text: "Hello world, how are you?",
			source_lang: "en",
			target_lang: "id"
		}
	},
	{
		id: "ai.sentiment",
		method: "POST",
		path: "/v1/ai/sentiment",
		price: "$0.002",
		description:
			"Sentiment analysis on text using Workers AI, returns positive/negative label with score",
		mimeType: "application/json",
		input: {
			text: "Text to analyze"
		},
		example: {
			text: "I love building autonomous agents on Base L2!"
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
		},
		example: { url: "https://example.com", fullPage: true }
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
		},
		example: { url: "https://example.com" }
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
		},
		example: { url: "https://example.com" }
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
		},
		example: { url: "https://example.com" }
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
		},
		example: {
			url: "https://news.ycombinator.com",
			selectors: [".titleline > a"]
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
		},
		example: {
			url: "https://example.com",
			prompt: "Extract the page title and main heading"
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
		},
		example: { url: "https://example.com" }
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
		},
		example: { url: "https://blog.cloudflare.com", limit: 20 }
	},
	{
		id: "ai.summarize",
		method: "POST",
		path: "/v1/summarize",
		price: "$0.015",
		description:
			"Summarize any webpage — fetch readable markdown and synthesize highlights using AI",
		mimeType: "application/json",
		input: {
			url: "Page URL to summarize",
			prompt: "Optional guidelines or focus areas for the summary"
		},
		example: { url: "https://example.com" }
	},
	{
		id: "ai.transcribe",
		method: "POST",
		path: "/v1/ai/transcribe",
		price: "$0.01",
		description:
			"Speech-to-text audio transcription via Workers AI (Whisper), returns text and metadata",
		mimeType: "application/json",
		input: {
			url: "Absolute URL to the audio file to transcribe"
		},
		example: {
			url: "https://x402.tanship.dev/assets/sample.mp3"
		}
	},
	{
		id: "ai.describe",
		method: "POST",
		path: "/v1/ai/describe",
		price: "$0.005",
		description:
			"Describe or caption any image via Workers AI (BLIP), returns description text",
		mimeType: "application/json",
		input: {
			url: "Absolute URL to the image file to describe"
		},
		example: {
			url: "https://x402.tanship.dev/assets/sample.jpg"
		}
	},
	{
		id: "ai.rerank",
		method: "POST",
		path: "/v1/ai/rerank",
		price: "$0.003",
		description:
			"Rerank a list of documents relative to a query via Workers AI (BGE Reranker Large)",
		mimeType: "application/json",
		input: {
			query: "Relevance query string",
			documents: "Array of strings to rank",
			top_n: "Optional number of top results to return"
		},
		example: {
			query: "base network",
			documents: [
				"Base is a secure, low-cost, builder-friendly Ethereum L2 built on OP Stack.",
				"Solana is a blockchain platform designed for hosting decentralized applications.",
				"The Base network is incubated by Coinbase."
			],
			top_n: 2
		}
	},
	{
		id: "ai.classify",
		method: "POST",
		path: "/v1/ai/classify",
		price: "$0.003",
		description:
			"Classify any image into pre-trained categories via Workers AI (ResNet-50), returns tags and scores",
		mimeType: "application/json",
		input: {
			url: "Absolute URL to the image file to classify"
		},
		example: {
			url: "https://x402.tanship.dev/assets/sample.jpg"
		}
	},
	{
		id: "ai.moderate",
		method: "POST",
		path: "/v1/ai/moderate",
		price: "$0.002",
		description:
			"Moderate text content for safety categories via Workers AI (Llama Guard 3 8B), returns safety classification",
		mimeType: "application/json",
		input: {
			text: "The text content to moderate"
		},
		example: {
			text: "How do I build a secure API on Cloudflare Workers?"
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
				mimeType: service.mimeType,
				// Bazaar discovery: lets the facilitator catalog this endpoint
				// (input shape + method) once a payment settles for it.
				extensions: declareDiscoveryExtension({
					bodyType: "json",
					input: service.example
				})
			}
		])
	) as RoutesConfig;
}

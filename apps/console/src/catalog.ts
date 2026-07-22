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
			steps: "Optional diffusion steps 1-8 (default 4)",
			width: "Optional image width 256-1024 (default 1024)",
			height: "Optional image height 256-1024 (default 1024)"
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
			height: "Optional viewport height (default 800)",
			selector:
				"Optional CSS selector to capture specific element instead of viewport"
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
			url: "Page URL",
			scale: "Optional PDF render scale 0.1-2.0 (default 1.0)",
			printBackground:
				"Optional print background graphics (default false)",
			landscape:
				"Optional print in landscape orientation (default false)",
			pageRanges: "Optional paper ranges to print (e.g. 1-5)",
			format: "Optional paper format (e.g. Letter, A4, default Letter)",
			margin: "Optional margin config object {top, bottom, left, right}"
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
		id: "browser.rss.summary",
		method: "POST",
		path: "/v1/browser/rss/summary",
		price: "$0.02",
		description:
			"Summarize and synthesize any blog or RSS feed URL into a clean newsletter bullet-point digest via browser rendering + AI",
		mimeType: "application/json",
		input: {
			url: "Blog or feed Page URL to summarize",
			limit: "Optional max articles to include in the summary (default 20)"
		},
		example: {
			url: "https://blog.cloudflare.com",
			limit: 5
		}
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
			url: "Optional Page URL to summarize (if text is not provided)",
			text: "Optional raw text to summarize (if url is not provided)",
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
	},
	{
		id: "ai.detect",
		method: "POST",
		path: "/v1/ai/detect",
		price: "$0.005",
		description:
			"Detect objects inside any image via Workers AI (DETR-ResNet-50), returns tags and bounding boxes",
		mimeType: "application/json",
		input: {
			url: "Absolute URL to the image file to detect objects inside"
		},
		example: {
			url: "https://x402.tanship.dev/assets/sample.jpg"
		}
	},
	{
		id: "browser.search",
		method: "POST",
		path: "/v1/browser/search",
		price: "$0.02",
		description:
			"Perform a web search via headless browser rendering, returns structured search results (titles, links, snippets)",
		mimeType: "application/json",
		input: {
			query: "Search query string",
			limit: "Optional max results to return (default 10)"
		},
		example: {
			query: "base network coinbase L2",
			limit: 5
		}
	},
	{
		id: "browser.metadata",
		method: "POST",
		path: "/v1/browser/metadata",
		price: "$0.008",
		description:
			"Extract SEO & OpenGraph metadata from any webpage via browser rendering + AI",
		mimeType: "application/json",
		input: {
			url: "Page URL to extract metadata from"
		},
		example: {
			url: "https://example.com"
		}
	},
	{
		id: "browser.article",
		method: "POST",
		path: "/v1/browser/article",
		price: "$0.012",
		description:
			"Extract a clean structured article from any webpage (title, content markdown, read time, etc) via browser rendering + AI",
		mimeType: "application/json",
		input: {
			url: "Page URL to extract the article from"
		},
		example: {
			url: "https://blog.cloudflare.com/introducing-browser-rendering-api"
		}
	},
	{
		id: "ai.compress",
		method: "POST",
		path: "/v1/ai/compress",
		price: "$0.005",
		description:
			"Compress long text semantically using Workers AI (Llama 3.3 70B) to save downstream LLM prompt tokens",
		mimeType: "application/json",
		input: {
			text: "The text content to semantically compress"
		},
		example: {
			text: "Model Context Protocol (MCP) is an open standard that enables developers to build secure, bidirectional connections between AI models and their data sources. By using standard JSON-RPC over stdio or SSE, clients can dynamically discover and call tools, read resources, and subscribe to prompts."
		}
	},
	{
		id: "browser.news",
		method: "POST",
		path: "/v1/browser/news",
		price: "$0.005",
		description:
			"Perform a real-time web news search, returns a structured list of recent news articles (titles, links, dates, sources)",
		mimeType: "application/json",
		input: {
			query: "News search query string",
			limit: "Optional max results to return (default 10)"
		},
		example: {
			query: "base network coinbase L2",
			limit: 5
		}
	},
	{
		id: "ai.answer",
		method: "POST",
		path: "/v1/ai/answer",
		price: "$0.008",
		description:
			"Perform visual question answering (VQA) on any image via Workers AI (PaliGemma), returns the text answer",
		mimeType: "application/json",
		input: {
			url: "Absolute URL to the image file to analyze",
			prompt: "Question or prompt about the image"
		},
		example: {
			url: "https://x402.tanship.dev/assets/sample.jpg",
			prompt: "What is written on the laptop screen?"
		}
	},
	{
		id: "browser.search.summary",
		method: "POST",
		path: "/v1/browser/search/summary",
		price: "$0.03",
		description:
			"Perform web search and synthesize results into a structured AI answer with cited sources (Perplexity clone)",
		mimeType: "application/json",
		input: {
			query: "Search query to research"
		},
		example: {
			query: "what is base network and how does it relate to coinbase"
		}
	},
	{
		id: "ai.correct",
		method: "POST",
		path: "/v1/ai/correct",
		price: "$0.005",
		description:
			"Automatically correct grammar, spelling, punctuation, and phrasing via Workers AI (Llama 3.3 70B)",
		mimeType: "application/json",
		input: {
			text: "The text content to check and correct"
		},
		example: {
			text: "i has a error in my code and it dont build"
		}
	},
	{
		id: "ai.code",
		method: "POST",
		path: "/v1/ai/code",
		price: "$0.005",
		description:
			"Analyze, debug, or refactor code via coding-tailored Workers AI (Llama 3.3 70B)",
		mimeType: "application/json",
		input: {
			code: "The code snippet to analyze",
			prompt: "Coding instruction (e.g. explain, debug, rewrite)",
			language: "Optional programming language name"
		},
		example: {
			code: "function add(a, b) { return a - b; }",
			prompt: "Verify this function name and correct the implementation if needed.",
			language: "javascript"
		}
	},
	{
		id: "ai.reason",
		method: "POST",
		path: "/v1/ai/reason",
		price: "$0.008",
		description:
			"Reasoning model completion via Workers AI (DeepSeek R1 Distill Qwen 32B), separating thinking process from final answer",
		mimeType: "application/json",
		input: {
			messages:
				"Array of { role: system|user|assistant, content: string }",
			max_tokens: "Optional max output tokens (default 2048)"
		},
		example: {
			messages: [
				{ role: "user", content: "How many Rs are in strawberry?" }
			]
		}
	},
	{
		id: "ai.similarity",
		method: "POST",
		path: "/v1/ai/similarity",
		price: "$0.004",
		description:
			"Calculate semantic cosine similarity score between two texts via Workers AI (BGE-M3 embeddings)",
		mimeType: "application/json",
		input: {
			text1: "First text content to compare",
			text2: "Second text content to compare"
		},
		example: {
			text1: "The weather is very warm today.",
			text2: "It is quite hot outside."
		}
	},
	{
		id: "ai.ocr",
		method: "POST",
		path: "/v1/ai/ocr",
		price: "$0.008",
		description:
			"Extract spelling/text content from any image via Workers AI (PaliGemma OCR)",
		mimeType: "application/json",
		input: {
			url: "Absolute URL to the image file to extract text from"
		},
		example: {
			url: "https://x402.tanship.dev/assets/sample.jpg"
		}
	},
	{
		id: "browser.seo",
		method: "POST",
		path: "/v1/browser/seo",
		price: "$0.015",
		description:
			"Perform an automated SEO health audit and validator on any webpage via browser rendering + AI",
		mimeType: "application/json",
		input: {
			url: "Page URL to audit for SEO"
		},
		example: {
			url: "https://example.com"
		}
	},
	{
		id: "browser.contacts",
		method: "POST",
		path: "/v1/browser/contacts",
		price: "$0.012",
		description:
			"Extract contact details and social media links from any webpage via browser rendering + AI",
		mimeType: "application/json",
		input: {
			url: "Page URL to extract contacts from"
		},
		example: {
			url: "https://example.com/contact"
		}
	},
	{
		id: "ai.lint",
		method: "POST",
		path: "/v1/ai/lint",
		price: "$0.008",
		description:
			"Perform static code syntax checking and linting via compiler-tailored Workers AI (Llama 3.3 70B)",
		mimeType: "application/json",
		input: {
			code: "The code snippet to lint",
			language: "Optional programming language name"
		},
		example: {
			code: "const x = 5\nconsole.log(y)",
			language: "javascript"
		}
	},
	{
		id: "ai.memory.add",
		method: "POST",
		path: "/v1/ai/memory/add",
		price: "$0.005",
		description:
			"Insert text chunks semantically into persistent memory using Workers AI (BGE-M3) and Cloudflare Vectorize",
		mimeType: "application/json",
		input: {
			text: "The text content to store in semantic memory"
		},
		example: {
			text: "Model Context Protocol (MCP) is standard JSON-RPC over stdio or SSE."
		}
	},
	{
		id: "ai.memory.search",
		method: "POST",
		path: "/v1/ai/memory/search",
		price: "$0.005",
		description:
			"Search semantically matching text chunks from persistent memory via BGE-M3 + Vectorize",
		mimeType: "application/json",
		input: {
			query: "Search query string",
			top_k: "Optional number of top matches to return (default 5)"
		},
		example: {
			query: "how does MCP work?",
			top_k: 3
		}
	},
	{
		id: "ai.sql",
		method: "POST",
		path: "/v1/ai/sql",
		price: "$0.005",
		description:
			"Generate a clean, optimized SQL query from natural language instructions via Workers AI (Llama 3.3 70B)",
		mimeType: "application/json",
		input: {
			prompt: "Natural language query description",
			schema: "Optional database DDL schema structure",
			dialect: "Optional target SQL dialect (default sqlite)"
		},
		example: {
			prompt: "Find the top 5 users by spend in June 2026",
			schema: "CREATE TABLE users (id INT, name TEXT, spend REAL, date TEXT);",
			dialect: "sqlite"
		}
	},
	{
		id: "browser.sitemap",
		method: "POST",
		path: "/v1/browser/sitemap",
		price: "$0.008",
		description:
			"Extract and filter all internal links from a website root to generate an XML sitemap or JSON URLs array via browser rendering",
		mimeType: "application/json",
		input: {
			url: "Root website URL to crawl for sitemap generation"
		},
		example: {
			url: "https://example.com"
		}
	},
	{
		id: "ai.emotion",
		method: "POST",
		path: "/v1/ai/emotion",
		price: "$0.005",
		description:
			"Analyze sentiment and detailed emotion categories (joy, sadness, anger, fear, etc) via Workers AI (Llama 3.3 70B)",
		mimeType: "application/json",
		input: {
			text: "The text content to analyze emotions on"
		},
		example: {
			text: "I am absolutely thrilled and excited about our launch, but also slightly terrified!"
		}
	},
	{
		id: "browser.forms",
		method: "POST",
		path: "/v1/browser/forms",
		price: "$0.012",
		description:
			"Extract all web forms and input schemas from any webpage via browser rendering + AI",
		mimeType: "application/json",
		input: {
			url: "Page URL to extract forms from"
		},
		example: {
			url: "https://example.com/login"
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

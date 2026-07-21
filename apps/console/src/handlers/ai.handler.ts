import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

import { ApiError } from "@/helpers/errors.helper";
import { ApiResponse } from "@/helpers/response.helper";
import type { HonoEnv } from "@/types/hono.types";

const CHAT_MODELS = [
	"@cf/meta/llama-3.3-70b-instruct-fp8-fast",
	"@cf/meta/llama-3.1-8b-instruct-fast",
	"@cf/openai/gpt-oss-120b",
	"@cf/deepseek-ai/deepseek-r1-distill-qwen-32b",
	"@cf/deepseek-ai/deepseek-r1-distill-llama-8b"
] as const;

const EMBEDDING_MODEL = "@cf/baai/bge-m3";
const IMAGE_MODEL = "@cf/black-forest-labs/flux-1-schnell";
const TRANSLATION_MODEL = "@cf/meta/m2m100-1.2b";
const SENTIMENT_MODEL = "@cf/huggingface/distilbert-sst-2-int8";
const TRANSCRIBE_MODEL = "@cf/openai/whisper";
const DESCRIBE_MODEL = "@cf/salesforce/blip-image-captioning-large";
const RERANK_MODEL = "@cf/baai/bge-reranker-large";
const CLASSIFY_MODEL = "@cf/microsoft/resnet-50";
const MODERATE_MODEL = "@cf/meta/llama-guard-3-8b";
const DETECT_MODEL = "@cf/facebook/detr-resnet-50";
const ANSWER_MODEL = "@cf/google/paligemma-3b-pt-448";

const ChatSchema = z.object({
	messages: z
		.array(
			z.object({
				role: z.enum(["system", "user", "assistant"]),
				content: z.string().min(1)
			})
		)
		.min(1)
		.max(50),
	model: z.enum(CHAT_MODELS).default(CHAT_MODELS[0]),
	max_tokens: z.number().int().min(1).max(4096).default(1024)
});

const ImageSchema = z.object({
	prompt: z.string().min(1).max(2048),
	steps: z.number().int().min(1).max(8).default(4),
	width: z.number().int().min(256).max(1024).default(1024),
	height: z.number().int().min(256).max(1024).default(1024)
});

const EmbeddingsSchema = z.object({
	text: z.union([
		z.string().min(1).max(10_000),
		z.array(z.string().min(1).max(10_000)).min(1).max(100)
	])
});

const TranslationSchema = z.object({
	text: z.string().min(1).max(10_000),
	source_lang: z.string().min(2).max(10).optional(),
	target_lang: z.string().min(2).max(10)
});

const SentimentSchema = z.object({
	text: z.string().min(1).max(10_000)
});

const TranscribeSchema = z.object({
	url: z.string().url()
});

const DescribeSchema = z.object({
	url: z.string().url()
});

const RerankSchema = z.object({
	query: z.string().min(1).max(10_000),
	documents: z.array(z.string().min(1).max(10_000)).min(1).max(100),
	top_n: z.number().int().min(1).max(100).optional()
});

const ClassifySchema = z.object({
	url: z.string().url()
});

const ModerateSchema = z.object({
	text: z.string().min(1).max(10_000)
});

const DetectSchema = z.object({
	url: z.string().url()
});

const CompressSchema = z.object({
	text: z.string().min(1).max(20_000)
});

const AnswerSchema = z.object({
	url: z.string().url(),
	prompt: z.string().min(1).max(2048)
});

const aiHandler = new Hono<HonoEnv>()
	.post("/chat", zValidator("json", ChatSchema), async (c) => {
		const { messages, model, max_tokens } = c.req.valid("json");

		const result = (await c.env.AI.run(model as any, {
			messages,
			max_tokens
		})) as { response?: string; usage?: unknown };

		return ApiResponse.ok(c, "Chat completion generated", {
			model,
			response: result.response ?? "",
			usage: result.usage ?? null
		});
	})
	.post("/image", zValidator("json", ImageSchema), async (c) => {
		const { prompt, steps, width, height } = c.req.valid("json");

		const result = (await c.env.AI.run(IMAGE_MODEL as any, {
			prompt,
			steps,
			width,
			height
		})) as { image?: string };

		if (!result.image) {
			throw ApiError.badGateway("Image generation returned no image");
		}

		const bytes = Uint8Array.from(atob(result.image), (ch) =>
			ch.charCodeAt(0)
		);
		return c.body(bytes, 200, {
			"Content-Type": "image/jpeg"
		});
	})
	.post("/embeddings", zValidator("json", EmbeddingsSchema), async (c) => {
		const { text } = c.req.valid("json");

		const result = (await c.env.AI.run(EMBEDDING_MODEL as any, {
			text
		})) as { data?: number[][] };

		const embeddings = result.data ?? [];
		return ApiResponse.ok(c, "Embeddings generated", {
			model: EMBEDDING_MODEL,
			count: embeddings.length,
			dimensions: embeddings[0]?.length ?? 0,
			embeddings
		});
	})
	.post("/translate", zValidator("json", TranslationSchema), async (c) => {
		const { text, source_lang, target_lang } = c.req.valid("json");

		const result = (await c.env.AI.run(TRANSLATION_MODEL as any, {
			text,
			source_lang,
			target_lang
		})) as { translated_text?: string };

		return ApiResponse.ok(c, "Translation completed", {
			model: TRANSLATION_MODEL,
			translatedText: result.translated_text ?? ""
		});
	})
	.post("/sentiment", zValidator("json", SentimentSchema), async (c) => {
		const { text } = c.req.valid("json");

		const result = (await c.env.AI.run(SENTIMENT_MODEL as any, {
			text
		})) as any;

		return ApiResponse.ok(c, "Sentiment analysis completed", {
			model: SENTIMENT_MODEL,
			result: result ?? []
		});
	})
	.post("/transcribe", zValidator("json", TranscribeSchema), async (c) => {
		const { url } = c.req.valid("json");

		const audioRes = await fetch(url);
		if (!audioRes.ok) {
			throw ApiError.badRequest(
				`Failed to fetch audio from URL: ${audioRes.statusText}`
			);
		}

		const blob = await audioRes.arrayBuffer();
		const audio = Array.from(new Uint8Array(blob));

		const result = (await c.env.AI.run(TRANSCRIBE_MODEL as any, {
			audio
		})) as unknown as {
			text: string;
			word_count?: number;
			words?: Array<{ word: string; start: number; end: number }>;
			vtt?: string;
		};

		return ApiResponse.ok(c, "Transcription completed", {
			model: TRANSCRIBE_MODEL,
			text: result.text ?? "",
			word_count: result.word_count ?? 0,
			words: result.words ?? [],
			vtt: result.vtt ?? ""
		});
	})
	.post("/describe", zValidator("json", DescribeSchema), async (c) => {
		const { url } = c.req.valid("json");

		const imageRes = await fetch(url);
		if (!imageRes.ok) {
			throw ApiError.badRequest(
				`Failed to fetch image from URL: ${imageRes.statusText}`
			);
		}

		const blob = await imageRes.arrayBuffer();
		const image = Array.from(new Uint8Array(blob));

		const result = (await c.env.AI.run(DESCRIBE_MODEL as any, {
			image
		})) as any;

		return ApiResponse.ok(c, "Image description completed", {
			model: DESCRIBE_MODEL,
			result: result ?? null
		});
	})
	.post("/rerank", zValidator("json", RerankSchema), async (c) => {
		const { query, documents, top_n } = c.req.valid("json");

		const result = (await c.env.AI.run(RERANK_MODEL as any, {
			query,
			documents,
			top_n
		})) as any;

		return ApiResponse.ok(c, "Text reranking completed", {
			model: RERANK_MODEL,
			results: result ?? []
		});
	})
	.post("/classify", zValidator("json", ClassifySchema), async (c) => {
		const { url } = c.req.valid("json");

		const imageRes = await fetch(url);
		if (!imageRes.ok) {
			throw ApiError.badRequest(
				`Failed to fetch image from URL: ${imageRes.statusText}`
			);
		}

		const blob = await imageRes.arrayBuffer();
		const image = Array.from(new Uint8Array(blob));

		const result = (await c.env.AI.run(CLASSIFY_MODEL as any, {
			image
		})) as any;

		return ApiResponse.ok(c, "Image classification completed", {
			model: CLASSIFY_MODEL,
			result: result ?? []
		});
	})
	.post("/moderate", zValidator("json", ModerateSchema), async (c) => {
		const { text } = c.req.valid("json");

		const result = (await c.env.AI.run(MODERATE_MODEL as any, {
			messages: [{ role: "user", content: text }]
		})) as any;

		const responseText = result.response ?? "safe";
		const safe = responseText.trim().toLowerCase().startsWith("safe");

		return ApiResponse.ok(c, "Content moderation completed", {
			model: MODERATE_MODEL,
			safe,
			flaggedCategories: safe
				? []
				: responseText
						.split("\n")
						.slice(1)
						.map((s: string) => s.trim())
						.filter(Boolean),
			response: responseText
		});
	})
	.post("/detect", zValidator("json", DetectSchema), async (c) => {
		const { url } = c.req.valid("json");

		const imageRes = await fetch(url);
		if (!imageRes.ok) {
			throw ApiError.badRequest(
				`Failed to fetch image from URL: ${imageRes.statusText}`
			);
		}

		const blob = await imageRes.arrayBuffer();
		const image = Array.from(new Uint8Array(blob));

		const result = (await c.env.AI.run(DETECT_MODEL as any, {
			image
		})) as any;

		return ApiResponse.ok(c, "Object detection completed", {
			model: DETECT_MODEL,
			result: result ?? []
		});
	})
	.post("/compress", zValidator("json", CompressSchema), async (c) => {
		const { text } = c.req.valid("json");

		const result = (await c.env.AI.run(
			"@cf/meta/llama-3.3-70b-instruct-fp8-fast",
			{
				messages: [
					{
						role: "system",
						content:
							"You are a context compression engine. Compress the input text into a highly dense, abbreviated, yet semantically complete representation. Drop fluff, articles, filler, and verbose phrasing. Keep key facts, relationships, numbers, and core technical details exact. Use shorthand abbreviations if clear. Goal: Save 60% of tokens while retaining all reasoning signals."
					},
					{
						role: "user",
						content: text
					}
				],
				max_tokens: 2048
			}
		)) as { response?: string };

		const compressed = result.response ?? "";

		return ApiResponse.ok(c, "Text compressed", {
			originalLength: text.length,
			compressedLength: compressed.length,
			savingsPercent: Math.round(
				(1 - compressed.length / text.length) * 100
			),
			compressedText: compressed
		});
	})
	.post("/answer", zValidator("json", AnswerSchema), async (c) => {
		const { url, prompt } = c.req.valid("json");

		const imageRes = await fetch(url);
		if (!imageRes.ok) {
			throw ApiError.badRequest(
				`Failed to fetch image from URL: ${imageRes.statusText}`
			);
		}

		const blob = await imageRes.arrayBuffer();
		const image = Array.from(new Uint8Array(blob));

		const result = (await c.env.AI.run(ANSWER_MODEL as any, {
			image,
			prompt
		})) as { response?: string };

		return ApiResponse.ok(c, "Visual question answering completed", {
			model: ANSWER_MODEL,
			response: result.response ?? ""
		});
	});

export default aiHandler;

import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

import { ApiError } from "@/helpers/errors.helper";
import { ApiResponse } from "@/helpers/response.helper";
import type { HonoEnv } from "@/types/hono.types";

const CHAT_MODELS = [
	"@cf/meta/llama-3.3-70b-instruct-fp8-fast",
	"@cf/meta/llama-3.1-8b-instruct-fast",
	"@cf/openai/gpt-oss-120b"
] as const;

const EMBEDDING_MODEL = "@cf/baai/bge-m3";
const IMAGE_MODEL = "@cf/black-forest-labs/flux-1-schnell";
const TRANSLATION_MODEL = "@cf/meta/m2m100-1.2b";
const SENTIMENT_MODEL = "@cf/huggingface/distilbert-sst-2-int8";

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
	steps: z.number().int().min(1).max(8).default(4)
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
		const { prompt, steps } = c.req.valid("json");

		const result = (await c.env.AI.run(IMAGE_MODEL as any, {
			prompt,
			steps
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
		})) as Array<{ label: string; score: number }>;

		return ApiResponse.ok(c, "Sentiment analysis completed", {
			model: SENTIMENT_MODEL,
			result: result ?? []
		});
	});

export default aiHandler;

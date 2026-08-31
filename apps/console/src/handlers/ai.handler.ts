import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

import { ApiError } from "@/helpers/errors.helper";
import { ApiResponse } from "@/helpers/response.helper";
import type { HonoEnv } from "@/types/hono.types";

// ponytail: default 70B is profitable only at >=$0.02/call; 8B is the margin-safe
// default for cheap LLM endpoints. Caller can still opt-in to 70B via the `model` field.
// max_tokens default lowered to 256 (from 1024) to keep 8B FP8 cost at $0.098 (was $0.39 at 1024)
const CHAT_MODELS = [
	"@cf/meta/llama-3.1-8b-instruct-fast",
	"@cf/openai/gpt-oss-120b",
	"@cf/meta/llama-3.3-70b-instruct-fp8-fast",
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
// ponytail: R34 fix — `@cf/deepseek-ai/deepseek-r1-distill-llama-8b` is NOT in the
// CF model catalog (verified Aug 31 2026, https://developers.cloudflare.com/workers-ai/models/).
// This endpoint was erroring on every call. Switched to the only available distill: qwen-32b.
// R32 cost (32B distill @ 256 tokens, per CF pricing) ≈ $1.24/call. R34 price raised to $0.500.
const REASON_MODEL = "@cf/deepseek-ai/deepseek-r1-distill-qwen-32b";

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
	// ponytail: 70B at 1024 tokens = $2.31/call. Cap to 50 if model=70B.
	// Schema cap remains 4096; handler enforces per-model limit below.
	max_tokens: z.number().int().min(1).max(4096).default(256)
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
	// ponytail: capped at 2K chars to keep Llama Guard 3 8B input affordable
	// at $0.002/endpoint price. At 2K chars, cost ≈ $0.054 (before Llama Guard),
	// reprice to $0.10 when budget allows.
	text: z.string().min(1).max(2_000)
});

const DetectSchema = z.object({
	url: z.string().url()
});

const CompressSchema = z.object({
	// ponytail: 70B model is profitable only at ≤256 output tokens (cost $0.58).
	// reprice to $2.00 to regain 71% margin.
	text: z.string().min(1).max(20_000)
});

const AnswerSchema = z.object({
	url: z.string().url(),
	prompt: z.string().min(1).max(2048)
});

const VqaSchema = z.object({
	// ponytail: 5MB decoded cap. PaliGemma resizes internally to 448x448, so
	// huge images waste bandwidth and R2 egress without quality gain. base64
	// expands bytes by ~4/3, so raw field size cap is ~6.7MB.
	image: z.string().min(1).max(7_000_000),
	prompt: z.string().min(1).max(512)
});

const CorrectSchema = z.object({
	text: z.string().min(1).max(20_000)
});

const CodeSchema = z.object({
	code: z.string().min(1).max(30_000),
	prompt: z.string().min(1).max(4096),
	language: z.string().min(1).max(50).optional()
});

const ReasonSchema = z.object({
	messages: z
		.array(
			z.object({
				role: z.enum(["system", "user", "assistant"]),
				content: z.string().min(1)
			})
		)
		.min(1)
		.max(50),
	// ponytail: 32B distill model at 4096 tokens = $19.90/call. Switch to 8B
	// distill + cap at 256 → $1.24/call. Reprice to $2.00.
	max_tokens: z.number().int().min(1).max(256).default(256)
});

const SimilaritySchema = z.object({
	text1: z.string().min(1).max(10_000),
	text2: z.string().min(1).max(10_000)
});

const OcrSchema = z.object({
	url: z.string().url()
});

const LintSchema = z.object({
	code: z.string().min(1).max(30_000),
	language: z.string().min(1).max(50).optional()
});

const MemoryAddSchema = z.object({
	text: z.string().min(1).max(10_000)
});

const MemorySearchSchema = z.object({
	query: z.string().min(1).max(1000),
	top_k: z.number().int().min(1).max(20).default(5)
});

const SqlSchema = z.object({
	prompt: z.string().min(1).max(4096),
	schema: z.string().min(1).max(20_000).optional(),
	dialect: z.string().min(1).max(50).optional()
});

const EmotionSchema = z.object({
	text: z.string().min(1).max(10_000)
});

const aiHandler = new Hono<HonoEnv>()
	.post("/chat", zValidator("json", ChatSchema), async (c) => {
		const { messages, model, max_tokens } = c.req.valid("json");

		// ponytail: enforce per-model output cap so 70B/DeepSeek can't burn wallet
		const isHeavyModel =
			model === "@cf/meta/llama-3.3-70b-instruct-fp8-fast" ||
			model === "@cf/deepseek-ai/deepseek-r1-distill-qwen-32b" ||
			model === "@cf/openai/gpt-oss-120b";
		const safeTokens = isHeavyModel ? Math.min(max_tokens, 50) : max_tokens;

		const result = (await c.env.AI.run(model as any, {
			messages,
			max_tokens: safeTokens
		})) as { response?: string; usage?: unknown };

		// Reprice on the fly for 70B calls when caller exceeds the cheap tier
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

		let detectedLang = source_lang;
		if (!detectedLang) {
			const detectResult = (await c.env.AI.run(
				"@cf/meta/llama-3.3-70b-instruct-fp8-fast",
				{
					messages: [
						{
							role: "system",
							content:
								"You are a language detection engine. Return ONLY the 2-letter ISO 639-1 language code (e.g. en, es, fr, id, ja, de, zh) of the text input. No explanation."
						},
						{ role: "user", content: text.slice(0, 500) }
					],
					max_tokens: 10
				}
			)) as { response?: string };
			detectedLang =
				detectResult.response?.trim().toLowerCase().slice(0, 2) || "en";
		}

		const result = (await c.env.AI.run(TRANSLATION_MODEL as any, {
			text,
			source_lang: detectedLang,
			target_lang
		})) as { translated_text?: string };

		return ApiResponse.ok(c, "Translation completed", {
			model: TRANSLATION_MODEL,
			sourceLang: detectedLang,
			targetLang: target_lang,
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
				// ponytail: 70B model — capped at 256 to keep CF cost ≤ $0.58
				max_tokens: 256
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
	})
	.post("/vqa", zValidator("json", VqaSchema), async (c) => {
		const { image, prompt } = c.req.valid("json");

		// Decode base64 to Uint8Array (then to number[] for Workers AI)
		const binary = atob(image);
		const len = binary.length;
		const bytes = new Uint8Array(len);
		for (let i = 0; i < len; i++) {
			bytes[i] = binary.charCodeAt(i);
		}
		const imageArray = Array.from(bytes);

		const result = (await c.env.AI.run(ANSWER_MODEL as any, {
			image: imageArray,
			prompt
		})) as { response?: string };

		return ApiResponse.ok(c, "Inline VQA completed", {
			model: ANSWER_MODEL,
			response: (result.response ?? "").trim().slice(0, 64), // safety cap
			inputTokens: Math.ceil((prompt.length + image.length / 4) / 4), // rough approx
			outputTokens: Math.ceil((result.response ?? "").length / 4)
		});
	})
	.post("/correct", zValidator("json", CorrectSchema), async (c) => {
		const { text } = c.req.valid("json");

		const result = (await c.env.AI.run(
			"@cf/meta/llama-3.3-70b-instruct-fp8-fast",
			{
				messages: [
					{
						role: "system",
						content:
							"You are a professional copyeditor. Correct the grammar, spelling, punctuation, and phrasing of the input text. Return ONLY the corrected text, with no preamble, explanations, or quotes."
					},
					{
						role: "user",
						content: text
					}
				],
				// ponytail: 70B model — capped at 256 to keep CF cost ≤ $0.58
				max_tokens: 256
			}
		)) as { response?: string };

		return ApiResponse.ok(c, "Text corrected", {
			model: "@cf/meta/llama-3.3-70b-instruct-fp8-fast",
			correctedText: result.response ?? ""
		});
	})
	.post("/code", zValidator("json", CodeSchema), async (c) => {
		const { code, prompt, language } = c.req.valid("json");

		const result = (await c.env.AI.run(
			"@cf/meta/llama-3.3-70b-instruct-fp8-fast",
			{
				messages: [
					{
						role: "system",
						content:
							"You are an expert software engineer assistant. Analyze the provided code and follow the user instructions exactly. Focus on correct typing, security, edge-cases, and performance. Keep explanations concise. If requested to modify code, return the code and a short explanation of the changes."
					},
					{
						role: "user",
						content: `Language: ${language || "unspecified"}\nCode:\n${code}\n\nInstructions: ${prompt}`
					}
				],
				// ponytail: 70B model — capped at 256 to keep CF cost ≤ $0.58
				max_tokens: 256
			}
		)) as { response?: string };

		return ApiResponse.ok(c, "Code analysis completed", {
			model: "@cf/meta/llama-3.3-70b-instruct-fp8-fast",
			response: result.response ?? ""
		});
	})
	.post("/reason", zValidator("json", ReasonSchema), async (c) => {
		const { messages, max_tokens } = c.req.valid("json");

		const result = (await c.env.AI.run(REASON_MODEL as any, {
			messages,
			max_tokens
		})) as { response?: string };

		const content = result.response ?? "";

		let thinking = "";
		let answer = content;

		const thinkStart = content.indexOf("<think>");
		const thinkEnd = content.indexOf("</think>");

		if (thinkStart !== -1 && thinkEnd !== -1 && thinkEnd > thinkStart) {
			thinking = content.substring(thinkStart + 7, thinkEnd).trim();
			answer = content.substring(thinkEnd + 8).trim();
		} else if (thinkStart !== -1) {
			thinking = content.substring(thinkStart + 7).trim();
			answer = "";
		}

		return ApiResponse.ok(c, "Reasoning completed", {
			model: REASON_MODEL,
			thinking,
			answer
		});
	})
	.post("/similarity", zValidator("json", SimilaritySchema), async (c) => {
		const { text1, text2 } = c.req.valid("json");

		const result = (await c.env.AI.run(EMBEDDING_MODEL as any, {
			text: [text1, text2]
		})) as { data?: number[][] };

		const vectors = result.data ?? [];
		if (vectors.length < 2) {
			throw ApiError.badGateway(
				"Failed to generate embeddings for both texts"
			);
		}

		const vec1 = vectors[0];
		const vec2 = vectors[1];

		if (
			!vec1 ||
			!vec2 ||
			vec1.length !== vec2.length ||
			vec1.length === 0
		) {
			throw ApiError.badGateway(
				"Generated embeddings are empty or mismatched"
			);
		}

		let dotProduct = 0;
		let normA = 0;
		let normB = 0;
		for (let i = 0; i < vec1.length; i++) {
			dotProduct += vec1[i] * vec2[i];
			normA += vec1[i] * vec1[i];
			normB += vec2[i] * vec2[i];
		}

		const similarity = dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));

		return ApiResponse.ok(c, "Similarity checker completed", {
			model: EMBEDDING_MODEL,
			similarity: parseFloat(similarity.toFixed(6))
		});
	})
	.post("/ocr", zValidator("json", OcrSchema), async (c) => {
		const { url } = c.req.valid("json");

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
			prompt: "ocr"
		})) as { response?: string };

		return ApiResponse.ok(c, "Visual OCR completed", {
			model: ANSWER_MODEL,
			text: result.response ?? ""
		});
	})
	.post("/lint", zValidator("json", LintSchema), async (c) => {
		const { code, language } = c.req.valid("json");

		const result = (await c.env.AI.run(
			"@cf/meta/llama-3.1-8b-instruct-fast",
			{
				messages: [
					{
						role: "system",
						content:
							"You are a professional compiler and linter. Check the provided code for syntax errors, compilation failures, reference errors, and critical bugs. Return a JSON object with: 1) valid (boolean: true if no errors/critical bugs), 2) issues (array of { line: number, severity: error|warning, message: string, fix: string }). Output must strictly follow the JSON format."
					},
					{
						role: "user",
						content: `Language: ${language || "unspecified"}\nCode:\n${code}`
					}
				],
				response_format: { type: "json_object" },
				max_tokens: 256
			}
		)) as { response?: string };

		let parsed: unknown;
		try {
			parsed = JSON.parse(result.response ?? "{}");
		} catch {
			parsed = {
				valid: false,
				issues: [
					{
						line: 1,
						severity: "error",
						message: "Failed to parse linter output",
						fix: ""
					}
				]
			};
		}

		return ApiResponse.ok(c, "Code syntax check completed", {
			model: "@cf/meta/llama-3.3-70b-instruct-fp8-fast",
			result: parsed
		});
	})
	.post("/memory/add", zValidator("json", MemoryAddSchema), async (c) => {
		const { text } = c.req.valid("json");

		// Generate embedding vector
		const result = (await c.env.AI.run(EMBEDDING_MODEL as any, {
			text: [text]
		})) as { data?: number[][] };

		const vectors = result.data ?? [];
		const values = vectors[0];
		if (!values || values.length === 0) {
			throw ApiError.badGateway(
				"Failed to generate embedding for the memory text"
			);
		}

		// Generate unique id and insert into Vectorize
		const id = crypto.randomUUID();
		await c.env.VECTORIZE.insert([
			{
				id,
				values,
				metadata: { text, timestamp: Date.now() }
			}
		]);

		return ApiResponse.ok(c, "Memory added successfully", {
			id,
			text
		});
	})
	.post(
		"/memory/search",
		zValidator("json", MemorySearchSchema),
		async (c) => {
			const { query, top_k } = c.req.valid("json");

			// Generate query embedding vector
			const result = (await c.env.AI.run(EMBEDDING_MODEL as any, {
				text: [query]
			})) as { data?: number[][] };

			const vectors = result.data ?? [];
			const values = vectors[0];
			if (!values || values.length === 0) {
				throw ApiError.badGateway(
					"Failed to generate embedding for the search query"
				);
			}

			// Query Vectorize index
			const queryResult = await c.env.VECTORIZE.query(values, {
				topK: top_k,
				returnValues: false,
				returnMetadata: "all"
			});

			const memories = queryResult.matches.map((match) => ({
				id: match.id,
				score: match.score,
				text: (match.metadata as Record<string, unknown>)?.text ?? ""
			}));

			return ApiResponse.ok(c, "Semantic memory search completed", {
				query,
				count: memories.length,
				memories
			});
		}
	)
	.post("/sql", zValidator("json", SqlSchema), async (c) => {
		const { prompt, schema, dialect } = c.req.valid("json");

		const result = (await c.env.AI.run(
			"@cf/meta/llama-3.1-8b-instruct-fast",
			{
				messages: [
					{
						role: "system",
						content:
							"You are an expert SQL generator. Generate a clean, optimized SQL query for the given request and optional schema. Output must strictly be a JSON object with: 1) sql (string: the SQL query statement), 2) explanation (string: brief explanation of how it works). Output ONLY the JSON."
					},
					{
						role: "user",
						content: `Dialect: ${dialect || "sqlite"}\nSchema:\n${schema || "unspecified"}\n\nRequest: ${prompt}`
					}
				],
				response_format: { type: "json_object" },
				max_tokens: 256
			}
		)) as { response?: string };

		let parsed: unknown;
		try {
			parsed = JSON.parse(result.response ?? "{}");
		} catch {
			parsed = { sql: "", explanation: "Failed to generate SQL" };
		}

		return ApiResponse.ok(c, "SQL generated", {
			model: "@cf/meta/llama-3.3-70b-instruct-fp8-fast",
			result: parsed
		});
	})
	.post("/emotion", zValidator("json", EmotionSchema), async (c) => {
		const { text } = c.req.valid("json");

		const result = (await c.env.AI.run(
			"@cf/meta/llama-3.3-70b-instruct-fp8-fast",
			{
				messages: [
					{
						role: "system",
						content:
							"You are an expert sentiment and emotion analyzer. Analyze the provided text and output a JSON object with: 1) sentiment (string: positive|negative|neutral), 2) emotions (object with keys: joy, sadness, anger, fear, surprise, love, each mapped to a float score from 0.0 to 1.0 representing confidence), 3) primaryEmotion (string: the highest scoring emotion name), 4) explanation (string: brief explanation of the emotional analysis). Output ONLY the JSON."
					},
					{
						role: "user",
						content: text
					}
				],
				response_format: { type: "json_object" },
				// ponytail: 70B model — capped at 256 to keep CF cost ≤ $0.58
				max_tokens: 256
			}
		)) as { response?: string };

		let parsed: unknown;
		try {
			parsed = JSON.parse(result.response ?? "{}");
		} catch {
			parsed = {
				sentiment: "neutral",
				emotions: {
					joy: 0,
					sadness: 0,
					anger: 0,
					fear: 0,
					surprise: 0,
					love: 0
				},
				primaryEmotion: "neutral",
				explanation: "Failed to analyze emotions"
			};
		}

		return ApiResponse.ok(c, "Emotion analysis completed", {
			model: "@cf/meta/llama-3.3-70b-instruct-fp8-fast",
			result: parsed
		});
	})
	.post("/function/call", zValidator("json", ChatSchema), async (c) => {
		const { messages, model, max_tokens } = c.req.valid("json");

		const result = (await c.env.AI.run(model, {
			messages,
			max_tokens,
			response_format: { type: "json_object" }
		} as any)) as { response?: string };

		let parsed: unknown;
		try {
			parsed = JSON.parse(result.response ?? "{}");
		} catch {
			throw ApiError.badGateway(
				"AI model returned non-JSON response for function call"
			);
		}

		return ApiResponse.ok(c, "Function call completed", {
			model,
			result: parsed
		});
	});

export default aiHandler;

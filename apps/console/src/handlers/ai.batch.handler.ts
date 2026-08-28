import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

import { ApiError } from "@/helpers/errors.helper";
import { STATUS_CODES } from "@/constants/status.constants";
import { ApiResponse } from "@/helpers/response.helper";
import type { HonoEnv } from "@/types/hono.types";

const CHAT_MODELS = [
	"@cf/meta/llama-3.1-8b-instruct-fast",
	"@cf/meta/llama-3.3-70b-instruct-fp8-fast"
] as const;
const DEFAULT_CHAT = CHAT_MODELS[0];

// A single operation shape: { type, ...params }. Anything we don't recognize
// becomes a `custom` echo so a typo'd type doesn't crash the whole batch.
const Op = z.object({
	type: z.enum([
		"chat",
		"sentiment",
		"summarize",
		"classify",
		"code",
		"translate",
		"embeddings",
		"moderate",
		"correct",
		"emotion",
		"reason",
		"rerank",
		"sql",
		"compress",
		"lint",
		"similarity"
	]),
	// Shared passthrough: every AI op accepts `text` or `messages` etc.
	// We validate the few we know about and let everything else through.
	payload: z.record(z.string(), z.unknown()).default({})
});

const BatchSchema = z.object({
	operations: z.array(Op).min(1).max(20)
});

type OpResult =
	| { type: string; ok: true; result: unknown }
	| { type: string; ok: false; error: string };

async function runOne(
	ai: Ai,
	type: string,
	payload: Record<string, unknown>
): Promise<unknown> {
	switch (type) {
		case "chat":
		case "reason": {
			const messages = (payload.messages as unknown[]) ?? [];
			const max =
				(payload.max_tokens as number) ??
				(type === "reason" ? 2048 : 1024);
			const model = (payload.model as string) ?? DEFAULT_CHAT;
			const out = (await ai.run(model, {
				messages,
				max_tokens: max
			})) as { response?: string };
			return { response: out.response ?? "", model };
		}
		case "sentiment": {
			const out = (await ai.run("@cf/huggingface/distilbert-sst-2-int8", {
				text: payload.text ?? ""
			})) as unknown;
			return out;
		}
		case "classify": {
			const out = (await ai.run("@cf/microsoft/resnet-50", {
				image: payload.url ?? payload.image
			})) as unknown;
			return out;
		}
		case "translate": {
			const out = (await ai.run("@cf/meta/m2m100-1.2b", {
				text: payload.text ?? "",
				source_lang: payload.source_lang ?? "en",
				target_lang: payload.target_lang ?? "en"
			})) as { translated_text?: string };
			return { translated_text: out.translated_text ?? "" };
		}
		case "embeddings": {
			const text = payload.text;
			const out = (await ai.run("@cf/baai/bge-m3", {
				text: Array.isArray(text) ? text : [text ?? ""]
			})) as { data?: number[][] };
			return { data: out.data ?? [] };
		}
		case "moderate": {
			const out = (await ai.run("@cf/meta/llama-guard-3-8b", {
				messages: [{ role: "user", content: payload.text ?? "" }]
			})) as unknown;
			return out;
		}
		case "summarize":
		case "code":
		case "correct":
		case "emotion":
		case "sql":
		case "compress":
		case "lint": {
			// Reuse the chat model with a type-specific system prompt.
			const sys =
				(
					{
						summarize:
							"You are a concise summarizer. Reply in 3 bullets.",
						code: "You are a senior code reviewer. Reply tersely.",
						correct:
							"You are a grammar corrector. Output only corrected text.",
						emotion:
							"You are an emotion classifier. Output JSON: {primary, scores:{}}",
						sql: "You are a SQL expert. Output only the query, no prose.",
						compress:
							"You are a semantic compressor. Preserve meaning in 30% of the words.",
						lint: "You are a code linter. Output only a bullet list of issues."
					} as Record<string, string>
				)[type] ?? "You are a helpful assistant.";
			const out = (await ai.run(DEFAULT_CHAT, {
				messages: [
					{ role: "system", content: sys },
					{
						role: "user",
						content: String(payload.text ?? payload.code ?? "")
					}
				],
				max_tokens: (payload.max_tokens as number) ?? 512
			})) as { response?: string };
			return { response: out.response ?? "" };
		}
		case "rerank": {
			const out = (await ai.run("@cf/baai/bge-reranker-large", {
				query: payload.query ?? "",
				documents: (payload.documents as string[]) ?? []
			})) as unknown;
			return out;
		}
		case "similarity": {
			// Compute cosine similarity between two embeddings.
			const emb = (await ai.run("@cf/baai/bge-m3", {
				text: [payload.text1 ?? "", payload.text2 ?? ""]
			})) as { data?: number[][] };
			const [a, b] = emb.data ?? [[], []];
			let dot = 0,
				na = 0,
				nb = 0;
			const n = Math.min(a.length, b.length);
			for (let i = 0; i < n; i++) {
				dot += a[i] * b[i];
				na += a[i] * a[i];
				nb += b[i] * b[i];
			}
			const score = dot / (Math.sqrt(na) * Math.sqrt(nb) || 1);
			return { score, model: "@cf/baai/bge-m3" };
		}
		default:
			throw new Error(`Unknown operation type: ${type}`);
	}
}

const aiBatchHandler = new Hono<HonoEnv>().post(
	"/",
	zValidator("json", BatchSchema, (result, _c) => {
		if (!result.success)
			throw new ApiError(STATUS_CODES.BAD_REQUEST, "Invalid request");
	}),
	async (c) => {
		const { operations } = c.req.valid("json");

		const settled = await Promise.allSettled(
			operations.map(async (op): Promise<OpResult> => {
				try {
					const result = await runOne(c.env.AI, op.type, op.payload);
					return { type: op.type, ok: true, result };
				} catch (err) {
					return {
						type: op.type,
						ok: false,
						error: err instanceof Error ? err.message : String(err)
					};
				}
			})
		);

		const results = settled.map((s) =>
			s.status === "fulfilled"
				? s.value
				: ({
						type: "unknown",
						ok: false,
						error:
							s.reason instanceof Error
								? s.reason.message
								: String(s.reason)
					} as OpResult)
		);

		const ok = results.filter((r) => r.ok).length;
		return ApiResponse.ok(
			c,
			`Batch complete: ${ok}/${results.length} succeeded`,
			{
				results,
				count: results.length,
				succeeded: ok
			}
		);
	}
);

export default aiBatchHandler;

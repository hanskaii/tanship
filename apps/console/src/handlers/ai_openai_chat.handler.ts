import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

import { ApiError } from "@/helpers/errors.helper";
import type { HonoEnv } from "@/types/hono.types";

const DEFAULT_MODEL = "@cf/meta/llama-3.1-8b-instruct";
const LARGE_MODEL = "@cf/meta/llama-3.3-70b-instruct-fp8-fast";

// ponytail: model allowlist covers OpenAI compat only — extend when more models are needed
const MODEL_MAP: Record<string, string> = {
	"gpt-4o-mini": DEFAULT_MODEL,
	"gpt-4o": LARGE_MODEL,
	"gpt-4-turbo": LARGE_MODEL,
	"gpt-3.5-turbo": DEFAULT_MODEL,
	"llama-3.1-8b": DEFAULT_MODEL,
	"llama-3.3-70b": LARGE_MODEL
};

const OpenAIMessageSchema = z.object({
	role: z.enum(["system", "user", "assistant"]),
	content: z.string()
});

const OpenAIChatSchema = z.object({
	model: z.string().optional(),
	messages: z.array(OpenAIMessageSchema).min(1),
	max_tokens: z.number().int().min(1).max(4096).optional(),
	temperature: z.number().min(0).max(2).optional(),
	top_p: z.number().min(0).max(1).optional(),
	stream: z.boolean().optional(),
	stop: z.union([z.string(), z.array(z.string())]).optional()
});

type OpenAIMessage = z.infer<typeof OpenAIMessageSchema>;
type OpenAIChatInput = z.infer<typeof OpenAIChatSchema>;

function resolveModel(model?: string): string {
	if (!model) return DEFAULT_MODEL;
	const normalized = model.startsWith("gpt-")
		? model
		: model.toLowerCase().replace(/\s+/g, "-");
	return MODEL_MAP[normalized] ?? DEFAULT_MODEL;
}

// Build Workers AI messages from OpenAI format
function buildAIMessages(
	messages: OpenAIMessage[]
): Array<{ role: string; content: string }> {
	return messages.map((m) => ({ role: m.role, content: m.content }));
}

const openaiChatHandler = new Hono<HonoEnv>().post(
	"/completions",
	zValidator("json", OpenAIChatSchema),
	async (c) => {
		const body = c.req.valid("json") as OpenAIChatInput;

		if (body.stream) {
			throw ApiError.badRequest("Streaming is not yet supported");
		}

		const modelId = resolveModel(body.model);
		const messages = buildAIMessages(body.messages);
		const maxTokens = body.max_tokens ?? 1024;
		const temperature = body.temperature ?? 0.7;

		const aiResult = (await c.env.AI.run(modelId as any, {
			messages,
			max_tokens: maxTokens,
			temperature
		})) as { response?: string };

		const content = aiResult.response ?? "";

		// Return OpenAI-compatible response shape
		return c.json(
			{
				id: `chatcmpl-${crypto.randomUUID().replace(/-/g, "").slice(0, 24)}`,
				object: "chat.completion",
				created: Math.floor(Date.now() / 1000),
				model: modelId,
				choices: [
					{
						index: 0,
						message: {
							role: "assistant",
							content
						},
						finish_reason: "stop"
					}
				],
				usage: {
					prompt_tokens: messages.reduce(
						(acc, m) => acc + Math.ceil(m.content.length / 4),
						0
					),
					completion_tokens: Math.ceil(content.length / 4),
					total_tokens:
						messages.reduce(
							(acc, m) => acc + Math.ceil(m.content.length / 4),
							0
						) + Math.ceil(content.length / 4)
				}
			},
			200
		);
	}
);

export default openaiChatHandler;

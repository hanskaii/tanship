import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { ApiError } from "@/helpers/errors.helper";
import { ApiResponse } from "@/helpers/response.helper";
import type { HonoEnv } from "@/types/hono.types";

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
	model: z
		.enum([
			"@cf/meta/llama-3.3-70b-instruct-fp8-fast",
			"@cf/meta/llama-3.1-8b-instruct-fp8-fast",
			"@cf/openai/gpt-oss-120b",
			"@cf/deepseek-ai/deepseek-r1-distill-qwen-32b",
			"@cf/deepseek-ai/deepseek-r1-distill-llama-8b"
		])
		.default("@cf/meta/llama-3.3-70b-instruct-fp8-fast"),
	max_tokens: z.number().int().min(1).max(4096).default(1024),
	cacheKey: z.string().optional()
});

const ChatResponseSchema = z.object({
	response: z.string().optional(),
	usage: z.any().optional(),
	cached: z.boolean().optional()
});

export const aiCachedHandler = new Hono<HonoEnv>().post(
	"/chat/cached",
	zValidator("json", ChatSchema),
	async (c) => {
		const { messages, model, max_tokens, cacheKey } = c.req.valid("json");

		// Check cache first
		if (cacheKey) {
			const cached = await c.env.KV.get(cacheKey);
			if (cached) {
				try {
					const cachedData = JSON.parse(cached);
					if (cachedData.response) {
						return ApiResponse.ok(c, "Cached response", {
							response: cachedData.response,
							usage: cachedData.usage,
							cached: true
						});
					}
				} catch (e) {
					// If cache is corrupted, continue to generate new response
				}
			}
		}

		// Generate response
		const result = (await c.env.AI.run(model as any, {
			messages,
			max_tokens
		})) as { response?: string; usage?: any };

		const responseText = result.response ?? "";

		// Cache the response if cacheKey is provided
		if (cacheKey) {
			await c.env.KV.put(
				cacheKey,
				JSON.stringify({
					response: responseText,
					usage: result.usage,
					cached: false
				})
			);
		}

		return ApiResponse.ok(c, "Chat completion generated", {
			response: result.response ?? "",
			usage: result.usage ?? null,
			cached: cacheKey ? true : false
		});
	}
);

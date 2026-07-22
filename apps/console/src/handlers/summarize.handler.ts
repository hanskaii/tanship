import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

import { BrowserRenderingService } from "@/services/browser.service";
import { ApiResponse } from "@/helpers/response.helper";
import { ApiError } from "@/helpers/errors.helper";
import type { HonoEnv } from "@/types/hono.types";

const SummarizeSchema = z
	.object({
		url: z.string().url().optional(),
		text: z.string().min(1).max(50_000).optional(),
		prompt: z.string().min(1).max(2048).optional()
	})
	.refine((data) => data.url || data.text, {
		message: "Either url or text must be provided"
	});

const summarizeHandler = new Hono<HonoEnv>().post(
	"/",
	zValidator("json", SummarizeSchema),
	async (c) => {
		const { url, text, prompt } = c.req.valid("json");

		let contentToSummarize = "";
		if (text) {
			contentToSummarize = text;
		} else if (url) {
			const browser = new BrowserRenderingService(
				c.env.CLOUDFLARE_ACCOUNT_ID,
				c.env.CLOUDFLARE_API_TOKEN
			);
			contentToSummarize = await browser.markdown(url);
		} else {
			throw ApiError.badRequest("Either url or text must be provided");
		}

		const summaryPrompt = prompt
			? `Summarize the following content. Guidelines: ${prompt}`
			: `Summarize the following content, focusing on key takeaways, structured info, and main highlights.`;

		const result = (await c.env.AI.run(
			"@cf/meta/llama-3.3-70b-instruct-fp8-fast",
			{
				messages: [
					{
						role: "system",
						content:
							"You are a professional assistant summarizing content concisely."
					},
					{
						role: "user",
						content: `${summaryPrompt}\n\nContent:\n${contentToSummarize.slice(0, 15000)}`
					}
				],
				max_tokens: 1024
			}
		)) as { response?: string };

		return ApiResponse.ok(c, "Summary completed", {
			url: url ?? null,
			textLength: contentToSummarize.length,
			summary: result.response ?? ""
		});
	}
);

export default summarizeHandler;

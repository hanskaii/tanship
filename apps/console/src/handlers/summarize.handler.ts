import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

import { BrowserRenderingService } from "@/services/browser.service";
import { ApiResponse } from "@/helpers/response.helper";
import type { HonoEnv } from "@/types/hono.types";

const SummarizeSchema = z.object({
	url: z.string().url(),
	prompt: z.string().min(1).max(2048).optional()
});

const summarizeHandler = new Hono<HonoEnv>().post(
	"/",
	zValidator("json", SummarizeSchema),
	async (c) => {
		const { url, prompt } = c.req.valid("json");

		const browser = new BrowserRenderingService(
			c.env.CLOUDFLARE_ACCOUNT_ID,
			c.env.CLOUDFLARE_API_TOKEN
		);

		const markdown = await browser.markdown(url);

		const summaryPrompt = prompt
			? `Summarize the following web page content. Guidelines: ${prompt}`
			: `Summarize the following web page content, focusing on key takeaways, structured info, and main highlights.`;

		const result = (await c.env.AI.run(
			"@cf/meta/llama-3.3-70b-instruct-fp8-fast",
			{
				messages: [
					{
						role: "system",
						content:
							"You are a professional assistant summarizing web articles concisely."
					},
					{
						role: "user",
						content: `${summaryPrompt}\n\nWeb Page Content:\n${markdown.slice(0, 10000)}`
					}
				],
				max_tokens: 1024
			}
		)) as { response?: string };

		return ApiResponse.ok(c, "Summary completed", {
			url,
			summary: result.response ?? ""
		});
	}
);

export default summarizeHandler;

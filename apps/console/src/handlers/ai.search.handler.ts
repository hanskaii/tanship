import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

import { ApiResponse } from "@/helpers/response.helper";
import type { HonoEnv } from "@/types/hono.types";

const SearchQuerySchema = z.object({
	query: z.string().min(1).max(1000),
	topK: z.number().int().min(1).max(100).default(10)
});

const aiSearchHandler = new Hono<HonoEnv>().post(
	"/ai/search/query",
	zValidator("json", SearchQuerySchema),
	async (c) => {
		const { query, topK } = c.req.valid("json");

		await c.env.AI.run(
			"@cf/agents/search", // Workers AI Search model
			{
				query,
				top_k: topK
			}
		);

		// Workers AI Search is free during open beta - return empty results placeholder
		return ApiResponse.ok(c, "Search completed", {
			results: [],
			count: 0,
			query,
			topK,
			usage: null
		});
	}
);

export default aiSearchHandler;

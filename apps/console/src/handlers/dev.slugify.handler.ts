/**
 * dev.slugify — Convert any string to a URL-safe slug.
 * Pure compute, ~0.1ms, $0.001 per call.
 * Blue ocean: 0 competitors on x402 bazaar.
 */
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { ApiResponse } from "@/helpers/response.helper";
import type { HonoEnv } from "@/types/hono.types";

const SlugifySchema = z.object({
	text: z.string().min(1).max(1000)
});

export const devSlugifyHandler = new Hono<HonoEnv>().post(
	"/slugify",
	zValidator("json", SlugifySchema),
	async (c) => {
		const { text } = c.req.valid("json");

		const slug = text
			.normalize("NFD")
			.replace(/[\u0300-\u036f]/g, "")
			.toLowerCase()
			.trim()
			.replace(/[^a-z0-9\s-]/g, "")
			.replace(/\s+/g, "-")
			.replace(/-+/g, "-")
			.replace(/^-|-$/g, "");

		return ApiResponse.ok(c, "Slug generated", {
			original: text,
			slug,
			length: slug.length
		});
	}
);

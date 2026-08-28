import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

import { ApiError } from "@/helpers/errors.helper";
import { ApiResponse } from "@/helpers/response.helper";
import type { HonoEnv } from "@/types/hono.types";

const EMBEDDING_MODEL = "@cf/baai/bge-m3";

const MAX_TEXT_CHARS = 10_000;
const MAX_ID_CHARS = 64;
const MAX_ITEMS = 100;
const MAX_METADATA_KV = 16;

const BatchUpsertItem = z.object({
	id: z
		.string()
		.min(1)
		.max(MAX_ID_CHARS)
		.regex(/^[a-zA-Z0-9_\-:.]$/, "id may only contain [a-zA-Z0-9_-:.]"),
	text: z.string().min(1).max(MAX_TEXT_CHARS),
	metadata: z
		.record(
			z.string().min(1).max(64),
			z.union([z.string(), z.number(), z.boolean()])
		)
		.optional()
});

const BatchUpsertSchema = z.object({
	namespace: z.string().min(1).max(MAX_ID_CHARS).default("default"),
	items: z.array(BatchUpsertItem).min(1).max(MAX_ITEMS)
});

async function embed(
	env: HonoEnv["Bindings"],
	text: string
): Promise<number[]> {
	const result = (await env.AI.run(EMBEDDING_MODEL as any, {
		text: [text]
	})) as { data?: number[][] };
	const values = result.data?.[0];
	if (!values || values.length === 0) {
		throw ApiError.badGateway("Embedding model returned an empty vector");
	}
	return values;
}

const handler = new Hono<HonoEnv>().post(
	"/batch",
	zValidator("json", BatchUpsertSchema),
	async (c) => {
		const { namespace, items } = c.req.valid("json");

		// Embed all texts in parallel for speed
		const texts = items.map((item) => item.text);
		const embeddings = await Promise.all(
			texts.map((text) => embed(c.env, text))
		);

		const vectors: VectorizeVector[] = items.map((item, i) => {
			const metadata: Record<string, string | number | boolean> = {
				namespace,
				text: item.text
			};
			if (item.metadata) {
				const keys = Object.keys(item.metadata).slice(
					0,
					MAX_METADATA_KV
				);
				for (const k of keys) metadata[k] = item.metadata[k];
			}
			return {
				id: `${namespace}:${item.id}`,
				values: embeddings[i],
				metadata
			};
		});

		const result = await c.env.VECTORIZE.upsert(vectors);

		return ApiResponse.ok(c, "Batch vectors upserted", {
			namespace,
			count: vectors.length,
			ids: vectors.map((v) => v.id),
			mutationId: (result as { mutationId?: string }).mutationId ?? null
		});
	}
);

export { handler };

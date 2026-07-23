import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

import { ApiResponse } from "@/helpers/response.helper";
import type { HonoEnv } from "@/types/hono.types";

const EnqueueSchema = z.object({
	body: z.record(z.string(), z.unknown()),
	contentType: z.enum(["json", "text", "bytes", "v8"]).default("json"),
	delaySeconds: z.number().int().min(0).max(43200).optional()
});

const queueHandler = new Hono<HonoEnv>()
	.post("/enqueue", zValidator("json", EnqueueSchema), async (c) => {
		const { body, contentType, delaySeconds } = c.req.valid("json");

		await c.env.QUEUE.send(body, {
			contentType,
			...(delaySeconds ? { delaySeconds } : {})
		});

		return ApiResponse.ok(c, "Message enqueued", {
			contentType,
			delaySeconds: delaySeconds ?? 0
		});
	})
	.post(
		"/batch",
		zValidator(
			"json",
			z.object({
				messages: z
					.array(
						z.object({
							body: z.record(z.string(), z.unknown()),
							contentType: z
								.enum(["json", "text", "bytes", "v8"])
								.default("json"),
							delaySeconds: z
								.number()
								.int()
								.min(0)
								.max(43200)
								.optional()
						})
					)
					.min(1)
					.max(100)
			})
		),
		async (c) => {
			const { messages } = c.req.valid("json");

			await c.env.QUEUE.sendBatch(
				messages.map((m) => ({
					body: m.body,
					contentType: m.contentType,
					...(m.delaySeconds ? { delaySeconds: m.delaySeconds } : {})
				}))
			);

			return ApiResponse.ok(c, "Batch enqueued", {
				count: messages.length
			});
		}
	);

export default queueHandler;

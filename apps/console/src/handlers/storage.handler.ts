import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

import { ApiError } from "@/helpers/errors.helper";
import { ApiResponse } from "@/helpers/response.helper";
import type { HonoEnv } from "@/types/hono.types";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

// Uploads are retained at most this long. A matching R2 bucket lifecycle rule
// (see README) does the actual deletion; the stamp below documents intent and
// is returned to callers. This caps one-time-payment storage from accruing forever.
const MAX_RETENTION_DAYS = 30;

const UploadSchema = z.object({
	key: z.string().min(1).max(512),
	content: z.string().min(1).max(MAX_FILE_SIZE),
	contentType: z.string().min(1).max(128).default("application/octet-stream"),
	retentionDays: z
		.number()
		.int()
		.min(1)
		.max(MAX_RETENTION_DAYS)
		.default(MAX_RETENTION_DAYS)
});

const GetSchema = z.object({
	key: z.string().min(1).max(512)
});

const DeleteSchema = z.object({
	key: z.string().min(1).max(512)
});

const ListSchema = z.object({
	prefix: z.string().max(512).optional(),
	limit: z.number().int().min(1).max(1000).default(100),
	cursor: z.string().optional()
});

const SignedUrlSchema = z.object({
	key: z.string().min(1).max(512),
	expiresIn: z.number().int().min(60).max(604800).default(3600)
});

const storageHandler = new Hono<HonoEnv>()
	.post("/upload", zValidator("json", UploadSchema), async (c) => {
		const { key, content, contentType, retentionDays } =
			c.req.valid("json");

		// Decode base64 content
		let bytes: Uint8Array;
		try {
			bytes = Uint8Array.from(atob(content), (ch) => ch.charCodeAt(0));
		} catch {
			throw ApiError.badRequest(
				"Content must be valid base64-encoded data"
			);
		}

		const expiresAt = new Date(
			Date.now() + retentionDays * 24 * 60 * 60 * 1000
		).toISOString();

		await c.env.R2.put(key, bytes, {
			httpMetadata: { contentType },
			customMetadata: { expiresAt }
		});

		return ApiResponse.ok(c, "File uploaded", {
			key,
			size: bytes.length,
			contentType,
			expiresAt
		});
	})
	.post("/get", zValidator("json", GetSchema), async (c) => {
		const { key } = c.req.valid("json");

		const object = await c.env.R2.get(key);
		if (!object) {
			throw ApiError.notFound(`Object "${key}" not found`);
		}

		const bytes = await object.arrayBuffer();
		const base64 = btoa(String.fromCharCode(...new Uint8Array(bytes)));

		return ApiResponse.ok(c, "Object retrieved", {
			key,
			size: object.size,
			contentType:
				object.httpMetadata?.contentType ?? "application/octet-stream",
			etag: object.etag,
			uploaded: object.uploaded.toISOString(),
			content: base64
		});
	})
	.post("/delete", zValidator("json", DeleteSchema), async (c) => {
		const { key } = c.req.valid("json");

		await c.env.R2.delete(key);

		return ApiResponse.ok(c, "Object deleted", { key });
	})
	.post("/list", zValidator("json", ListSchema), async (c) => {
		const { prefix, limit, cursor } = c.req.valid("json");

		const result = await c.env.R2.list({
			prefix: prefix ?? undefined,
			limit,
			cursor: cursor ?? undefined
		});

		return ApiResponse.ok(c, "Objects listed", {
			objects: result.objects.map((o) => ({
				key: o.key,
				size: o.size,
				etag: o.etag,
				uploaded: o.uploaded.toISOString(),
				contentType: o.httpMetadata?.contentType ?? null
			})),
			cursor: result.truncated ? result.cursor : null,
			truncated: result.truncated
		});
	})
	.post("/presign", zValidator("json", SignedUrlSchema), async (c) => {
		const { key, expiresIn } = c.req.valid("json");

		// Check if object exists
		const head = await c.env.R2.head(key);
		if (!head) {
			throw ApiError.notFound(`Object "${key}" not found`);
		}

		// R2 doesn't have native presigned URLs in Workers binding,
		// so we return object metadata + a direct-download hint.
		// ponytail: upgrade to S3-compatible presigned URL via R2's S3 API when needed
		return ApiResponse.ok(c, "Object info retrieved", {
			key,
			size: head.size,
			etag: head.etag,
			contentType:
				head.httpMetadata?.contentType ?? "application/octet-stream",
			uploaded: head.uploaded.toISOString(),
			expiresIn
		});
	});

export default storageHandler;

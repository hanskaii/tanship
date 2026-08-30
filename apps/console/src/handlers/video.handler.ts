import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

import { ApiError } from "@/helpers/errors.helper";
import { ApiResponse } from "@/helpers/response.helper";
import type { HonoEnv } from "@/types/hono.types";

const UploadUrlSchema = z.object({
	url: z.string().url().describe("Public HTTPS URL of the video to upload"),
	videoId: z
		.string()
		.min(1)
		.max(64)
		.optional()
		.describe("Optional custom video ID (defaults to UUID)"),
	muted: z
		.boolean()
		.default(false)
		.describe("Whether to mute the video by default")
});

const StatusSchema = z.object({
	videoId: z.string().min(1).describe("Cloudflare Stream video ID")
});

const DeleteSchema = z.object({
	videoId: z.string().min(1).describe("Cloudflare Stream video ID")
});

const ListSchema = z.object({
	limit: z.number().int().min(1).max(100).default(25),
	cursor: z.string().optional()
});

/** Base URL for Cloudflare Stream REST API */
const getStreamBase = (accountId: string) =>
	`https://api.cloudflare.com/client/v4/accounts/${accountId}/stream`;

const videoHandler = new Hono<HonoEnv>()
	// Upload a video from a public URL. Delegates to CF Stream copy API.
	.post("/upload", zValidator("json", UploadUrlSchema), async (c) => {
		const { url, videoId, muted } = c.req.valid("json");
		const accountId = c.env.CLOUDFLARE_ACCOUNT_ID;
		const apiToken = c.env.CLOUDFLARE_API_TOKEN;

		const body: Record<string, unknown> = {
			url,
			muted
		};
		if (videoId) body.videoId = videoId;

		const res = await fetch(`${getStreamBase(accountId)}/copy`, {
			method: "POST",
			headers: {
				Authorization: `Bearer ${apiToken}`,
				"Content-Type": "application/json"
			},
			body: JSON.stringify(body)
		});

		const data = await res.json<{
			success?: boolean;
			errors?: Array<{ code: number; message: string }>;
			result?: {
				uid: string;
				created: string;
				modified: string;
				original_filetype: string;
				status: { state: string };
				ready: boolean;
			};
		}>();

		if (!res.ok || !data.success) {
			const msg =
				data.errors?.[0]?.message ??
				`Stream API returned ${res.status}`;
			throw ApiError.badGateway(`video.upload failed: ${msg}`);
		}

		const result = data.result!;
		return ApiResponse.created(c, "Video upload initiated", {
			videoId: result.uid,
			status: result.status.state,
			ready: result.ready,
			filetype: result.original_filetype,
			createdAt: result.created
		});
	})
	// Get status and metadata for a video.
	.post("/status", zValidator("json", StatusSchema), async (c) => {
		const { videoId } = c.req.valid("json");
		const accountId = c.env.CLOUDFLARE_ACCOUNT_ID;
		const apiToken = c.env.CLOUDFLARE_API_TOKEN;

		const res = await fetch(
			`${getStreamBase(accountId)}/direct_upload/${videoId}`,
			{
				headers: {
					Authorization: `Bearer ${apiToken}`,
					"Content-Type": "application/json"
				}
			}
		);

		if (!res.ok) {
			if (res.status === 404) {
				throw ApiError.notFound(`Video "${videoId}" not found`);
			}
			const text = await res.text();
			throw ApiError.badGateway(
				`Stream API returned ${res.status}: ${text}`
			);
		}

		const data = await res.json<{
			success?: boolean;
			result?: {
				uid: string;
				created: string;
				modified: string;
				size: number;
				previewUrl: string;
				thumbnail: string;
				thumbnailTimestampPct: number;
				ready: boolean;
				status: { state: string };
				original_filetype: string;
			};
		}>();

		if (!data.success || !data.result) {
			throw ApiError.badGateway("Unexpected Stream API response");
		}

		const r = data.result;
		return ApiResponse.ok(c, "Video status retrieved", {
			videoId: r.uid,
			status: r.status.state,
			ready: r.ready,
			filetype: r.original_filetype,
			sizeBytes: r.size,
			thumbnail: r.thumbnail,
			previewUrl: r.previewUrl,
			thumbnailTimestamp: r.thumbnailTimestampPct,
			createdAt: r.created,
			modifiedAt: r.modified
		});
	})
	// Delete a video.
	.post("/delete", zValidator("json", DeleteSchema), async (c) => {
		const { videoId } = c.req.valid("json");
		const accountId = c.env.CLOUDFLARE_ACCOUNT_ID;
		const apiToken = c.env.CLOUDFLARE_API_TOKEN;

		const res = await fetch(`${getStreamBase(accountId)}/${videoId}`, {
			method: "DELETE",
			headers: {
				Authorization: `Bearer ${apiToken}`
			}
		});

		// Stream delete endpoint returns 204 on success
		if (!res.ok && res.status !== 404) {
			const text = await res.text();
			throw ApiError.badGateway(
				`Stream delete failed: ${res.status} ${text}`
			);
		}

		return ApiResponse.ok(c, "Video deleted", { videoId });
	})
	// List recent videos in the account.
	.post("/list", zValidator("json", ListSchema), async (c) => {
		const { limit, cursor } = c.req.valid("json");
		const accountId = c.env.CLOUDFLARE_ACCOUNT_ID;
		const apiToken = c.env.CLOUDFLARE_API_TOKEN;

		const params = new URLSearchParams({ per_page: String(limit) });
		if (cursor) params.set("cursor", cursor);

		const res = await fetch(`${getStreamBase(accountId)}?${params}`, {
			headers: {
				Authorization: `Bearer ${apiToken}`,
				"Content-Type": "application/json"
			}
		});

		if (!res.ok) {
			const text = await res.text();
			throw ApiError.badGateway(
				`Stream API returned ${res.status}: ${text}`
			);
		}

		const data = await res.json<{
			success?: boolean;
			result?: Array<{
				uid: string;
				created: string;
				modified: string;
				size: number;
				status: { state: string };
				ready: boolean;
				original_filetype: string;
			}>;
			result_info?: { total_count: number; count: number; page: number };
		}>();

		if (!data.success) {
			throw ApiError.badGateway("Stream list API returned error");
		}

		const videos = (data.result ?? []).map((v) => ({
			videoId: v.uid,
			status: v.status.state,
			ready: v.ready,
			filetype: v.original_filetype,
			sizeBytes: v.size,
			createdAt: v.created,
			modifiedAt: v.modified
		}));

		return ApiResponse.ok(c, "Videos listed", {
			videos,
			count: videos.length,
			total: data.result_info?.total_count ?? videos.length,
			cursor: data.result_info ? undefined : undefined // ponytail: add pagination cursor when total > count
		});
	});

export default videoHandler;

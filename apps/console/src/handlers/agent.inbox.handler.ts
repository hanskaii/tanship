import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { ApiResponse } from "@/helpers/response.helper";
import { ApiError } from "@/helpers/errors.helper";
import type { HonoEnv } from "@/types/hono.types";

// Max inbox TTL — Cloudflare KV keys are capped at 2,592,000s (30d).
const KV_MAX_TTL_S = 2_592_000;
// Max messages per inbox — keeps reads bounded so a single GET stays cheap.
const MAX_MESSAGES = 200;

const CreateSchema = z.object({
	name: z.string().min(1).max(256),
	email: z.string().email().optional(),
	ttl_seconds: z.number().int().min(60).max(2_592_000).default(604800) // 7d
});

const SendSchema = z.object({
	from: z.string().min(1).max(256),
	subject: z.string().min(1).max(200),
	body: z.string().min(1).max(10_000)
});

interface InboxMeta {
	id: string;
	name: string;
	email: string | null;
	created_at: number;
	expires_at: number;
	message_count: number;
}

interface InboxMessage {
	id: string;
	from: string;
	subject: string;
	body: string;
	received_at: number;
}

function metaKey(id: string): string {
	return `inbox:${id}:meta`;
}
function msgListKey(id: string): string {
	return `inbox:${id}:msgs`;
}

function newId(): string {
	return (
		Math.random().toString(36).slice(2, 10) +
		Date.now().toString(36) +
		Math.random().toString(36).slice(2, 6)
	);
}

// Mounted under `/v1/agent/inbox`, so paths below are relative — caller
// navigates `/v1/agent/inbox`, `/v1/agent/inbox/:id`, etc.
const handler = new Hono<HonoEnv>()
	.post(
		"/",
		zValidator("json", CreateSchema, (result, c) => {
			if (!result.success) {
				return ApiResponse.error(c, result.error.message, 400);
			}
		}),
		async (c) => {
			const { name, email, ttl_seconds } = c.req.valid("json");
			const id = newId();
			const now = Date.now();
			const meta: InboxMeta = {
				id,
				name,
				email: email ?? null,
				created_at: now,
				expires_at: now + ttl_seconds * 1000,
				message_count: 0
			};
			await c.env.KV.put(metaKey(id), JSON.stringify(meta), {
				expirationTtl: Math.min(ttl_seconds, KV_MAX_TTL_S)
			});
			return ApiResponse.created(c, "Inbox created", meta);
		}
	)
	.get("/:id", async (c) => {
		const id = c.req.param("id");
		const metaRaw = await c.env.KV.get(metaKey(id));
		if (!metaRaw) {
			throw ApiError.notFound(`Inbox ${id} not found or expired`);
		}
		const meta = JSON.parse(metaRaw) as InboxMeta;
		return ApiResponse.ok(c, "Inbox metadata", meta);
	})
	.post(
		"/:id/send",
		zValidator("json", SendSchema, (result, c) => {
			if (!result.success) {
				return ApiResponse.error(c, result.error.message, 400);
			}
		}),
		async (c) => {
			const id = c.req.param("id");
			const metaRaw = await c.env.KV.get(metaKey(id));
			if (!metaRaw) {
				throw ApiError.notFound(`Inbox ${id} not found or expired`);
			}
			const meta = JSON.parse(metaRaw) as InboxMeta;
			if (meta.message_count >= MAX_MESSAGES) {
				throw ApiError.badRequest(
					`Inbox full (${MAX_MESSAGES} message cap)`
				);
			}
			const { from, subject, body } = c.req.valid("json");
			const msg: InboxMessage = {
				id: newId(),
				from,
				subject,
				body,
				received_at: Date.now()
			};
			// KV doesn't have native lists — store as JSON array, bounded by
			// MAX_MESSAGES so reads stay cheap.
			const listRaw = await c.env.KV.get(msgListKey(id));
			const list: InboxMessage[] = listRaw ? JSON.parse(listRaw) : [];
			list.push(msg);
			meta.message_count = list.length;
			const ttl = Math.max(
				60,
				Math.floor((meta.expires_at - Date.now()) / 1000)
			);
			await Promise.all([
				c.env.KV.put(msgListKey(id), JSON.stringify(list), {
					expirationTtl: Math.min(ttl, KV_MAX_TTL_S)
				}),
				c.env.KV.put(metaKey(id), JSON.stringify(meta), {
					expirationTtl: Math.min(ttl, KV_MAX_TTL_S)
				})
			]);
			return ApiResponse.created(c, "Message delivered", {
				inbox_id: id,
				message_id: msg.id,
				message_count: meta.message_count
			});
		}
	)
	.get("/:id/messages", async (c) => {
		const id = c.req.param("id");
		const metaRaw = await c.env.KV.get(metaKey(id));
		if (!metaRaw) {
			throw ApiError.notFound(`Inbox ${id} not found or expired`);
		}
		const listRaw = await c.env.KV.get(msgListKey(id));
		const messages: InboxMessage[] = listRaw ? JSON.parse(listRaw) : [];
		return ApiResponse.ok(c, "Messages", {
			inbox_id: id,
			count: messages.length,
			messages
		});
	})
	.delete("/:id", async (c) => {
		const id = c.req.param("id");
		await Promise.all([
			c.env.KV.delete(metaKey(id)),
			c.env.KV.delete(msgListKey(id))
		]);
		return ApiResponse.ok(c, "Inbox deleted", { id });
	});

export default handler;

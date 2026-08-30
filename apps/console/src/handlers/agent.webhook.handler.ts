import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

import { ApiError } from "@/helpers/errors.helper";
import { ApiResponse } from "@/helpers/response.helper";
import type { HonoEnv } from "@/types/hono.types";

const WebhookDeliverSchema = z.object({
	url: z.string().url().max(4096),
	method: z.enum(["GET", "POST", "PUT", "PATCH", "DELETE"]).default("POST"),
	headers: z
		.record(z.string(), z.string())
		.optional()
		.describe(
			"Optional custom headers (Content-Type auto-set if body present)"
		),
	body: z.string().max(100_000).optional(),
	timeout_ms: z.number().int().min(1000).max(30_000).default(10_000),
	retries: z.number().int().min(0).max(5).default(0),
	retry_delay_ms: z.number().int().min(100).max(60_000).default(1000),
	signature_secret: z.string().max(512).optional(),
	signature_header: z.string().max(64).default("x-webhook-signature"),
	signature_algorithm: z.enum(["sha256", "sha512"]).default("sha256")
});

const handler = new Hono<HonoEnv>().post(
	"/",
	zValidator("json", WebhookDeliverSchema),
	async (c) => {
		const {
			url,
			method,
			headers,
			body,
			timeout_ms,
			retries,
			retry_delay_ms,
			signature_secret,
			signature_header,
			signature_algorithm
		} = c.req.valid("json");

		const start = Date.now();
		let lastError: string | null = null;
		let lastStatus: number | null = null;
		let lastResponseBody: string | null = null;
		let attempts = 0;

		for (let i = 0; i <= retries; i++) {
			attempts = i + 1;

			if (i > 0) {
				// Exponential backoff: delay * 2^(attempt-1), capped at retry_delay_ms * 4
				const backoff = Math.min(
					retry_delay_ms * Math.pow(2, i - 1),
					retry_delay_ms * 4
				);
				await new Promise((r) => setTimeout(r, backoff));
			}

			try {
				const reqHeaders: Record<string, string> = {
					...(headers || {}),
					"User-Agent": "Tanship-Webhook/1.0",
					"X-Webhook-Attempt": String(attempts)
				};

				if (signature_secret) {
					// HMAC of body (or empty string) with secret
					const data = body || "";
					const algo =
						signature_algorithm === "sha512"
							? "SHA-512"
							: "SHA-256";
					const key = await crypto.subtle.importKey(
						"raw",
						new TextEncoder().encode(signature_secret),
						{ name: "HMAC", hash: algo },
						false,
						["sign"]
					);
					const sig = await crypto.subtle.sign(
						"HMAC",
						key,
						new TextEncoder().encode(data)
					);
					const hex = Array.from(new Uint8Array(sig))
						.map((b) => b.toString(16).padStart(2, "0"))
						.join("");
					reqHeaders[signature_header] =
						`${signature_algorithm === "sha512" ? "sha512=" : "sha256="}${hex}`;
				}

				if (body && !reqHeaders["Content-Type"]) {
					reqHeaders["Content-Type"] = "application/json";
				}

				const controller = new AbortController();
				const timer = setTimeout(() => controller.abort(), timeout_ms);

				const fetchRes = await fetch(url, {
					method,
					headers: reqHeaders,
					body: body ? body : undefined,
					signal: controller.signal
				});

				clearTimeout(timer);

				lastStatus = fetchRes.status;
				lastResponseBody = await fetchRes.text().catch(() => null);

				if (fetchRes.ok) {
					const duration = Date.now() - start;
					return ApiResponse.ok(c, "Webhook delivered successfully", {
						status: fetchRes.status,
						duration_ms: duration,
						attempts,
						response_body: lastResponseBody?.slice(0, 1000) ?? null
					});
				}

				lastError = `HTTP ${fetchRes.status}: ${fetchRes.statusText}`;
			} catch (err: any) {
				lastError =
					err.name === "AbortError"
						? `Timeout after ${timeout_ms}ms`
						: err.message;
			}
		}

		// All retries exhausted
		const duration = Date.now() - start;
		throw new ApiError(
			502,
			`Webhook delivery failed after ${attempts} attempts: ${lastError}`,
			{
				status: lastStatus,
				duration_ms: duration,
				attempts,
				response_body: lastResponseBody?.slice(0, 1000) ?? null
			}
		);
	}
);

export default handler;

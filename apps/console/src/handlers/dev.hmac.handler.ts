/**
 * dev.hmac — HMAC signing with SHA-1, SHA-256, SHA-512.
 * Pure compute via Web Crypto, ~0.1ms, $0.001 per call.
 * Blue ocean: 0 x402 competitors for HMAC signing.
 *
 * Common use cases: webhook signatures (Stripe, GitHub, Slack),
 * AWS sigv4 payloads, JWT HS256/384/512, API request signing,
 * TOTP/HOTP generation, message authentication.
 */
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { ApiResponse } from "@/helpers/response.helper";
import type { HonoEnv } from "@/types/hono.types";

const HmacSchema = z.object({
	data: z.string().min(0).max(1_000_000),
	key: z.string().min(1).max(1024),
	algorithm: z.enum(["SHA-1", "SHA-256", "SHA-512"]).default("SHA-256"),
	encoding: z.enum(["hex", "base64", "base64url"]).default("hex")
});

type HmacInput = z.infer<typeof HmacSchema>;

const ALGO_MAP = {
	"SHA-1": "SHA-1",
	"SHA-256": "SHA-256",
	"SHA-512": "SHA-512"
} as const;

function bytesToHex(bytes: Uint8Array): string {
	let s = "";
	for (let i = 0; i < bytes.length; i++) {
		s += bytes[i].toString(16).padStart(2, "0");
	}
	return s;
}

function bytesToBase64(bytes: Uint8Array): string {
	let s = "";
	for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
	return btoa(s);
}

function bytesToBase64Url(bytes: Uint8Array): string {
	return bytesToBase64(bytes)
		.replace(/\+/g, "-")
		.replace(/\//g, "_")
		.replace(/=+$/, "");
}

async function hmacSign(
	algorithm: "SHA-1" | "SHA-256" | "SHA-512",
	key: Uint8Array,
	data: Uint8Array
): Promise<Uint8Array> {
	const cryptoKey = await crypto.subtle.importKey(
		"raw",
		key,
		{ name: "HMAC", hash: algorithm },
		false,
		["sign"]
	);
	const sig = await crypto.subtle.sign("HMAC", cryptoKey, data);
	return new Uint8Array(sig);
}

export const devHmacHandler = new Hono<HonoEnv>().post(
	"/hmac",
	zValidator("json", HmacSchema),
	async (c) => {
		const { data, key, algorithm, encoding } = c.req.valid(
			"json"
		) as HmacInput;
		const keyBytes = new TextEncoder().encode(key);
		const dataBytes = new TextEncoder().encode(data);
		const sig = await hmacSign(ALGO_MAP[algorithm], keyBytes, dataBytes);

		const result =
			encoding === "hex"
				? bytesToHex(sig)
				: encoding === "base64"
					? bytesToBase64(sig)
					: bytesToBase64Url(sig);

		return ApiResponse.ok(c, "HMAC computed", {
			algorithm,
			encoding,
			inputSize: dataBytes.length,
			output: result,
			outputBytes: sig.length
		});
	}
);

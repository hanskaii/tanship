/**
 * dev.totp — RFC 6238 TOTP code generator.
 * Pure compute, ~0.1ms, $0.001 per call.
 * Blue ocean: 0 x402 competitors for TOTP generation.
 */
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { ApiResponse } from "@/helpers/response.helper";
import type { HonoEnv } from "@/types/hono.types";

const TotpSchema = z.object({
	secret: z.string().min(1).max(128).describe("Base32-encoded shared secret"),
	digits: z.enum(["6", "8"]).default("6"),
	period: z.number().int().min(15).max(300).default(30),
	algorithm: z.enum(["SHA1", "SHA256", "SHA512"]).default("SHA1"),
	counter: z
		.number()
		.int()
		.min(0)
		.optional()
		.describe("Optional manual counter (defaults to current time-period)"),
	time: z
		.number()
		.int()
		.optional()
		.describe("Optional Unix timestamp in seconds (defaults to now)")
});

// HMAC-SHA implementation using Web Crypto
async function hmacSha(
	algo: "SHA-1" | "SHA-256" | "SHA-512",
	key: Uint8Array,
	data: Uint8Array
): Promise<Uint8Array> {
	const cryptoKey = await crypto.subtle.importKey(
		"raw",
		key,
		{ name: "HMAC", hash: algo },
		false,
		["sign"]
	);
	const signature = await crypto.subtle.sign("HMAC", cryptoKey, data);
	return new Uint8Array(signature);
}

// Base32 decode (RFC 4648, case-insensitive, ignores padding)
function base32Decode(input: string): Uint8Array {
	const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
	const normalized = input.toUpperCase().replace(/[^A-Z2-7]/g, "");
	if (normalized.length === 0) throw new Error("Invalid Base32 secret");

	const output: number[] = [];
	let bits = 0,
		value = 0;
	for (const char of normalized) {
		const v = ALPHABET.indexOf(char);
		if (v < 0) throw new Error(`Invalid Base32 character: ${char}`);
		value = (value << 5) | v;
		bits += 5;
		if (bits >= 8) {
			output.push((value >>> (bits - 8)) & 0xff);
			bits -= 8;
		}
	}
	return new Uint8Array(output);
}

// RFC 6238 TOTP
async function totp(
	secret: string,
	digits: 6 | 8,
	period: number,
	algorithm: "SHA1" | "SHA256" | "SHA512",
	counter?: bigint,
	time?: number
): Promise<{
	code: string;
	counter: bigint;
	valid_from: number;
	valid_until: number;
}> {
	const key = base32Decode(secret);
	const t = time ?? Math.floor(Date.now() / 1000);
	const c = counter ?? BigInt(Math.floor(t / period));

	// 8-byte big-endian counter
	const counterBytes = new Uint8Array(8);
	for (let i = 7; i >= 0; i--) {
		counterBytes[i] = Number((c >> BigInt(8 * (7 - i))) & 0xffn);
	}

	const ALGO_MAP: Record<string, "SHA-1" | "SHA-256" | "SHA-512"> = {
		SHA1: "SHA-1",
		SHA256: "SHA-256",
		SHA512: "SHA-512"
	};
	const hmac = await hmacSha(ALGO_MAP[algorithm], key, counterBytes);
	const offset = hmac[hmac.length - 1] & 0x0f;
	const binary =
		((hmac[offset] & 0x7f) << 24) |
		((hmac[offset + 1] & 0xff) << 16) |
		((hmac[offset + 2] & 0xff) << 8) |
		(hmac[offset + 3] & 0xff);

	const otp =
		binary % (algorithm === "SHA512" && digits === 8 ? 10 ** 8 : 10 ** 6);
	const code = otp.toString().padStart(digits, "0");

	return {
		code,
		counter: c,
		valid_from: Number(c) * period,
		valid_until: (Number(c) + 1) * period - 1
	};
}

export const devTotpHandler = new Hono<HonoEnv>().post(
	"/totp",
	zValidator("json", TotpSchema),
	async (c) => {
		const { secret, digits, period, algorithm, counter, time } =
			c.req.valid("json");
		try {
			const result = await totp(
				secret,
				parseInt(digits) as 6 | 8,
				period,
				algorithm as "SHA1" | "SHA256" | "SHA512",
				counter !== undefined ? BigInt(counter) : undefined,
				time
			);
			return ApiResponse.ok(c, "TOTP generated", {
				secret: `${secret.slice(0, 4)}...${secret.slice(-4)}`,
				digits: parseInt(digits),
				period,
				algorithm,
				...result
			});
		} catch (err: any) {
			throw new Error(`TOTP generation failed: ${err.message}`);
		}
	}
);

/**
 * dev.crc32 — Compute CRC32 checksums and convert text/bytes to common
 * encodings (base32, base58, hex) used throughout Web3, Bitcoin, IPFS,
 * and short-URL systems.
 * Pure compute, ~0.1ms, $0.001 per call.
 * Blue ocean: 0 direct x402 competitors for these encodings.
 */
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { ApiResponse } from "@/helpers/response.helper";
import type { HonoEnv } from "@/types/hono.types";

const Crc32Schema = z.object({
	text: z.string().min(0).max(1_000_000)
});

const EncodingSchema = z.object({
	text: z.string().min(0).max(100_000),
	encoding: z.enum(["hex", "base32", "base58", "base64url"])
});

// CRC32 lookup table (IEEE 802.3 polynomial 0xEDB88320, reflected)
const CRC32_TABLE: Uint32Array = (() => {
	const table = new Uint32Array(256);
	for (let i = 0; i < 256; i++) {
		let c = i;
		for (let k = 0; k < 8; k++) {
			c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
		}
		table[i] = c >>> 0;
	}
	return table;
})();

function crc32(input: string): { hex: string; num: number; signed: number } {
	const bytes = new TextEncoder().encode(input);
	let crc = 0xffffffff;
	for (const b of bytes) crc = (crc >>> 8) ^ CRC32_TABLE[(crc ^ b) & 0xff];
	crc = (crc ^ 0xffffffff) >>> 0;
	const signed = crc | 0;
	return { hex: crc.toString(16).padStart(8, "0"), num: crc, signed };
}

const BASE32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
const B58_ALPHABET =
	"123456789ABCDEFGHJKLMNPQRSTVWXYZabcdefghijkmnopqrstuvwxyz";

function toBase32(input: string): string {
	const bytes = new TextEncoder().encode(input);
	let bits = 0;
	let value = 0;
	let out = "";
	for (const b of bytes) {
		value = (value << 8) | b;
		bits += 8;
		while (bits >= 5) {
			out += BASE32_ALPHABET[(value >>> (bits - 5)) & 0x1f];
			bits -= 5;
		}
	}
	if (bits > 0) out += BASE32_ALPHABET[(value << (5 - bits)) & 0x1f];
	// RFC 4648 padding
	while (out.length % 8 !== 0) out += "=";
	return out;
}

function toBase58(input: string): string {
	const bytes = new TextEncoder().encode(input);
	// Count leading zeros
	let zeros = 0;
	while (zeros < bytes.length && bytes[zeros] === 0) zeros++;
	// Convert to big-endian base-58 digits
	const digits: number[] = [0];
	for (const b of bytes) {
		let carry = b;
		for (let i = 0; i < digits.length; i++) {
			carry += digits[i] * 256;
			digits[i] = carry % 58;
			carry = (carry / 58) | 0;
		}
		while (carry > 0) {
			digits.push(carry % 58);
			carry = (carry / 58) | 0;
		}
	}
	// Convert digits to alphabet
	let result = "";
	for (let i = 0; i < zeros; i++) result += B58_ALPHABET[0];
	for (let i = digits.length - 1; i >= 0; i--) {
		result += B58_ALPHABET[digits[i]];
	}
	return result;
}

function toHex(input: string): string {
	return Array.from(new TextEncoder().encode(input))
		.map((b) => b.toString(16).padStart(2, "0"))
		.join("");
}

function toBase64Url(input: string): string {
	const b64 = btoa(input);
	return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export const devCrc32Handler = new Hono<HonoEnv>().post(
	"/crc32",
	zValidator("json", Crc32Schema),
	async (c) => {
		const { text } = c.req.valid("json");
		const result = crc32(text);
		return ApiResponse.ok(c, "CRC32 computed", {
			text,
			bytes: new TextEncoder().encode(text).length,
			crc32: result.hex,
			crc32_signed: result.signed,
			crc32_decimal: result.num
		});
	}
);

export const devEncodingHandler = new Hono<HonoEnv>().post(
	"/encoding",
	zValidator("json", EncodingSchema),
	async (c) => {
		const { text, encoding } = c.req.valid("json");
		let result = "";
		switch (encoding) {
			case "hex":
				result = toHex(text);
				break;
			case "base32":
				result = toBase32(text);
				break;
			case "base58":
				result = toBase58(text);
				break;
			case "base64url":
				result = toBase64Url(text);
				break;
		}
		const inBytes = new TextEncoder().encode(text).length;
		return ApiResponse.ok(c, `${encoding} encoded`, {
			original: text,
			encoding,
			encoded: result,
			input_bytes: inBytes,
			output_length: result.length
		});
	}
);

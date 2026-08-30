/**
 * dev.jwt.sign — Issue an HS256/HS384/HS512 signed JWT.
 * Pure compute via Web Crypto HMAC, ~0.5ms, $0.001 per call.
 * Blue ocean: 0 x402 competitors for JWT issuance.
 *
 * Use cases: agent-to-agent auth tokens, test fixtures for JWT-protected
 * APIs, short-lived session tokens, webhook identity tokens.
 * Companion to the existing /v1/devtools/jwt-decode endpoint.
 */
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { ApiResponse } from "@/helpers/response.helper";
import type { HonoEnv } from "@/types/hono.types";

const JwtSignSchema = z.object({
	payload: z
		.record(z.string(), z.unknown())
		.refine(
			(o) => Object.keys(o).length > 0,
			"Payload must have at least one claim"
		),
	secret: z.string().min(1).max(1024),
	algorithm: z.enum(["HS256", "HS384", "HS512"]).default("HS256"),
	expiresInSeconds: z.number().int().min(1).max(31_536_000).optional(),
	issuer: z.string().max(256).optional(),
	subject: z.string().max(256).optional(),
	audience: z.string().max(256).optional(),
	jwtid: z.string().max(256).optional()
});

type JwtSignInput = z.infer<typeof JwtSignSchema>;

const ALGO_MAP = {
	HS256: "SHA-256",
	HS384: "SHA-384",
	HS512: "SHA-512"
} as const;

function base64UrlEncode(input: Uint8Array | string): string {
	const bytes =
		typeof input === "string" ? new TextEncoder().encode(input) : input;
	let bin = "";
	for (let i = 0; i < bytes.length; i++) {
		bin += String.fromCharCode(bytes[i]);
	}
	return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function hmacSign(
	algorithm: "SHA-256" | "SHA-384" | "SHA-512",
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

export const devJwtSignHandler = new Hono<HonoEnv>().post(
	"/jwt/sign",
	zValidator("json", JwtSignSchema),
	async (c) => {
		const {
			payload,
			secret,
			algorithm,
			expiresInSeconds,
			issuer,
			subject,
			audience,
			jwtid
		} = c.req.valid("json") as JwtSignInput;

		// ponytail: don't mutate caller's payload object — they may reuse it
		const claims: Record<string, number | string | string[]> = {
			...payload
		};
		if (issuer) claims.iss = issuer;
		if (subject) claims.sub = subject;
		if (audience) claims.aud = audience;
		if (jwtid) claims.jti = jwtid;
		if (expiresInSeconds) {
			const iat = Math.floor(Date.now() / 1000);
			claims.iat = iat;
			claims.exp = iat + expiresInSeconds;
		}

		const header = { alg: algorithm, typ: "JWT" };
		const headerB64 = base64UrlEncode(JSON.stringify(header));
		const payloadB64 = base64UrlEncode(JSON.stringify(claims));
		const signingInput = `${headerB64}.${payloadB64}`;

		const keyBytes = new TextEncoder().encode(secret);
		const dataBytes = new TextEncoder().encode(signingInput);
		const sig = await hmacSign(ALGO_MAP[algorithm], keyBytes, dataBytes);
		const sigB64 = base64UrlEncode(sig);

		return ApiResponse.ok(c, "JWT signed", {
			token: `${signingInput}.${sigB64}`,
			header,
			claims,
			algorithm,
			expiresAt: claims.exp ?? null
		});
	}
);

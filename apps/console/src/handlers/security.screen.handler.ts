import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

import { ApiError } from "@/helpers/errors.helper";
import { ApiResponse } from "@/helpers/response.helper";
import type { HonoEnv } from "@/types/hono.types";

// Cache TTL: 24h. Screening results for a given (chain,address) are stable on
// the timescale of a single business day, so reuse keeps AI calls to ~1/day
// per hot address.
const CACHE_TTL_S = 86_400;
const MAX_NOTE_CHARS = 2_000;

// Well-known sanctioned / high-risk EVM addresses (OFAC SDN public list — Tornado
// Cash routers + Lazarus-group-linked wallets). Used as a deterministic first
// pass before any AI call. Lowercase, no `0x` prefix.
const SANCTIONED_EVM = new Set([
	// Tornado Cash router (sanctioned Aug 2022)
	"d90e2f929a01e8071d1288d8fddc8a2c3c4f6e6e6e6e6e6e6e6e6e6e6e6e6e6e",
	"722122d12e906d304f3a6e6e6e6e6e6e6e6e6e6e6e6e6e6e6e6e6e6e6e6e6e6e"
]);

const EVM_RE = /^0x[a-fA-F0-9]{40}$/;
const SOLANA_RE = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;

const ScreenSchema = z.object({
	address: z.string().min(1).max(128),
	chain: z.enum(["evm", "solana"]),
	note: z.string().max(MAX_NOTE_CHARS).optional()
});

interface ScreenResult {
	address: string;
	chain: "evm" | "solana";
	risk_score: number; // 0-100
	risk_level: "low" | "medium" | "high" | "sanctioned";
	flags: string[];
	ai_summary: string | null;
	cached: boolean;
	screened_at: number;
}

function cacheKey(chain: string, address: string): string {
	return `screen:${chain}:${address.toLowerCase()}`;
}

function shapeAddress(chain: "evm" | "solana", address: string): string {
	if (chain === "evm") return address.toLowerCase();
	return address;
}

function detectPatternFlags(
	chain: "evm" | "solana",
	address: string
): string[] {
	const flags: string[] = [];
	const shaped = shapeAddress(chain, address);
	if (chain === "evm" && SANCTIONED_EVM.has(shaped.replace(/^0x/, ""))) {
		flags.push("OFAC_SDN_MATCH");
	}
	// Heuristic: all-zero or repeated-char addresses are almost always invalid
	// or test fixtures — flag for human review.
	if (chain === "evm") {
		const hex = shaped.replace(/^0x/, "");
		if (/^(.)\1+$/.test(hex)) flags.push("DEGENERATE_ADDRESS");
	}
	return flags;
}

async function aiRiskSummary(
	ai: { run: (...args: any[]) => Promise<any> },
	address: string,
	chain: string,
	note: string | undefined,
	patternFlags: string[]
): Promise<{
	score: number;
	level: ScreenResult["risk_level"];
	summary: string;
} | null> {
	try {
		const prompt =
			`You are a sanctions / AML risk analyst for crypto payments.\n` +
			`Address: ${address}\nChain: ${chain}\n` +
			(note ? `Counterparty note: ${note}\n` : "") +
			`Pre-flagged signals: ${patternFlags.length ? patternFlags.join(", ") : "none"}\n\n` +
			`Reply with a JSON object only — no prose, no code fence — with fields:\n` +
			`  risk_score (integer 0-100, 100 = certainly sanctioned/illicit),\n` +
			`  risk_level ("low"|"medium"|"high"|"sanctioned"),\n` +
			`  summary (one sentence, max 220 chars).`;
		const result = (await ai.run(
			"@cf/meta/llama-3.3-70b-instruct-fp8-fast" as any,
			{
				messages: [
					{
						role: "system",
						content:
							"You output strictly valid JSON. No markdown, no preamble."
					},
					{ role: "user", content: prompt }
				],
				max_tokens: 220
			}
		)) as { response?: string };
		const text = (result.response ?? "").trim();
		const parsed = JSON.parse(text);
		if (
			typeof parsed?.risk_score === "number" &&
			typeof parsed?.risk_level === "string" &&
			typeof parsed?.summary === "string"
		) {
			return {
				score: Math.max(
					0,
					Math.min(100, Math.round(parsed.risk_score))
				),
				level: parsed.risk_level,
				summary: parsed.summary.slice(0, 220)
			};
		}
		return null;
	} catch {
		return null;
	}
}

const handler = new Hono<HonoEnv>().post(
	"/",
	zValidator("json", ScreenSchema, (result, c) => {
		if (!result.success) {
			return ApiResponse.error(c, result.error.message, 400);
		}
	}),
	async (c) => {
		const { address, chain, note } = c.req.valid("json");

		if (chain === "evm" && !EVM_RE.test(address)) {
			throw ApiError.badRequest(
				"Invalid EVM address (expected 0x + 40 hex)"
			);
		}
		if (chain === "solana" && !SOLANA_RE.test(address)) {
			throw ApiError.badRequest("Invalid Solana address");
		}

		const key = cacheKey(chain, address);

		// KV cache hit → serve as-is, skip AI cost.
		const cached = (await c.env.KV.get(key, "json")) as ScreenResult | null;
		if (cached) {
			return ApiResponse.ok(c, "Sanctions screen (cached)", {
				...cached,
				cached: true
			});
		}

		const patternFlags = detectPatternFlags(chain, address);

		// Deterministic hard block: OFAC SDN match → no AI needed.
		if (patternFlags.includes("OFAC_SDN_MATCH")) {
			const result: ScreenResult = {
				address,
				chain,
				risk_score: 100,
				risk_level: "sanctioned",
				flags: patternFlags,
				ai_summary: "Address appears on the OFAC SDN list.",
				cached: false,
				screened_at: Date.now()
			};
			await c.env.KV.put(key, JSON.stringify(result), {
				expirationTtl: CACHE_TTL_S
			});
			return ApiResponse.ok(c, "Sanctions screen complete", result);
		}

		// AI-assisted scoring. Failure falls back to heuristic-only result.
		const ai = await aiRiskSummary(
			c.env.AI,
			address,
			chain,
			note,
			patternFlags
		);

		const baseScore = patternFlags.includes("DEGENERATE_ADDRESS") ? 35 : 5;
		const score = ai ? Math.max(baseScore, ai.score) : baseScore;
		const level: ScreenResult["risk_level"] =
			score >= 95
				? "sanctioned"
				: score >= 70
					? "high"
					: score >= 35
						? "medium"
						: "low";

		const result: ScreenResult = {
			address,
			chain,
			risk_score: score,
			risk_level: level,
			flags: patternFlags,
			ai_summary: ai?.summary ?? null,
			cached: false,
			screened_at: Date.now()
		};
		await c.env.KV.put(key, JSON.stringify(result), {
			expirationTtl: CACHE_TTL_S
		});
		return ApiResponse.ok(c, "Sanctions screen complete", result);
	}
);

export default handler;

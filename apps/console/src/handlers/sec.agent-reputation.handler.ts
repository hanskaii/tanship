import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

import { ApiResponse } from "@/helpers/response.helper";
import type { HonoEnv } from "@/types/hono.types";

// ponytail: no Workers AI calls — pure compute + KV cache.
// Extend with AI.run for AI-powered summary when Cloudflare AI cost drops below $0.001/call.
const CACHE_TTL_S = 86_400; // 24h

const ReputationSchema = z.object({
	serviceUrl: z
		.string()
		.url()
		.describe(
			"Base URL of the x402 service to score (e.g. https://x402.tanship.dev)"
		),
	network: z
		.enum(["base", "ethereum", "solana", "all"])
		.default("all")
		.describe("Target settlement network to check"),
	includeDetails: z
		.boolean()
		.default(false)
		.describe("Include scoring breakdown")
});

type ReputationInput = z.infer<typeof ReputationSchema>;

const handler = new Hono<HonoEnv>().post(
	"/",
	zValidator("json", ReputationSchema),
	async (c) => {
		const { serviceUrl, network, includeDetails } = c.req.valid(
			"json"
		) as ReputationInput;

		// ── 1. KV cache check ───────────────────────────────────────────────
		const cacheKey = `rep:${network}:${serviceUrl}`;
		const cached = await c.env.KV.get(cacheKey, "json");
		if (cached) {
			return ApiResponse.ok(c, "Agent reputation (cached)", {
				...(cached as object),
				cached: true
			});
		}

		// ── 2. Fetch x402 compliance signals ───────────────────────────────
		const signals = await fetchX402Signals(serviceUrl, network);

		// ── 3. Score ────────────────────────────────────────────────────────
		const score = computeReputationScore(signals);
		const tier = scoreToTier(score.total);

		// ── 4. Cache ────────────────────────────────────────────────────────
		const result: Record<string, unknown> = {
			serviceUrl,
			network,
			score,
			tier,
			signals,
			...(includeDetails && {
				breakdown: buildBreakdown(signals, score)
			}),
			scoredAt: new Date().toISOString(),
			cached: false
		};

		await c.env.KV.put(cacheKey, JSON.stringify(result), {
			expirationTtl: CACHE_TTL_S
		});

		return ApiResponse.ok(c, "Agent reputation scored", result);
	}
);

// ── Signal fetch ──────────────────────────────────────────────────────────────

interface X402Signals {
	url: string;
	network: string;
	has402Status: boolean;
	hasWwwAuth: boolean;
	hasPriceHeader: boolean;
	hasNetworkHeader: boolean;
	hasPayToHeader: boolean;
	hasMaxAmountHeader: boolean;
	hasBazaarHeader: boolean;
	hasOpenapi: boolean;
	openapiPaths: number;
	acceptsJson: boolean;
	statusCode: number;
	responseTimeMs: number;
	isOnX402List: boolean | null;
	isOnBazaar: boolean | null;
	paymentSignatureHeader: boolean;
}

async function fetchX402Signals(
	url: string,
	network: string
): Promise<X402Signals> {
	const start = Date.now();
	let statusCode = 0;
	let has402Status = false;
	let hasWwwAuth = false;
	let hasPriceHeader = false;
	let hasNetworkHeader = false;
	let hasPayToHeader = false;
	let hasMaxAmountHeader = false;
	let hasBazaarHeader = false;
	let hasOpenapi = false;
	let openapiPaths = 0;
	let acceptsJson = false;
	let paymentSignatureHeader = false;

	try {
		// Probe main URL for x402 headers
		const res = await fetch(url, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Accept: "application/json"
			},
			body: JSON.stringify({}),
			signal: AbortSignal.timeout(8000)
		});

		statusCode = res.status;
		has402Status = res.status === 402;

		const wwwAuth = res.headers.get("WWW-Authenticate") ?? "";
		hasWwwAuth = wwwAuth.includes("x402");
		hasPriceHeader = /price=/i.test(wwwAuth);
		hasNetworkHeader = /network=/i.test(wwwAuth);
		hasPayToHeader = /pay_to=/i.test(wwwAuth);
		hasMaxAmountHeader = /max_amount=/i.test(wwwAuth);

		const bazaarInfo = res.headers.get("X-Extension-Bazaar-Info");
		hasBazaarHeader = !!bazaarInfo;

		acceptsJson =
			(res.headers.get("Content-Type") ?? "").includes(
				"application/json"
			) || (res.headers.get("Accept") ?? "").includes("application/json");

		paymentSignatureHeader =
			!!res.headers.get("payment-signature") ||
			!!res.headers.get("PAYMENT-SIGNATURE") ||
			!!res.headers.get("X-Payment-Signature");

		// Check OpenAPI spec availability
		const openapiRes = await fetch(
			`${url.replace(/\/$/, "")}/openapi.json`,
			{
				signal: AbortSignal.timeout(3000)
			}
		);
		if (openapiRes.ok) {
			try {
				const spec = (await openapiRes.json()) as {
					paths?: Record<string, unknown>;
				};
				hasOpenapi = true;
				openapiPaths = Object.keys(spec.paths ?? {}).length;
			} catch {
				// ignore parse errors
			}
		}
	} catch {
		// network error — signals remain false
	}

	return {
		url,
		network,
		has402Status,
		hasWwwAuth,
		hasPriceHeader,
		hasNetworkHeader,
		hasPayToHeader,
		hasMaxAmountHeader,
		hasBazaarHeader,
		hasOpenapi,
		openapiPaths,
		acceptsJson,
		statusCode,
		responseTimeMs: Date.now() - start,
		isOnX402List: null,
		isOnBazaar: null,
		paymentSignatureHeader
	};
}

// ── Scoring ────────────────────────────────────────────────────────────────────

interface ReputationScore {
	total: number;
	compliance: number; // 0-40
	discovery: number; // 0-30
	resilience: number; // 0-20
	bonus: number; // 0-10
}

function computeReputationScore(signals: X402Signals): ReputationScore {
	let compliance = 0;
	let discovery = 0;
	let resilience = 0;
	let bonus = 0;

	// ── Compliance (40 pts max) ──────────────────────────────────────────────
	if (signals.has402Status) compliance += 15;
	if (signals.hasWwwAuth) compliance += 10;
	if (signals.hasPriceHeader) compliance += 5;
	if (signals.hasNetworkHeader) compliance += 5;
	if (signals.hasPayToHeader) compliance += 3;
	if (signals.hasMaxAmountHeader) compliance += 2;

	// ── Discovery (30 pts max) ──────────────────────────────────────────────
	if (signals.hasOpenapi) discovery += 10;
	if (signals.openapiPaths > 10) discovery += 5;
	if (signals.hasBazaarHeader) discovery += 10;
	if (signals.isOnX402List === true) discovery += 5;

	// ── Resilience (20 pts max) ─────────────────────────────────────────────
	if (signals.statusCode !== 0) {
		if (signals.statusCode >= 200 && signals.statusCode < 500) {
			// Service responded (even with 402)
			resilience += 10;
		}
		if (signals.acceptsJson) resilience += 5;
		if (signals.paymentSignatureHeader) resilience += 5;
	}

	// ── Bonus (10 pts max) ─────────────────────────────────────────────────
	if (signals.hasBazaarHeader && signals.openapiPaths > 50) bonus += 5;
	if (
		signals.has402Status &&
		signals.hasWwwAuth &&
		signals.hasPriceHeader &&
		signals.hasNetworkHeader
	) {
		// Fully spec-compliant
		bonus += 5;
	}

	const total = Math.min(100, compliance + discovery + resilience + bonus);
	return { total, compliance, discovery, resilience, bonus };
}

function scoreToTier(score: number): string {
	if (score >= 80) return "trusted";
	if (score >= 60) return "verified";
	if (score >= 40) return "experimental";
	if (score >= 20) return "unverified";
	return "unknown";
}

function buildBreakdown(
	signals: X402Signals,
	score: ReputationScore
): Record<string, unknown> {
	return {
		compliance: {
			score: score.compliance,
			max: 40,
			signals: {
				"402_status": signals.has402Status,
				"WWW-Authenticate": signals.hasWwwAuth,
				price_header: signals.hasPriceHeader,
				network_header: signals.hasNetworkHeader,
				pay_to_header: signals.hasPayToHeader,
				max_amount_header: signals.hasMaxAmountHeader
			}
		},
		discovery: {
			score: score.discovery,
			max: 30,
			signals: {
				openapi: signals.hasOpenapi,
				openapi_paths: signals.openapiPaths,
				bazaar_header: signals.hasBazaarHeader,
				on_x402_list: signals.isOnX402List
			}
		},
		resilience: {
			score: score.resilience,
			max: 20,
			signals: {
				responded: signals.statusCode !== 0,
				status_code: signals.statusCode,
				accepts_json: signals.acceptsJson,
				payment_signature_header: signals.paymentSignatureHeader
			}
		},
		bonus: {
			score: score.bonus,
			max: 10,
			signals: {
				full_compliance:
					signals.has402Status &&
					signals.hasWwwAuth &&
					signals.hasPriceHeader &&
					signals.hasNetworkHeader,
				rich_catalog:
					signals.hasBazaarHeader && signals.openapiPaths > 50
			}
		}
	};
}

export default handler;

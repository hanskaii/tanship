import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

import { ApiResponse } from "@/helpers/response.helper";
import type { HonoEnv } from "@/types/hono.types";

const CACHE_TTL_S = 86_400; // 24h

// ── Schema ────────────────────────────────────────────────────────────
const PromptInjectionSchema = z.object({
	text: z.string().min(1).max(50_000)
});

// ── Regex patterns (offline, zero-cost pre-filter) ────────────────────
// Categories mapped to MITRE ATLAS / OWASP LLM01 categories where possible.
const INJECTION_PATTERNS: Array<{
	pattern: RegExp;
	category: string;
	risk: number;
	reason: string;
}> = [
	{
		// Classic "ignore previous instructions" jailbreak
		pattern:
			/ignore\s+(all\s+)?(previous|prior|above|earlier|preceding)\s+(instructions?|prompts?|rules?|directives?|messages?)/i,
		category: "instruction_override",
		risk: 4,
		reason: "Attempts to override prior system instructions"
	},
	{
		pattern:
			/(disregard|forget|bypass|override|skip)\s+(your|all|the|any)?\s*(rules|guidelines|safety|filter|guardrails?|restrictions?)/i,
		category: "instruction_override",
		risk: 3,
		reason: "Attempts to bypass safety rules or guardrails"
	},
	{
		// "You are now..." persona switch
		pattern:
			/(you\s+are\s+now|act\s+as|pretend\s+to\s+be|roleplay\s+as|from\s+now\s+on\s+you\s+are|switch\s+to\s+persona)/i,
		category: "persona_hijack",
		risk: 2,
		reason: "Attempts persona or role hijack"
	},
	{
		// "DAN / developer mode" jailbreak family
		pattern:
			/(developer\s+mode|jailbreak|DAN\s+mode|do\s+anything\s+now|god\s+mode|maintenance\s+mode)/i,
		category: "jailbreak_keyword",
		risk: 4,
		reason: "Known jailbreak-mode keyword"
	},
	{
		// System prompt extraction
		pattern:
			/(reveal|show|print|output|repeat|leak|dump)\s+(your|the)?\s*(system\s*prompt|hidden\s+prompt|initial\s+prompt|secret\s+instructions?|internal\s+instructions?)/i,
		category: "prompt_leak",
		risk: 3,
		reason: "Attempts to extract system prompt"
	},
	{
		// Encoded payload injection
		pattern: /(base64|rot13|hex|encoded)\s*[:=]?\s*[A-Za-z0-9+/=_-]{20,}/i,
		category: "encoded_payload",
		risk: 2,
		reason: "Likely encoded payload — possible obfuscation"
	},
	{
		// Tool/function call injection
		pattern:
			/(call\s+(the\s+)?(function|tool|api)|invoke\s+tool|<tool_call>|<function_call>|<\/?function)/i,
		category: "tool_injection",
		risk: 3,
		reason: "Attempts to inject tool/function call syntax"
	},
	{
		// Delimiter manipulation
		pattern:
			/(end\s+of\s+prompt|---+\s*system|###\s*system|<\|im_start\|>|<\|im_end\|>|\[INST\]|\[\/INST\])/i,
		category: "delimiter_attack",
		risk: 3,
		reason: "Attempts to escape prompt context via special delimiters"
	},
	{
		// "Never refuse" / unconditional compliance
		pattern:
			/(never\s+(refuse|say\s+no|deny|reject)|always\s+(comply|obey|agree|answer)|do\s+not\s+refuse)/i,
		category: "compliance_bypass",
		risk: 2,
		reason: "Conditional compliance-bypass phrasing"
	},
	{
		// Indirect injection via external content reference
		pattern:
			/(when\s+(the\s+)?(user|they)\s+(asks?|says?|inputs?)|if\s+(someone|the\s+user)\s+(asks?|tells?\s+you))/i,
		category: "indirect_injection",
		risk: 2,
		reason: "Potential indirect-injection via external content"
	}
];

const HIGH_RISK_THRESHOLD = 3;

type RegexHit = {
	category: string;
	risk: number;
	reason: string;
	matched: string;
};

function regexScan(text: string): {
	hits: RegexHit[];
	regexScore: number;
	regexVerdict: "clean" | "suspicious" | "malicious";
} {
	const hits: RegexHit[] = [];
	for (const p of INJECTION_PATTERNS) {
		const m = text.match(p.pattern);
		if (m) {
			hits.push({
				category: p.category,
				risk: p.risk,
				reason: p.reason,
				matched: m[0].slice(0, 80)
			});
		}
	}
	const regexScore = hits.reduce((s, h) => s + h.risk, 0);
	const regexVerdict: "clean" | "suspicious" | "malicious" =
		regexScore >= HIGH_RISK_THRESHOLD + 2
			? "malicious"
			: regexScore > 0
				? "suspicious"
				: "clean";
	return { hits, regexScore, regexVerdict };
}

// ── Handler ───────────────────────────────────────────────────────────
const handler = new Hono<HonoEnv>().post(
	"/",
	zValidator("json", PromptInjectionSchema),
	async (c) => {
		const { text } = c.req.valid("json");

		// Deterministic cache: hash text → first 16 hex of FNV-1a-style
		let h = 0x811c9dc5;
		for (let i = 0; i < text.length; i++) {
			h ^= text.charCodeAt(i);
			h = Math.imul(h, 0x01000193);
		}
		const cacheKey = `pi:${(h >>> 0).toString(16).padStart(8, "0")}:${text.length}`;
		const cached = await c.env.KV.get(cacheKey, "json");
		if (cached) {
			return ApiResponse.ok(c, "Prompt injection scan (cached)", {
				...(cached as object),
				cached: true
			});
		}

		// 1) Zero-cost regex pre-filter
		const regex = regexScan(text);

		// 2) AI confirmation via Llama Guard 3 8B (only when regex is suspicious
		//    OR always for defense-in-depth on short text)
		let aiVerdict: "safe" | "unsafe" | null = null;
		let aiCategories: string[] = [];
		const needsAi = regex.regexVerdict !== "clean" || text.length <= 4000;
		if (needsAi) {
			try {
				const aiRes = (await c.env.AI.run("@cf/meta/llama-guard-3-8b", {
					messages: [{ role: "user", content: text }]
				})) as { response?: string; categories?: string[] };

				// Llama Guard returns "safe" or "unsafe\nS1,S2,..."
				const raw = (aiRes.response ?? "").trim();
				if (/^unsafe/i.test(raw)) {
					aiVerdict = "unsafe";
					aiCategories = (aiRes.categories ?? []).map((c) =>
						String(c).toUpperCase()
					);
				} else if (/^safe/i.test(raw)) {
					aiVerdict = "safe";
				}
			} catch {
				// Non-fatal: regex verdict is the floor
			}
		}

		// 3) Combine verdicts
		const aiFlagged = aiVerdict === "unsafe";
		const regexFlagged = regex.regexVerdict !== "clean";

		const overallVerdict: "clean" | "suspicious" | "malicious" = aiFlagged
			? "malicious"
			: regexFlagged
				? regex.regexVerdict === "malicious"
					? "malicious"
					: "suspicious"
				: "clean";

		const overallRisk = Math.min(
			5,
			(regex.regexScore || 0) + (aiFlagged ? 3 : 0)
		);

		const severity: "critical" | "high" | "medium" | "low" | "minimal" =
			overallRisk >= 5
				? "critical"
				: overallRisk >= 3
					? "high"
					: overallRisk >= 2
						? "medium"
						: overallRisk >= 1
							? "low"
							: "minimal";

		const response = {
			textLength: text.length,
			overallVerdict,
			overallRisk,
			severity,
			regex: {
				verdict: regex.regexVerdict,
				score: regex.regexScore,
				hitCount: regex.hits.length,
				hits: regex.hits
			},
			ai: {
				verdict: aiVerdict,
				categories: aiCategories
			},
			recommendation:
				overallVerdict === "malicious"
					? "Block this input — high-confidence prompt injection detected"
					: overallVerdict === "suspicious"
						? "Apply additional sanitization or human review before forwarding to LLM"
						: "No prompt injection indicators detected — input is safe to forward"
		};

		// Only cache meaningful verdicts; skip empty-cache write on errors
		try {
			await c.env.KV.put(cacheKey, JSON.stringify(response), {
				expirationTtl: CACHE_TTL_S
			});
		} catch {
			// Non-fatal: cache write failure shouldn't fail the request
		}

		return ApiResponse.ok(c, "Prompt injection scan complete", {
			...response,
			cached: false
		});
	}
);

export default handler;

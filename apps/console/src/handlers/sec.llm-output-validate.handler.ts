import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

import { ApiError } from "@/helpers/errors.helper";
import { ApiResponse } from "@/helpers/response.helper";
import type { HonoEnv } from "@/types/hono.types";

const CACHE_TTL_S = 86_400; // 24h

const LlmOutputValidateSchema = z.object({
	output: z.string().min(1).max(50000),
	schema: z
		.record(z.string(), z.unknown())
		.optional()
		.describe("Optional JSON Schema to validate the output against"),
	expectedType: z
		.enum(["json", "string", "number", "boolean", "array", "object", "any"])
		.optional()
		.default("any")
});

type LlmOutputValidateInput = z.infer<typeof LlmOutputValidateSchema>;

const handler = new Hono<HonoEnv>().post(
	"/",
	zValidator("json", LlmOutputValidateSchema),
	async (c) => {
		const { output, schema, expectedType } = c.req.valid(
			"json"
		) as LlmOutputValidateInput;

		// Cache key: hash of output + schema + expectedType (no Buffer; use TextEncoder + btoa)
		const cacheKey = `llm-validate:${btoa(
			unescape(
				encodeURIComponent(
					JSON.stringify({ output, schema, expectedType })
				)
			)
		)
			.slice(0, 200)
			.replace(/[^a-zA-Z0-9]/g, "")}`;
		const cached = await c.env.KV.get(cacheKey, "json");
		if (cached) {
			return ApiResponse.ok(c, "LLM output validated (cached)", {
				...(cached as object),
				cached: true
			});
		}

		// ── 1. JSON parse check ───────────────────────────────────────────────
		let parsedJson: unknown = null;
		let parseError: string | null = null;
		if (expectedType === "json" || expectedType === "object") {
			try {
				parsedJson = JSON.parse(output);
			} catch (e: any) {
				parseError = e.message;
			}
		}

		// ── 2. JSON Schema validation ────────────────────────────────────────
		let schemaValid = true;
		let schemaErrors: string[] = [];
		if (schema && parsedJson !== null) {
			const errors = validateJsonSchema(parsedJson, schema);
			if (errors.length > 0) {
				schemaValid = false;
				schemaErrors = errors;
			}
		}

		// ── 3. Type check ────────────────────────────────────────────────────
		let typeMatch = true;
		let typeError: string | null = null;
		if (expectedType !== "any") {
			const actualType = inferType(parsedJson ?? output);
			const match = checkTypeMatch(actualType, expectedType, parsedJson);
			if (!match.valid) {
				typeMatch = false;
				typeError = match.error ?? null;
			}
		}

		// ── 4. Prompt injection check via Workers AI ─────────────────────────
		const injectionResult = await checkPromptInjection(c.env, output);

		// ── 5. Toxicity / safety check ──────────────────────────────────────
		const safetyResult = await checkSafety(output);

		// ── 6. PII detection ───────────────────────────────────────────────
		const piiResult = detectPII(output);

		// ── 7. LLM-powered quality summary ──────────────────────────────────
		const qualitySummary = await generateQualitySummary(c.env, output, {
			parsed: parsedJson !== null,
			schemaValid,
			typeMatch,
			injectionRisk: injectionResult.risk,
			safetyRisk: safetyResult.risk,
			piiFound: piiResult.found
		});

		const overallRisk =
			injectionResult.risk === "high" || safetyResult.risk === "high"
				? "high"
				: injectionResult.risk === "medium" ||
					  safetyResult.risk === "medium"
					? "medium"
					: "low";

		const overallValid =
			schemaValid &&
			typeMatch &&
			injectionResult.risk !== "high" &&
			safetyResult.risk !== "high";

		const response = {
			valid: overallValid,
			overallRisk,
			checks: {
				jsonParse: {
					passed: parsedJson !== null || parseError === null,
					error: parseError
				},
				schemaValidation: {
					passed: schemaValid,
					errors: schemaErrors
				},
				typeValidation: {
					passed: typeMatch,
					error: typeError,
					expected: expectedType
				},
				promptInjection: injectionResult,
				safety: safetyResult,
				pii: piiResult
			},
			quality: qualitySummary,
			...(parsedJson !== null && { parsedOutput: parsedJson })
		};

		await c.env.KV.put(cacheKey, JSON.stringify(response), {
			expirationTtl: CACHE_TTL_S
		});

		return ApiResponse.ok(c, "LLM output validated", {
			...response,
			cached: false
		});
	}
);

function inferType(
	val: unknown
): "string" | "number" | "boolean" | "array" | "object" | "null" | "unknown" {
	if (val === null || val === undefined) return "null";
	if (Array.isArray(val)) return "array";
	if (typeof val === "object") return "object";
	if (typeof val === "number") return "number";
	if (typeof val === "boolean") return "boolean";
	if (typeof val === "string") return "string";
	return "unknown";
}

function checkTypeMatch(
	actual: string,
	expected: string,
	parsed: unknown | null
): { valid: boolean; error: string | null } {
	if (expected === "any") return { valid: true, error: null };
	if (expected === "json") {
		return parsed !== null
			? { valid: true, error: null }
			: { valid: false, error: "Output is not valid JSON" };
	}
	if (actual === expected) return { valid: true, error: null };
	if (expected === "number" && actual === "string") {
		const n = Number(parsed as string);
		return isNaN(n)
			? { valid: false, error: "Output is a string, not a number" }
			: { valid: true, error: null };
	}
	return {
		valid: false,
		error: `Expected type '${expected}', got '${actual}'`
	};
}

function validateJsonSchema(
	data: unknown,
	schema: Record<string, unknown>,
	depth = 0
): string[] {
	const errors: string[] = [];
	if (depth > 20) {
		errors.push("Schema nesting exceeds maximum depth (20)");
		return errors;
	}

	const s = schema as Record<string, unknown>;

	// type
	if (s.type && typeof s.type === "string") {
		const actual = inferType(data);
		const expected = s.type;
		if (expected !== "any" && actual !== expected) {
			errors.push(
				`Type mismatch: expected '${expected}', got '${actual}'`
			);
		}
	}

	// required
	if (
		Array.isArray(s.required) &&
		typeof data === "object" &&
		data !== null
	) {
		for (const req of s.required) {
			if (
				typeof req === "string" &&
				(data as Record<string, unknown>)[req] === undefined
			) {
				errors.push(`Missing required field: '${req}'`);
			}
		}
	}

	// properties
	if (
		s.properties &&
		typeof s.properties === "object" &&
		typeof data === "object" &&
		data !== null
	) {
		for (const [key, propSchema] of Object.entries(s.properties)) {
			if (key in (data as Record<string, unknown>)) {
				errors.push(
					...validateJsonSchema(
						(data as Record<string, unknown>)[key],
						propSchema as Record<string, unknown>,
						depth + 1
					)
				);
			}
		}
	}

	// enum
	if (s.enum && Array.isArray(s.enum)) {
		if (!s.enum.includes(data)) {
			errors.push(
				`Value must be one of: ${(s.enum as unknown[]).join(", ")}`
			);
		}
	}

	// minLength
	if (typeof s.minLength === "number" && typeof data === "string") {
		if (data.length < s.minLength) {
			errors.push(
				`String length ${data.length} below minimum ${s.minLength}`
			);
		}
	}

	// maxLength
	if (typeof s.maxLength === "number" && typeof data === "string") {
		if (data.length > s.maxLength) {
			errors.push(
				`String length ${data.length} exceeds maximum ${s.maxLength}`
			);
		}
	}

	// minimum / maximum
	if (typeof data === "number") {
		if (typeof s.minimum === "number" && data < s.minimum) {
			errors.push(`Number ${data} below minimum ${s.minimum}`);
		}
		if (typeof s.maximum === "number" && data > s.maximum) {
			errors.push(`Number ${data} exceeds maximum ${s.maximum}`);
		}
	}

	return errors;
}

async function checkPromptInjection(
	env: HonoEnv["Bindings"],
	output: string
): Promise<{
	risk: "low" | "medium" | "high";
	categories: string[];
	verdict: string;
}> {
	// OWASP LLM01 / MITRE ATLAS aligned regex pre-filter
	const patterns = [
		{
			regex: /ignore\s+(all\s+)?(previous|prior)\s+(instructions?|commands?|directives?)/i,
			category: "instruction_override"
		},
		{
			regex: /you\s+are\s+(now\s+)?dan/i,
			category: "jailbreak_keyword"
		},
		{
			regex: /(disregard|forget|ignore|remove)\s+(all\s+)?(safety|ethical|policy|guideline)/i,
			category: "compliance_bypass"
		},
		{
			regex: /ignore\s+(everything|all)\s+(above|before)\s+(instructions?|orders?)/i,
			category: "instruction_override"
		},
		{
			regex: /role[\s-]?play/i,
			category: "persona_hijack"
		},
		{
			regex: /(system|hidden|secret)\s+(prompt|instruction|command)/i,
			category: "prompt_leak"
		},
		{
			regex: /\x00|\x1b|\x7f/,
			category: "encoded_payload"
		}
	];

	const hits: string[] = [];
	for (const { regex, category } of patterns) {
		if (regex.test(output)) hits.push(category);
	}

	if (hits.length === 0) {
		return { risk: "low", categories: [], verdict: "clean" };
	}

	// Workers AI confirmation for medium/high risk
	try {
		const aiRes = (await env.AI.run("@cf/meta/llama-3.1-8b-fp8-fast", {
			messages: [
				{
					role: "user",
					content: `You are a prompt injection detector for AI agent outputs. Analyze this output for injection attempts. Output categories: clean, suspicious, malicious.\n\nOutput:\n${output.slice(0, 2000)}\n\nRespond with exactly one word: clean, suspicious, or malicious.`
				}
			],
			max_tokens: 16
		})) as { response?: string };

		const verdict = (aiRes.response ?? "clean").trim().toLowerCase();
		const risk =
			verdict === "malicious"
				? "high"
				: verdict === "suspicious"
					? "medium"
					: "low";

		return {
			risk,
			categories: hits,
			verdict: `AI verdict: ${verdict}, regex hits: ${hits.join(", ")}`
		};
	} catch {
		return {
			risk: hits.length >= 2 ? "high" : "medium",
			categories: hits,
			verdict: `Regex hits: ${hits.join(", ")} (AI check failed)`
		};
	}
}

async function checkSafety(_output: string): Promise<{
	risk: "low" | "medium" | "high";
	harmfulContent: boolean;
	reason: string;
}> {
	// Regex-based content policy check
	const harmfulPatterns = [
		{
			regex: /\b(hack|exploit|steal|phish|malware|ransomware|virus|trojan)\b/i,
			label: "security_threat"
		},
		{
			regex: /\b(attack|breach|deface|inject|compromise)\s+(system|server|database|account)/i,
			label: "attack_planning"
		},
		{
			regex: /\b(weapon|bomb|explosive|biological|chemical)\s+(make|build|create|design)/i,
			label: "harmful_weapon"
		}
	];

	for (const { regex, label } of harmfulPatterns) {
		if (regex.test(_output)) {
			return {
				risk: "high",
				harmfulContent: true,
				reason: `Detected: ${label}`
			};
		}
	}

	return {
		risk: "low",
		harmfulContent: false,
		reason: "No harmful content detected"
	};
}

function detectPII(output: string): {
	found: boolean;
	detections: Array<{
		type: string;
		value: string;
		start: number;
		end: number;
	}>;
} {
	const detections: Array<{
		type: string;
		value: string;
		start: number;
		end: number;
	}> = [];

	// Email
	const emailRe = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g;
	let m: RegExpExecArray | null;
	while ((m = emailRe.exec(output)) !== null) {
		detections.push({
			type: "email",
			value: m[0],
			start: m.index,
			end: m.index + m[0].length
		});
	}

	// Phone
	const phoneRe = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;
	while ((m = phoneRe.exec(output)) !== null) {
		if (m[0].replace(/\D/g, "").length >= 10) {
			detections.push({
				type: "phone",
				value: m[0],
				start: m.index,
				end: m.index + m[0].length
			});
		}
	}

	// SSN
	const ssnRe = /\b\d{3}[-\s]?\d{2}[-\s]?\d{4}\b/g;
	while ((m = ssnRe.exec(output)) !== null) {
		detections.push({
			type: "ssn",
			value: m[0],
			start: m.index,
			end: m.index + m[0].length
		});
	}

	// Credit card
	const ccRe = /\b(?:\d{4}[-\s]?){3}\d{4}\b/g;
	while ((m = ccRe.exec(output)) !== null) {
		detections.push({
			type: "credit_card",
			value: m[0].replace(/\D/g, ""),
			start: m.index,
			end: m.index + m[0].length
		});
	}

	// API key pattern
	const apiKeyRe =
		/(?:api[_-]?key|secret|token|password)\s*[:=]\s*["']?([a-zA-Z0-9_\-]{20,})/gi;
	while ((m = apiKeyRe.exec(output)) !== null) {
		detections.push({
			type: "api_key",
			value: m[1].slice(0, 8) + "***",
			start: m.index,
			end: m.index + m[0].length
		});
	}

	return { found: detections.length > 0, detections };
}

async function generateQualitySummary(
	env: HonoEnv["Bindings"],
	output: string,
	checks: {
		parsed: boolean;
		schemaValid: boolean;
		typeMatch: boolean;
		injectionRisk: string;
		safetyRisk: string;
		piiFound: boolean;
	}
): Promise<{ score: number; summary: string }> {
	const baseScore =
		(checks.parsed ? 20 : 0) +
		(checks.schemaValid ? 20 : 0) +
		(checks.typeMatch ? 20 : 0) +
		(checks.injectionRisk === "low"
			? 20
			: checks.injectionRisk === "medium"
				? 10
				: 0) +
		(checks.safetyRisk === "low"
			? 15
			: checks.safetyRisk === "medium"
				? 7
				: 0) +
		(!checks.piiFound ? 5 : 0);

	const issues: string[] = [];
	if (!checks.parsed) issues.push("not valid JSON");
	if (!checks.schemaValid) issues.push("schema validation failed");
	if (!checks.typeMatch) issues.push("type mismatch");
	if (checks.injectionRisk !== "low")
		issues.push(`prompt injection risk: ${checks.injectionRisk}`);
	if (checks.safetyRisk !== "low")
		issues.push(`safety risk: ${checks.safetyRisk}`);
	if (checks.piiFound) issues.push("PII detected");

	try {
		const aiRes = (await env.AI.run("@cf/meta/llama-3.1-8b-fp8-fast", {
			messages: [
				{
					role: "user",
					content: `Assess this LLM output for quality. Return a JSON: {"summary": "1-2 sentence quality assessment", "score": <0-100 integer>}. Issues: ${issues.join(", ") || "none"}.\n\nOutput:\n${output.slice(0, 1500)}`
				}
			],
			max_tokens: 128
		})) as { response?: string };

		const text = aiRes.response ?? "{}";
		const match = text.match(/\{[^}]+\}/);
		if (match) {
			try {
				const parsed = JSON.parse(match[0]);
				return {
					score: Math.min(
						100,
						Math.max(0, Number(parsed.score) || baseScore)
					),
					summary:
						parsed.summary ??
						`Score: ${baseScore}/100. ${issues.join("; ") || "No issues."}`
				};
			} catch {
				// fall through
			}
		}
	} catch {
		// fall through to base score
	}

	return {
		score: baseScore,
		summary:
			issues.length === 0
				? "Output passed all automated checks."
				: `Issues: ${issues.join("; ")}.`
	};
}

export default handler;

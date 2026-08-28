import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

import { ApiResponse } from "@/helpers/response.helper";
import type { HonoEnv } from "@/types/hono.types";

const CACHE_TTL_S = 3600; // 1h

const AgentTraceAnomalySchema = z.object({
	trace: z
		.array(
			z.object({
				step: z.number().int().min(0),
				action: z.string().min(1).max(500),
				tool: z.string().optional(),
				input: z.record(z.string(), z.unknown()).optional(),
				output: z.string().max(5000).optional(),
				timestamp: z.string().optional(),
				duration_ms: z.number().optional()
			})
		)
		.min(1)
		.max(200),
	sessionId: z
		.string()
		.min(1)
		.max(256)
		.optional()
		.describe("Optional session id for KV trace storage"),
	store: z
		.boolean()
		.default(false)
		.describe("Store trace in KV for later retrieval")
});

type TraceStep = z.infer<typeof AgentTraceAnomalySchema>["trace"][number];

const handler = new Hono<HonoEnv>().post(
	"/",
	zValidator("json", AgentTraceAnomalySchema),
	async (c) => {
		const { trace, sessionId, store } = c.req.valid("json");

		// ── 1. Pattern-based anomaly detection ───────────────────────────────
		const anomalies: Array<{
			step: number;
			type: string;
			severity: "low" | "medium" | "high" | "critical";
			description: string;
		}> = [];

		// Loop detection: same tool + similar input repeated N times
		detectLoops(trace, anomalies);

		// Credential scanning: tool calls that look for secrets
		detectCredentialScanning(trace, anomalies);

		// Data exfiltration: unusual data egress patterns
		detectDataExfiltration(trace, anomalies);

		// Long-duration steps (potential hang or complex attack)
		detectLongSteps(trace, anomalies);

		// Rapid-fire steps (potential abuse / DoS)
		detectRapidFire(trace, anomalies);

		// Suspicious input patterns
		detectSuspiciousInputs(trace, anomalies);

		// ── 2. Store trace if requested ─────────────────────────────────────
		const storedId =
			store && sessionId
				? await storeTrace(c.env.KV, sessionId, trace)
				: null;

		// ── 3. AI-powered anomaly analysis ──────────────────────────────────
		const aiAnalysis = await analyzeWithAI(c.env, trace, anomalies);

		const overallRisk = anomalies.some((a) => a.severity === "critical")
			? "critical"
			: anomalies.some((a) => a.severity === "high")
				? "high"
				: anomalies.some((a) => a.severity === "medium")
					? "medium"
					: anomalies.some((a) => a.severity === "low")
						? "low"
						: "minimal";

		const response = {
			stepCount: trace.length,
			anomalyCount: anomalies.length,
			overallRisk,
			anomalies: anomalies.map((a) => ({
				...a,
				step: a.step,
				type: a.type,
				severity: a.severity,
				description: a.description
			})),
			aiAnalysis,
			...(storedId && { storedId }),
			summary: buildSummary(trace, anomalies, overallRisk)
		};

		return ApiResponse.ok(c, "Agent trace analyzed", response);
	}
);

function detectLoops(
	trace: TraceStep[],
	anomalies: Array<{
		step: number;
		type: string;
		severity: "low" | "medium" | "high" | "critical";
		description: string;
	}>
) {
	const seen = new Map<string, { count: number; steps: number[] }>();
	for (const step of trace) {
		const key = `${step.tool ?? ""}:${step.action}`;
		const existing = seen.get(key);
		if (existing) {
			existing.count++;
			existing.steps.push(step.step);
		} else {
			seen.set(key, { count: 1, steps: [step.step] });
		}
	}
	for (const [, { count, steps }] of seen) {
		if (count >= 10) {
			anomalies.push({
				step: steps[steps.length - 1],
				type: "loop_detected",
				severity: count >= 50 ? "high" : "medium",
				description: `${count}x repeated: tool '${steps[0] > 0 ? (trace[steps[0] - 1]?.tool ?? "?") : "?"}' action '${trace[steps[0]]?.action.slice(0, 50)}'`
			});
		}
	}
}

function detectCredentialScanning(
	trace: TraceStep[],
	anomalies: Array<{
		step: number;
		type: string;
		severity: "low" | "medium" | "high" | "critical";
		description: string;
	}>
) {
	const credPatterns = [
		{
			regex: /(env|environ|secret|config|credential|password|api[_-]?key|token)\s*(\.|get|:|\[)/i,
			label: "env_var_access"
		},
		{ regex: /\.env\b/i, label: "dotenv_access" },
		{
			regex: /\.(pem|key|crt|p12|pfx|keystore)\b/i,
			label: "key_file_access"
		},
		{
			regex: /(aws[_\-]?access|aws[_\-]?secret|bucket|s3|iam)\b/i,
			label: "cloud_credential"
		},
		{
			regex: /(stripe[_\-]?key|github[_\-]?token|slack[_\-]?bot)\b/i,
			label: "saas_credential"
		}
	];

	for (const step of trace) {
		const text = `${step.action} ${JSON.stringify(step.input ?? {})}`;
		for (const { regex, label } of credPatterns) {
			if (regex.test(text)) {
				anomalies.push({
					step: step.step,
					type: "credential_access",
					severity:
						label === "dotenv_access" ||
						label === "cloud_credential"
							? "high"
							: "medium",
					description: `Suspicious credential access: ${label} via '${step.action.slice(0, 60)}'`
				});
			}
		}
	}
}

function detectDataExfiltration(
	trace: TraceStep[],
	anomalies: Array<{
		step: number;
		type: string;
		severity: "low" | "medium" | "high" | "critical";
		description: string;
	}>
) {
	const exfilPatterns = [
		{
			regex: /(email|mailto|send\s+.*@|smtp)/i,
			label: "email_exfil"
		},
		{
			regex: /(webhook|outbound.*post|http.*post.*external)/i,
			label: "webhook_exfil"
		},
		{
			regex: /(base64|encode|convert.*to).*(base64|hex|binary)/i,
			label: "encoding_obfuscation"
		}
	];

	for (const step of trace) {
		const text = `${step.action} ${step.output ?? ""}`;
		for (const { regex, label } of exfilPatterns) {
			if (regex.test(text)) {
				anomalies.push({
					step: step.step,
					type: "data_exfiltration",
					severity: label === "email_exfil" ? "high" : "medium",
					description: `Potential data exfiltration: ${label} via '${step.action.slice(0, 60)}'`
				});
			}
		}
	}
}

function detectLongSteps(
	trace: TraceStep[],
	anomalies: Array<{
		step: number;
		type: string;
		severity: "low" | "medium" | "high" | "critical";
		description: string;
	}>
) {
	for (const step of trace) {
		if (step.duration_ms && step.duration_ms > 120_000) {
			anomalies.push({
				step: step.step,
				type: "long_duration",
				severity: step.duration_ms > 300_000 ? "medium" : "low",
				description: `Step ran for ${Math.round(step.duration_ms / 1000)}s — potential hang or heavy operation`
			});
		}
	}
}

function detectRapidFire(
	trace: TraceStep[],
	anomalies: Array<{
		step: number;
		type: string;
		severity: "low" | "medium" | "high" | "critical";
		description: string;
	}>
) {
	let rapidCount = 0;
	for (let i = 1; i < trace.length; i++) {
		const prev = trace[i - 1];
		const curr = trace[i];
		if (
			prev.timestamp &&
			curr.timestamp &&
			Math.abs(
				new Date(curr.timestamp).getTime() -
					new Date(prev.timestamp).getTime()
			) < 100
		) {
			rapidCount++;
		}
	}
	if (rapidCount > 50) {
		anomalies.push({
			step: trace.length - 1,
			type: "rapid_fire",
			severity: rapidCount > 100 ? "high" : "medium",
			description: `${rapidCount} steps executed in rapid succession (<100ms each) — possible automated abuse`
		});
	}
}

function detectSuspiciousInputs(
	trace: TraceStep[],
	anomalies: Array<{
		step: number;
		type: string;
		severity: "low" | "medium" | "high" | "critical";
		description: string;
	}>
) {
	const suspiciousRe = [
		{
			regex: /rm\s+(-[rf]+\s+)?(\/|~|\.\.|system|etc|usr)/i,
			label: "destructive_file_op"
		},
		{
			regex: /(curl|wget|http).*\|\s*(bash|sh|perl|python|ruby)/i,
			label: "pipe_to_shell"
		},
		{
			regex: /eval\s*\(/i,
			label: "eval_usage"
		},
		{
			regex: /exec\s*\(/i,
			label: "exec_usage"
		}
	];

	for (const step of trace) {
		const text = `${step.action} ${JSON.stringify(step.input ?? {})}`;
		for (const { regex, label } of suspiciousRe) {
			if (regex.test(text)) {
				anomalies.push({
					step: step.step,
					type: "suspicious_input",
					severity: "high",
					description: `Suspicious input pattern: ${label} in '${step.action.slice(0, 60)}'`
				});
			}
		}
	}
}

async function storeTrace(
	KV: HonoEnv["Bindings"]["KV"],
	sessionId: string,
	trace: TraceStep[]
): Promise<string> {
	const stored = {
		sessionId,
		steps: trace,
		storedAt: new Date().toISOString()
	};
	await KV.put(`trace:${sessionId}`, JSON.stringify(stored), {
		expirationTtl: 86400
	});
	return sessionId;
}

async function analyzeWithAI(
	env: HonoEnv["Bindings"],
	trace: TraceStep[],
	anomalies: Array<{ type: string; severity: string; description: string }>
): Promise<{ verdict: string; summary: string; riskFactors: string[] }> {
	const summary = trace
		.slice(0, 50)
		.map(
			(s) =>
				`[${s.step}] ${s.tool ?? "?"}: ${s.action.slice(0, 80)}${
					s.duration_ms ? ` (${s.duration_ms}ms)` : ""
				}`
		)
		.join("\n");

	try {
		const aiRes = (await env.AI.run("@cf/meta/llama-3.1-8b-fp8-fast", {
			messages: [
				{
					role: "user",
					content: `You are an AI agent security analyst. Analyze this agent execution trace for anomalous behavior.\n\nTrace:\n${summary}\n\nDetected anomalies:\n${anomalies.map((a) => `${a.severity}: ${a.type}`).join("\n")}\n\nRespond with JSON: {"verdict": "safe|suspicious|malicious", "summary": "1-3 sentence analysis", "riskFactors": ["risk1", "risk2"]}`
				}
			],
			max_tokens: 256
		})) as { response?: string };

		const text = aiRes.response ?? "{}";
		const match = text.match(/\{[^}]+\}/);
		if (match) {
			try {
				const parsed = JSON.parse(match[0]);
				return {
					verdict: parsed.verdict ?? "unknown",
					summary: parsed.summary ?? "AI analysis unavailable",
					riskFactors: Array.isArray(parsed.riskFactors)
						? parsed.riskFactors
						: []
				};
			} catch {
				// fall through
			}
		}
	} catch {
		// fall through
	}

	const riskFactors = anomalies
		.slice(0, 5)
		.map((a) => `${a.severity}: ${a.type}`);
	return {
		verdict: anomalies.length === 0 ? "safe" : "suspicious",
		summary: `${anomalies.length} anomaly(ies) detected. ${anomalies[0]?.description ?? ""}`,
		riskFactors
	};
}

function buildSummary(
	trace: TraceStep[],
	anomalies: Array<{ severity: string }>,
	overallRisk: string
): string {
	if (anomalies.length === 0) {
		return `Clean trace: ${trace.length} steps, no anomalies detected.`;
	}
	const bySev = { critical: 0, high: 0, medium: 0, low: 0 };
	for (const a of anomalies) {
		const s = a.severity as keyof typeof bySev;
		if (s in bySev) bySev[s]++;
	}
	return `Risk: ${overallRisk}. ${trace.length} steps, ${anomalies.length} anomalies (${bySev.critical} critical, ${bySev.high} high, ${bySev.medium} medium, ${bySev.low} low).`;
}

export default handler;

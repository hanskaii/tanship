import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

import { ApiResponse } from "@/helpers/response.helper";
import type { HonoEnv } from "@/types/hono.types";

const CACHE_TTL_S = 86_400; // 24h

const McpToolRiskScorerSchema = z.object({
	tools: z
		.array(
			z.object({
				name: z.string(),
				description: z.string().optional(),
				inputSchema: z.record(z.string(), z.unknown()).optional(),
				dangerous: z.boolean().optional(),
				annotations: z.record(z.string(), z.unknown()).optional()
			})
		)
		.min(1)
		.max(500)
});

type Tool = z.infer<typeof McpToolRiskScorerSchema>["tools"][number];

const handler = new Hono<HonoEnv>().post(
	"/",
	zValidator("json", McpToolRiskScorerSchema),
	async (c) => {
		const { tools } = c.req.valid("json");

		// Deterministic cache key from tool names (order-insensitive)
		const cacheKey = `mcp-risk:${tools
			.map((t) => t.name)
			.sort()
			.join(",")}`;
		const cached = await c.env.KV.get(cacheKey, "json");
		if (cached) {
			return ApiResponse.ok(c, "MCP tool risk scored (cached)", {
				...(cached as object),
				cached: true
			});
		}

		const results = tools.map(scoreTool);

		// Workers AI summary for high-risk tools (risk >= 3)
		const highRiskTools = results.filter((r) => r.risk >= 3);
		let aiSummary: string | null = null;
		if (highRiskTools.length > 0) {
			const prompt = `You are a security analyst reviewing an MCP (Model Context Protocol) tool manifest for agentic AI systems.

Analyze these high-risk MCP tools and provide a brief security posture assessment:
${highRiskTools.map((t) => `- ${t.tool}: ${t.reasons.join("; ")} (risk score ${t.risk}/5)`).join("\n")}

Provide a 1-2 sentence security recommendation for agentic deployments.`;

			try {
				const aiRes = await c.env.AI.run(
					"@cf/meta/llama-3.1-8b-fp8-fast",
					{
						messages: [{ role: "user", content: prompt }],
						max_tokens: 256
					}
				);
				const aiText = (aiRes as { response?: string })?.response;
				if (aiText) aiSummary = aiText.trim();
			} catch {
				// Non-fatal: AI summary is best-effort enrichment
			}
		}

		const response = {
			toolCount: tools.length,
			highRiskCount: highRiskTools.length,
			overallRisk: Math.max(...results.map((r) => r.risk), 0),
			results,
			...(aiSummary ? { aiSecuritySummary: aiSummary } : {})
		};

		await c.env.KV.put(cacheKey, JSON.stringify(response), {
			expirationTtl: CACHE_TTL_S
		});

		return ApiResponse.ok(c, "MCP tool risk scored", {
			...response,
			cached: false
		});
	}
);

function scoreTool(tool: Tool): {
	tool: string;
	risk: number;
	severity: "critical" | "high" | "medium" | "low" | "minimal";
	categories: string[];
	reasons: string[];
	recommendations: string[];
} {
	const categories: string[] = [];
	const reasons: string[] = [];
	const recommendations: string[] = [];
	let risk = 0;

	// ── Dangerous permission flags ───────────────────────────────────────
	if (tool.dangerous === true) {
		categories.push("dangerous_permission");
		risk += 3;
		reasons.push("Tool marked as dangerous by MCP provider");
		recommendations.push(
			"Require explicit user confirmation before invocation in agentic loops"
		);
	}

	// ── PII / sensitive data access patterns ────────────────────────────
	const piiPatterns = [
		{
			pattern:
				/credential|secret|api[_-]?key|password|token|auth|bearer/i,
			category: "secrets_access"
		},
		{
			pattern:
				/email|phone|ssn|social[_-]?security|passport|national[_-]?id/i,
			category: "pii_access"
		},
		{
			pattern:
				/bank|account[_-]?num|routing|credit[_-]?card|balance|transaction/i,
			category: "financial_access"
		},
		{
			pattern: /location|gps|address|ip[_-]?address|geo/i,
			category: "location_tracking"
		},
		{
			pattern: /health|medical|diagnosis|prescription|patient/i,
			category: "health_data"
		},
		{
			pattern:
				/file[_-]?system|filesystem|read[_-]?file|write[_-]?file|download|upload/i,
			category: "filesystem_access"
		},
		{
			pattern: /exec|shell|bash|system[_-]?command|subprocess/i,
			category: "code_execution"
		},
		{
			pattern: /database|sql[_-]?query|drop[_-]?table|delete[_-]?record/i,
			category: "database_mutation"
		},
		{
			pattern:
				/network[_-]?call|http|fetch|request|webhook|send[_-]?message/i,
			category: "network_egress"
		}
	];

	const desc = `${tool.description ?? ""} ${JSON.stringify(tool.inputSchema ?? {})}`;
	for (const { pattern, category } of piiPatterns) {
		if (pattern.test(desc)) {
			categories.push(category);
			if (category === "secrets_access") {
				risk += 2;
				reasons.push("Accesses secrets/credentials");
			} else if (category === "code_execution") {
				risk += 3;
				reasons.push("Shell/command execution capability");
			} else if (category === "database_mutation") {
				risk += 2;
				reasons.push("Database write/mutation capability");
			} else if (category === "financial_access") {
				risk += 2;
				reasons.push("Financial data access");
			} else if (category === "filesystem_access") {
				risk += 2;
				reasons.push("Filesystem read/write access");
			} else if (category === "network_egress") {
				risk += 1;
				reasons.push("Network egress capability");
			} else if (category === "pii_access") {
				risk += 1;
				reasons.push("PII data access");
			} else if (category === "health_data") {
				risk += 2;
				reasons.push("Protected health information access");
			} else if (category === "location_tracking") {
				risk += 1;
				reasons.push("Location tracking capability");
			}
		}
	}

	// ── Input schema size (overly broad schemas are risky) ────────────
	const schemaStr = JSON.stringify(tool.inputSchema ?? {});
	if (schemaStr.length > 5000) {
		categories.push("overly_broad_schema");
		risk += 1;
		reasons.push(
			"Input schema is unusually large (>5KB) — may accept unexpected parameters"
		);
		recommendations.push(
			"Restrict input schema to minimum required fields"
		);
	}

	// ── annotations (MCP official danger indicators) ───────────────────
	const annotStr = JSON.stringify(tool.annotations ?? {});
	if (/indeterminate|risky|destructive/i.test(annotStr)) {
		categories.push("annotation_warning");
		risk += 2;
		reasons.push(
			"Tool annotations indicate indeterminate or destructive behavior"
		);
		recommendations.push(
			"Review tool purpose and restrict to trusted contexts"
		);
	}

	// ── Tool name patterns ─────────────────────────────────────────────
	const dangerousNames = [
		/^admin|^root|^sudo|^delete|^drop|^truncate|^destroy|^kill|^stop|^shutdown/i,
		/eval|exec[ure]?|shell/i
	];
	for (const pattern of dangerousNames) {
		if (pattern.test(tool.name)) {
			categories.push("dangerous_naming");
			risk += 1;
			reasons.push(
				`Tool name suggests destructive capability (${pattern})`
			);
			break;
		}
	}

	// ── Rate limiting / throttling concerns ────────────────────────────
	if (/rate[_-]?limit|throttle|quota|budget/i.test(desc)) {
		categories.push("rate_limit_sensitivity");
		risk += 1;
		reasons.push(
			"Tool interacts with rate-limited external systems — may degrade agent performance"
		);
	}

	// ── Infinite loop / recursive tool-chain risk ──────────────────────
	if (/loop|recursive|iterate|foreach|map.*function|callback/i.test(desc)) {
		categories.push("loop_risk");
		risk += 1;
		reasons.push(
			"Tool description suggests iterative/recursive behavior — may cause infinite tool chains"
		);
		recommendations.push(
			"Set explicit max iterations in the agent loop configuration"
		);
	}

	// ── External dependency risk ───────────────────────────────────────
	const externalDomains = [
		{
			pattern:
				/https?:\/\/[^\s"']+\.(openai|anthropic|google|azure|aws)\./i,
			label: "major_cloud"
		},
		{
			pattern: /https?:\/\/[^\s"']+\.(stripe|paypal|braintree)\./i,
			label: "payment_processor"
		},
		{ pattern: /https?:\/\/[^\s"']+\.gov\b/i, label: "government_api" }
	];
	for (const { pattern, label } of externalDomains) {
		if (pattern.test(desc)) {
			categories.push(`${label}_dependency`);
			risk += 1;
			reasons.push(
				`External dependency on ${label.replace("_", " ")} API — availability risk`
			);
			break;
		}
	}

	// Clamp
	risk = Math.min(risk, 5);

	const severity =
		risk >= 5
			? "critical"
			: risk >= 3
				? "high"
				: risk >= 2
					? "medium"
					: risk >= 1
						? "low"
						: "minimal";

	return {
		tool: tool.name,
		risk,
		severity,
		categories,
		reasons: [...new Set(reasons)], // deduplicate
		recommendations: [...new Set(recommendations)]
	};
}

export default handler;

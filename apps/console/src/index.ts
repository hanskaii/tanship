import { LANDING_PAGE_HTML } from "./landing";
import { Hono } from "hono";
import { Sandbox } from "@cloudflare/sandbox";
import { cors } from "hono/cors";

import aiHandler from "./handlers/ai.handler";
import browserHandler from "./handlers/browser.handler";
import cryptoHandler from "./handlers/crypto.handler";
import securityHandler from "./handlers/security.handler";
import securityScreenHandler from "./handlers/security.screen.handler";
import secCveLookupHandler from "./handlers/sec.cve-lookup.handler";
import secMcpRiskScorerHandler from "./handlers/sec.mcp-tool-risk-scorer.handler";
import secPromptInjectionScanHandler from "./handlers/sec.prompt-injection-scan.handler";
import cloudEstimateHandler from "./handlers/cloud.estimate.handler";
import devHandler from "./handlers/dev.handler";
import modalHandler from "./handlers/modal.handler";
import redditHandler from "./handlers/reddit.handler";
import summarizeHandler from "./handlers/summarize.handler";
import weatherHandler from "./handlers/weather.handler";
import kvHandler from "./handlers/kv.handler";
import storageHandler from "./handlers/storage.handler";
import dbHandler from "./handlers/db.handler";
import queueHandler from "./handlers/queue.handler";
import kvQueueHandler from "./handlers/kv.queue.handler";
import schedulerHandler from "./handlers/scheduler.handler";
import durableHandler from "./handlers/durable.handler";
import coordinationHandler from "./handlers/coordination.handler";
import agentResearchHandler from "./handlers/agent.research.handler";
import agentInboxHandler from "./handlers/agent.inbox.handler";
import nlHandler from "./handlers/nl.handler";
import ragHandler from "./handlers/rag.handler";
import ragAnswerHandler from "./handlers/rag.answer.handler";
import { aiCachedHandler } from "./handlers/ai.rag.handler";
import aiBatchHandler from "./handlers/ai.batch.handler";
import { x402 } from "./middleware/x402.middleware";
import { SERVICES } from "./catalog";
import { OPENAPI_SPEC } from "./openapi";
import { hasAssetFor } from "./assets";
import { parseNetworks } from "./networks";
import { EnvSchema } from "./env";

import { STATUS_CODES, type StatusCode } from "./constants/status.constants";
import { ApiError } from "./helpers/errors.helper";
import { ApiResponse } from "./helpers/response.helper";
import type { HonoEnv } from "./types/hono.types";

interface LogEntry {
	id: string;
	timestamp: string;
	method: string;
	path: string;
	status: number;
	duration: number;
	txHash: string | null;
	payer: string | null;
	network: string | null;
	amount: string | null;
	requestBody: any;
	error: string | null;
}

const recentLogs: LogEntry[] = [];

function parsePaymentSignature(sigHeader: string | null) {
	if (!sigHeader) return null;
	try {
		const decoded = JSON.parse(atob(sigHeader));
		return {
			txHash: decoded.payload?.transaction || null,
			payer: decoded.payload?.payer || null,
			network: decoded.payload?.network || null,
			amount: decoded.payload?.amount || null
		};
	} catch {
		return null;
	}
}

// Reverse map: 400 → "BAD_REQUEST", 500 → "INTERNAL_SERVER_ERROR", etc.
const STATUS_NAME: Record<StatusCode, string> = Object.fromEntries(
	Object.entries(STATUS_CODES).map(([k, v]) => [v, k])
) as Record<StatusCode, string>;

// Validate env once per isolate lifetime
let envValidated = false;

const app = new Hono<HonoEnv>()
	.use(
		"*",
		cors({
			origin: (origin) => origin,
			allowHeaders: ["Content-Type", "X-PAYMENT"],
			exposeHeaders: ["X-PAYMENT-RESPONSE"],
			allowMethods: ["POST", "GET", "OPTIONS"]
		})
	)
	// Logging middleware for live transactions / runs
	.use("/v1/*", async (c, next) => {
		const path = c.req.path;
		const method = c.req.method;

		if (path === "/v1/logs" || path === "/v1/services") {
			return await next();
		}

		const id = crypto.randomUUID();
		const timestamp = new Date().toISOString();
		const sigHeader =
			c.req.header("payment-signature") ||
			c.req.header("PAYMENT-SIGNATURE");
		const payment = parsePaymentSignature(sigHeader || null);

		let requestBody: any = null;
		if (method === "POST") {
			try {
				const clone = c.req.raw.clone();
				requestBody = await clone.json();
			} catch {
				// Ignore
			}
		}

		const start = performance.now();
		let status = 200;
		let error: string | null = null;

		try {
			await next();
			status = c.res ? c.res.status : 200;
		} catch (err: any) {
			status = err.statusCode || 500;
			error = err.message || String(err);
			throw err;
		} finally {
			const duration = Math.round(performance.now() - start);
			recentLogs.unshift({
				id,
				timestamp,
				method,
				path,
				status,
				duration,
				txHash: payment?.txHash || null,
				payer: payment?.payer || null,
				network: payment?.network || null,
				amount: payment?.amount || null,
				requestBody,
				error
			});
			if (recentLogs.length > 50) {
				recentLogs.pop();
			}
		}
	})
	// Everything under /v1/* that appears in the catalog requires x402 payment
	.use("/v1/*", x402)
	.route("/v1/ai", aiHandler)
	.route("/v1/ai/chat/cached", aiCachedHandler)
	.route("/v1/ai/batch", aiBatchHandler)
	.route("/v1/browser", browserHandler)
	.route("/v1/crypto", cryptoHandler)
	.route("/v1/dev", devHandler)
	.route("/v1/security", securityHandler)
	.route("/v1/security/screen", securityScreenHandler)
	.route("/v1/security/cve-lookup", secCveLookupHandler)
	.route("/v1/security/mcp-tool-risk-scorer", secMcpRiskScorerHandler)
	.route("/v1/security/prompt-injection-scan", secPromptInjectionScanHandler)
	.route("/v1/cloud/estimate", cloudEstimateHandler)
	.route("/v1/modal", modalHandler)
	.route("/v1/reddit", redditHandler)
	.route("/v1/summarize", summarizeHandler)
	.route("/v1/weather", weatherHandler)
	.route("/v1/kv", kvHandler)
	.route("/v1/storage", storageHandler)
	.route("/v1/db", dbHandler)
	.route("/v1/queue", queueHandler)
	.route("/v1/kv/queue", kvQueueHandler)
	.route("/v1/scheduler", schedulerHandler)
	.route("/v1/durable", durableHandler)
	.route("/v1/coordination", coordinationHandler)
	.route("/v1/agent", agentResearchHandler)
	.route("/v1/agent/inbox", agentInboxHandler)
	.route("/v1/nl", nlHandler)
	.route("/v1/rag", ragHandler)
	.route("/v1/rag/answer", ragAnswerHandler)
	// Free discovery endpoints
	.get("/v1/logs", (c) => {
		return c.json({ success: true, logs: recentLogs });
	})
	.get("/", (c) => {
		const accept = c.req.header("Accept");
		if (accept && accept.includes("application/json")) {
			return ApiResponse.ok(c, "Tanflare Console — x402 API", {
				docs: "/v1/services",
				payment: "x402 (https://x402.org)"
			});
		}
		const html = LANDING_PAGE_HTML.replace(
			"{{PAY_TO_ADDRESS}}",
			c.env.PAY_TO_ADDRESS || ""
		)
			.replace("{{FACILITATOR_URL}}", c.env.FACILITATOR_URL || "")
			.replace("{{X402_NETWORKS}}", c.env.X402_NETWORKS || "");
		return c.html(html);
	})
	.get("/openapi.json", (c) => c.json(OPENAPI_SPEC))
	.get("/.well-known/x402", (c) =>
		c.json({ openapi: "https://x402.tanship.dev/openapi.json" })
	)
	.get("/v1/services", (c) => {
		const response = ApiResponse.ok(c, "Available paid services", {
			networks: parseNetworks(
				c.env.X402_NETWORKS,
				!!c.env.SVM_PAY_TO_ADDRESS
			).filter(hasAssetFor),
			facilitator: c.env.FACILITATOR_URL,
			services: SERVICES
		});

		// Add Bazaar discovery header for endpoint registration
		response.headers.set(
			"X-Extension-Bazaar-Info",
			JSON.stringify({
				inputSchema: SERVICES.reduce(
					(acc: Record<string, Record<string, string>>, service) => {
						acc[service.path] = service.input;
						return acc;
					},
					{}
				),
				outputSchema: SERVICES.reduce(
					(acc: Record<string, Record<string, unknown>>, service) => {
						acc[service.path] = {
							type: "object",
							properties: {
								success: { type: "boolean" },
								data: {}
							}
						};
						return acc;
					},
					{}
				),
				description:
					"Tanship marketplace of 99 pre-built AI infra endpoints",
				tags: ["AI", "workers", "kv", "vectorize", "batch-settlement"],
				iconUrl: "https://x402.tanship.dev/logo.svg"
			})
		);

		return response;
	});

app.notFound((c) => {
	// The path exists in the catalog but was called with the wrong verb —
	// answer 405 with the expected method instead of a misleading 404.
	const service = SERVICES.find((s) => s.path === c.req.path);
	if (service) {
		c.header("Allow", `${service.method}, OPTIONS`);
		return c.json(
			{
				success: false,
				message: `Method ${c.req.method} not allowed — use ${service.method} ${service.path}`,
				code: "METHOD_NOT_ALLOWED",
				errors: {
					method: service.method,
					price: service.price,
					input: service.input,
					example: service.example
				}
			},
			405
		);
	}

	return c.json(
		{
			success: false,
			message: "Route not found",
			code: "NOT_FOUND",
			errors: null
		},
		404
	);
});

app.onError((err, c) => {
	console.error(`${err}`);

	if (err instanceof ApiError) {
		return c.json(
			{
				success: false,
				message: err.message,
				code: STATUS_NAME[err.statusCode] ?? "INTERNAL_SERVER_ERROR",
				errors: err.errors ?? null
			},
			err.statusCode as any
		);
	}

	return c.json(
		{
			success: false,
			message: err.message || "Internal Server Error",
			code: "INTERNAL_SERVER_ERROR",
			errors: null
		},
		STATUS_CODES.INTERNAL_SERVER_ERROR
	);
});

export type AppType = typeof app;

export { Counter, RateLimiter, Lock } from "./durable-objects";
export { Scheduler } from "./durable-objects/scheduler";
export { Sandbox };

export default {
	fetch: async (
		request: Request,
		env: HonoEnv["Bindings"],
		ctx: ExecutionContext
	) => {
		if (!envValidated) {
			const result = EnvSchema.safeParse(env);
			if (!result.success) {
				const missing = result.error.issues
					.map((i) => `${i.path.join(".")}: ${i.message}`)
					.join(", ");
				console.error(`[ENV] Invalid environment: ${missing}`);
				return Response.json(
					{ error: "Server misconfiguration", details: missing },
					{ status: 500 }
				);
			}
			envValidated = true;
		}
		return app.fetch(request, env, ctx);
	}
} satisfies ExportedHandler<HonoEnv["Bindings"]>;

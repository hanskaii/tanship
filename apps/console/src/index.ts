import { LANDING_PAGE_HTML } from "./landing";
import { Hono } from "hono";
import { cors } from "hono/cors";

import aiHandler from "./handlers/ai.handler";
import browserHandler from "./handlers/browser.handler";
import modalHandler from "./handlers/modal.handler";
import redditHandler from "./handlers/reddit.handler";
import summarizeHandler from "./handlers/summarize.handler";
import kvHandler from "./handlers/kv.handler";
import storageHandler from "./handlers/storage.handler";
import dbHandler from "./handlers/db.handler";
import queueHandler from "./handlers/queue.handler";
import durableHandler from "./handlers/durable.handler";
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
	// Everything under /v1/* that appears in the catalog requires x402 payment
	.use("/v1/*", x402)
	.route("/v1/ai", aiHandler)
	.route("/v1/browser", browserHandler)
	.route("/v1/modal", modalHandler)
	.route("/v1/reddit", redditHandler)
	.route("/v1/summarize", summarizeHandler)
	.route("/v1/kv", kvHandler)
	.route("/v1/storage", storageHandler)
	.route("/v1/db", dbHandler)
	.route("/v1/queue", queueHandler)
	.route("/v1/durable", durableHandler)
	// Free discovery endpoints
	.get("/", (c) => {
		const accept = c.req.header("Accept");
		if (accept && accept.includes("application/json")) {
			return ApiResponse.ok(c, "Tanflare Console — x402 API", {
				docs: "/v1/services",
				payment: "x402 (https://x402.org)"
			});
		}
		return c.html(LANDING_PAGE_HTML);
	})
	.get("/openapi.json", (c) => c.json(OPENAPI_SPEC))
	.get("/.well-known/x402", (c) =>
		c.json({ openapi: "https://x402.tanship.dev/openapi.json" })
	)
	.get("/v1/services", (c) =>
		ApiResponse.ok(c, "Available paid services", {
			networks: parseNetworks(
				c.env.X402_NETWORKS,
				!!c.env.SVM_PAY_TO_ADDRESS
			).filter(hasAssetFor),
			facilitator: c.env.FACILITATOR_URL,
			services: SERVICES
		})
	);

app.notFound((c) =>
	c.json(
		{
			success: false,
			message: "Route not found",
			code: "NOT_FOUND",
			errors: null
		},
		404
	)
);

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

// Durable Object class exports (required by wrangler)
export { Counter, RateLimiter } from "./durable-objects";

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

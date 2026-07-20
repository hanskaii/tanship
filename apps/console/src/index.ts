import { Hono } from "hono";
import { cors } from "hono/cors";

import aiHandler from "./handlers/ai.handler";
import browserHandler from "./handlers/browser.handler";
import summarizeHandler from "./handlers/summarize.handler";
import { x402 } from "./middleware/x402.middleware";
import { SERVICES } from "./catalog";
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
	.route("/v1/summarize", summarizeHandler)
	// Free discovery endpoints
	.get("/", (c) =>
		ApiResponse.ok(c, "Tanflare Console — x402 API", {
			docs: "/v1/services",
			payment: "x402 (https://x402.org)"
		})
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

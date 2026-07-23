import { createMiddleware } from "hono/factory";

import { resolvePayer } from "@/helpers/payer.helper";
import type { HonoEnv } from "@/types/hono.types";

/**
 * Resolves the paying wallet from the X-PAYMENT header and stores it on the
 * request context. Must run AFTER the x402 middleware (which guarantees the
 * header is present and verified). Every stateful handler reads `c.get("payer")`
 * to scope storage per-wallet — one tenant can never touch another's data.
 */
export const withPayer = createMiddleware<HonoEnv>(async (c, next) => {
	const header =
		c.req.header("X-PAYMENT") ?? c.req.header("payment-signature");
	c.set("payer", resolvePayer(header));
	await next();
});

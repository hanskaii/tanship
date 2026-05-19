import { definePolicy, allow, deny } from "@workspace/core";
import type { BasePolicyContext } from "@workspace/core";
import { authorize } from "../permissions";

interface LicenseActivateContext extends BasePolicyContext {
	resource: { userId: string };
}

export const PurchasePolicy = {
	initiate: definePolicy<BasePolicyContext, "purchase.initiate">(
		"purchase.initiate",
		authorize("purchase:initiate")
	),

	activateLicense: definePolicy<LicenseActivateContext, "license.activate">(
		"license.activate",
		async (ctx) => {
			const authResult = authorize("license:activate")(ctx);
			if (!authResult.allowed) return authResult;
			if (ctx.actor.id === ctx.resource.userId) return allow();
			return deny({ code: "FORBIDDEN", message: "Not your license." });
		}
	)
};

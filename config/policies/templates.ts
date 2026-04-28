import { definePolicy, allow, deny, combine } from "@workspace/core";
import type { Actor } from "@workspace/core";
import { authorize } from "../permissions";

interface TemplatesPolicyContext {
	actor: Actor;
	resource?: { planSlug?: string | null };
}

export const TemplatesPolicy = {
	access: definePolicy<TemplatesPolicyContext, "templates.access">(
		"templates.access",
		combine<TemplatesPolicyContext>(
			authorize("templates:access"),
			(ctx) => {
				if (ctx.resource?.planSlug === "tanflare-pro") return allow();
				return deny({
					code: "PLAN_REQUIRED",
					message: "Templates access requires Tanflare Pro."
				});
			}
		)
	)
};

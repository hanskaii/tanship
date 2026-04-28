import { definePolicy, allow, deny } from "@workspace/core";
import type { Actor } from "@workspace/core";

interface TemplatesPolicyContext {
	actor: Actor;
	resource?: { planSlug?: string | null };
}

export const TemplatesPolicy = {
	access: definePolicy<TemplatesPolicyContext, "templates.access">(
		"templates.access",
		(ctx) => {
			if (ctx.resource?.planSlug === "tanflare-pro") return allow();
			return deny({
				code: "PLAN_REQUIRED",
				message: "Templates access requires Tanflare Pro."
			});
		}
	)
};

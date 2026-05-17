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
				const slug = ctx.resource?.planSlug;
				// Pro plan → access to all templates
				if (slug === "tanship-pro") return allow();
				// Individual template purchase → access granted
				if (slug?.startsWith("template-")) return allow();
				return deny({
					code: "PLAN_REQUIRED",
					message:
						"You don't have access to this template. Purchase it to download."
				});
			}
		)
	)
};

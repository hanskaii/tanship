import type { PaymentPlan } from "@workspace/core";

export const appConfig = {
	name: "Tanflare",
	version: "1.0.0",
	supportEmail: "support@tanflare.com",

	authDefaultRedirect: "/overview",

	payments: [
		{
			productId: "pdt_tanflare_replace_me",
			slug: "tanflare",
			name: "Tanflare",
			description:
				"Full boilerplate with everything you need to ship an edge-native SaaS.",
			price: "$99",
			currency: "USD",
			interval: "one-time",
			type: "standard",
			features: [
				"TanStack Start + Cloudflare Workers",
				"Better Auth (OAuth, OTP, Sessions)",
				"Drizzle ORM + D1 SQLite",
				"Hono API with RPC type safety",
				"Dodo Payments integration",
				"Gate policy engine (RBAC)",
				"Resend transactional emails",
				"Dark mode + shadcn/ui components",
				"Turborepo monorepo setup",
				"Lifetime updates via GitHub"
			],
			cta: "Buy Tanflare — $99",
			popular: false,
			footer: "One-time payment. GitHub repo access included."
		},
		{
			productId: "pdt_tanflare_pro_replace_me",
			slug: "tanflare-pro",
			name: "Tanflare Pro",
			description:
				"Everything in Tanflare plus access to all premium templates.",
			price: "$299",
			currency: "USD",
			interval: "one-time",
			type: "standard",
			features: [
				"Everything in Tanflare",
				"All premium templates (growing library)",
				"SaaS dashboard template",
				"Marketing site template",
				"Blog + docs template",
				"Priority email support",
				"Early access to new templates"
			],
			cta: "Buy Tanflare Pro — $299",
			popular: true,
			footer: "One-time payment. All current + future templates."
		}
	]
} as const satisfies {
	name: string;
	version: string;
	supportEmail?: string;
	authDefaultRedirect: string;
	payments: readonly PaymentPlan[];
};

export type AppConfig = typeof appConfig;
export type PricingPlan = (typeof appConfig.payments)[number];

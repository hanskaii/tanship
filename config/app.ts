import type { PaymentPlan } from "@workspace/core";

export const appConfig = {
	name: "Tanship",
	version: "1.0.0",
	supportEmail: "support@tanship.dev",

	authDefaultRedirect: "/overview",

	payments: [
		{
			productId: "pdt_0NckxDjwzwWTyMiEdEb7y",
			slug: "tanship",
			name: "Tanship Standard",
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
			cta: "Get Standard",
			popular: false,
			footer: "One-time payment. Lifetime access. No subscriptions."
		},
		{
			productId: "pdt_0NckxPorlzacS6mGIUiXc",
			slug: "tanship-pro",
			name: "Tanship Pro",
			description:
				"Everything in Tanship plus access to all premium templates.",
			price: "$299",
			currency: "USD",
			interval: "one-time",
			type: "standard",
			features: [
				"Everything in Tanship",
				"All premium templates (growing library)",
				"SaaS dashboard template",
				"Marketing site template",
				"Blog + docs template",
				"Priority email support",
				"Early access to new templates"
			],
			cta: "Get Pro",
			popular: true,
			footer: "One-time payment. Lifetime access. No subscriptions."
		},
		// ── Individual templates ─────────────────────────────────────────
		{
			productId: "pdt_tpl_saas_dashboard_replace_me",
			slug: "template-saas-dashboard",
			name: "SaaS Dashboard Template",
			description:
				"Full admin dashboard with analytics, user management, billing UI, and real-time charts.",
			price: "$99",
			currency: "USD",
			interval: "one-time",
			type: "standard",
			features: [
				"TanStack",
				"shadcn/ui",
				"Recharts",
				"GitHub repo access"
			],
			cta: "Buy Template — $99",
			popular: false,
			footer: "One-time payment. GitHub repo access included."
		},
		{
			productId: "pdt_tpl_marketing_site_replace_me",
			slug: "template-marketing-site",
			name: "Marketing Site Template",
			description:
				"High-converting landing page with hero, features, testimonials, pricing, and blog.",
			price: "$99",
			currency: "USD",
			interval: "one-time",
			type: "standard",
			features: ["TanStack Start", "MDX", "Motion", "GitHub repo access"],
			cta: "Buy Template — $99",
			popular: false,
			footer: "One-time payment. GitHub repo access included."
		},
		{
			productId: "pdt_tpl_docs_site_replace_me",
			slug: "template-docs-site",
			name: "Docs & Blog Template",
			description:
				"Documentation site with full-text search, versioned content, and MDX-powered blog.",
			price: "$99",
			currency: "USD",
			interval: "one-time",
			type: "standard",
			features: ["TanStack Router", "MDX", "GitHub repo access"],
			cta: "Buy Template — $99",
			popular: false,
			footer: "One-time payment. GitHub repo access included."
		},
		{
			productId: "pdt_tpl_api_starter_replace_me",
			slug: "template-api-starter",
			name: "API Starter Template",
			description:
				"Production-ready Hono API with auth, rate limiting, and OpenAPI spec generation.",
			price: "$99",
			currency: "USD",
			interval: "one-time",
			type: "standard",
			features: ["Hono", "Zod", "Workers", "GitHub repo access"],
			cta: "Buy Template — $99",
			popular: false,
			footer: "One-time payment. GitHub repo access included."
		},
		{
			productId: "pdt_tpl_waitlist_replace_me",
			slug: "template-waitlist",
			name: "Waitlist App Template",
			description:
				"Viral waitlist with referral tracking, position display, and email confirmation.",
			price: "$99",
			currency: "USD",
			interval: "one-time",
			type: "standard",
			features: [
				"TanStack Start",
				"Dodo",
				"Resend",
				"GitHub repo access"
			],
			cta: "Buy Template — $99",
			popular: false,
			footer: "One-time payment. GitHub repo access included."
		},
		{
			productId: "pdt_tpl_changelog_replace_me",
			slug: "template-changelog",
			name: "Changelog App Template",
			description:
				"Public changelog with RSS feed, email subscriber management, and markdown editor.",
			price: "$99",
			currency: "USD",
			interval: "one-time",
			type: "standard",
			features: ["TanStack Router", "D1", "Resend", "GitHub repo access"],
			cta: "Buy Template — $99",
			popular: false,
			footer: "One-time payment. GitHub repo access included."
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

import { createFileRoute, Link } from "@tanstack/react-router";
import { Badge, Button, Spinner } from "@workspace/ui";
import { motion } from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import {
	FlashIcon,
	GithubIcon,
	ArrowRight01Icon
} from "@hugeicons/core-free-icons";
import { authClient } from "@/auth/client";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useRouter } from "@tanstack/react-router";
import { toast } from "@workspace/ui";
import { appConfig } from "@workspace/config";
import type { PricingPlan } from "@workspace/config";
import { purchasesQueryOptions } from "@/routes/-fn/purchases";
import { TemplateCard, type TemplateItem } from "./-components/template-card";

export const Route = createFileRoute("/(app)/_home/templates/")({
	component: TemplatesPage
});

const TEMPLATES: TemplateItem[] = [
	{
		id: "saas-dashboard",
		slug: "template-saas-dashboard",
		name: "SaaS Dashboard",
		description:
			"Full admin dashboard with analytics, user management, billing UI, and real-time charts.",
		tags: ["TanStack", "shadcn/ui", "Recharts"],
		previewBg: "from-blue-500/5 via-blue-500/10 to-blue-500/5",
		previewUrl: "https://dashboard.tanflare.dev"
	},
	{
		id: "marketing-site",
		slug: "template-marketing-site",
		name: "Marketing Site",
		description:
			"High-converting landing page with hero, features, testimonials, pricing, and blog.",
		tags: ["TanStack Start", "MDX", "Motion"],
		previewBg: "from-violet-500/5 via-violet-500/10 to-violet-500/5",
		previewUrl: "https://marketing.tanflare.dev"
	},
	{
		id: "docs-site",
		slug: "template-docs-site",
		name: "Docs & Blog",
		description:
			"Documentation site with full-text search, versioned content, and MDX-powered blog.",
		tags: ["TanStack Router", "MDX"],
		previewBg: "from-emerald-500/5 via-emerald-500/10 to-emerald-500/5",
		previewUrl: "https://docs.tanflare.dev"
	},
	{
		id: "api-starter",
		slug: "template-api-starter",
		name: "API Starter",
		description:
			"Production-ready Hono API with auth, rate limiting, and OpenAPI spec generation.",
		tags: ["Hono", "Zod", "Workers"],
		previewBg: "from-orange-500/5 via-orange-500/10 to-orange-500/5",
		previewUrl: "https://api.tanflare.dev"
	},
	{
		id: "waitlist",
		slug: "template-waitlist",
		name: "Waitlist App",
		description:
			"Viral waitlist with referral tracking, position display, and email confirmation.",
		tags: ["TanStack Start", "Dodo", "Resend"],
		previewBg: "from-pink-500/5 via-pink-500/10 to-pink-500/5",
		previewUrl: "https://waitlist.tanflare.dev"
	},
	{
		id: "changelog",
		slug: "template-changelog",
		name: "Changelog App",
		description:
			"Public changelog with RSS feed, email subscriber management, and markdown editor.",
		tags: ["TanStack Router", "D1", "Resend"],
		previewBg: "from-yellow-500/5 via-yellow-500/10 to-yellow-500/5",
		previewUrl: "https://changelog.tanflare.dev"
	}
];

function TemplatesPage() {
	const router = useRouter();
	const { data: session } = authClient.useSession();
	// null = no checkout in progress; string = slug of plan being purchased
	const [checkoutSlug, setCheckoutSlug] = useState<string | null>(null);

	const { data: purchases } = useQuery({
		...purchasesQueryOptions(),
		enabled: !!session?.user
	});

	const isProUser =
		purchases?.some((p) => p.planSlug === "tanflare-pro") ?? false;

	/** Set of individual template slugs the user already owns */
	const ownedTemplateSlugs = new Set(
		purchases
			?.filter((p) => p.planSlug.startsWith("template-"))
			.map((p) => p.planSlug) ?? []
	);

	const startCheckout = async (slug: string) => {
		if (!session?.user) {
			router.navigate({ to: "/login" });
			return;
		}
		const plan = appConfig.payments.find(
			(p: PricingPlan) => p.slug === slug
		);
		if (!plan) return;

		setCheckoutSlug(slug);
		try {
			const { data, error } =
				await authClient.dodopayments.checkoutSession({
					slug: plan.slug,
					customer: {
						name:
							session.user.name ??
							session.user.email?.split("@")[0] ??
							"Customer",
						email: session.user.email ?? ""
					}
				} as any);

			if (error) {
				toast.error(error.message || "Failed to initiate checkout");
				return;
			}
			if (data?.url) {
				window.location.href = data.url;
			}
		} catch {
			toast.error("Something went wrong. Please try again.");
		} finally {
			setCheckoutSlug(null);
		}
	};

	const handleUpgrade = () => startCheckout("tanflare-pro");

	return (
		<div className="relative flex min-h-screen flex-col items-center bg-background overflow-hidden">
			{/* Background */}
			<div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
				<div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-30" />
				<div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-30" />
				<div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
			</div>

			<main className="relative z-10 mt-28 mb-32 flex w-full max-w-5xl flex-col items-center px-6">
				{/* Hero */}
				<motion.section
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5 }}
					className="flex flex-col items-center text-center gap-6 mb-16"
				>
					<Badge
						variant="secondary"
						className="px-3 py-0.5 bg-primary/5 text-primary border-primary/20 text-[10px] uppercase tracking-wider font-bold"
					>
						Templates
					</Badge>
					<h1 className="max-w-2xl font-extrabold text-4xl leading-tight tracking-tight sm:text-5xl">
						Ship faster with{" "}
						<span className="bg-linear-to-r from-primary via-primary/80 to-primary/50 bg-clip-text text-transparent">
							ready-made templates
						</span>
					</h1>
					<p className="max-w-xl text-balance text-sm text-muted-foreground sm:text-base leading-relaxed">
						Production-ready templates built on the Tanflare stack.
						Buy individually at $99, or unlock all of them with
						Tanflare Pro for $299.
					</p>

					{!isProUser && (
						<div className="flex items-center gap-3 mt-2">
							<Button
								size="sm"
								className="rounded-full px-6 h-10 text-xs"
								onClick={handleUpgrade}
								disabled={!!checkoutSlug}
							>
								{checkoutSlug === "tanflare-pro" ? (
									<Spinner className="size-3.5 mr-2" />
								) : (
									<HugeiconsIcon
										icon={FlashIcon}
										className="size-3.5 mr-2"
									/>
								)}
								Get All Templates — $299
							</Button>
							<Button
								size="sm"
								variant="outline"
								className="rounded-full px-6 h-10 text-xs"
								asChild
							>
								<Link to="/">
									<HugeiconsIcon
										icon={ArrowRight01Icon}
										className="size-3.5 mr-2"
									/>
									View Plans
								</Link>
							</Button>
						</div>
					)}

					{isProUser && (
						<div className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-600 font-medium">
							<HugeiconsIcon
								icon={GithubIcon}
								className="size-3.5"
							/>
							Pro access active — all templates unlocked
						</div>
					)}
				</motion.section>

				{/* Template grid */}
				<div className="w-full">
					<div className="flex items-center gap-2 mb-6">
						<span className="text-sm font-semibold">
							{TEMPLATES.length} templates
						</span>
						<Badge
							variant="secondary"
							className="text-[9px] px-1.5 py-0 opacity-60"
						>
							More coming soon
						</Badge>
					</div>

					<div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
						{TEMPLATES.map((template, i) => (
							<motion.div
								key={template.id}
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.4, delay: 0.05 * i }}
							>
								<TemplateCard
									template={template}
									isProUser={isProUser}
									hasPurchased={ownedTemplateSlugs.has(
										template.slug
									)}
									isLoggedIn={!!session?.user}
									onUpgrade={handleUpgrade}
									onBuyTemplate={() =>
										startCheckout(template.slug)
									}
									isCheckoutLoading={
										checkoutSlug === template.slug ||
										checkoutSlug === "tanflare-pro"
									}
								/>
							</motion.div>
						))}
					</div>
				</div>

				{/* Pro CTA */}
				{!isProUser && (
					<motion.section
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5, delay: 0.3 }}
						className="mt-20 w-full relative overflow-hidden rounded-2xl bg-primary/5 border border-primary/20 p-8 sm:p-10 py-14 text-center flex flex-col items-center gap-5"
					>
						<div className="flex items-center justify-center size-12 rounded-2xl bg-primary/10 border border-primary/20">
							<HugeiconsIcon
								icon={FlashIcon}
								className="size-6 text-primary"
							/>
						</div>
						<div className="flex flex-col gap-2">
							<h2 className="text-xl sm:text-2xl font-bold tracking-tight">
								Unlock all templates with Tanflare Pro
							</h2>
							<p className="text-muted-foreground text-[11px] max-w-md leading-relaxed">
								One payment. Every template we've built and
								everything we'll build in the future. Cheaper
								than buying 4 individually. Priority support
								included.
							</p>
						</div>
						<div className="flex items-center gap-3">
							<Button
								size="sm"
								className="rounded-full px-8 h-10 text-xs font-semibold"
								onClick={handleUpgrade}
								disabled={!!checkoutSlug}
							>
								{checkoutSlug === "tanflare-pro" ? (
									<Spinner className="size-3.5 mr-2" />
								) : null}
								Get Tanflare Pro — $299
							</Button>
							<p className="text-[11px] text-muted-foreground">
								vs. $99 × 6 = $594 individually
							</p>
						</div>
					</motion.section>
				)}
			</main>
		</div>
	);
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { Badge, Button, Spinner } from "@workspace/ui";
import { motion } from "framer-motion";
import { EASE_OUT_EXPO } from "../-lib/motion";
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
import { FooterSection } from "../-components/footer-section";
import { HireSection } from "../-components/hire-section";

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
		previewUrl: "https://dashboard.tanship.dev"
	},
	{
		id: "marketing-site",
		slug: "template-marketing-site",
		name: "Marketing Site",
		description:
			"High-converting landing page with hero, features, testimonials, pricing, and blog.",
		tags: ["TanStack Start", "MDX", "Motion"],
		previewBg: "from-violet-500/5 via-violet-500/10 to-violet-500/5",
		previewUrl: "https://marketing.tanship.dev"
	},
	{
		id: "docs-site",
		slug: "template-docs-site",
		name: "Docs & Blog",
		description:
			"Documentation site with full-text search, versioned content, and MDX-powered blog.",
		tags: ["TanStack Router", "MDX"],
		previewBg: "from-emerald-500/5 via-emerald-500/10 to-emerald-500/5",
		previewUrl: "https://docs.tanship.dev"
	},
	{
		id: "api-starter",
		slug: "template-api-starter",
		name: "API Starter",
		description:
			"Production-ready Hono API with auth, rate limiting, and OpenAPI spec generation.",
		tags: ["Hono", "Zod", "Workers"],
		previewBg: "from-orange-500/5 via-orange-500/10 to-orange-500/5",
		previewUrl: "https://api.tanship.dev"
	},
	{
		id: "waitlist",
		slug: "template-waitlist",
		name: "Waitlist App",
		description:
			"Viral waitlist with referral tracking, position display, and email confirmation.",
		tags: ["TanStack Start", "Dodo", "Resend"],
		previewBg: "from-pink-500/5 via-pink-500/10 to-pink-500/5",
		previewUrl: "https://waitlist.tanship.dev"
	},
	{
		id: "changelog",
		slug: "template-changelog",
		name: "Changelog App",
		description:
			"Public changelog with RSS feed, email subscriber management, and markdown editor.",
		tags: ["TanStack Router", "D1", "Resend"],
		previewBg: "from-yellow-500/5 via-yellow-500/10 to-yellow-500/5",
		previewUrl: "https://changelog.tanship.dev"
	}
];

function TemplatesPage() {
	const router = useRouter();
	const { data: session } = authClient.useSession();
	const [checkoutSlug, setCheckoutSlug] = useState<string | null>(null);

	const { data: purchases } = useQuery({
		...purchasesQueryOptions(),
		enabled: !!session?.user
	});

	const isProUser =
		purchases?.some((p) => p.planSlug === "tanship-pro") ?? false;
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
			if (data?.url) window.location.href = data.url;
		} catch {
			toast.error("Something went wrong. Please try again.");
		} finally {
			setCheckoutSlug(null);
		}
	};

	const handleUpgrade = () => startCheckout("tanship-pro");

	return (
		<>
			<main className="grid gap-6 px-4 sm:px-6 pb-32 pt-24">
				<motion.section
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5, ease: EASE_OUT_EXPO }}
					className="flex flex-col gap-6 mb-16 border-b border-border/40 pb-16"
				>
					<div className="flex items-center gap-2">
						<div className="h-1.5 w-1.5 rounded-full bg-primary" />
						<span className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
							Templates
						</span>
					</div>
					<h1
						className="font-heading font-medium text-foreground"
						style={{
							fontSize: "clamp(2rem, 5vw, 3rem)",
							letterSpacing: "-0.04em",
							lineHeight: "1.05"
						}}
					>
						Ship faster with ready-made templates
					</h1>
					<p
						className="max-w-xl text-balance text-base text-muted-foreground leading-relaxed"
						style={{ letterSpacing: "-0.01em" }}
					>
						Production-ready templates built on the Tanship stack.
						Buy individually at $99, or unlock all of them with
						Tanship Pro for $299.
					</p>

					{!isProUser && (
						<div className="flex flex-wrap items-center gap-3 mt-2">
							<Button
								size="lg"
								className="h-11 px-6 text-sm font-medium bg-foreground text-background hover:bg-foreground/90"
								onClick={handleUpgrade}
								disabled={!!checkoutSlug}
							>
								{checkoutSlug === "tanship-pro" ? (
									<Spinner className="size-4 mr-2" />
								) : null}
								Get All Templates — $299
								{checkoutSlug !== "tanship-pro" && (
									<HugeiconsIcon
										icon={ArrowRight01Icon}
										className="ml-2 size-4"
									/>
								)}
							</Button>
							<Button
								size="lg"
								variant="ghost"
								className="h-11 px-6 text-sm font-medium border border-border text-foreground hover:bg-secondary"
								asChild
							>
								<Link to="/">View Plans</Link>
							</Button>
						</div>
					)}

					{isProUser && (
						<div className="flex w-fit items-center gap-2 px-4 py-2 rounded-xl bg-secondary border border-border/40 text-xs text-foreground font-medium">
							<HugeiconsIcon
								icon={GithubIcon}
								className="size-4"
							/>
							Pro access active — all templates unlocked
						</div>
					)}
				</motion.section>

				<div className="w-full">
					<div className="flex items-center gap-3 mb-8">
						<span className="text-base font-semibold">
							{TEMPLATES.length} templates
						</span>
						<Badge
							variant="secondary"
							className="text-[10px] px-2 py-0.5 rounded-full opacity-60"
						>
							More coming soon
						</Badge>
					</div>

					<div className="flex flex-col gap-3">
						{TEMPLATES.map((template, i) => (
							<motion.div
								key={template.id}
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.4, delay: 0.05 * i, ease: EASE_OUT_EXPO }}
							>
								<TemplateCard
									template={template}
									index={i}
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
										checkoutSlug === "tanship-pro"
									}
								/>
							</motion.div>
						))}
					</div>
				</div>

				<HireSection />

				{!isProUser && (
					<motion.section
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5, delay: 0.3, ease: EASE_OUT_EXPO }}
						className="w-full"
					>
						<div className="rounded-2xl bg-secondary p-2">
							<div className="rounded-xl bg-foreground text-background p-8 sm:p-12 text-center flex flex-col items-center gap-6">
								<div className="flex size-11 items-center justify-center rounded-xl bg-background/10">
									<HugeiconsIcon
										icon={FlashIcon}
										className="size-5 text-background"
									/>
								</div>
								<div className="flex flex-col gap-3">
									<h2
										className="font-heading font-medium text-background"
										style={{
											fontSize:
												"clamp(1.4rem, 3vw, 1.8rem)",
											letterSpacing: "-0.04em",
											lineHeight: "1.05"
										}}
									>
										Unlock all templates with Tanship Pro
									</h2>
									<p
										className="text-background/60 text-sm max-w-md mx-auto leading-relaxed"
										style={{ letterSpacing: "-0.01em" }}
									>
										One payment. Every template we've built
										and everything we'll build in the
										future. Cheaper than buying 4
										individually.
									</p>
								</div>
								<div className="flex flex-col items-center gap-3 mt-4">
									<Button
										size="lg"
										className="h-11 px-6 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90"
										onClick={handleUpgrade}
										disabled={!!checkoutSlug}
									>
										{checkoutSlug === "tanship-pro" ? (
											<Spinner className="size-4 mr-2" />
										) : null}
										Get Tanship Pro — $299
										{checkoutSlug !== "tanship-pro" && (
											<HugeiconsIcon
												icon={ArrowRight01Icon}
												className="ml-2 size-4"
											/>
										)}
									</Button>
									<p className="text-[11px] text-background/40 font-mono uppercase tracking-wider">
										vs. $99 × 6 = $594 individually
									</p>
								</div>
							</div>
						</div>
					</motion.section>
				)}
			</main>
			<FooterSection />
		</>
	);
}

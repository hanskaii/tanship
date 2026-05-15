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
	// null = no checkout in progress; string = slug of plan being purchased
	const [checkoutSlug, setCheckoutSlug] = useState<string | null>(null);

	const { data: purchases } = useQuery({
		...purchasesQueryOptions(),
		enabled: !!session?.user
	});

	const isProUser =
		purchases?.some((p) => p.planSlug === "tanship-pro") ?? false;

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

	const handleUpgrade = () => startCheckout("tanship-pro");

	return (
		<div className="relative flex min-h-screen flex-col items-center bg-background overflow-hidden">
			{/* Background */}
			<div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
				<div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
			</div>

			<main className="relative z-10 pt-24 pb-32 flex w-full max-w-3xl flex-col px-4 sm:px-6 mx-auto">
				{/* Hero */}
				<motion.section
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5 }}
					className="flex flex-col gap-6 mb-16 border-b border-border/40 pb-16"
				>
					<Badge
						variant="secondary"
						className="w-fit px-3 py-1 bg-muted/30 text-foreground border border-border/50 text-[10px] uppercase tracking-widest font-bold rounded-full"
					>
						Templates
					</Badge>
					<h1 className="max-w-2xl font-semibold text-4xl leading-tight tracking-tight sm:text-5xl">
						Ship faster with ready-made templates
					</h1>
					<p className="max-w-xl text-balance text-base text-muted-foreground leading-relaxed">
						Production-ready templates built on the Tanship stack.
						Buy individually at $99, or unlock all of them with
						Tanship Pro for $299.
					</p>

					{!isProUser && (
						<div className="flex flex-wrap items-center gap-4 mt-2">
							<Button
								size="lg"
								className="rounded-none px-6 h-12 text-sm font-medium bg-foreground text-background hover:bg-foreground/90"
								onClick={handleUpgrade}
								disabled={!!checkoutSlug}
							>
								{checkoutSlug === "tanship-pro" ? (
									<Spinner className="size-4 mr-2" />
								) : (
									<HugeiconsIcon
										icon={FlashIcon}
										className="size-4 mr-2"
									/>
								)}
								Get All Templates — $299
							</Button>
							<Button
								size="lg"
								variant="ghost"
								className="rounded-none px-6 h-12 text-sm font-medium border border-border/50 hover:bg-muted/10"
								asChild
							>
								<Link to="/">
									<HugeiconsIcon
										icon={ArrowRight01Icon}
										className="size-4 mr-2"
									/>
									View Plans
								</Link>
							</Button>
						</div>
					)}

					{isProUser && (
						<div className="flex w-fit items-center gap-2 px-4 py-2 rounded-none border border-foreground/20 bg-muted/5 text-xs text-foreground font-medium">
							<HugeiconsIcon
								icon={GithubIcon}
								className="size-4"
							/>
							Pro access active — all templates unlocked
						</div>
					)}
				</motion.section>

				{/* Template grid */}
				<div className="w-full">
					<div className="flex items-center gap-3 mb-8">
						<span className="text-base font-semibold">
							{TEMPLATES.length} templates
						</span>
						<Badge
							variant="secondary"
							className="text-[10px] px-2 py-0.5 rounded-full opacity-60 border-border/50"
						>
							More coming soon
						</Badge>
					</div>

					<div className="grid gap-6 sm:grid-cols-2">
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
										checkoutSlug === "tanship-pro"
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
						className="mt-20 w-full relative overflow-hidden rounded-none border border-border/50 bg-muted/5 p-8 sm:p-12 text-center flex flex-col items-center gap-6"
					>
						<div className="flex items-center justify-center size-12 rounded-none bg-background border border-border/50">
							<HugeiconsIcon
								icon={FlashIcon}
								className="size-5 text-foreground"
							/>
						</div>
						<div className="flex flex-col gap-3">
							<h2 className="text-2xl font-semibold tracking-tight">
								Unlock all templates with Tanship Pro
							</h2>
							<p className="text-muted-foreground text-sm max-w-md mx-auto leading-relaxed">
								One payment. Every template we've built and
								everything we'll build in the future. Cheaper
								than buying 4 individually. Priority support
								included.
							</p>
						</div>
						<div className="flex flex-col items-center gap-3 mt-4">
							<Button
								size="lg"
								className="rounded-none px-8 h-12 text-sm font-medium bg-foreground text-background hover:bg-foreground/90"
								onClick={handleUpgrade}
								disabled={!!checkoutSlug}
							>
								{checkoutSlug === "tanship-pro" ? (
									<Spinner className="size-4 mr-2" />
								) : null}
								Get Tanship Pro — $299
							</Button>
							<p className="text-[11px] text-muted-foreground font-mono uppercase tracking-wider">
								vs. $99 × 6 = $594 individually
							</p>
						</div>
					</motion.section>
				)}
			</main>
		</div>
	);
}

import { createFileRoute, redirect } from "@tanstack/react-router";
import { Badge, Button, Separator, Spinner, toast } from "@workspace/ui";
import { HugeiconsIcon } from "@hugeicons/react";
import { CheckmarkCircle01Icon, FlashIcon } from "@hugeicons/core-free-icons";
import { motion } from "framer-motion";
import { useState } from "react";
import { authClient } from "@/auth/client";
import { sessionsOptions, useLogoutMutation } from "@/routes/-fn/auth";
import { Gate } from "@workspace/core";
import { appConfig, type PricingPlan } from "@workspace/config";

export const Route = createFileRoute("/(app)/_home/upgrade")({
	beforeLoad: async ({ context }) => {
		const session = await context.queryClient.fetchQuery(sessionsOptions());
		if (!session?.user) throw redirect({ to: "/login" });

		const result = await Gate.can("app.use", { actor: session.user });
		if (result.allowed) throw redirect({ to: "/overview" });

		return { session };
	},
	component: UpgradePage
});

function UpgradePage() {
	const { session } = Route.useRouteContext();
	const user = session.user;
	const { logout, isPending: isLogoutPending } = useLogoutMutation();
	const [isCheckoutLoading, setIsCheckoutLoading] = useState<string | null>(
		null
	);

	const handleCheckout = async (plan: PricingPlan) => {
		setIsCheckoutLoading(plan.name);
		try {
			const { data, error } =
				await authClient.dodopayments.checkoutSession({
					slug: plan.slug,
					customer: {
						name:
							user?.name ||
							user?.email?.split("@")[0] ||
							"Customer",
						email: user?.email || ""
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
			setIsCheckoutLoading(null);
		}
	};

	const plans = appConfig.payments.filter(
		(p: any) => !p.slug.startsWith("template-")
	);

	return (
		<div className="relative flex min-h-screen flex-col items-center overflow-hidden bg-background px-4 pb-32 pt-24 sm:px-6">
			{/* Background grid */}
			<div className="pointer-events-none fixed inset-0 z-0 bg-[linear-gradient(to_right,hsl(var(--border)/0.15)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.15)_1px,transparent_1px)] bg-[size:28px_28px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

			<div className="relative z-10 mx-auto flex w-full max-w-2xl flex-col items-center gap-12">
				{/* Header */}
				<motion.div
					initial={{ opacity: 0, y: 16 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.35 }}
					className="flex w-full flex-col items-center gap-4 border-b border-border/40 pb-12 text-center"
				>
					<div className="flex h-10 w-10 items-center justify-center bg-foreground">
						<HugeiconsIcon
							icon={FlashIcon}
							className="size-5 text-background"
						/>
					</div>
					<Badge
						variant="secondary"
						className="rounded-full border border-border/50 bg-muted/30 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-foreground"
					>
						Subscription Required
					</Badge>
					<h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
						Upgrade to get access
					</h1>
					<p className="max-w-sm text-base text-muted-foreground leading-relaxed">
						Choose a plan to unlock the app. Already subscribed?{" "}
						<button
							onClick={() => window.location.reload()}
							className="font-medium text-foreground underline-offset-3 hover:underline"
						>
							Refresh the page.
						</button>
					</p>
				</motion.div>

				{/* Plan cards */}
				<div
					className={`grid w-full gap-4 ${plans.length > 1 ? "sm:grid-cols-2" : "grid-cols-1"}`}
				>
					{plans.map((plan: any, i: number) => (
						<motion.div
							key={plan.name}
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.35, delay: 0.08 * i }}
							className="flex h-full"
						>
							<div
								className={`relative flex w-full flex-col p-8 transition-all ${
									plan.popular
										? "border-2 border-foreground bg-background shadow-md dark:bg-muted/5"
										: "border border-border/60 bg-background hover:border-border dark:bg-muted/5"
								}`}
							>
								{plan.popular && (
									<div className="absolute -top-3.5 right-6">
										<span className="rounded-full bg-foreground px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-background">
											Most Popular
										</span>
									</div>
								)}

								<div className="mb-6 flex flex-col gap-2 pt-1">
									<h3 className="text-lg font-semibold leading-tight text-foreground">
										{plan.name}
									</h3>
									<div className="flex items-baseline gap-1.5">
										{plan.originalPrice && (
											<span className="text-sm font-medium text-muted-foreground line-through opacity-50">
												{plan.originalPrice}
											</span>
										)}
										<span className="text-4xl font-semibold tracking-tight text-foreground">
											{plan.price}
										</span>
										<span className="mt-1 text-xs font-mono font-bold uppercase tracking-widest text-muted-foreground">
											{plan.currency}
										</span>
									</div>
									<span className="text-[10px] font-mono font-bold uppercase tracking-widest text-muted-foreground">
										{plan.interval === "one-time"
											? plan.type === "credits"
												? `Refillable (${plan.unit})`
												: "One-time payment"
											: `/ ${plan.interval}`}
									</span>
									<p className="mt-2 text-sm leading-relaxed text-muted-foreground">
										{plan.description}
									</p>
								</div>

								<Separator className="mb-6 opacity-40" />

								<ul className="mb-8 flex flex-1 flex-col gap-3">
									{plan.features.map((feature: string) => (
										<li
											key={feature}
											className="flex items-start gap-2.5 text-sm"
										>
											<HugeiconsIcon
												icon={CheckmarkCircle01Icon}
												className="mt-0.5 size-4 shrink-0 text-foreground"
											/>
											<span className="text-foreground">
												{feature}
											</span>
										</li>
									))}
								</ul>

								<Button
									size="lg"
									className={`h-11 w-full rounded-none text-sm font-medium transition-colors ${
										plan.popular
											? "bg-foreground text-background hover:bg-foreground/90"
											: "border border-border/60 bg-transparent text-foreground hover:bg-muted/10"
									}`}
									onClick={() => handleCheckout(plan)}
									disabled={isCheckoutLoading !== null}
								>
									{isCheckoutLoading === plan.name && (
										<Spinner className="mr-2 size-4" />
									)}
									{isCheckoutLoading === plan.name
										? "Preparing…"
										: plan.cta}
								</Button>

								<p className="mt-3 text-center text-[11px] text-muted-foreground opacity-60">
									{plan.footer}
								</p>
							</div>
						</motion.div>
					))}
				</div>

				{/* Footer */}
				<div className="flex flex-col items-center gap-2">
					<p className="text-sm text-muted-foreground">
						Signed in as{" "}
						<span className="font-semibold text-foreground">
							{user?.email}
						</span>
					</p>
					<Button
						variant="ghost"
						size="sm"
						onClick={logout}
						disabled={isLogoutPending}
						className="h-8 rounded-none text-[13px] text-muted-foreground hover:text-foreground"
					>
						{isLogoutPending ? "Logging out…" : "Log out"}
					</Button>
				</div>
			</div>
		</div>
	);
}

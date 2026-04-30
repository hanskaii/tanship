import { createFileRoute, redirect } from "@tanstack/react-router";
import { Badge, Button, Card, Separator, Spinner, toast } from "@workspace/ui";
import { HugeiconsIcon } from "@hugeicons/react";
import { FlashIcon } from "@hugeicons/core-free-icons";
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

		// Already subscribed — send them to the app
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

			if (data?.url) {
				window.location.href = data.url;
			}
		} catch {
			toast.error("Something went wrong. Please try again.");
		} finally {
			setIsCheckoutLoading(null);
		}
	};

	return (
		<div className="relative flex min-h-screen flex-col items-center bg-background overflow-hidden px-4 sm:px-6 pt-24 pb-32">
			{/* Background */}
			<div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
				<div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
			</div>

			<div className="relative z-10 w-full max-w-3xl flex flex-col items-center gap-12 mx-auto">
				{/* Header */}
				<motion.div
					initial={{ opacity: 0, y: 16 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.4 }}
					className="flex flex-col items-center text-center gap-4 border-b border-border/40 w-full pb-12"
				>
					<Badge
						variant="secondary"
						className="px-3 py-1 bg-muted/30 text-foreground border border-border/50 text-[10px] uppercase tracking-widest font-bold rounded-full"
					>
						Subscription Required
					</Badge>
					<h1 className="text-4xl sm:text-5xl font-semibold tracking-tight">
						Upgrade to get access
					</h1>
					<p className="text-muted-foreground text-base max-w-md leading-relaxed">
						Choose a plan to unlock the app. Already subscribed?{" "}
						<button
							onClick={() => window.location.reload()}
							className="text-foreground underline-offset-4 hover:underline font-medium"
						>
							Refresh the page.
						</button>
					</p>
				</motion.div>

				{/* Pricing cards */}
				<div
					className={`grid w-full gap-6 grid-cols-1 ${appConfig.payments.filter((p: any) => !p.slug.startsWith("template-")).length > 1 ? "sm:grid-cols-2" : ""}`}
				>
					{appConfig.payments
						.filter((p: any) => !p.slug.startsWith("template-"))
						.map((plan: any, i: number) => (
							<motion.div
								key={plan.name}
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.4, delay: 0.1 * i }}
								className="flex h-full"
							>
								<div
									className={`relative flex flex-col w-full p-8 transition-all border-none bg-background ring-1 ${plan.popular ? "ring-foreground bg-muted/5 shadow-md" : "ring-border/60 hover:ring-border"}`}
								>
									{plan.popular && (
										<div className="absolute -top-3 right-8">
											<div className="bg-foreground text-background text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">
												Most Popular
											</div>
										</div>
									)}
									<div className="flex flex-col gap-2 mb-8">
										<h3 className="font-semibold text-xl leading-tight text-foreground">
											{plan.name}
										</h3>
										<div className="flex flex-col gap-1 mt-2">
											<div className="flex items-center gap-2">
												{plan.originalPrice && (
													<span className="text-sm font-medium text-muted-foreground line-through opacity-50">
														{plan.originalPrice}
													</span>
												)}
												<span className="text-4xl font-semibold text-foreground tracking-tight">
													{plan.price}
												</span>
												<span className="text-xs font-mono text-muted-foreground uppercase tracking-widest ml-1 mt-1">
													{plan.currency}
												</span>
											</div>
											<span className="text-xs text-muted-foreground uppercase tracking-wider font-mono mt-1">
												{plan.interval === "one-time"
													? plan.type === "credits"
														? `Refillable (${plan.unit})`
														: "One-time payment"
													: `/ ${plan.interval}`}
											</span>
										</div>
										<p className="text-sm text-muted-foreground leading-relaxed mt-4">
											{plan.description}
										</p>
									</div>

									<Separator className="mb-8 opacity-40 bg-border/50" />

									<div className="flex flex-col gap-4 mb-8 flex-1">
										{plan.features.map(
											(feature: string) => (
												<div
													key={feature}
													className="flex items-start gap-3"
												>
													<HugeiconsIcon
														icon={FlashIcon}
														className="size-4 text-foreground flex-shrink-0 mt-0.5"
													/>
													<span className="text-sm text-foreground">
														{feature}
													</span>
												</div>
											)
										)}
									</div>

									<Button
										size="lg"
										className={`w-full rounded-none h-12 text-sm font-medium transition-colors ${plan.popular ? "bg-foreground text-background hover:bg-foreground/90" : "bg-transparent text-foreground border border-border/60 hover:bg-muted/10"}`}
										onClick={() => handleCheckout(plan)}
										disabled={isCheckoutLoading !== null}
									>
										{isCheckoutLoading === plan.name ? (
											<Spinner className="size-4 mr-2" />
										) : null}
										{isCheckoutLoading === plan.name
											? "Preparing..."
											: plan.cta}
									</Button>

									<p className="text-center text-xs text-muted-foreground mt-4 opacity-60">
										{plan.footer}
									</p>
								</div>
							</motion.div>
						))}
				</div>

				{/* Footer */}
				<div className="flex flex-col items-center gap-2 mt-8">
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
						className="text-sm text-muted-foreground rounded-none hover:text-foreground"
					>
						{isLogoutPending ? "Logging out..." : "Log out"}
					</Button>
				</div>
			</div>
		</div>
	);
}

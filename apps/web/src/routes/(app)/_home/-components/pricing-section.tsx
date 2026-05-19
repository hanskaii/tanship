import { Button, Spinner } from "@workspace/ui";
import { motion } from "framer-motion";
import { EASE_OUT_EXPO } from "../-lib/motion";
import { authClient } from "@/auth/client";
import { appConfig } from "@workspace/config";
import { toast } from "@workspace/ui";
import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";

const PLAN_SLUGS = ["tanship", "tanship-pro"] as const;

const plans = appConfig.payments.filter((p) =>
	(PLAN_SLUGS as readonly string[]).includes(p.slug)
);

const cardVariants = {
	hidden: { opacity: 0, y: 20 },
	show: (delay: number) => ({
		opacity: 1,
		y: 0,
		transition: { duration: 0.55, ease: EASE_OUT_EXPO, delay }
	})
};

export function PricingSection() {
	return (
		<section id="pricing" className="border-b border-border/40 py-20">
			<div className="mb-14">
				<h2
					className="mb-3 font-heading font-medium text-foreground"
					style={{
						fontSize: "clamp(2rem, 5vw, 3rem)",
						letterSpacing: "-0.04em",
						lineHeight: "1.05"
					}}
				>
					Invest in your time.
				</h2>
				<p
					className="max-w-md text-muted-foreground"
					style={{
						fontSize: "15px",
						lineHeight: "1.6",
						letterSpacing: "-0.02em"
					}}
				>
					Get lifetime access to the boilerplate. Save hundreds of
					hours of development time.
				</p>
			</div>

			<Plans />
		</section>
	);
}

export function Plans() {
	return (
		<div className="rounded-2xl bg-secondary p-2">
			<div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
				{plans.map((plan, i) => (
					<PlanCard key={plan.slug} plan={plan} delay={i * 0.1} />
				))}
			</div>
			<p
				className="mb-2 mt-3 flex items-center justify-center gap-2 text-[12px] text-muted-foreground"
				style={{ letterSpacing: "-0.01em" }}
			>
				<svg
					width="14"
					height="14"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
					aria-hidden="true"
				>
					<path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.42 19.42 0 0 1 4.43 9.88a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.34 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.32 8.91" />
					<line x1="1" y1="1" x2="23" y2="23" />
				</svg>
				One-time payment. Lifetime access. No subscriptions.
			</p>
		</div>
	);
}

function PlanCard({
	plan,
	delay
}: {
	plan: (typeof plans)[number];
	delay: number;
}) {
	const isPro = plan.slug === "tanship-pro";
	const { data: session } = authClient.useSession();
	const navigate = useNavigate();
	const [isLoading, setIsLoading] = useState(false);

	const handleCheckout = async () => {
		if (!session?.user) {
			navigate({ to: "/login", search: { redirect: "/" } });
			return;
		}
		setIsLoading(true);
		try {
			const result = await authClient.dodopayments.checkoutSession({
				slug: plan.slug
			});
			if (result.error) {
				toast.error(
					result.error.message ??
						"Failed to start checkout. Please try again."
				);
				return;
			}
			if (result.data?.url) {
				window.location.href = result.data.url;
			}
		} catch {
			toast.error("Failed to start checkout. Please try again.");
		} finally {
			setIsLoading(false);
		}
	};

	if (isPro) {
		return (
			<motion.div
				className="flex flex-col rounded-xl bg-foreground p-8 text-background"
				variants={cardVariants}
				custom={delay}
				initial="hidden"
				whileInView="show"
				viewport={{ once: true, margin: "-8%" }}
			>
				<div className="mb-4">
					<div className="mb-2 flex items-center gap-2">
						<h3
							className="font-heading font-medium"
							style={{
								fontSize: "1.25rem",
								letterSpacing: "-0.03em"
							}}
						>
							{plan.name}
						</h3>
						{plan.popular && (
							<span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-medium uppercase tracking-widest text-primary-foreground">
								Most Popular
							</span>
						)}
					</div>
					<p
						className="text-background/60"
						style={{
							fontSize: "14px",
							lineHeight: "1.5",
							letterSpacing: "-0.01em"
						}}
					>
						{plan.description}
					</p>
				</div>

				<div className="mb-6">
					<span
						className="font-heading font-bold"
						style={{
							fontSize: "clamp(2.5rem, 5vw, 3rem)",
							letterSpacing: "-0.04em",
							lineHeight: "1"
						}}
					>
						{plan.price}
					</span>
					<span
						className="ml-2 text-background/50"
						style={{
							fontSize: "14px",
							letterSpacing: "-0.01em"
						}}
					>
						one-time
					</span>
				</div>

				<div className="mb-5 border-b border-background/10" />

				<Button
					className="mb-6 h-11 w-full bg-primary text-sm font-medium text-primary-foreground hover:opacity-90 active:translate-y-px"
					onClick={handleCheckout}
					disabled={isLoading}
				>
					{isLoading ? <Spinner className="size-4" /> : plan.cta}
				</Button>

				<ul className="flex flex-1 flex-col gap-3">
					{plan.features.map((f) => (
						<li
							key={f}
							className="flex items-start gap-2.5"
							style={{
								fontSize: "14px",
								letterSpacing: "-0.01em"
							}}
						>
							<span className="shrink-0 text-background/40">
								+
							</span>
							<span className="text-background/90">{f}</span>
						</li>
					))}
				</ul>

				{plan.footer && (
					<p className="mt-6 text-[12px] text-background/40">
						{plan.footer}
					</p>
				)}
			</motion.div>
		);
	}

	return (
		<motion.div
			className="flex flex-col rounded-xl bg-card p-8"
			variants={cardVariants}
			custom={delay}
			initial="hidden"
			whileInView="show"
			viewport={{ once: true, margin: "-8%" }}
		>
			<div className="mb-4">
				<h3
					className="mb-1 font-heading font-medium text-foreground"
					style={{
						fontSize: "1.25rem",
						letterSpacing: "-0.03em"
					}}
				>
					{plan.name}
				</h3>
				<p
					className="text-muted-foreground"
					style={{
						fontSize: "14px",
						lineHeight: "1.5",
						letterSpacing: "-0.01em"
					}}
				>
					{plan.description}
				</p>
			</div>

			<div className="mb-6">
				<span
					className="font-heading font-bold text-foreground"
					style={{
						fontSize: "clamp(2.5rem, 5vw, 3rem)",
						letterSpacing: "-0.04em",
						lineHeight: "1"
					}}
				>
					{plan.price}
				</span>
				<span
					className="ml-2 text-muted-foreground"
					style={{
						fontSize: "14px",
						letterSpacing: "-0.01em"
					}}
				>
					one-time
				</span>
			</div>

			<div className="mb-5 border-b border-border/40" />

			<Button
				className="mb-6 h-11 w-full bg-foreground text-sm font-medium text-background hover:bg-foreground/90 active:translate-y-px"
				onClick={handleCheckout}
				disabled={isLoading}
			>
				{isLoading ? <Spinner className="size-4" /> : plan.cta}
			</Button>

			<ul className="flex flex-1 flex-col gap-3">
				{plan.features.map((f) => (
					<li
						key={f}
						className="flex items-start gap-2.5"
						style={{
							fontSize: "14px",
							letterSpacing: "-0.01em"
						}}
					>
						<span className="shrink-0 text-muted-foreground">
							+
						</span>
						<span className="text-foreground">{f}</span>
					</li>
				))}
			</ul>

			{plan.footer && (
				<p className="mt-6 text-[12px] text-muted-foreground">
					{plan.footer}
				</p>
			)}
		</motion.div>
	);
}

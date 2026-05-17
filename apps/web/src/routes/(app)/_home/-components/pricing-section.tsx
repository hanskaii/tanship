import { Link } from "@tanstack/react-router";
import { Button } from "@workspace/ui";

const STANDARD_FEATURES = [
	"TanStack Start + Cloudflare Workers",
	"Better Auth — OAuth, OTP, sessions",
	"Dodo Payments billing integration",
	"Drizzle ORM + D1 SQLite",
	"Gate policy & RBAC system",
	"MDX blog & docs engine",
	"Lifetime updates"
];

const PRO_FEATURES = [
	"Everything in Standard",
	"All current premium templates",
	"All future templates (free forever)",
	"Priority email support"
];

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
				{/* Standard — white card */}
				<div className="flex flex-col rounded-xl bg-card p-8">
					<div className="mb-4">
						<h3
							className="mb-1 font-heading font-medium text-foreground"
							style={{
								fontSize: "1.25rem",
								letterSpacing: "-0.03em"
							}}
						>
							Tanship Standard
						</h3>
						<p
							className="text-muted-foreground"
							style={{
								fontSize: "14px",
								lineHeight: "1.5",
								letterSpacing: "-0.01em"
							}}
						>
							Full boilerplate to ship a production-ready SaaS.
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
							$99
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
						asChild
					>
						<Link to="/upgrade">Get Standard</Link>
					</Button>

					<ul className="flex flex-col gap-3 flex-1">
						{STANDARD_FEATURES.map((f) => (
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
				</div>

				{/* Pro — dark featured card */}
				<div className="flex flex-col rounded-xl bg-foreground p-8 text-background">
					<div className="mb-4">
						<h3
							className="mb-1 font-heading font-medium"
							style={{
								fontSize: "1.25rem",
								letterSpacing: "-0.03em"
							}}
						>
							Tanship Pro
						</h3>
						<p
							className="text-background/60"
							style={{
								fontSize: "14px",
								lineHeight: "1.5",
								letterSpacing: "-0.01em"
							}}
						>
							Boilerplate + access to all premium templates.
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
							$299
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
						asChild
					>
						<Link to="/upgrade">Get Pro</Link>
					</Button>

					<ul className="flex flex-col gap-3 flex-1">
						{PRO_FEATURES.map((f) => (
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
				</div>
			</div>
			<p
				className="mt-3 mb-2 flex items-center justify-center gap-2 text-[12px] text-muted-foreground"
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

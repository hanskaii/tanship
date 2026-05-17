import { HugeiconsIcon } from "@hugeicons/react";
import { Cancel01Icon } from "@hugeicons/core-free-icons";

const ROWS = [
	{ component: "Authentication (OAuth, MFA)", scratch: "2–4 weeks" },
	{ component: "Subscription billing", scratch: "2–3 weeks" },
	{ component: "Multi-tenant organizations", scratch: "3–4 weeks" },
	{ component: "Blog & docs engine", scratch: "1–2 weeks" },
	{ component: "Security & bug patches", scratch: "Ongoing" }
];

const DIFFERENTIATORS = [
	{
		pain: "Generic boilerplates are abandoned weekend projects",
		win: "Production-grade, actively maintained foundation"
	},
	{
		pain: "AI-generated code often lacks established patterns",
		win: "Strict Gate, RBAC, and RPC patterns AI tools understand"
	}
];

export function BuildVsBuySection() {
	return (
		<section className="border-b border-border/40 py-20">
			<div className="mb-14">
				<h2
					className="mb-3 font-heading font-medium text-foreground"
					style={{
						fontSize: "clamp(2rem, 5vw, 3rem)",
						letterSpacing: "-0.04em",
						lineHeight: "1.05"
					}}
				>
					Save months.
					<br />
					Start shipping.
				</h2>
				<p
					className="max-w-md text-muted-foreground"
					style={{
						fontSize: "15px",
						lineHeight: "1.6",
						letterSpacing: "-0.02em"
					}}
				>
					Every SaaS needs auth, billing, and email. Building them
					yourself costs months. Tanship ships them on day one.
				</p>
			</div>

			{/* Component time table */}
			<div className="mb-8 overflow-hidden">
				<div className="grid grid-cols-[1fr_auto_auto] border-b border-border/40 pb-3 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/60">
					<div>Component</div>
					<div className="px-6 text-right">Build Yourself</div>
					<div className="w-28">With Tanship</div>
				</div>

				{ROWS.map((row, i) => (
					<div
						key={i}
						className={`grid grid-cols-[1fr_auto_auto] items-center py-4 text-sm transition-colors hover:opacity-80 ${
							i < ROWS.length - 1
								? "border-b border-border/30"
								: ""
						}`}
					>
						<div className="font-medium text-foreground">
							{row.component}
						</div>
						<div className="px-6 text-right text-muted-foreground line-through decoration-muted-foreground/30">
							{row.scratch}
						</div>
						<div className="flex w-28 items-center gap-2 font-semibold text-foreground">
							<span className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">
								✓
							</span>
							Pre-built
						</div>
					</div>
				))}
			</div>

			{/* Summary cards */}
			<div className="mb-10 rounded-2xl bg-secondary p-2">
				<div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
					<div className="flex flex-col gap-1 rounded-xl bg-card p-5">
						<span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground/50">
							Build from scratch
						</span>
						<span
							className="font-heading font-medium text-foreground"
							style={{
								fontSize: "clamp(1.4rem, 3vw, 1.8rem)",
								letterSpacing: "-0.04em",
								lineHeight: "1"
							}}
						>
							3–6 mo
						</span>
						<span className="text-xs text-muted-foreground">
							of dev time
						</span>
					</div>
					<div className="flex flex-col gap-1 rounded-xl bg-foreground p-5">
						<span className="text-[10px] font-medium uppercase tracking-widest text-background/40">
							With Tanship
						</span>
						<span
							className="font-heading font-medium text-background"
							style={{
								fontSize: "clamp(1.4rem, 3vw, 1.8rem)",
								letterSpacing: "-0.04em",
								lineHeight: "1"
							}}
						>
							Day 1
						</span>
						<span className="text-xs text-background/50">
							start building features
						</span>
					</div>
					<div className="flex flex-col gap-1 rounded-xl bg-card p-5">
						<span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground/50">
							AWS infrastructure
						</span>
						<span
							className="font-heading font-medium text-muted-foreground line-through decoration-destructive/40"
							style={{
								fontSize: "clamp(1.4rem, 3vw, 1.8rem)",
								letterSpacing: "-0.04em",
								lineHeight: "1"
							}}
						>
							$150
						</span>
						<span className="text-xs text-muted-foreground">
							per month
						</span>
					</div>
					<div className="flex flex-col gap-1 rounded-xl bg-foreground p-5">
						<span className="text-[10px] font-medium uppercase tracking-widest text-background/40">
							Cloudflare Workers
						</span>
						<span
							className="font-heading font-medium text-background"
							style={{
								fontSize: "clamp(1.4rem, 3vw, 1.8rem)",
								letterSpacing: "-0.04em",
								lineHeight: "1"
							}}
						>
							$0
						</span>
						<span className="text-xs text-background/50">
							until 100k req/day
						</span>
					</div>
				</div>
			</div>

			{/* Differentiator rows */}
			<div className="overflow-hidden rounded-xl ring-1 ring-border/40">
				<div className="grid grid-cols-2 border-b border-border/30 bg-card">
					<div className="flex items-center gap-2 px-5 py-3 text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
						<HugeiconsIcon
							icon={Cancel01Icon}
							className="size-3.5 text-destructive"
						/>
						Without Tanship
					</div>
					<div className="flex items-center gap-2 px-5 py-3 text-[11px] font-medium uppercase tracking-widest text-foreground">
						<span className="inline-flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full bg-primary text-[8px] font-bold text-primary-foreground">
							✓
						</span>
						With Tanship
					</div>
				</div>
				{DIFFERENTIATORS.map((row, i) => (
					<div
						key={i}
						className={`grid grid-cols-2 bg-card text-sm ${
							i < DIFFERENTIATORS.length - 1
								? "border-b border-border/20"
								: ""
						}`}
					>
						<div
							className="px-5 py-4 pr-6 text-muted-foreground line-through decoration-destructive/30"
							style={{ letterSpacing: "-0.01em" }}
						>
							{row.pain}
						</div>
						<div
							className="flex items-start gap-2 px-5 py-4 font-medium text-foreground"
							style={{ letterSpacing: "-0.01em" }}
						>
							<span className="mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">
								✓
							</span>
							{row.win}
						</div>
					</div>
				))}
			</div>
		</section>
	);
}

import { HugeiconsIcon } from "@hugeicons/react";
import { CheckmarkCircle01Icon } from "@hugeicons/core-free-icons";

const ROWS = [
	{
		component: "Authentication (OAuth, MFA)",
		scratch: "2–4 weeks"
	},
	{
		component: "Subscription billing",
		scratch: "2–3 weeks"
	},
	{
		component: "Multi-tenant organizations",
		scratch: "3–4 weeks"
	},
	{
		component: "Blog & docs engine",
		scratch: "1–2 weeks"
	},
	{
		component: "Security & bug patches",
		scratch: "Ongoing"
	}
];

export function BuildVsBuySection() {
	return (
		<section className="border-b border-border/40 py-20">
			<div className="mb-14">
				<h2 className="mb-3 text-3xl font-semibold tracking-tight text-foreground">
					Skip months of
					<br />
					infrastructure work.
				</h2>
				<p className="max-w-md text-base text-muted-foreground">
					See how much time you save by starting with a
					production-ready foundation instead of building from
					scratch.
				</p>
			</div>

			{/* Table */}
			<div className="mb-8 overflow-hidden border border-border/50">
				<div className="grid grid-cols-[1fr_auto_auto] border-b border-border/40 bg-muted/10 px-5 py-3 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
					<div>Component</div>
					<div className="px-6 text-right">Build Yourself</div>
					<div className="w-28 text-foreground">With Tanship</div>
				</div>

				{ROWS.map((row, i) => (
					<div
						key={i}
						className={`grid grid-cols-[1fr_auto_auto] items-center px-5 py-4 text-sm transition-colors hover:bg-muted/5 ${
							i < ROWS.length - 1
								? "border-b border-border/30"
								: ""
						}`}
					>
						<div className="font-medium text-foreground">
							{row.component}
						</div>
						<div className="px-6 text-right text-muted-foreground">
							{row.scratch}
						</div>
						<div className="flex w-28 items-center gap-2 font-semibold text-foreground">
							<HugeiconsIcon
								icon={CheckmarkCircle01Icon}
								className="size-4 shrink-0 text-emerald-500"
							/>
							Pre-built
						</div>
					</div>
				))}
			</div>

			{/* Summary cards */}
			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
				<div className="flex flex-col items-center justify-center border border-border/50 bg-muted/5 p-8 text-center dark:bg-muted/10">
					<div className="mb-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
						Build from scratch
					</div>
					<div className="text-2xl font-semibold text-foreground">
						3–6 months
					</div>
					<div className="mt-1 text-xs text-muted-foreground">
						500+ hours of development
					</div>
				</div>
				<div className="flex flex-col items-center justify-center border border-foreground bg-foreground p-8 text-center text-background">
					<div className="mb-1 text-[10px] font-bold uppercase tracking-widest opacity-70">
						With Tanship
					</div>
					<div className="text-2xl font-semibold">Day 1</div>
					<div className="mt-1 text-xs opacity-80">
						Start building features immediately
					</div>
				</div>
			</div>
		</section>
	);
}

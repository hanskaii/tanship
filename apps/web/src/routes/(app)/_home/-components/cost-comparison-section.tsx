import { HugeiconsIcon } from "@hugeicons/react";
import { CheckmarkCircle01Icon } from "@hugeicons/core-free-icons";

const BENEFITS = [
	{
		label: "Generous Free Tier",
		detail: "Up to 100k requests/day at no cost"
	},
	{
		label: "Zero Servers",
		detail: "No DevOps, no cold starts, no AWS bills"
	},
	{
		label: "Global by Default",
		detail: "Your DB and API run near your users"
	}
];

export function CostComparisonSection() {
	return (
		<section className="border-b border-border/40 py-20">
			<div className="grid grid-cols-1 gap-12 md:grid-cols-[1fr_1.4fr] md:items-center">
				{/* Left: copy */}
				<div>
					<h2 className="mb-4 text-3xl font-semibold leading-tight tracking-tight text-foreground">
						Scale infinitely.
						<br />
						Pay almost nothing.
					</h2>
					<p className="mb-8 text-base text-muted-foreground">
						By running on Cloudflare's edge network your SaaS is
						faster and costs significantly less than traditional
						cloud.
					</p>
					<ul className="flex flex-col gap-4">
						{BENEFITS.map((b) => (
							<li
								key={b.label}
								className="flex items-start gap-3 text-sm"
							>
								<HugeiconsIcon
									icon={CheckmarkCircle01Icon}
									className="mt-0.5 size-4 shrink-0 text-emerald-500"
								/>
								<span className="text-foreground">
									<strong className="font-semibold">
										{b.label}:
									</strong>{" "}
									{b.detail}
								</span>
							</li>
						))}
					</ul>
				</div>

				{/* Right: cost bars */}
				<div className="flex flex-col gap-6 border border-border/50 bg-muted/5 p-8 dark:bg-muted/10">
					{/* AWS */}
					<div className="flex flex-col gap-2">
						<div className="flex items-center justify-between">
							<span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
								Estimated AWS Cost
							</span>
							<span className="font-mono text-lg font-semibold text-muted-foreground line-through decoration-red-400/60">
								$150/mo
							</span>
						</div>
						<div className="h-2 w-full overflow-hidden bg-muted/30">
							<div className="h-full w-full bg-red-400/30" />
						</div>
					</div>

					{/* Cloudflare */}
					<div className="flex flex-col gap-2">
						<div className="flex items-center justify-between">
							<span className="text-[11px] font-bold uppercase tracking-widest text-foreground">
								Cloudflare Workers Cost
							</span>
							<span className="font-mono text-3xl font-semibold tracking-tight text-foreground">
								$0
								<span className="ml-1 text-base font-normal text-muted-foreground">
									/mo*
								</span>
							</span>
						</div>
						<div className="h-2 w-full overflow-hidden bg-muted/30">
							<div className="h-full w-[3%] bg-emerald-500" />
						</div>
					</div>

					<p className="text-[11px] text-muted-foreground">
						* Until you reach significant scale (100k+ daily
						requests)
					</p>
				</div>
			</div>
		</section>
	);
}

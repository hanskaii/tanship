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
					<h2
						className="mb-4 font-heading font-medium text-foreground"
						style={{
							fontSize: "clamp(2rem, 5vw, 3rem)",
							letterSpacing: "-0.04em",
							lineHeight: "1.05"
						}}
					>
						Scale infinitely.
						<br />
						Pay almost nothing.
					</h2>
					<p
						className="mb-8 text-muted-foreground"
						style={{
							fontSize: "15px",
							lineHeight: "1.6",
							letterSpacing: "-0.02em"
						}}
					>
						Cloudflare runs your app close to your users worldwide.
						Faster responses, lower bills, no servers to manage.
					</p>
					<ul className="flex flex-col gap-4">
						{BENEFITS.map((b) => (
							<li
								key={b.label}
								className="flex items-start gap-3 text-sm"
							>
								<HugeiconsIcon
									icon={CheckmarkCircle01Icon}
									className="mt-0.5 size-4 shrink-0 text-foreground"
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
				<div className="flex flex-col gap-6 rounded-xl bg-secondary p-8 md:rounded-xl md:bg-secondary md:p-8">
					{/* AWS */}
					<div className="flex flex-col gap-2">
						<div className="flex items-center justify-between">
							<span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
								Estimated AWS Cost
							</span>
							<span
								className="font-heading font-medium text-muted-foreground line-through decoration-destructive/40"
								style={{
									fontSize: "1.3rem",
									letterSpacing: "-0.03em"
								}}
							>
								$150/mo
							</span>
						</div>
						<div className="h-px w-full bg-destructive/20" />
					</div>

					{/* Cloudflare */}
					<div className="flex flex-col gap-3">
						<div className="flex items-baseline justify-between">
							<span className="text-[10px] font-medium uppercase tracking-widest text-foreground">
								Cloudflare Workers
							</span>
							<span
								className="font-heading font-medium text-foreground"
								style={{
									fontSize: "clamp(1.8rem, 4vw, 2.4rem)",
									letterSpacing: "-0.04em",
									lineHeight: "1"
								}}
							>
								$0
								<span
									className="ml-1 text-sm font-normal text-muted-foreground"
									style={{ letterSpacing: "-0.01em" }}
								>
									/mo*
								</span>
							</span>
						</div>
						<div className="h-px w-full bg-foreground/20" />
					</div>

					<p className="text-[11px] text-muted-foreground/60">
						* Until you reach significant scale (100k+ daily
						requests)
					</p>
				</div>
			</div>
		</section>
	);
}

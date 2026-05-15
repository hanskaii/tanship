import { HugeiconsIcon } from "@hugeicons/react";
import { CheckmarkCircle01Icon, FlashIcon } from "@hugeicons/core-free-icons";

export function CostComparisonSection() {
	return (
		<section className="py-20 border-b border-border/40">
			<div className="grid grid-cols-1 md:grid-cols-[1fr_1.5fr] gap-12 items-center">
				<div>
					<h2 className="text-3xl font-semibold tracking-tight text-foreground mb-4 leading-tight">
						Scale infinitely. <br /> Pay almost nothing.
					</h2>
					<p className="text-muted-foreground text-lg mb-6">
						By leveraging Cloudflare's massive edge network, your
						SaaS runs faster and costs significantly less.
					</p>
					<ul className="space-y-3">
						<li className="flex items-center gap-3 text-sm text-foreground">
							<HugeiconsIcon
								icon={CheckmarkCircle01Icon}
								className="size-4 text-emerald-500 shrink-0"
							/>
							<span>
								<strong className="font-semibold">
									Generous Free Tier:
								</strong>{" "}
								Up to 100k requests/day free
							</span>
						</li>
						<li className="flex items-center gap-3 text-sm text-foreground">
							<HugeiconsIcon
								icon={CheckmarkCircle01Icon}
								className="size-4 text-emerald-500 shrink-0"
							/>
							<span>
								<strong className="font-semibold">
									Zero Servers:
								</strong>{" "}
								No DevOps, no cold starts, no AWS bills
							</span>
						</li>
						<li className="flex items-center gap-3 text-sm text-foreground">
							<HugeiconsIcon
								icon={CheckmarkCircle01Icon}
								className="size-4 text-emerald-500 shrink-0"
							/>
							<span>
								<strong className="font-semibold">
									Global by Default:
								</strong>{" "}
								Your DB and API run near your users
							</span>
						</li>
					</ul>
				</div>
				<div className="border border-border/50 bg-muted/5 p-8 rounded-none flex flex-col justify-center relative overflow-hidden">
					<div className="absolute top-0 right-0 p-4 opacity-5">
						<HugeiconsIcon icon={FlashIcon} className="size-32" />
					</div>
					<div className="relative z-10">
						<div className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-2">
							Estimated AWS Cost
						</div>
						<div className="text-2xl font-mono text-muted-foreground line-through decoration-red-500/50 mb-8">
							$150.00/mo
						</div>

						<div className="text-sm font-bold uppercase tracking-widest text-foreground mb-2">
							Cloudflare Workers Cost
						</div>
						<div className="text-5xl font-mono font-semibold text-foreground tracking-tight">
							$0.00
							<span className="text-lg text-muted-foreground">
								/mo*
							</span>
						</div>
						<p className="text-xs text-muted-foreground mt-4">
							* Until you reach significant scale (100k+ daily
							requests)
						</p>
					</div>
				</div>
			</div>
		</section>
	);
}

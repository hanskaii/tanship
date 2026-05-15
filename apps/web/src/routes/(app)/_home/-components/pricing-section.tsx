import { HugeiconsIcon } from "@hugeicons/react";
import { CheckmarkCircle01Icon } from "@hugeicons/core-free-icons";
import { Button } from "@workspace/ui";

export function PricingSection() {
	return (
		<section className="py-20 border-b border-border/40">
			<div className="mb-16">
				<h2 className="text-3xl font-semibold tracking-tight text-foreground mb-4">
					Invest in your time.
				</h2>
				<p className="text-muted-foreground text-lg max-w-xl">
					Get lifetime access to the boilerplate. Save hundreds of
					hours of development time.
				</p>
			</div>

			<div className="grid grid-cols-1 gap-8">
				{/* Standard Plan */}
				<div className="border border-border/60 p-8 bg-background relative flex flex-col sm:flex-row gap-8 rounded-none transition-colors hover:border-border">
					<div className="flex-1">
						<h3 className="text-xl font-semibold text-foreground mb-2">
							Tanship Standard
						</h3>
						<p className="text-sm text-muted-foreground mb-8">
							Full boilerplate to ship an edge-native SaaS.
						</p>
						<div className="space-y-4 mb-8 sm:mb-0">
							<div className="flex items-start gap-3">
								<HugeiconsIcon
									icon={CheckmarkCircle01Icon}
									className="text-muted-foreground size-4 flex-shrink-0 mt-0.5"
								/>
								<span className="text-sm text-foreground">
									TanStack Start + Cloudflare Workers
								</span>
							</div>
							<div className="flex items-start gap-3">
								<HugeiconsIcon
									icon={CheckmarkCircle01Icon}
									className="text-muted-foreground size-4 flex-shrink-0 mt-0.5"
								/>
								<span className="text-sm text-foreground">
									Better Auth & Dodo Payments
								</span>
							</div>
							<div className="flex items-start gap-3">
								<HugeiconsIcon
									icon={CheckmarkCircle01Icon}
									className="text-muted-foreground size-4 flex-shrink-0 mt-0.5"
								/>
								<span className="text-sm text-foreground">
									Drizzle ORM + D1 SQLite
								</span>
							</div>
						</div>
					</div>
					<div className="sm:w-64 flex flex-col justify-end border-t sm:border-t-0 sm:border-l border-border/40 pt-6 sm:pt-0 sm:pl-8">
						<div className="mb-6">
							<div className="text-4xl font-semibold text-foreground tracking-tight">
								$99
							</div>
							<div className="text-xs text-muted-foreground mt-2 uppercase tracking-wider font-mono">
								One-time payment
							</div>
						</div>
						<Button className="w-full rounded-none h-12 bg-foreground text-background hover:bg-foreground/90 font-medium">
							Get Standard
						</Button>
					</div>
				</div>

				{/* Pro Plan */}
				<div className="border border-foreground p-8 bg-background relative flex flex-col sm:flex-row gap-8 rounded-none">
					<div className="absolute -top-3 left-8 bg-foreground text-background text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">
						Pro
					</div>
					<div className="flex-1 pt-2 sm:pt-0">
						<h3 className="text-xl font-semibold text-foreground mb-2">
							Tanship Pro
						</h3>
						<p className="text-sm text-muted-foreground mb-8">
							Boilerplate + access to all premium templates.
						</p>
						<div className="space-y-4 mb-8 sm:mb-0">
							<div className="flex items-start gap-3">
								<HugeiconsIcon
									icon={CheckmarkCircle01Icon}
									className="text-foreground size-4 flex-shrink-0 mt-0.5"
								/>
								<span className="text-sm text-foreground font-medium">
									Everything in Standard
								</span>
							</div>
							<div className="flex items-start gap-3">
								<HugeiconsIcon
									icon={CheckmarkCircle01Icon}
									className="text-foreground size-4 flex-shrink-0 mt-0.5"
								/>
								<span className="text-sm text-foreground">
									All premium templates
								</span>
							</div>
							<div className="flex items-start gap-3">
								<HugeiconsIcon
									icon={CheckmarkCircle01Icon}
									className="text-foreground size-4 flex-shrink-0 mt-0.5"
								/>
								<span className="text-sm text-foreground">
									Priority email support
								</span>
							</div>
						</div>
					</div>
					<div className="sm:w-64 flex flex-col justify-end border-t sm:border-t-0 sm:border-l border-border/40 pt-6 sm:pt-0 sm:pl-8">
						<div className="mb-6">
							<div className="text-4xl font-semibold text-foreground tracking-tight">
								$299
							</div>
							<div className="text-xs text-muted-foreground mt-2 uppercase tracking-wider font-mono">
								One-time payment
							</div>
						</div>
						<Button className="w-full rounded-none h-12 bg-foreground text-background hover:bg-foreground/90 font-medium">
							Get Pro
						</Button>
					</div>
				</div>
			</div>
		</section>
	);
}

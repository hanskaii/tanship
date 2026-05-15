import { HugeiconsIcon } from "@hugeicons/react";
import { CheckmarkCircle01Icon, FlashIcon } from "@hugeicons/core-free-icons";
import { Badge, Button } from "@workspace/ui";

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
		<section className="border-b border-border/40 py-20">
			<div className="mb-14">
				<h2 className="mb-3 text-3xl font-semibold tracking-tight text-foreground">
					Invest in your time.
				</h2>
				<p className="max-w-md text-base text-muted-foreground">
					Get lifetime access to the boilerplate. Save hundreds of
					hours of development time.
				</p>
			</div>

			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
				{/* Standard */}
				<div className="flex flex-col border border-border/60 bg-background p-8 transition-colors hover:border-border dark:bg-muted/5">
					<div className="mb-6">
						<h3 className="mb-1 text-lg font-semibold text-foreground">
							Tanship Standard
						</h3>
						<p className="text-sm text-muted-foreground">
							Full boilerplate to ship an edge-native SaaS.
						</p>
					</div>

					<div className="mb-8">
						<div className="flex items-baseline gap-1">
							<span className="text-5xl font-semibold tracking-tight text-foreground">
								$99
							</span>
						</div>
						<div className="mt-1 text-[10px] font-mono font-bold uppercase tracking-widest text-muted-foreground">
							One-time payment
						</div>
					</div>

					<ul className="mb-8 flex flex-col gap-3 flex-1">
						{STANDARD_FEATURES.map((f) => (
							<li
								key={f}
								className="flex items-start gap-2.5 text-sm"
							>
								<HugeiconsIcon
									icon={CheckmarkCircle01Icon}
									className="mt-0.5 size-4 shrink-0 text-muted-foreground"
								/>
								<span className="text-foreground">{f}</span>
							</li>
						))}
					</ul>

					<Button className="h-11 w-full rounded-none bg-foreground text-sm font-medium text-background hover:bg-foreground/90">
						Get Standard
					</Button>
				</div>

				{/* Pro */}
				<div className="relative flex flex-col border-2 border-foreground bg-background p-8 dark:bg-muted/5">
					<div className="absolute -top-3.5 left-6">
						<Badge className="rounded-full bg-foreground px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-background">
							Most Popular
						</Badge>
					</div>

					<div className="mb-6 pt-2">
						<h3 className="mb-1 text-lg font-semibold text-foreground">
							Tanship Pro
						</h3>
						<p className="text-sm text-muted-foreground">
							Boilerplate + access to all premium templates.
						</p>
					</div>

					<div className="mb-8">
						<div className="flex items-baseline gap-1">
							<span className="text-5xl font-semibold tracking-tight text-foreground">
								$299
							</span>
						</div>
						<div className="mt-1 text-[10px] font-mono font-bold uppercase tracking-widest text-muted-foreground">
							One-time payment
						</div>
					</div>

					<ul className="mb-8 flex flex-col gap-3 flex-1">
						{PRO_FEATURES.map((f) => (
							<li
								key={f}
								className="flex items-start gap-2.5 text-sm"
							>
								<HugeiconsIcon
									icon={CheckmarkCircle01Icon}
									className="mt-0.5 size-4 shrink-0 text-foreground"
								/>
								<span className="font-medium text-foreground">
									{f}
								</span>
							</li>
						))}
					</ul>

					<Button className="h-11 w-full rounded-none bg-foreground text-sm font-medium text-background hover:bg-foreground/90">
						<HugeiconsIcon
							icon={FlashIcon}
							className="mr-2 size-4"
						/>
						Get Pro
					</Button>
				</div>
			</div>
		</section>
	);
}

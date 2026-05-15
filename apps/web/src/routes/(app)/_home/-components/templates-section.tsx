import { HugeiconsIcon } from "@hugeicons/react";
import { Layout01Icon } from "@hugeicons/core-free-icons";
import { appConfig, type PricingPlan } from "../../../../../../../config/app";

export function TemplatesSection() {
	return (
		<section className="py-20 border-b border-border/40">
			<div className="mb-16">
				<h2 className="text-3xl font-semibold tracking-tight text-foreground mb-4">
					Premium Templates
				</h2>
				<p className="text-muted-foreground text-lg max-w-xl">
					Jumpstart your project with our growing library of premium
					templates, included in the Pro plan.
				</p>
			</div>

			<div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
				{appConfig.payments
					.filter((p: PricingPlan) => p.slug.startsWith("template-"))
					.slice(0, 4)
					.map((template: PricingPlan) => (
						<div
							key={template.slug}
							className="group cursor-pointer"
						>
							<div className="aspect-[4/3] bg-muted/20 border border-border/50 mb-4 overflow-hidden relative p-1 transition-colors group-hover:border-foreground/30 rounded-none">
								<div className="w-full h-full bg-background border border-border/30 flex items-center justify-center">
									<HugeiconsIcon
										icon={Layout01Icon}
										className="size-6 text-muted-foreground/40"
									/>
								</div>
							</div>
							<h4 className="text-sm font-semibold text-foreground mb-1">
								{template.name}
							</h4>
							<p className="text-xs text-muted-foreground leading-relaxed">
								{template.description}
							</p>
						</div>
					))}
			</div>
		</section>
	);
}

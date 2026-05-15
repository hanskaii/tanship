import { HugeiconsIcon } from "@hugeicons/react";
import { Layout01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { Badge, Button } from "@workspace/ui";
import { Link } from "@tanstack/react-router";
import { appConfig, type PricingPlan } from "../../../../../../../config/app";

export function TemplatesSection() {
	const templates = appConfig.payments
		.filter((p: PricingPlan) => p.slug.startsWith("template-"))
		.slice(0, 4);

	return (
		<section className="border-b border-border/40 py-20">
			<div className="mb-14 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
				<div>
					<h2 className="mb-2 text-3xl font-semibold tracking-tight text-foreground">
						Premium Templates
					</h2>
					<p className="max-w-md text-base text-muted-foreground">
						Jumpstart your project with our growing library of
						premium templates, included with Pro.
					</p>
				</div>
				<Button
					variant="ghost"
					size="sm"
					className="h-9 w-fit rounded-none border border-border/50 px-4 text-[13px] font-medium hover:bg-muted/20"
					asChild
				>
					<Link to="/templates">
						Browse all
						<HugeiconsIcon
							icon={ArrowRight01Icon}
							className="ml-1.5 size-3.5"
						/>
					</Link>
				</Button>
			</div>

			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
				{templates.map((template: PricingPlan) => (
					<div
						key={template.slug}
						className="group flex flex-col border border-border/50 bg-background transition-all hover:border-border dark:bg-muted/5"
					>
						{/* Preview area */}
						<div className="flex h-36 items-center justify-center border-b border-border/40 bg-muted/10 p-1 dark:bg-muted/20">
							<div className="flex h-full w-full items-center justify-center border border-border/30 bg-background dark:bg-muted/10">
								<HugeiconsIcon
									icon={Layout01Icon}
									className="size-8 text-muted-foreground/30 transition-all group-hover:text-muted-foreground/50"
								/>
							</div>
						</div>

						{/* Info */}
						<div className="flex flex-col gap-2 p-5">
							<div className="flex items-start justify-between gap-2">
								<h4 className="text-sm font-semibold text-foreground">
									{template.name}
								</h4>
								<Badge
									variant="secondary"
									className="shrink-0 rounded-full text-[10px]"
								>
									Pro
								</Badge>
							</div>
							<p className="text-xs leading-relaxed text-muted-foreground">
								{template.description}
							</p>
						</div>
					</div>
				))}
			</div>
		</section>
	);
}

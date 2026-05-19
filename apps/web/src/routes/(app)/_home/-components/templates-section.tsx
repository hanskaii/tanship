import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { Badge, Button } from "@workspace/ui";
import { Link } from "@tanstack/react-router";
import { appConfig, type PricingPlan } from "../../../../../../../config/app";

const PREVIEW_IMAGES = [
	"https://picsum.photos/seed/tpl-crm/700/440",
	"https://picsum.photos/seed/tpl-saas/700/440",
	"https://picsum.photos/seed/tpl-analytics/700/440",
	"https://picsum.photos/seed/tpl-dash/700/440"
];

function TemplatePreview({ index }: { index: number }) {
	return (
		<img
			src={PREVIEW_IMAGES[index % PREVIEW_IMAGES.length]}
			alt="Template preview"
			className="h-full w-full object-cover"
			loading="lazy"
		/>
	);
}

export function TemplatesSection() {
	const templates = appConfig.payments
		.filter((p: PricingPlan) => p.slug.startsWith("template-"))
		.slice(0, 4);

	return (
		<section className="border-b border-border/40 py-20">
			<div className="mb-14 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
				<div>
					<h2
						className="mb-2 font-heading font-medium text-foreground"
						style={{
							fontSize: "clamp(2rem, 5vw, 3rem)",
							letterSpacing: "-0.04em",
							lineHeight: "1.05"
						}}
					>
						Premium Templates
					</h2>
					<p
						className="max-w-md text-muted-foreground"
						style={{
							fontSize: "15px",
							lineHeight: "1.6",
							letterSpacing: "-0.02em"
						}}
					>
						Jumpstart your project with our growing library of
						premium templates, included with Pro.
					</p>
				</div>
				<Button
					variant="ghost"
					size="sm"
					className="h-9 w-fit border border-border/50 px-4 text-[13px] font-medium hover:bg-muted/20"
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

			<div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
				{templates.map((template: PricingPlan, i: number) => (
					<div
						key={template.slug}
						className="group rounded-xl bg-secondary p-2"
					>
						<div className="overflow-hidden rounded-lg bg-card">
							<div className="aspect-[14/9] overflow-hidden">
								<div className="h-full w-full transition-transform duration-500 ease-out group-hover:scale-[1.03]">
									<TemplatePreview index={i} />
								</div>
							</div>
							<div className="border-t border-border/30 px-4 py-3">
								<div className="flex items-start justify-between gap-2">
									<p
										className="text-sm font-medium text-foreground"
										style={{ letterSpacing: "-0.01em" }}
									>
										{template.name}
									</p>
									<Badge
										variant="secondary"
										className="shrink-0 rounded-xl text-[10px]"
									>
										Pro
									</Badge>
								</div>
								<p
									className="mt-0.5 text-[11px] text-muted-foreground"
									style={{ letterSpacing: "-0.01em" }}
								>
									{template.description}
								</p>
							</div>
						</div>
					</div>
				))}
			</div>
		</section>
	);
}

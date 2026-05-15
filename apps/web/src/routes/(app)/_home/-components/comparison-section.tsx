import { HugeiconsIcon } from "@hugeicons/react";
import { CheckmarkCircle01Icon } from "@hugeicons/core-free-icons";

export function ComparisonSection() {
	return (
		<section className="py-20 border-b border-border/40">
			<div className="mb-12">
				<h2 className="text-3xl font-semibold tracking-tight text-foreground mb-4">
					How Tanship Compares
				</h2>
				<p className="text-muted-foreground text-lg max-w-xl">
					We've felt the pain of building SaaS apps from scratch. Here
					is why Tanship is the better way.
				</p>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				<div className="border border-border/50 p-6 bg-background rounded-none hover:bg-muted/5 transition-colors">
					<div className="text-sm font-medium text-muted-foreground line-through decoration-red-500/50 mb-2">
						Building auth from scratch takes 2-4 weeks
					</div>
					<div className="text-base font-semibold text-foreground flex items-start gap-2">
						<HugeiconsIcon
							icon={CheckmarkCircle01Icon}
							className="size-5 text-emerald-500 shrink-0 mt-0.5"
						/>
						Tanship includes complete auth with MFA in minutes
					</div>
				</div>
				<div className="border border-border/50 p-6 bg-background rounded-none hover:bg-muted/5 transition-colors">
					<div className="text-sm font-medium text-muted-foreground line-through decoration-red-500/50 mb-2">
						Managing servers and cold starts kills speed
					</div>
					<div className="text-base font-semibold text-foreground flex items-start gap-2">
						<HugeiconsIcon
							icon={CheckmarkCircle01Icon}
							className="size-5 text-emerald-500 shrink-0 mt-0.5"
						/>
						Cloudflare Edge workers run instantly, globally
					</div>
				</div>
				<div className="border border-border/50 p-6 bg-background rounded-none hover:bg-muted/5 transition-colors">
					<div className="text-sm font-medium text-muted-foreground line-through decoration-red-500/50 mb-2">
						Generic boilerplates are abandoned weekend projects
					</div>
					<div className="text-base font-semibold text-foreground flex items-start gap-2">
						<HugeiconsIcon
							icon={CheckmarkCircle01Icon}
							className="size-5 text-emerald-500 shrink-0 mt-0.5"
						/>
						Tanship is a production-grade business foundation
					</div>
				</div>
				<div className="border border-border/50 p-6 bg-background rounded-none hover:bg-muted/5 transition-colors">
					<div className="text-sm font-medium text-muted-foreground line-through decoration-red-500/50 mb-2">
						AI-generated code often lacks best practices
					</div>
					<div className="text-base font-semibold text-foreground flex items-start gap-2">
						<HugeiconsIcon
							icon={CheckmarkCircle01Icon}
							className="size-5 text-emerald-500 shrink-0 mt-0.5"
						/>
						Tanship provides strict patterns that AI tools can
						extend
					</div>
				</div>
			</div>
		</section>
	);
}

import { HugeiconsIcon } from "@hugeicons/react";
import { CheckmarkCircle01Icon } from "@hugeicons/core-free-icons";

export function BuildVsBuySection() {
	return (
		<section className="py-20 border-b border-border/40">
			<div className="mb-12">
				<h2 className="text-3xl font-semibold tracking-tight text-foreground mb-4">
					Skip months of infrastructure work.
				</h2>
				<p className="text-muted-foreground text-lg max-w-xl">
					See how much time you save by starting with a
					production-ready foundation instead of building everything
					from scratch.
				</p>
			</div>

			<div className="border border-border/50 bg-background rounded-none overflow-hidden mb-8">
				<div className="grid grid-cols-[2fr_1fr_1fr] border-b border-border/50 bg-muted/5 p-4 sm:px-6">
					<div className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">
						Component
					</div>
					<div className="font-semibold text-xs uppercase tracking-wider text-muted-foreground text-right pr-4">
						Build Yourself
					</div>
					<div className="font-semibold text-xs uppercase tracking-wider text-foreground">
						With Tanship
					</div>
				</div>

				<div className="grid grid-cols-[2fr_1fr_1fr] border-b border-border/30 p-4 sm:px-6 text-sm items-center hover:bg-muted/5 transition-colors">
					<div className="font-medium text-foreground">
						Authentication (OAuth, MFA)
					</div>
					<div className="text-muted-foreground text-right pr-4">
						2-4 weeks
					</div>
					<div className="flex items-center text-foreground font-semibold">
						<HugeiconsIcon
							icon={CheckmarkCircle01Icon}
							className="size-4 mr-2"
						/>
						Pre-built
					</div>
				</div>
				<div className="grid grid-cols-[2fr_1fr_1fr] border-b border-border/30 p-4 sm:px-6 text-sm items-center hover:bg-muted/5 transition-colors">
					<div className="font-medium text-foreground">
						Subscription billing
					</div>
					<div className="text-muted-foreground text-right pr-4">
						2-3 weeks
					</div>
					<div className="flex items-center text-foreground font-semibold">
						<HugeiconsIcon
							icon={CheckmarkCircle01Icon}
							className="size-4 mr-2"
						/>
						Pre-built
					</div>
				</div>
				<div className="grid grid-cols-[2fr_1fr_1fr] border-b border-border/30 p-4 sm:px-6 text-sm items-center hover:bg-muted/5 transition-colors">
					<div className="font-medium text-foreground">
						Multi-tenant organizations
					</div>
					<div className="text-muted-foreground text-right pr-4">
						3-4 weeks
					</div>
					<div className="flex items-center text-foreground font-semibold">
						<HugeiconsIcon
							icon={CheckmarkCircle01Icon}
							className="size-4 mr-2"
						/>
						Pre-built
					</div>
				</div>
				<div className="grid grid-cols-[2fr_1fr_1fr] border-b border-border/30 p-4 sm:px-6 text-sm items-center hover:bg-muted/5 transition-colors">
					<div className="font-medium text-foreground">
						Blog & docs engine
					</div>
					<div className="text-muted-foreground text-right pr-4">
						1-2 weeks
					</div>
					<div className="flex items-center text-foreground font-semibold">
						<HugeiconsIcon
							icon={CheckmarkCircle01Icon}
							className="size-4 mr-2"
						/>
						Pre-built
					</div>
				</div>
				<div className="grid grid-cols-[2fr_1fr_1fr] p-4 sm:px-6 text-sm items-center hover:bg-muted/5 transition-colors">
					<div className="font-medium text-foreground">
						Security & bug patches
					</div>
					<div className="text-muted-foreground text-right pr-4">
						Ongoing
					</div>
					<div className="flex items-center text-foreground font-semibold">
						<HugeiconsIcon
							icon={CheckmarkCircle01Icon}
							className="size-4 mr-2"
						/>
						Included
					</div>
				</div>
			</div>

			<div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
				<div className="border border-border/50 p-6 bg-muted/5 rounded-none flex flex-col justify-center text-center">
					<div className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">
						Build from scratch
					</div>
					<div className="text-2xl font-semibold mb-1 text-foreground">
						3-6 months
					</div>
					<div className="text-xs text-muted-foreground">
						500+ hours of development
					</div>
				</div>
				<div className="border border-foreground p-6 bg-foreground text-background rounded-none flex flex-col justify-center text-center">
					<div className="text-xs font-bold uppercase tracking-widest opacity-80 mb-2">
						With Tanship
					</div>
					<div className="text-2xl font-semibold mb-1">Day 1</div>
					<div className="text-xs opacity-90">
						Start building features immediately
					</div>
				</div>
			</div>
		</section>
	);
}

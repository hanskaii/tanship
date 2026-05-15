import { HugeiconsIcon } from "@hugeicons/react";
import {
	CheckmarkCircle01Icon,
	Cancel01Icon
} from "@hugeicons/core-free-icons";

const ROWS = [
	{
		pain: "Building auth from scratch takes 2–4 weeks",
		win: "Complete auth with MFA in minutes"
	},
	{
		pain: "Managing servers and cold starts kills speed",
		win: "Cloudflare Edge workers run instantly, globally"
	},
	{
		pain: "Generic boilerplates are abandoned weekend projects",
		win: "Production-grade, actively maintained foundation"
	},
	{
		pain: "AI-generated code often lacks best practices",
		win: "Strict patterns that AI tools understand and extend"
	}
];

export function ComparisonSection() {
	return (
		<section className="border-b border-border/40 py-20">
			<div className="mb-14">
				<h2 className="mb-3 text-3xl font-semibold tracking-tight text-foreground">
					How Tanship compares
				</h2>
				<p className="max-w-md text-base text-muted-foreground">
					We've felt the pain of building SaaS from scratch. Here's
					why Tanship is the smarter way.
				</p>
			</div>

			<div className="overflow-hidden border border-border/50">
				{/* Header */}
				<div className="grid grid-cols-2 border-b border-border/40 bg-muted/10 px-5 py-3">
					<div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
						<HugeiconsIcon
							icon={Cancel01Icon}
							className="size-3.5 text-red-400"
						/>
						Without Tanship
					</div>
					<div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-foreground">
						<HugeiconsIcon
							icon={CheckmarkCircle01Icon}
							className="size-3.5 text-emerald-500"
						/>
						With Tanship
					</div>
				</div>

				{ROWS.map((row, i) => (
					<div
						key={i}
						className={`grid grid-cols-2 px-5 py-4 text-sm transition-colors hover:bg-muted/5 ${
							i < ROWS.length - 1
								? "border-b border-border/30"
								: ""
						}`}
					>
						<div className="pr-6 text-muted-foreground line-through decoration-red-400/50">
							{row.pain}
						</div>
						<div className="flex items-start gap-2 font-medium text-foreground">
							<HugeiconsIcon
								icon={CheckmarkCircle01Icon}
								className="mt-0.5 size-4 shrink-0 text-emerald-500"
							/>
							{row.win}
						</div>
					</div>
				))}
			</div>
		</section>
	);
}

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
		win: "Cloudflare Workers run instantly, globally"
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
				<h2
					className="mb-3 font-heading font-medium text-foreground"
					style={{
						fontSize: "clamp(2rem, 5vw, 3rem)",
						letterSpacing: "-0.04em",
						lineHeight: "1.05"
					}}
				>
					How Tanship compares
				</h2>
				<p
					className="max-w-md text-muted-foreground"
					style={{
						fontSize: "15px",
						lineHeight: "1.6",
						letterSpacing: "-0.02em"
					}}
				>
					We've felt the pain of building SaaS from scratch. Here's
					why Tanship is the smarter way.
				</p>
			</div>

			<div className="overflow-hidden rounded-2xl bg-secondary">
				{/* Header */}
				<div className="grid grid-cols-2 border-b border-border/30 px-5 py-3">
					<div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
						<HugeiconsIcon
							icon={Cancel01Icon}
							className="size-3.5 text-destructive"
						/>
						Without Tanship
					</div>
					<div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-widest text-foreground">
						<HugeiconsIcon
							icon={CheckmarkCircle01Icon}
							className="size-3.5 text-foreground"
						/>
						With Tanship
					</div>
				</div>

				{ROWS.map((row, i) => (
					<div
						key={i}
						className={`grid grid-cols-2 px-5 py-4 text-sm transition-colors hover:bg-muted/30 ${
							i < ROWS.length - 1
								? "border-b border-border/20"
								: ""
						}`}
					>
						<div
							className="pr-6 text-muted-foreground line-through decoration-destructive/30"
							style={{ letterSpacing: "-0.01em" }}
						>
							{row.pain}
						</div>
						<div
							className="flex items-start gap-2 font-medium text-foreground"
							style={{ letterSpacing: "-0.01em" }}
						>
							<HugeiconsIcon
								icon={CheckmarkCircle01Icon}
								className="mt-0.5 size-4 shrink-0 text-foreground"
							/>
							{row.win}
						</div>
					</div>
				))}
			</div>
		</section>
	);
}

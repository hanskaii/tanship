import { HugeiconsIcon } from "@hugeicons/react";
import { FlashIcon } from "@hugeicons/core-free-icons";

const TOOLS = ["Cursor AI", "Claude Code", "Gemini IDE", "GitHub Copilot"];

export function AiAgentsSection() {
	return (
		<section className="border-b border-border/40 py-20">
			<div className="flex flex-col gap-8 border border-border/50 bg-muted/5 p-10 sm:flex-row sm:items-center dark:bg-muted/10">
				{/* Icon */}
				<div className="flex h-12 w-12 shrink-0 items-center justify-center border border-border/50 bg-background dark:border-border/30">
					<HugeiconsIcon
						icon={FlashIcon}
						className="size-5 text-foreground"
					/>
				</div>

				{/* Copy */}
				<div className="flex flex-col gap-3 flex-1">
					<h2 className="text-xl font-semibold tracking-tight text-foreground">
						Optimized for AI-assisted development
					</h2>
					<p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
						Custom CLAUDE.md rules, structured policy patterns, and
						an included MCP server give AI coding assistants the
						context they need to produce correct, idiomatic code —
						every time.
					</p>
					<div className="flex flex-wrap gap-2 pt-1">
						{TOOLS.map((tool) => (
							<span
								key={tool}
								className="border border-border/50 bg-background px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-foreground dark:bg-muted/10"
							>
								{tool}
							</span>
						))}
					</div>
				</div>
			</div>
		</section>
	);
}

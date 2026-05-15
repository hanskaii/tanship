import { HugeiconsIcon } from "@hugeicons/react";
import { FlashIcon } from "@hugeicons/core-free-icons";

export function AiAgentsSection() {
	return (
		<section className="py-20 border-b border-border/40">
			<div className="border border-border/50 bg-background p-10 text-center flex flex-col items-center rounded-none">
				<div className="flex items-center justify-center size-12 rounded-none bg-background border border-border/50 mb-6">
					<HugeiconsIcon
						icon={FlashIcon}
						className="size-6 text-foreground"
					/>
				</div>
				<h2 className="text-2xl font-semibold tracking-tight text-foreground mb-4">
					Optimized for LLMs
				</h2>
				<p className="text-muted-foreground text-base max-w-lg mb-8 leading-relaxed">
					Integrates seamlessly with AI IDEs. Our codebase makes
					development faster with custom rules and an included MCP
					Server to turbocharge output quality.
				</p>
				<div className="flex flex-wrap justify-center gap-3 text-xs font-bold tracking-widest uppercase">
					<span className="px-4 py-2 border border-border/50 bg-background text-foreground">
						Cursor AI
					</span>
					<span className="px-4 py-2 border border-border/50 bg-background text-foreground">
						Claude Code
					</span>
					<span className="px-4 py-2 border border-border/50 bg-background text-foreground">
						Gemini IDE
					</span>
				</div>
			</div>
		</section>
	);
}

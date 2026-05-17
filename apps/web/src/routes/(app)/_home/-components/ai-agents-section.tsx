const TOOLS = [
	{ name: "Claude Code", src: "/ai-tools/claude.png" },
	{ name: "Cursor", src: "/ai-tools/cursor.jpg" },
	{ name: "ChatGPT", src: "/ai-tools/chatgpt.webp" },
	{ name: "GitHub Copilot", src: "/ai-tools/copilot.png" },
	{ name: "Windsurf", src: "/ai-tools/windsurf.jpg" },
	{ name: "Gemini", src: "/ai-tools/gemini.webp" },
	{ name: "Grok", src: "/ai-tools/grok.jpg" }
];

export function AiAgentsSection() {
	return (
		<section className="border-b border-border/40 py-20">
			<div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:gap-16">
				{/* Left: heading */}
				<div className="sm:w-64 sm:shrink-0">
					<div className="mb-3 flex items-center gap-2">
						<div className="h-1 w-1 rounded-full bg-primary" />
						<span className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
							AI-first
						</span>
					</div>
					<h2
						className="font-heading font-medium text-foreground"
						style={{
							fontSize: "clamp(2rem, 5vw, 3rem)",
							letterSpacing: "-0.04em",
							lineHeight: "1.05"
						}}
					>
						Optimized for AI development
					</h2>
				</div>

				{/* Right: copy + tool logos */}
				<div className="flex flex-1 flex-col gap-8">
					<p
						className="text-muted-foreground"
						style={{
							fontSize: "15px",
							lineHeight: "1.6",
							letterSpacing: "-0.02em"
						}}
					>
						Custom CLAUDE.md rules, structured policy patterns, and
						an included MCP server give AI coding assistants the
						context they need to produce correct, idiomatic code —
						every time.
					</p>

					<div className="flex flex-wrap gap-3">
						{TOOLS.map((tool) => (
							<div
								key={tool.name}
								className="flex items-center gap-2.5 rounded-full bg-secondary px-3 py-2 transition-colors hover:bg-muted/80"
								title={tool.name}
							>
								<img
									src={tool.src}
									alt={tool.name}
									className="h-5 w-5 rounded-full object-cover"
								/>
								<span className="text-[13px] font-medium text-foreground">
									{tool.name}
								</span>
							</div>
						))}
					</div>
				</div>
			</div>
		</section>
	);
}

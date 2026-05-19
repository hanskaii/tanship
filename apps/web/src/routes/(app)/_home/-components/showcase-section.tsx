import { useRef } from "react";

const SCREENS = [
	{
		label: "Authentication",
		caption: "OTP, OAuth, protected routes",
		preview: (
			<div className="flex h-full">
				<div className="flex w-2/5 flex-col justify-end bg-foreground p-5">
					<div className="mb-2 h-1 w-8 rounded-sm bg-background/20" />
					<div className="mb-2 h-6 w-28 rounded-sm bg-background/80" />
					<div className="h-3 w-20 rounded-sm bg-background/30" />
				</div>
				<div className="flex flex-1 flex-col justify-center gap-3 bg-card p-5">
					<div className="h-3 w-16 rounded-sm bg-foreground/60" />
					<div className="h-9 w-full rounded-sm bg-secondary ring-1 ring-border/40" />
					<div className="h-9 w-full rounded-sm bg-foreground" />
					<div className="mt-1 h-2 w-32 rounded-sm bg-border/60" />
				</div>
			</div>
		)
	},
	{
		label: "Dashboard",
		caption: "RBAC, sessions, user management",
		preview: (
			<div className="flex h-full">
				<div className="flex w-14 flex-col gap-3 bg-foreground p-3">
					<div className="h-5 w-5 rounded-sm bg-background/30" />
					<div className="mt-1 flex flex-col gap-2">
						<div className="h-2.5 w-7 rounded-sm bg-background/20" />
						<div className="h-2.5 w-7 rounded-sm bg-background/20" />
						<div className="h-2.5 w-7 rounded-sm bg-primary/50" />
						<div className="h-2.5 w-7 rounded-sm bg-background/20" />
						<div className="h-2.5 w-7 rounded-sm bg-background/20" />
					</div>
				</div>
				<div className="flex flex-1 flex-col gap-3 bg-card p-4">
					<div className="h-3 w-24 rounded-sm bg-foreground/50" />
					<div className="grid grid-cols-3 gap-2">
						<div className="h-12 rounded-sm bg-secondary ring-1 ring-border/40" />
						<div className="h-12 rounded-sm bg-secondary ring-1 ring-border/40" />
						<div className="h-12 rounded-sm bg-secondary ring-1 ring-border/40" />
					</div>
					<div className="flex flex-col gap-1.5">
						<div className="h-2 w-full rounded-sm bg-border/60" />
						<div className="h-2 w-4/5 rounded-sm bg-border/40" />
						<div className="h-2 w-3/4 rounded-sm bg-border/40" />
					</div>
				</div>
			</div>
		)
	},
	{
		label: "Billing",
		caption: "Subscriptions, webhooks, invoices",
		preview: (
			<div className="flex h-full flex-col bg-card p-5">
				<div className="mb-4 h-3 w-20 rounded-sm bg-foreground/50" />
				<div className="mb-3 flex items-center justify-between rounded-sm bg-secondary px-3 py-2.5 ring-1 ring-border/40">
					<div className="h-2 w-20 rounded-sm bg-foreground/40" />
					<div className="h-6 w-16 rounded-sm bg-foreground" />
				</div>
				<div className="flex flex-col gap-2.5">
					{[1, 2, 3].map((i) => (
						<div
							key={i}
							className="flex items-center gap-3 border-b border-border/20 pb-2"
						>
							<div className="h-2 w-2 shrink-0 rounded-full bg-primary/60" />
							<div className="h-2 flex-1 rounded-sm bg-foreground/20" />
							<div className="h-2 w-12 rounded-sm bg-foreground/30" />
						</div>
					))}
				</div>
			</div>
		)
	},
	{
		label: "Blog & Docs",
		caption: "MDX engine, SEO, content management",
		preview: (
			<div className="flex h-full flex-col bg-card p-5">
				<div className="mb-3 flex items-center gap-2">
					<div className="h-2 w-10 rounded-full bg-secondary ring-1 ring-border/40" />
					<div className="h-2 w-10 rounded-full bg-secondary ring-1 ring-border/40" />
					<div className="h-2 w-10 rounded-full bg-foreground" />
				</div>
				<div className="h-4 w-3/4 rounded-sm bg-foreground/70" />
				<div className="mt-2 flex flex-col gap-1.5">
					<div className="h-2 w-full rounded-sm bg-border/60" />
					<div className="h-2 w-full rounded-sm bg-border/50" />
					<div className="h-2 w-4/5 rounded-sm bg-border/50" />
				</div>
				<div className="mt-4 flex items-center gap-2">
					<div className="h-6 w-6 rounded-full bg-secondary ring-1 ring-border/40" />
					<div className="h-2 w-20 rounded-sm bg-foreground/30" />
				</div>
			</div>
		)
	},
	{
		label: "AI Agents",
		caption: "CLAUDE.md, MCP tools, task context",
		preview: (
			<div className="flex h-full flex-col bg-foreground p-5">
				<div className="mb-3 h-2 w-16 rounded-sm bg-background/30" />
				<div className="flex flex-col gap-2">
					<div className="flex gap-2">
						<div className="h-5 w-5 shrink-0 rounded-sm bg-background/20" />
						<div className="flex flex-1 flex-col gap-1">
							<div className="h-2 w-full rounded-sm bg-background/40" />
							<div className="h-2 w-4/5 rounded-sm bg-background/30" />
						</div>
					</div>
					<div className="flex gap-2">
						<div className="h-5 w-5 shrink-0 rounded-sm bg-primary/40" />
						<div className="flex flex-1 flex-col gap-1">
							<div className="h-2 w-full rounded-sm bg-background/40" />
							<div className="h-2 w-2/3 rounded-sm bg-background/30" />
						</div>
					</div>
				</div>
				<div className="mt-auto flex items-center gap-2 rounded-sm bg-background/10 px-3 py-2">
					<div className="h-2 flex-1 rounded-sm bg-background/20" />
					<div className="h-4 w-4 rounded-sm bg-primary/50" />
				</div>
			</div>
		)
	},
	{
		label: "Storage & Email",
		caption: "R2 uploads, Resend templates, routing",
		preview: (
			<div className="flex h-full flex-col gap-3 bg-card p-5">
				<div className="flex items-center justify-between">
					<div className="h-3 w-16 rounded-sm bg-foreground/50" />
					<div className="h-6 w-20 rounded-sm bg-secondary ring-1 ring-border/40" />
				</div>
				<div className="grid grid-cols-3 gap-2">
					{[1, 2, 3, 4, 5, 6].map((i) => (
						<div
							key={i}
							className="aspect-square rounded-sm bg-secondary ring-1 ring-border/30"
						/>
					))}
				</div>
				<div className="mt-auto h-2 w-28 rounded-sm bg-border/50" />
			</div>
		)
	}
];

export function ShowcaseSection() {
	const scrollRef = useRef<HTMLDivElement>(null);

	const scroll = (dir: "left" | "right") => {
		const el = scrollRef.current;
		if (!el) return;
		el.scrollBy({ left: dir === "right" ? 340 : -340, behavior: "smooth" });
	};

	return (
		<section className="border-b border-border/40 py-16">
			{/* Header + nav buttons */}
			<div className="mb-6 flex items-end justify-between">
				<div>
					<p className="mb-1 text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
						What you get on day one
					</p>
					<h2
						className="font-heading font-medium text-foreground"
						style={{
							fontSize: "clamp(1.8rem, 4vw, 2.4rem)",
							letterSpacing: "-0.04em",
							lineHeight: "1.05"
						}}
					>
						Every screen, pre-built.
					</h2>
				</div>

				<div className="flex items-center gap-2">
					<button
						onClick={() => scroll("left")}
						aria-label="Scroll left"
						className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-foreground transition-all hover:bg-secondary active:scale-95"
					>
						<svg
							width="14"
							height="14"
							viewBox="0 0 14 14"
							fill="none"
							aria-hidden
						>
							<path
								d="M9 2L4 7l5 5"
								stroke="currentColor"
								strokeWidth="1.5"
								strokeLinecap="round"
								strokeLinejoin="round"
							/>
						</svg>
					</button>
					<button
						onClick={() => scroll("right")}
						aria-label="Scroll right"
						className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-foreground transition-all hover:bg-secondary active:scale-95"
					>
						<svg
							width="14"
							height="14"
							viewBox="0 0 14 14"
							fill="none"
							aria-hidden
						>
							<path
								d="M5 2l5 5-5 5"
								stroke="currentColor"
								strokeWidth="1.5"
								strokeLinecap="round"
								strokeLinejoin="round"
							/>
						</svg>
					</button>
				</div>
			</div>

			{/* Scrollable strip */}
			<div
				ref={scrollRef}
				className="flex gap-2 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
				style={{ scrollSnapType: "x mandatory" }}
			>
				{SCREENS.map(({ label, caption, preview }) => (
					<div
						key={label}
						className="w-[340px] shrink-0 rounded-xl bg-secondary p-2 sm:w-[440px]"
						style={{ scrollSnapAlign: "start" }}
					>
						<div className="overflow-hidden rounded-lg bg-card">
							<div className="aspect-[14/9] overflow-hidden">
								{preview}
							</div>
							<div className="border-t border-border/30 px-4 py-3">
								<p
									className="text-sm font-medium text-foreground"
									style={{ letterSpacing: "-0.01em" }}
								>
									{label}
								</p>
								<p
									className="mt-0.5 text-[11px] text-muted-foreground"
									style={{ letterSpacing: "-0.01em" }}
								>
									{caption}
								</p>
							</div>
						</div>
					</div>
				))}
			</div>
		</section>
	);
}

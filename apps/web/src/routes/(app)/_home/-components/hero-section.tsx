import { Link } from "@tanstack/react-router";
import { Button } from "@workspace/ui";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon, FlashIcon } from "@hugeicons/core-free-icons";

const TERMINAL_LINES = [
	{ prefix: "$", text: "pnpm create tanship my-saas", type: "cmd" },
	{ prefix: "✓", text: "Auth configured (Better Auth + Google)", type: "ok" },
	{ prefix: "✓", text: "Payments wired (Dodo Payments)", type: "ok" },
	{ prefix: "✓", text: "Edge DB ready (Cloudflare D1)", type: "ok" },
	{ prefix: "✓", text: "UI components installed (shadcn/ui)", type: "ok" },
	{ prefix: "$", text: "pnpm dev", type: "cmd" },
	{ prefix: "▸", text: "Ready on http://localhost:3000", type: "ready" }
];

export function HeroSection() {
	return (
		<section className="flex flex-col gap-20 pb-20 pt-28 sm:flex-row sm:items-center sm:gap-12">
			{/* Left: copy */}
			<div className="flex flex-col gap-8 sm:flex-1">
				<div className="inline-flex w-fit items-center gap-2 rounded-full border border-border/50 bg-muted/30 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
					<HugeiconsIcon
						icon={FlashIcon}
						className="size-3 text-foreground"
					/>
					v1.0 — Now Live
				</div>

				<div className="flex flex-col gap-4">
					<h1 className="text-balance text-5xl font-semibold leading-[1.08] tracking-tight text-foreground sm:text-6xl">
						Build your next
						<br />
						idea, faster.
					</h1>
					<p className="max-w-sm text-balance text-base leading-relaxed text-muted-foreground">
						Stop wiring auth, payments, and databases from scratch.
						Get a production-ready edge foundation in seconds.
					</p>
				</div>

				<div className="flex flex-wrap items-center gap-3">
					<Button
						size="lg"
						className="h-11 rounded-none bg-foreground px-6 text-sm font-medium text-background hover:bg-foreground/90"
						asChild
					>
						<Link to="/login">
							Start Building
							<HugeiconsIcon
								icon={ArrowRight01Icon}
								className="ml-2 size-4"
							/>
						</Link>
					</Button>
					<Button
						variant="ghost"
						size="lg"
						className="h-11 rounded-none border border-border/50 px-6 text-sm font-medium text-foreground hover:bg-muted/30"
						asChild
					>
						<a href="/docs">Explore Docs</a>
					</Button>
				</div>
			</div>

			{/* Right: terminal mockup */}
			<div className="relative w-full sm:w-[340px] sm:flex-none">
				<div className="overflow-hidden border border-border/60 bg-background shadow-lg dark:bg-muted/10">
					{/* Title bar */}
					<div className="flex items-center gap-2 border-b border-border/40 bg-muted/20 px-4 py-3">
						<span className="h-2.5 w-2.5 rounded-full bg-red-400/70" />
						<span className="h-2.5 w-2.5 rounded-full bg-yellow-400/70" />
						<span className="h-2.5 w-2.5 rounded-full bg-green-400/70" />
						<span className="ml-2 font-mono text-[10px] text-muted-foreground">
							terminal
						</span>
					</div>
					{/* Lines */}
					<div className="flex flex-col gap-1.5 p-4 font-mono text-[11px]">
						{TERMINAL_LINES.map((line, i) => (
							<div key={i} className="flex gap-2">
								<span
									className={
										line.type === "ok"
											? "text-emerald-500"
											: line.type === "ready"
												? "text-blue-400"
												: "text-muted-foreground"
									}
								>
									{line.prefix}
								</span>
								<span
									className={
										line.type === "cmd"
											? "text-foreground"
											: "text-muted-foreground"
									}
								>
									{line.text}
								</span>
							</div>
						))}
						<div className="mt-1 flex items-center gap-2">
							<span className="text-muted-foreground">$</span>
							<span className="inline-block h-3.5 w-0.5 animate-pulse bg-foreground/70" />
						</div>
					</div>
				</div>
				{/* Decorative glow */}
				<div className="pointer-events-none absolute -inset-px -z-10 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-40 blur-xl" />
			</div>
		</section>
	);
}

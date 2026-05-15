import {
	TanstackIcon,
	CloudflareIcon,
	OXCIcon,
	DodoPaymentIcon,
	HonoIcon,
	DrizzleIcon,
	TailwindIcon,
	BetterAuthIcon
} from "../../../-components/icons";

export function TechStackSection() {
	return (
		<section className="py-20 border-b border-border/40">
			<div className="text-center mb-16">
				<h2 className="text-3xl font-semibold tracking-tight text-foreground mb-4">
					Build with the best tech stack
				</h2>
				<p className="text-muted-foreground text-lg max-w-2xl mx-auto">
					Use the latest industry-standard tech stack for your next
					project, optimized for performance and cost.
				</p>
			</div>

			<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
				{[
					{
						name: "TanStack Start",
						desc: "The most popular type-safe full-stack React framework.",
						icon: (
							<TanstackIcon className="size-5 text-foreground" />
						)
					},
					{
						name: "Cloudflare",
						desc: "Complete edge infrastructure including Workers, D1, R2, and more.",
						icon: (
							<CloudflareIcon className="size-5 text-foreground" />
						)
					},
					{
						name: "OXC",
						desc: "The Oxidation Compiler. A collection of high-performance tools for JS and TS.",
						icon: <OXCIcon className="size-5 text-foreground" />
					},
					{
						name: "Better Auth",
						desc: "The most comprehensive open source authentication library.",
						icon: (
							<BetterAuthIcon className="size-5 text-foreground" />
						)
					},
					{
						name: "Drizzle ORM",
						desc: "Lightweight, performant, and headless TypeScript ORM.",
						icon: <DrizzleIcon className="size-5 text-foreground" />
					},
					{
						name: "Dodo Payments",
						desc: "Global payment processing and billing infrastructure.",
						icon: (
							<DodoPaymentIcon className="size-5 text-foreground" />
						)
					},
					{
						name: "Hono",
						desc: "Ultrafast, lightweight, edge-native web framework.",
						icon: <HonoIcon className="size-5 text-foreground" />
					},
					{
						name: "Tailwind CSS v4",
						desc: "The utility-first CSS framework for rapid UI development.",
						icon: (
							<TailwindIcon className="size-5 text-foreground" />
						)
					}
				].map((tech) => (
					<div
						key={tech.name}
						className="border border-border/50 bg-muted/5 hover:bg-muted/10 transition-colors p-6 rounded-none flex flex-col gap-3 group"
					>
						<div className="flex items-center gap-3">
							<div className="p-2 bg-background border border-border/50 rounded-none group-hover:border-foreground/30 transition-colors">
								{tech.icon}
							</div>
							<span className="font-semibold text-sm text-foreground">
								{tech.name}
							</span>
						</div>
						<p className="text-xs text-muted-foreground leading-relaxed">
							{tech.desc}
						</p>
					</div>
				))}
			</div>
		</section>
	);
}

const TESTIMONIALS = [
	{
		quote: "This boilerplate saved me at least 3 weeks of development time. The integration between Better Auth and Dodo Payments is flawless. Best investment I've made this year.",
		name: "Sarah Jenkins",
		role: "Founder, IndieLog",
		initials: "SJ"
	},
	{
		quote: "Finally a boilerplate that uses Cloudflare Workers! The edge performance is insane, and the D1 setup is exactly what I needed. Highly recommend for any solo dev.",
		name: "Mark T.",
		role: "Full Stack Developer",
		initials: "MT"
	},
	{
		quote: "The Gate policy system and RBAC setup alone saved me days of architecture work. The codebase is production-grade and the Claude rules mean AI just... works.",
		name: "Priya N.",
		role: "Indie Hacker",
		initials: "PN"
	},
	{
		quote: "Deployed to Cloudflare in under 10 minutes. The type safety end-to-end — from Hono RPC to TanStack Router — is something I've never had out of the box before.",
		name: "Lucas R.",
		role: "Software Engineer",
		initials: "LR"
	}
];

export function TestimonialsSection() {
	return (
		<section className="border-b border-border/40 py-20">
			<div className="mb-14">
				<h2 className="mb-3 text-3xl font-semibold tracking-tight text-foreground">
					Loved by builders.
				</h2>
				<p className="max-w-md text-base text-muted-foreground">
					Don't just take our word for it — here's what people are
					shipping.
				</p>
			</div>

			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
				{TESTIMONIALS.map((t) => (
					<div
						key={t.name}
						className="flex flex-col gap-6 border border-border/50 bg-background p-7 transition-colors hover:border-border dark:bg-muted/5"
					>
						{/* Quote marks */}
						<div className="text-3xl font-serif leading-none text-muted-foreground/30 select-none">
							"
						</div>
						<p className="flex-1 text-sm leading-relaxed text-foreground">
							{t.quote}
						</p>
						<div className="flex items-center gap-3 border-t border-border/30 pt-5">
							<div className="flex h-9 w-9 items-center justify-center bg-foreground text-[11px] font-bold text-background">
								{t.initials}
							</div>
							<div>
								<div className="text-sm font-semibold text-foreground">
									{t.name}
								</div>
								<div className="text-xs text-muted-foreground">
									{t.role}
								</div>
							</div>
						</div>
					</div>
				))}
			</div>
		</section>
	);
}

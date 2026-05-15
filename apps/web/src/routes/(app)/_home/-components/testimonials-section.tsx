export function TestimonialsSection() {
	return (
		<section className="py-20 border-b border-border/40">
			<div className="mb-12">
				<h2 className="text-3xl font-semibold tracking-tight text-foreground mb-4">
					Loved by builders.
				</h2>
				<p className="text-muted-foreground text-lg max-w-xl">
					Don't just take our word for it. See what others are saying.
				</p>
			</div>
			<div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
				<div className="border border-border/50 p-8 bg-muted/10 rounded-none hover:bg-muted/30 transition-colors">
					<p className="text-sm text-foreground leading-relaxed mb-8">
						"This boilerplate saved me at least 3 weeks of
						development time. The integration between Better Auth
						and Dodo Payments is flawless. Best investment I've made
						this year."
					</p>
					<div className="flex items-center gap-3">
						<div className="w-10 h-10 bg-foreground text-background flex items-center justify-center font-bold rounded-none">
							S
						</div>
						<div>
							<div className="text-sm font-semibold text-foreground">
								Sarah Jenkins
							</div>
							<div className="text-xs text-muted-foreground">
								Founder, IndieLog
							</div>
						</div>
					</div>
				</div>
				<div className="border border-border/50 p-8 bg-muted/10 rounded-none hover:bg-muted/30 transition-colors">
					<p className="text-sm text-foreground leading-relaxed mb-8">
						"Finally a boilerplate that uses Cloudflare Workers! The
						edge performance is insane, and the D1 setup is exactly
						what I needed. Highly recommend for any solo dev."
					</p>
					<div className="flex items-center gap-3">
						<div className="w-10 h-10 bg-foreground text-background flex items-center justify-center font-bold rounded-none">
							M
						</div>
						<div>
							<div className="text-sm font-semibold text-foreground">
								Mark T.
							</div>
							<div className="text-xs text-muted-foreground">
								Full Stack Developer
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}

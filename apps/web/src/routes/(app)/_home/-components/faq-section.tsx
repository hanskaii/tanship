export function FaqSection() {
	return (
		<section className="py-20 border-b border-border/40">
			<div className="mb-12">
				<h2 className="text-3xl font-semibold tracking-tight text-foreground mb-4">
					Frequently Asked Questions
				</h2>
			</div>
			<div className="space-y-6">
				<div className="border border-border/50 p-6 bg-background rounded-none">
					<h3 className="text-base font-semibold text-foreground mb-2">
						What exactly is Tanship?
					</h3>
					<p className="text-sm text-muted-foreground leading-relaxed">
						Tanship is a full-stack SaaS Starter Kit — a premium,
						edge-ready codebase that you can use to build your SaaS
						product. It includes authentication, billing,
						organizations, and a beautiful UI out of the box.
					</p>
				</div>
				<div className="border border-border/50 p-6 bg-background rounded-none">
					<h3 className="text-base font-semibold text-foreground mb-2">
						Why should I buy Tanship instead of another Boilerplate?
					</h3>
					<p className="text-sm text-muted-foreground leading-relaxed">
						Purchasing a Tanship license is an investment in a
						production-grade foundation. We focus heavily on modern
						edge infrastructure (Cloudflare, TanStack, Hono) giving
						you insane performance and zero vendor lock-in. Think of
						us as your technical co-founder.
					</p>
				</div>
				<div className="border border-border/50 p-6 bg-background rounded-none">
					<h3 className="text-base font-semibold text-foreground mb-2">
						I don't know how to code. Should I buy Tanship?
					</h3>
					<p className="text-sm text-muted-foreground leading-relaxed">
						No. Tanship is a product for developers and requires
						programming knowledge. AI can help, but you will need to
						understand the underlying technologies (React,
						TypeScript).
					</p>
				</div>
				<div className="border border-border/50 p-6 bg-background rounded-none">
					<h3 className="text-base font-semibold text-foreground mb-2">
						Can I use this for unlimited client projects?
					</h3>
					<p className="text-sm text-muted-foreground leading-relaxed">
						Yes! The Developer License allows you to build and
						deploy as many personal or client projects as you want.
						You just cannot resell the boilerplate itself.
					</p>
				</div>
				<div className="border border-border/50 p-6 bg-background rounded-none">
					<h3 className="text-base font-semibold text-foreground mb-2">
						How hard is it to deploy?
					</h3>
					<p className="text-sm text-muted-foreground leading-relaxed">
						We use Cloudflare Workers. Deployment is as simple as
						running `npm run deploy`. Your database (D1) and storage
						(R2) are automatically provisioned via Wrangler.
					</p>
				</div>
				<div className="border border-border/50 p-6 bg-background rounded-none">
					<h3 className="text-base font-semibold text-foreground mb-2">
						Do I need to pay monthly for the tech stack?
					</h3>
					<p className="text-sm text-muted-foreground leading-relaxed">
						No. Cloudflare offers a very generous free tier. Better
						Auth is open-source. Dodo Payments only takes a small
						fee per transaction. Your running costs are virtually
						zero until you scale.
					</p>
				</div>
				<div className="border border-border/50 p-6 bg-background rounded-none">
					<h3 className="text-base font-semibold text-foreground mb-2">
						How is the codebase distributed?
					</h3>
					<p className="text-sm text-muted-foreground leading-relaxed">
						You will receive an invite to the private GitHub
						repositories immediately after purchase. Enter your
						GitHub username in the activation portal, and you'll get
						instant access.
					</p>
				</div>
				<div className="border border-border/50 p-6 bg-background rounded-none">
					<h3 className="text-base font-semibold text-foreground mb-2">
						What level of support do you offer?
					</h3>
					<p className="text-sm text-muted-foreground leading-relaxed">
						We provide priority email support for all Pro customers
						and community support via Discord for everyone. We'll
						help you with any questions setting up the product or
						clarifying doubts about the codebase.
					</p>
				</div>
				<div className="border border-border/50 p-6 bg-background rounded-none">
					<h3 className="text-base font-semibold text-foreground mb-2">
						Can I get a refund?
					</h3>
					<p className="text-sm text-muted-foreground leading-relaxed">
						Due to the non-returnable nature of the source code, we
						generally cannot offer refunds once access is redeemed.
						If you have questions before buying, feel free to reach
						out to our support.
					</p>
				</div>
				<div className="border border-border/50 p-6 bg-background rounded-none">
					<h3 className="text-base font-semibold text-foreground mb-2">
						For how long can I get updates?
					</h3>
					<p className="text-sm text-muted-foreground leading-relaxed">
						Forever. Purchasing a license gives you lifetime access
						to updates for the stack you purchased.
					</p>
				</div>
			</div>
		</section>
	);
}

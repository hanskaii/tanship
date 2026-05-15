import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger
} from "@workspace/ui";

const FAQS = [
	{
		q: "What exactly is Tanship?",
		a: "Tanship is a full-stack SaaS Starter Kit — a premium, edge-ready codebase that you can use to build your SaaS product. It includes authentication, billing, organizations, and a beautiful UI out of the box."
	},
	{
		q: "Why should I buy Tanship instead of another boilerplate?",
		a: "Purchasing a Tanship license is an investment in a production-grade foundation. We focus heavily on modern edge infrastructure (Cloudflare, TanStack, Hono) giving you insane performance and zero vendor lock-in. Think of us as your technical co-founder."
	},
	{
		q: "I don't know how to code. Should I buy Tanship?",
		a: "No. Tanship is a product for developers and requires programming knowledge. AI can help, but you will need to understand the underlying technologies (React, TypeScript)."
	},
	{
		q: "Can I use this for unlimited client projects?",
		a: "Yes! The Developer License allows you to build and deploy as many personal or client projects as you want. You just cannot resell the boilerplate itself."
	},
	{
		q: "How hard is it to deploy?",
		a: "We use Cloudflare Workers. Deployment is as simple as running `pnpm deploy`. Your database (D1) and storage (R2) are automatically provisioned via Wrangler."
	},
	{
		q: "Do I need to pay monthly for the tech stack?",
		a: "No. Cloudflare offers a very generous free tier. Better Auth is open-source. Dodo Payments only takes a small fee per transaction. Your running costs are virtually zero until you scale."
	},
	{
		q: "How is the codebase distributed?",
		a: "You will receive an invite to the private GitHub repositories immediately after purchase. Enter your GitHub username in the activation portal, and you'll get instant access."
	},
	{
		q: "What level of support do you offer?",
		a: "We provide priority email support for all Pro customers and community support via Discord for everyone. We'll help you with any questions setting up the product or clarifying doubts about the codebase."
	},
	{
		q: "Can I get a refund?",
		a: "Due to the non-returnable nature of the source code, we generally cannot offer refunds once access is redeemed. If you have questions before buying, feel free to reach out to our support."
	},
	{
		q: "For how long can I get updates?",
		a: "Forever. Purchasing a license gives you lifetime access to updates for the stack you purchased."
	}
];

export function FaqSection() {
	return (
		<section className="border-b border-border/40 py-20">
			<div className="mb-14">
				<h2 className="mb-3 text-3xl font-semibold tracking-tight text-foreground">
					Frequently asked questions
				</h2>
				<p className="max-w-md text-base text-muted-foreground">
					Everything you need to know before you buy.
				</p>
			</div>

			<Accordion
				type="single"
				collapsible
				className="flex flex-col gap-0"
			>
				{FAQS.map((faq, i) => (
					<AccordionItem
						key={i}
						value={`faq-${i}`}
						className="border-b border-border/40 last:border-b-0"
					>
						<AccordionTrigger className="py-5 text-sm font-semibold text-foreground hover:no-underline text-left">
							{faq.q}
						</AccordionTrigger>
						<AccordionContent className="pb-5 text-sm leading-relaxed text-muted-foreground">
							{faq.a}
						</AccordionContent>
					</AccordionItem>
				))}
			</Accordion>
		</section>
	);
}

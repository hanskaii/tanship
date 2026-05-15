import { createFileRoute, Link } from "@tanstack/react-router";
import { Badge } from "@workspace/ui";
import { HugeiconsIcon } from "@hugeicons/react";
import {
	Book02Icon,
	TelegramIcon,
	GithubIcon,
	Mail01Icon,
	MessageQuestionIcon,
	ArrowRight01Icon
} from "@hugeicons/core-free-icons";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger
} from "@workspace/ui";

export const Route = createFileRoute("/(app)/_home/contact")({
	component: ContactPage
});

const CONTACT_CARDS = [
	{
		title: "Documentation",
		description: "Step-by-step guides, API reference, and setup tutorials.",
		icon: Book02Icon,
		href: "/docs",
		isExternal: true,
		cta: "Browse docs"
	},
	{
		title: "Telegram",
		description: "Join our community — fastest way to reach the team.",
		icon: TelegramIcon,
		href: "https://t.me/hudasaja",
		isExternal: true,
		cta: "Open Telegram"
	},
	{
		title: "GitHub",
		description: "Open an issue, browse the roadmap, or contribute code.",
		icon: GithubIcon,
		href: "https://github.com/hudasaja",
		isExternal: true,
		cta: "View GitHub"
	}
];

const FAQS = [
	{
		q: "How do I get an API Key?",
		a: "You can generate and manage your API keys in your Account Settings under the API Keys tab. Make sure to keep your secret keys safe."
	},
	{
		q: "Is there a rate limit for the API?",
		a: "Yes, our public API has a rate limit of 100 requests per minute per API key to ensure stability for all users."
	},
	{
		q: "Where can I find the full documentation?",
		a: "Our comprehensive API reference is available on the /docs page, featuring guides, examples, and a full API reference."
	}
];

function ContactCard({
	title,
	description,
	icon,
	href,
	isExternal,
	cta
}: (typeof CONTACT_CARDS)[number]) {
	const Inner = (
		<div className="group flex h-full flex-col gap-5 border border-border/50 bg-background p-7 transition-all hover:border-border dark:bg-muted/5">
			<div className="flex h-11 w-11 items-center justify-center border border-border/50 bg-muted/20 transition-colors group-hover:border-foreground/20">
				<HugeiconsIcon
					icon={icon}
					className="size-5 text-foreground/80"
				/>
			</div>
			<div className="flex flex-col gap-1.5 flex-1">
				<h3 className="text-sm font-semibold tracking-tight text-foreground">
					{title}
				</h3>
				<p className="text-xs leading-relaxed text-muted-foreground">
					{description}
				</p>
			</div>
			<div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
				{cta}
				<HugeiconsIcon
					icon={ArrowRight01Icon}
					className="size-3.5 transition-transform group-hover:translate-x-0.5"
				/>
			</div>
		</div>
	);

	if (isExternal) {
		return (
			<a
				href={href}
				target="_blank"
				rel="noreferrer"
				className="block h-full"
			>
				{Inner}
			</a>
		);
	}

	return (
		<Link to={href} className="block h-full">
			{Inner}
		</Link>
	);
}

function ContactPage() {
	return (
		<div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col items-center px-4 pb-32 pt-24 sm:px-6">
			{/* Header */}
			<div className="mb-16 flex flex-col items-center gap-4 text-center">
				<Badge
					variant="outline"
					className="mx-auto w-fit rounded-full border-border/50 bg-muted/30 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-foreground"
				>
					Support
				</Badge>
				<h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
					How can we help?
				</h1>
				<p className="max-w-sm text-balance text-base leading-relaxed text-muted-foreground">
					Questions about setup, billing, or the roadmap? We're here
					to help you ship faster.
				</p>
			</div>

			{/* Contact cards */}
			<div className="mb-24 grid w-full grid-cols-1 gap-4 sm:grid-cols-3">
				{CONTACT_CARDS.map((card) => (
					<ContactCard key={card.title} {...card} />
				))}
			</div>

			{/* FAQ */}
			<div className="w-full border-t border-border/40 pt-16">
				<div className="mb-10 flex flex-col items-center gap-3 text-center">
					<div className="flex h-10 w-10 items-center justify-center bg-muted/30">
						<HugeiconsIcon
							icon={MessageQuestionIcon}
							className="size-5 text-foreground"
						/>
					</div>
					<h2 className="text-2xl font-semibold tracking-tight text-foreground">
						Frequently asked questions
					</h2>
					<p className="text-sm text-muted-foreground">
						Quick answers to common questions about Tanship.
					</p>
				</div>

				<Accordion
					type="single"
					collapsible
					className="w-full max-w-2xl mx-auto"
				>
					{FAQS.map((faq, i) => (
						<AccordionItem
							key={i}
							value={`faq-${i}`}
							className="border-b border-border/40 last:border-b-0"
						>
							<AccordionTrigger className="py-4 text-sm font-semibold text-foreground hover:no-underline text-left">
								{faq.q}
							</AccordionTrigger>
							<AccordionContent className="pb-4 text-sm leading-relaxed text-muted-foreground">
								{faq.a}
							</AccordionContent>
						</AccordionItem>
					))}
				</Accordion>

				{/* Still need help CTA */}
				<div className="mt-10 flex w-full max-w-2xl mx-auto flex-col items-center gap-4 border border-border/50 bg-muted/5 p-10 text-center dark:bg-muted/10">
					<h3 className="text-sm font-semibold text-foreground">
						Still have questions?
					</h3>
					<p className="text-xs text-muted-foreground">
						We're available via email for more formal inquiries.
					</p>
					<a
						href="mailto:support@tanship.com"
						className="mt-1 flex items-center gap-2 text-sm font-semibold text-foreground transition-colors hover:text-foreground/70"
					>
						<HugeiconsIcon icon={Mail01Icon} className="size-4" />
						support@tanship.com
					</a>
				</div>
			</div>
		</div>
	);
}

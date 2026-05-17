import { createFileRoute, Link } from "@tanstack/react-router";
import { Badge } from "@workspace/ui";
import { HugeiconsIcon } from "@hugeicons/react";
import {
	Book02Icon,
	TelegramIcon,
	Mail01Icon,
	ArrowRight01Icon
} from "@hugeicons/core-free-icons";
import { appConfig } from "@workspace/config";
import { FaqSection } from "../-components/faq-section";
import { FooterSection } from "../-components/footer-section";
import { Fragment } from "react/jsx-runtime";

export const Route = createFileRoute("/(app)/_home/contact/")({
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
		title: "Email Support",
		description:
			"Need private or detailed help? Send us an email directly.",
		icon: Mail01Icon,
		href: `mailto:${appConfig.supportEmail}`,
		isExternal: true,
		cta: "Send email"
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
		<div className="group flex h-full flex-col gap-5 rounded-xl bg-card p-7 transition-all hover:bg-card/80">
			<div className="flex size-11 items-center justify-center rounded-xl bg-secondary group-hover:bg-background transition-colors">
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
			<div className="mt-2 flex h-11 w-full items-center justify-center gap-2 rounded-md bg-foreground text-sm font-medium text-background transition-colors group-hover:bg-foreground/90 group-active:translate-y-px">
				{cta}
				<HugeiconsIcon
					icon={ArrowRight01Icon}
					className="size-4 transition-transform group-hover:translate-x-0.5"
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
		<Fragment>
			<main className="px-4 sm:px-6 pb-32 pt-24">
				<div className="mb-16 flex flex-col items-center gap-4 text-center">
					<div className="flex items-center gap-2">
						<div className="h-1.5 w-1.5 rounded-full bg-primary" />
						<span className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
							Support
						</span>
					</div>
					<h1
						className="font-heading font-medium text-foreground"
						style={{
							fontSize: "clamp(2rem, 5vw, 3rem)",
							letterSpacing: "-0.04em",
							lineHeight: "1.05"
						}}
					>
						How can we help?
					</h1>
					<p
						className="max-w-sm text-balance text-base leading-relaxed text-muted-foreground"
						style={{ letterSpacing: "-0.01em" }}
					>
						Questions about setup, billing, or the roadmap? We're
						here to help you ship faster.
					</p>
				</div>

				<div className="mb-24 w-full rounded-2xl bg-secondary p-2">
					<div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
						{CONTACT_CARDS.map((card) => (
							<ContactCard key={card.title} {...card} />
						))}
					</div>
				</div>

				<FaqSection />
			</main>
			<FooterSection />
		</Fragment>
	);
}

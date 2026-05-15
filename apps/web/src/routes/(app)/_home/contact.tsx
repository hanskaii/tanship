import { createFileRoute, Link } from "@tanstack/react-router";
import {
	Badge,
	Card,
	CardHeader,
	CardTitle,
	CardDescription
} from "@workspace/ui";
import { HugeiconsIcon } from "@hugeicons/react";
import {
	Book02Icon,
	TelegramIcon,
	GithubIcon,
	Mail01Icon,
	MessageQuestionIcon
} from "@hugeicons/core-free-icons";

export const Route = createFileRoute("/(app)/_home/contact")({
	component: ContactPage
});

function ContactCard({
	title,
	description,
	icon,
	href,
	isExternal = false
}: {
	title: string;
	description: string;
	icon: any;
	href: string;
	isExternal?: boolean;
}) {
	const Content = (
		<div className="flex flex-col items-center bg-background border border-border/50 hover:bg-muted/10 transition-all cursor-pointer group h-full rounded-none p-6">
			<div className="flex flex-col items-center text-center gap-3">
				<div className="w-12 h-12 rounded-none bg-muted/30 border border-border/50 flex items-center justify-center shadow-sm transition-transform group-hover:scale-105">
					<HugeiconsIcon
						icon={icon}
						className="size-5 text-foreground/80"
					/>
				</div>
				<div className="flex flex-col gap-1.5 mt-2">
					<h3 className="text-sm font-semibold tracking-tight">
						{title}
					</h3>
					<p className="text-xs leading-relaxed text-muted-foreground px-2">
						{description}
					</p>
				</div>
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
				{Content}
			</a>
		);
	}

	return (
		<Link to={href} className="block h-full">
			{Content}
		</Link>
	);
}

const faqs = [
	{
		question: "How do I get an API Key?",
		answer: "You can generate and manage your API keys in your Account Settings under the API Keys tab. Make sure to keep your secret keys safe."
	},
	{
		question: "Is there a rate limit for the API?",
		answer: "Yes, our public API has a rate limit of 100 requests per minute per API key to ensure stability."
	},
	{
		question: "Where can I find the full documentation?",
		answer: "Our comprehensive API reference is available on the /docs page, featuring guides and examples."
	}
];

function ContactPage() {
	return (
		<div className="flex flex-col items-center w-full max-w-3xl mx-auto px-4 sm:px-6 pt-24 pb-32 min-h-screen">
			<div className="flex flex-col gap-4 text-center mb-20">
				<Badge
					variant="outline"
					className="w-fit mx-auto rounded-full px-3 py-1 bg-muted/30 text-foreground border-border/50 text-[10px] uppercase tracking-widest font-bold"
				>
					Support
				</Badge>
				<h1 className="text-4xl sm:text-5xl font-semibold tracking-tight">
					How can we help?
				</h1>
				<p className="text-muted-foreground text-base max-w-md mx-auto leading-relaxed text-balance mt-2">
					Questions about setup, billing, or roadmap? We're here to
					help you build faster.
				</p>
			</div>

			<div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full mb-28">
				<ContactCard
					title="Documentation"
					description="Guides, API reference, and more."
					icon={Book02Icon}
					href="/docs"
				/>
				<ContactCard
					title="Telegram"
					description="Fastest way to reach the team."
					icon={TelegramIcon}
					href="https://t.me/hudasaja"
					isExternal
				/>
				<ContactCard
					title="GitHub"
					description="Open issues or contribute code."
					icon={GithubIcon}
					href="https://github.com/hudasaja"
					isExternal
				/>
			</div>

			<div className="flex flex-col items-center gap-12 w-full pt-16 border-t border-border/40">
				<div className="flex flex-col items-center gap-3 text-center">
					<div className="flex items-center justify-center p-3 rounded-none bg-muted/30 text-foreground mb-2">
						<HugeiconsIcon
							icon={MessageQuestionIcon}
							className="size-5"
						/>
					</div>
					<h2 className="text-2xl font-semibold tracking-tight">
						Frequently asked questions
					</h2>
					<p className="text-muted-foreground text-sm">
						Quick answers to common questions about Tanship.
					</p>
				</div>

				<div className="grid grid-cols-1 gap-6 w-full max-w-2xl">
					{faqs.map((faq, i) => (
						<div
							key={i}
							className="flex flex-col gap-2 p-6 rounded-none border border-border/50 bg-background hover:bg-muted/10 transition-colors"
						>
							<h3 className="font-semibold text-base tracking-tight">
								{faq.question}
							</h3>
							<p className="text-sm text-muted-foreground leading-relaxed">
								{faq.answer}
							</p>
						</div>
					))}
				</div>

				<div className="mt-12 flex flex-col items-center gap-4 p-10 rounded-none border border-border/50 bg-muted/5 w-full">
					<div className="flex flex-col items-center gap-2 text-center">
						<h3 className="font-semibold text-base">
							Still have questions?
						</h3>
						<p className="text-sm text-muted-foreground">
							We're generally available via email for more formal
							inquiries.
						</p>
					</div>
					<a
						href="mailto:support@tanship.com"
						className="flex items-center gap-2 text-sm font-semibold text-foreground hover:text-foreground/70 transition-colors mt-2"
					>
						<HugeiconsIcon icon={Mail01Icon} className="size-4" />
						support@tanship.com
					</a>
				</div>
			</div>
		</div>
	);
}

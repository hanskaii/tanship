import { HugeiconsIcon } from "@hugeicons/react";
import {
	GlobeIcon,
	CodeIcon,
	Shield01Icon,
	CreditCardIcon,
	Layout01Icon,
	FlashIcon
} from "@hugeicons/core-free-icons";

const FEATURES = [
	{
		icon: GlobeIcon,
		title: "Cloudflare Edge",
		description:
			"Deploy globally in seconds. Zero cold starts, unlimited scale with Workers, D1, and R2."
	},
	{
		icon: CodeIcon,
		title: "TanStack & Hono",
		description:
			"100% type-safe routing and RPC. Seamless client-server state with React 19."
	},
	{
		icon: Shield01Icon,
		title: "Better Auth",
		description:
			"Edge-ready authentication with social logins, magic links, and session management."
	},
	{
		icon: CreditCardIcon,
		title: "Dodo Payments",
		description:
			"End-to-end billing. Subscriptions, webhooks, and customer portals out of the box."
	},
	{
		icon: Layout01Icon,
		title: "Minimalist UI",
		description:
			"Sharp, clean design system. Tailwind v4 + shadcn/ui components, ready to extend."
	},
	{
		icon: FlashIcon,
		title: "SEO & Content",
		description:
			"Built-in MDX blog and documentation engine so you rank without fighting config."
	}
];

export function FeaturesSection() {
	return (
		<section className="border-b border-border/40 py-20">
			<div className="mb-14">
				<h2 className="mb-3 text-3xl font-semibold tracking-tight text-foreground">
					Core infrastructure,
					<br />
					simplified.
				</h2>
				<p className="max-w-md text-base text-muted-foreground">
					Everything you need to launch a modern SaaS, pre-configured
					and ready to scale.
				</p>
			</div>

			<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
				{FEATURES.map((f) => (
					<div
						key={f.title}
						className="group flex flex-col gap-4 border border-border/50 bg-background p-6 transition-colors hover:border-border dark:bg-muted/5"
					>
						<div className="flex h-10 w-10 items-center justify-center border border-border/50 bg-muted/20 transition-colors group-hover:border-foreground/20 dark:bg-muted/10">
							<HugeiconsIcon
								icon={f.icon}
								className="size-5 text-foreground"
							/>
						</div>
						<div className="flex flex-col gap-1.5">
							<h3 className="text-sm font-semibold text-foreground">
								{f.title}
							</h3>
							<p className="text-sm leading-relaxed text-muted-foreground">
								{f.description}
							</p>
						</div>
					</div>
				))}
			</div>
		</section>
	);
}

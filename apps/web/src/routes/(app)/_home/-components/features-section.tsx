import { HugeiconsIcon } from "@hugeicons/react";
import {
	GlobeIcon,
	CodeIcon,
	Shield01Icon,
	CreditCardIcon,
	Layout01Icon,
	FlashIcon
} from "@hugeicons/core-free-icons";

export function FeaturesSection() {
	return (
		<section className="py-20 border-b border-border/40">
			<div className="mb-16">
				<h2 className="text-3xl font-semibold tracking-tight text-foreground mb-4">
					Core infrastructure,
					<br />
					simplified.
				</h2>
				<p className="text-muted-foreground text-lg max-w-xl">
					Everything you need to launch a modern SaaS, pre-configured
					and ready to scale.
				</p>
			</div>

			<div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-16">
				<div>
					<HugeiconsIcon
						icon={GlobeIcon}
						className="size-6 text-foreground mb-5"
					/>
					<h3 className="text-base font-semibold text-foreground mb-2">
						Cloudflare Edge
					</h3>
					<p className="text-sm text-muted-foreground leading-relaxed">
						Deploy globally in seconds. Zero cold starts and
						unlimited scalability with Workers, D1, and R2.
					</p>
				</div>
				<div>
					<HugeiconsIcon
						icon={CodeIcon}
						className="size-6 text-foreground mb-5"
					/>
					<h3 className="text-base font-semibold text-foreground mb-2">
						TanStack & Hono
					</h3>
					<p className="text-sm text-muted-foreground leading-relaxed">
						100% type-safe routing and RPC backend. Seamless
						client-server state with React 19.
					</p>
				</div>
				<div>
					<HugeiconsIcon
						icon={Shield01Icon}
						className="size-6 text-foreground mb-5"
					/>
					<h3 className="text-base font-semibold text-foreground mb-2">
						Better Auth
					</h3>
					<p className="text-sm text-muted-foreground leading-relaxed">
						Secure, edge-ready authentication. Pre-configured social
						logins, magic links, and session management.
					</p>
				</div>
				<div>
					<HugeiconsIcon
						icon={CreditCardIcon}
						className="size-6 text-foreground mb-5"
					/>
					<h3 className="text-base font-semibold text-foreground mb-2">
						Dodo Payments
					</h3>
					<p className="text-sm text-muted-foreground leading-relaxed">
						End-to-end billing integration. Subscriptions, webhooks,
						and customer portals out of the box.
					</p>
				</div>
				<div>
					<HugeiconsIcon
						icon={Layout01Icon}
						className="size-6 text-foreground mb-5"
					/>
					<h3 className="text-base font-semibold text-foreground mb-2">
						Minimalist UI
					</h3>
					<p className="text-sm text-muted-foreground leading-relaxed">
						Tailwind Plus aesthetic out of the box. Sharp borders,
						crisp typography, and highly accessible components.
					</p>
				</div>
				<div>
					<HugeiconsIcon
						icon={FlashIcon}
						className="size-6 text-foreground mb-5"
					/>
					<h3 className="text-base font-semibold text-foreground mb-2">
						SEO & Content Ready
					</h3>
					<p className="text-sm text-muted-foreground leading-relaxed">
						Built-in MDX blog and documentation engine so you can
						rank higher without fighting configuration files.
					</p>
				</div>
			</div>
		</section>
	);
}

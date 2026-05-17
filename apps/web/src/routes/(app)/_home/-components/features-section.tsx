import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Tick02Icon } from "@hugeicons/core-free-icons";
import {
	CloudflareIcon,
	DodoPaymentIcon,
	DrizzleIcon,
	BetterAuthIcon
} from "../../../-components/icons";

const FEATURES = [
	{
		id: "email",
		label: "Email",
		heading: "Email in one call.",
		subheading:
			"Transactional, inbound routing, and pre-built templates. Nothing to configure.",
		bullets: [
			"Send transactional emails with a single function call",
			"Webhook routing to receive and forward inbound email",
			"Pre-built templates: welcome, OTP, invoice"
		],
		timeSaved: 3,
		tech: [{ name: "Cloudflare Email", Icon: CloudflareIcon }]
	},
	{
		id: "payments",
		label: "Payments",
		heading: "Payments without the weekend.",
		subheading:
			"Checkout, subscriptions, webhooks, and chargeback tips. Wired and tested.",
		bullets: [
			"Create checkout sessions in two lines",
			"Webhooks wired for subscriptions and one-time payments",
			"Account update hooks and chargeback reduction tips included"
		],
		timeSaved: 5,
		tech: [{ name: "Dodo Payments", Icon: DodoPaymentIcon }]
	},
	{
		id: "auth",
		label: "Auth",
		heading: "Auth that actually works.",
		subheading:
			"Magic links, OTP, Google OAuth, protected routes. Production-ready from day one.",
		bullets: [
			"Email magic links and OTP, no extra service",
			"Google OAuth wired and tested",
			"Server-side protected routes and API calls"
		],
		timeSaved: 4,
		tech: [{ name: "Better Auth", Icon: BetterAuthIcon }]
	},
	{
		id: "database",
		label: "Database",
		heading: "Database on day one.",
		subheading:
			"D1 schema with Drizzle ORM, fully type-safe from server to client. Migration tooling included.",
		bullets: [
			"D1 schema ready with Drizzle ORM",
			"Type-safe queries from server to client",
			"Migration tooling and helper plugins included"
		],
		timeSaved: 2,
		tech: [
			{ name: "Cloudflare D1", Icon: CloudflareIcon },
			{ name: "Drizzle ORM", Icon: DrizzleIcon }
		]
	}
] as const;

export function FeaturesSection() {
	const [active, setActive] = useState<string>("email");

	const feature = FEATURES.find((f) => f.id === active) ?? FEATURES[0];

	return (
		<section className="border-b border-border/40 py-20">
			<div className="mb-10">
				<h2
					className="mb-3 font-heading font-medium text-foreground"
					style={{
						fontSize: "clamp(2rem, 5vw, 3rem)",
						letterSpacing: "-0.04em",
						lineHeight: "1.05"
					}}
				>
					Everything wired. Nothing missing.
				</h2>
				<p
					className="max-w-xl text-muted-foreground"
					style={{
						fontSize: "15px",
						lineHeight: "1.6",
						letterSpacing: "-0.02em"
					}}
				>
					Login users, process payments, send emails. Built on
					Cloudflare Workers, ready to ship.
				</p>
			</div>

			<div className="flex flex-col gap-3">
				{/* Tab bar */}
				<div className="flex gap-2">
					{FEATURES.map((f) => (
						<button
							key={f.id}
							onClick={() => setActive(f.id)}
							className={[
								"rounded-full px-5 py-2 text-xs font-medium transition-colors",
								active === f.id
									? "bg-foreground text-background"
									: "bg-secondary text-muted-foreground hover:text-foreground"
							].join(" ")}
						>
							{f.label}
						</button>
					))}
				</div>

				{/* Tab content */}
				<div className="rounded-xl bg-secondary p-6 sm:p-8">
					<div className="flex flex-col gap-8 sm:flex-row sm:gap-12">
						{/* Left: copy */}
						<div className="flex flex-1 flex-col gap-5">
							<div>
								<h3
									className="mb-1.5 font-heading font-medium text-foreground"
									style={{
										fontSize: "1.5rem",
										letterSpacing: "-0.04em",
										lineHeight: "1.1"
									}}
								>
									{feature.heading}
								</h3>
								<p
									className="text-muted-foreground"
									style={{
										fontSize: "14px",
										lineHeight: "1.6",
										letterSpacing: "-0.01em"
									}}
								>
									{feature.subheading}
								</p>
							</div>

							<ul className="flex flex-col gap-2.5">
								{feature.bullets.map((bullet) => (
									<li
										key={bullet}
										className="flex items-start gap-2.5 text-sm text-foreground"
									>
										<HugeiconsIcon
											icon={Tick02Icon}
											className="mt-0.5 size-3.5 shrink-0 text-foreground"
										/>
										{bullet}
									</li>
								))}
							</ul>
						</div>

						{/* Right: time saved + tech */}
						<div className="flex shrink-0 flex-col gap-5 border-t border-border/20 pt-5 sm:w-40 sm:border-l sm:border-t-0 sm:pl-8 sm:pt-0">
							<div>
								<p className="mb-1 text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
									Setup time saved
								</p>
								<p
									className="font-heading font-medium tabular-nums text-foreground"
									style={{
										fontSize: "1.8rem",
										letterSpacing: "-0.04em",
										lineHeight: "1"
									}}
								>
									~{feature.timeSaved}{" "}
									<span
										className="text-sm font-normal text-muted-foreground"
										style={{ letterSpacing: "-0.01em" }}
									>
										hrs
									</span>
								</p>
							</div>

							<div className="flex flex-col gap-2">
								<p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
									Powered by
								</p>
								{feature.tech.map(({ name, Icon }) => (
									<div
										key={name}
										className="flex items-center gap-2"
									>
										<Icon className="size-4 shrink-0" />
										<span className="text-xs font-medium text-foreground">
											{name}
										</span>
									</div>
								))}
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}

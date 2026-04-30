import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@workspace/ui";
import { HugeiconsIcon } from "@hugeicons/react";
import {
	FlashIcon,
	Shield01Icon,
	CodeIcon,
	GlobeIcon,
	CheckmarkCircle01Icon,
	CreditCardIcon,
	Layout01Icon,
	DatabaseIcon,
	FolderIcon,
	Mail01Icon,
	AiCloudIcon,
	Share01Icon,
	ZapIcon
} from "@hugeicons/core-free-icons";
import { appConfig, type PricingPlan } from "../../../../../../config/app";

export const Route = createFileRoute("/(app)/_home/")({
	component: HomePage
});

function HomePage() {
	return (
		<div className="bg-background text-foreground antialiased min-h-screen flex flex-col font-sans selection:bg-primary selection:text-primary-foreground mx-auto w-full max-w-3xl px-4 sm:px-6 pt-14">
			<main className="flex-grow">
				{/* Hero Section */}
				<section className="pt-24 pb-16 border-b border-border/40">
					<div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/30 border border-border/50 text-xs font-medium mb-8">
						<span className="flex h-1.5 w-1.5 rounded-full bg-primary"></span>
						Tanflare v1.0 is now live
					</div>
					<h1 className="text-5xl sm:text-6xl font-semibold tracking-tight text-foreground mb-6 leading-[1.1] text-balance">
						Build your next idea <br /> even faster.
					</h1>
					<p className="text-lg text-muted-foreground mb-10 leading-relaxed max-w-2xl font-normal text-balance">
						Stop wasting weeks wiring up databases, auth providers,
						and payment gateways. Get a production-ready foundation
						deployed on the edge in seconds.
					</p>
					<div className="flex flex-wrap gap-4">
						<Button
							size="lg"
							className="rounded-none bg-foreground text-background hover:bg-foreground/90 font-medium px-8 h-14"
							asChild
						>
							<Link to="/login">Start Building</Link>
						</Button>
						<Button
							variant="ghost"
							size="lg"
							className="rounded-none text-foreground hover:bg-muted font-medium px-8 h-14 border border-border/50"
							asChild
						>
							<Link to="/docs">Explore Docs</Link>
						</Button>
					</div>
				</section>

				{/* Showcase Hero Image - Minimalist */}
				<section className="py-16 border-b border-border/40">
					<div className="bg-background border border-border/50 p-2 sm:p-4 rounded-none">
						<div className="aspect-[16/9] bg-muted/30 flex items-center justify-center relative overflow-hidden">
							<div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
							<div className="text-center z-10">
								<HugeiconsIcon
									icon={Layout01Icon}
									className="size-12 mb-4 mx-auto text-muted-foreground/50"
								/>
								<p className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
									Dashboard_Preview.tsx
								</p>
							</div>
						</div>
					</div>
				</section>

				{/* Tech Stack Section */}
				<section className="py-20 border-b border-border/40">
					<div className="text-center mb-16">
						<h2 className="text-3xl font-semibold tracking-tight text-foreground mb-4">
							Build with the best tech stack
						</h2>
						<p className="text-muted-foreground text-lg max-w-2xl mx-auto">
							Use the latest industry-standard tech stack for your
							next project, optimized for performance and cost.
						</p>
					</div>

					<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
						{[
							{
								name: "TanStack Start",
								desc: "The most popular type-safe full-stack React framework.",
								icon: FlashIcon
							},
							{
								name: "Cloudflare Workers",
								desc: "Serverless execution environment on the edge with zero cold starts.",
								icon: GlobeIcon
							},
							{
								name: "Cloudflare D1",
								desc: "Serverless SQL database built on SQLite for the edge.",
								icon: DatabaseIcon
							},
							{
								name: "Cloudflare R2",
								desc: "S3-compatible object storage with zero egress fees.",
								icon: FolderIcon
							},
							{
								name: "Cloudflare Durable Objects",
								desc: "Globally distributed stateful serverless with WebSockets.",
								icon: Share01Icon
							},
							{
								name: "Cloudflare Queues",
								desc: "Guaranteed message delivery and asynchronous processing.",
								icon: ZapIcon
							},
							{
								name: "Cloudflare Email",
								desc: "Transactional email routing and sending at the edge.",
								icon: Mail01Icon
							},
							{
								name: "Better Auth",
								desc: "The most comprehensive open source authentication library.",
								icon: Shield01Icon
							},
							{
								name: "Drizzle ORM",
								desc: "Lightweight, performant, and headless TypeScript ORM.",
								icon: CodeIcon
							},
							{
								name: "Dodo Payments",
								desc: "Global payment processing and billing infrastructure.",
								icon: CreditCardIcon
							},
							{
								name: "Hono",
								desc: "Ultrafast, lightweight, edge-native web framework.",
								icon: ZapIcon
							},
							{
								name: "Tailwind CSS v4",
								desc: "The utility-first CSS framework for rapid UI development.",
								icon: Layout01Icon
							}
						].map((tech) => (
							<div
								key={tech.name}
								className="border border-border/50 bg-muted/5 hover:bg-muted/10 transition-colors p-6 rounded-none flex flex-col gap-3 group"
							>
								<div className="flex items-center gap-3">
									<div className="p-2 bg-background border border-border/50 rounded-none group-hover:border-foreground/30 transition-colors">
										<HugeiconsIcon
											icon={tech.icon}
											className="size-5 text-foreground"
										/>
									</div>
									<span className="font-semibold text-sm text-foreground">
										{tech.name}
									</span>
								</div>
								<p className="text-xs text-muted-foreground leading-relaxed">
									{tech.desc}
								</p>
							</div>
						))}
					</div>
				</section>

				{/* Architecture / Features Section */}
				<section className="py-20 border-b border-border/40">
					<div className="mb-16">
						<h2 className="text-3xl font-semibold tracking-tight text-foreground mb-4">
							Core infrastructure,
							<br />
							simplified.
						</h2>
						<p className="text-muted-foreground text-lg max-w-xl">
							Everything you need to launch a modern SaaS,
							pre-configured and ready to scale.
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
								Secure, edge-ready authentication.
								Pre-configured social logins, magic links, and
								session management.
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
								End-to-end billing integration. Subscriptions,
								webhooks, and customer portals out of the box.
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
								Tailwind Plus aesthetic out of the box. Sharp
								borders, crisp typography, and highly accessible
								components.
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
								Built-in MDX blog and documentation engine so
								you can rank higher without fighting
								configuration files.
							</p>
						</div>
					</div>
				</section>

				{/* Cost Less with Cloudflare */}
				<section className="py-20 border-b border-border/40">
					<div className="grid grid-cols-1 md:grid-cols-[1fr_1.5fr] gap-12 items-center">
						<div>
							<h2 className="text-3xl font-semibold tracking-tight text-foreground mb-4 leading-tight">
								Scale infinitely. <br /> Pay almost nothing.
							</h2>
							<p className="text-muted-foreground text-lg mb-6">
								By leveraging Cloudflare's massive edge network,
								your SaaS runs faster and costs significantly
								less.
							</p>
							<ul className="space-y-3">
								<li className="flex items-center gap-3 text-sm text-foreground">
									<HugeiconsIcon
										icon={CheckmarkCircle01Icon}
										className="size-4 text-emerald-500 shrink-0"
									/>
									<span>
										<strong className="font-semibold">
											Generous Free Tier:
										</strong>{" "}
										Up to 100k requests/day free
									</span>
								</li>
								<li className="flex items-center gap-3 text-sm text-foreground">
									<HugeiconsIcon
										icon={CheckmarkCircle01Icon}
										className="size-4 text-emerald-500 shrink-0"
									/>
									<span>
										<strong className="font-semibold">
											Zero Servers:
										</strong>{" "}
										No DevOps, no cold starts, no AWS bills
									</span>
								</li>
								<li className="flex items-center gap-3 text-sm text-foreground">
									<HugeiconsIcon
										icon={CheckmarkCircle01Icon}
										className="size-4 text-emerald-500 shrink-0"
									/>
									<span>
										<strong className="font-semibold">
											Global by Default:
										</strong>{" "}
										Your DB and API run near your users
									</span>
								</li>
							</ul>
						</div>
						<div className="border border-border/50 bg-muted/5 p-8 rounded-none flex flex-col justify-center relative overflow-hidden">
							<div className="absolute top-0 right-0 p-4 opacity-5">
								<HugeiconsIcon
									icon={FlashIcon}
									className="size-32"
								/>
							</div>
							<div className="relative z-10">
								<div className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-2">
									Estimated AWS Cost
								</div>
								<div className="text-2xl font-mono text-muted-foreground line-through decoration-red-500/50 mb-8">
									$150.00/mo
								</div>

								<div className="text-sm font-bold uppercase tracking-widest text-foreground mb-2">
									Cloudflare Workers Cost
								</div>
								<div className="text-5xl font-mono font-semibold text-foreground tracking-tight">
									$0.00
									<span className="text-lg text-muted-foreground">
										/mo*
									</span>
								</div>
								<p className="text-xs text-muted-foreground mt-4">
									* Until you reach significant scale (100k+
									daily requests)
								</p>
							</div>
						</div>
					</div>
				</section>

				{/* How it Compares */}
				<section className="py-20 border-b border-border/40">
					<div className="mb-12">
						<h2 className="text-3xl font-semibold tracking-tight text-foreground mb-4">
							How Tanflare Compares
						</h2>
						<p className="text-muted-foreground text-lg max-w-xl">
							We've felt the pain of building SaaS apps from
							scratch. Here is why Tanflare is the better way.
						</p>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<div className="border border-border/50 p-6 bg-background rounded-none hover:bg-muted/5 transition-colors">
							<div className="text-sm font-medium text-muted-foreground line-through decoration-red-500/50 mb-2">
								Building auth from scratch takes 2-4 weeks
							</div>
							<div className="text-base font-semibold text-foreground flex items-start gap-2">
								<HugeiconsIcon
									icon={CheckmarkCircle01Icon}
									className="size-5 text-emerald-500 shrink-0 mt-0.5"
								/>
								Tanflare includes complete auth with MFA in
								minutes
							</div>
						</div>
						<div className="border border-border/50 p-6 bg-background rounded-none hover:bg-muted/5 transition-colors">
							<div className="text-sm font-medium text-muted-foreground line-through decoration-red-500/50 mb-2">
								Managing servers and cold starts kills speed
							</div>
							<div className="text-base font-semibold text-foreground flex items-start gap-2">
								<HugeiconsIcon
									icon={CheckmarkCircle01Icon}
									className="size-5 text-emerald-500 shrink-0 mt-0.5"
								/>
								Cloudflare Edge workers run instantly, globally
							</div>
						</div>
						<div className="border border-border/50 p-6 bg-background rounded-none hover:bg-muted/5 transition-colors">
							<div className="text-sm font-medium text-muted-foreground line-through decoration-red-500/50 mb-2">
								Generic boilerplates are abandoned weekend
								projects
							</div>
							<div className="text-base font-semibold text-foreground flex items-start gap-2">
								<HugeiconsIcon
									icon={CheckmarkCircle01Icon}
									className="size-5 text-emerald-500 shrink-0 mt-0.5"
								/>
								Tanflare is a production-grade business
								foundation
							</div>
						</div>
						<div className="border border-border/50 p-6 bg-background rounded-none hover:bg-muted/5 transition-colors">
							<div className="text-sm font-medium text-muted-foreground line-through decoration-red-500/50 mb-2">
								AI-generated code often lacks best practices
							</div>
							<div className="text-base font-semibold text-foreground flex items-start gap-2">
								<HugeiconsIcon
									icon={CheckmarkCircle01Icon}
									className="size-5 text-emerald-500 shrink-0 mt-0.5"
								/>
								Tanflare provides strict patterns that AI tools
								can extend
							</div>
						</div>
					</div>
				</section>

				{/* Build vs Buy */}
				<section className="py-20 border-b border-border/40">
					<div className="mb-12">
						<h2 className="text-3xl font-semibold tracking-tight text-foreground mb-4">
							Skip months of infrastructure work.
						</h2>
						<p className="text-muted-foreground text-lg max-w-xl">
							See how much time you save by starting with a
							production-ready foundation instead of building
							everything from scratch.
						</p>
					</div>

					<div className="border border-border/50 bg-background rounded-none overflow-hidden mb-8">
						<div className="grid grid-cols-[2fr_1fr_1fr] border-b border-border/50 bg-muted/5 p-4 sm:px-6">
							<div className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">
								Component
							</div>
							<div className="font-semibold text-xs uppercase tracking-wider text-muted-foreground text-right pr-4">
								Build Yourself
							</div>
							<div className="font-semibold text-xs uppercase tracking-wider text-foreground">
								With Tanflare
							</div>
						</div>

						<div className="grid grid-cols-[2fr_1fr_1fr] border-b border-border/30 p-4 sm:px-6 text-sm items-center hover:bg-muted/5 transition-colors">
							<div className="font-medium text-foreground">
								Authentication (OAuth, MFA)
							</div>
							<div className="text-muted-foreground text-right pr-4">
								2-4 weeks
							</div>
							<div className="flex items-center text-foreground font-semibold">
								<HugeiconsIcon
									icon={CheckmarkCircle01Icon}
									className="size-4 mr-2"
								/>
								Pre-built
							</div>
						</div>
						<div className="grid grid-cols-[2fr_1fr_1fr] border-b border-border/30 p-4 sm:px-6 text-sm items-center hover:bg-muted/5 transition-colors">
							<div className="font-medium text-foreground">
								Subscription billing
							</div>
							<div className="text-muted-foreground text-right pr-4">
								2-3 weeks
							</div>
							<div className="flex items-center text-foreground font-semibold">
								<HugeiconsIcon
									icon={CheckmarkCircle01Icon}
									className="size-4 mr-2"
								/>
								Pre-built
							</div>
						</div>
						<div className="grid grid-cols-[2fr_1fr_1fr] border-b border-border/30 p-4 sm:px-6 text-sm items-center hover:bg-muted/5 transition-colors">
							<div className="font-medium text-foreground">
								Multi-tenant organizations
							</div>
							<div className="text-muted-foreground text-right pr-4">
								3-4 weeks
							</div>
							<div className="flex items-center text-foreground font-semibold">
								<HugeiconsIcon
									icon={CheckmarkCircle01Icon}
									className="size-4 mr-2"
								/>
								Pre-built
							</div>
						</div>
						<div className="grid grid-cols-[2fr_1fr_1fr] border-b border-border/30 p-4 sm:px-6 text-sm items-center hover:bg-muted/5 transition-colors">
							<div className="font-medium text-foreground">
								Blog & docs engine
							</div>
							<div className="text-muted-foreground text-right pr-4">
								1-2 weeks
							</div>
							<div className="flex items-center text-foreground font-semibold">
								<HugeiconsIcon
									icon={CheckmarkCircle01Icon}
									className="size-4 mr-2"
								/>
								Pre-built
							</div>
						</div>
						<div className="grid grid-cols-[2fr_1fr_1fr] p-4 sm:px-6 text-sm items-center hover:bg-muted/5 transition-colors">
							<div className="font-medium text-foreground">
								Security & bug patches
							</div>
							<div className="text-muted-foreground text-right pr-4">
								Ongoing
							</div>
							<div className="flex items-center text-foreground font-semibold">
								<HugeiconsIcon
									icon={CheckmarkCircle01Icon}
									className="size-4 mr-2"
								/>
								Included
							</div>
						</div>
					</div>

					<div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
						<div className="border border-border/50 p-6 bg-muted/5 rounded-none flex flex-col justify-center text-center">
							<div className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">
								Build from scratch
							</div>
							<div className="text-2xl font-semibold mb-1 text-foreground">
								3-6 months
							</div>
							<div className="text-xs text-muted-foreground">
								500+ hours of development
							</div>
						</div>
						<div className="border border-foreground p-6 bg-foreground text-background rounded-none flex flex-col justify-center text-center">
							<div className="text-xs font-bold uppercase tracking-widest opacity-80 mb-2">
								With Tanflare
							</div>
							<div className="text-2xl font-semibold mb-1">
								Day 1
							</div>
							<div className="text-xs opacity-90">
								Start building features immediately
							</div>
						</div>
					</div>
				</section>

				{/* AI Agents Optimized */}
				<section className="py-20 border-b border-border/40">
					<div className="border border-border/50 bg-background p-10 text-center flex flex-col items-center rounded-none">
						<div className="flex items-center justify-center size-12 rounded-none bg-background border border-border/50 mb-6">
							<HugeiconsIcon
								icon={FlashIcon}
								className="size-6 text-foreground"
							/>
						</div>
						<h2 className="text-2xl font-semibold tracking-tight text-foreground mb-4">
							Optimized for LLMs
						</h2>
						<p className="text-muted-foreground text-base max-w-lg mb-8 leading-relaxed">
							Integrates seamlessly with AI IDEs. Our codebase
							makes development faster with custom rules and an
							included MCP Server to turbocharge output quality.
						</p>
						<div className="flex flex-wrap justify-center gap-3 text-xs font-bold tracking-widest uppercase">
							<span className="px-4 py-2 border border-border/50 bg-background text-foreground">
								Cursor AI
							</span>
							<span className="px-4 py-2 border border-border/50 bg-background text-foreground">
								Claude Code
							</span>
							<span className="px-4 py-2 border border-border/50 bg-background text-foreground">
								Gemini IDE
							</span>
						</div>
					</div>
				</section>

				{/* Testimonials Section */}
				<section className="py-20 border-b border-border/40">
					<div className="mb-12">
						<h2 className="text-3xl font-semibold tracking-tight text-foreground mb-4">
							Loved by builders.
						</h2>
						<p className="text-muted-foreground text-lg max-w-xl">
							Don't just take our word for it. See what others are
							saying.
						</p>
					</div>
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
						<div className="border border-border/50 p-8 bg-muted/10 rounded-none hover:bg-muted/30 transition-colors">
							<p className="text-sm text-foreground leading-relaxed mb-8">
								"This boilerplate saved me at least 3 weeks of
								development time. The integration between Better
								Auth and Dodo Payments is flawless. Best
								investment I've made this year."
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
								"Finally a boilerplate that uses Cloudflare
								Workers! The edge performance is insane, and the
								D1 setup is exactly what I needed. Highly
								recommend for any solo dev."
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

				{/* Templates Section */}
				<section className="py-20 border-b border-border/40">
					<div className="mb-16">
						<h2 className="text-3xl font-semibold tracking-tight text-foreground mb-4">
							Premium Templates
						</h2>
						<p className="text-muted-foreground text-lg max-w-xl">
							Jumpstart your project with our growing library of
							premium templates, included in the Pro plan.
						</p>
					</div>

					<div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
						{appConfig.payments
							.filter((p: PricingPlan) =>
								p.slug.startsWith("template-")
							)
							.slice(0, 4)
							.map((template: PricingPlan) => (
								<div
									key={template.slug}
									className="group cursor-pointer"
								>
									<div className="aspect-[4/3] bg-muted/20 border border-border/50 mb-4 overflow-hidden relative p-1 transition-colors group-hover:border-foreground/30 rounded-none">
										<div className="w-full h-full bg-background border border-border/30 flex items-center justify-center">
											<HugeiconsIcon
												icon={Layout01Icon}
												className="size-6 text-muted-foreground/40"
											/>
										</div>
									</div>
									<h4 className="text-sm font-semibold text-foreground mb-1">
										{template.name}
									</h4>
									<p className="text-xs text-muted-foreground leading-relaxed">
										{template.description}
									</p>
								</div>
							))}
					</div>
				</section>

				{/* Pricing Section */}
				<section className="py-20 border-b border-border/40">
					<div className="mb-16">
						<h2 className="text-3xl font-semibold tracking-tight text-foreground mb-4">
							Invest in your time.
						</h2>
						<p className="text-muted-foreground text-lg max-w-xl">
							Get lifetime access to the boilerplate. Save
							hundreds of hours of development time.
						</p>
					</div>

					<div className="grid grid-cols-1 gap-8">
						{/* Standard Plan */}
						<div className="border border-border/60 p-8 bg-background relative flex flex-col sm:flex-row gap-8 rounded-none transition-colors hover:border-border">
							<div className="flex-1">
								<h3 className="text-xl font-semibold text-foreground mb-2">
									Tanflare Standard
								</h3>
								<p className="text-sm text-muted-foreground mb-8">
									Full boilerplate to ship an edge-native
									SaaS.
								</p>
								<div className="space-y-4 mb-8 sm:mb-0">
									<div className="flex items-start gap-3">
										<HugeiconsIcon
											icon={CheckmarkCircle01Icon}
											className="text-muted-foreground size-4 flex-shrink-0 mt-0.5"
										/>
										<span className="text-sm text-foreground">
											TanStack Start + Cloudflare Workers
										</span>
									</div>
									<div className="flex items-start gap-3">
										<HugeiconsIcon
											icon={CheckmarkCircle01Icon}
											className="text-muted-foreground size-4 flex-shrink-0 mt-0.5"
										/>
										<span className="text-sm text-foreground">
											Better Auth & Dodo Payments
										</span>
									</div>
									<div className="flex items-start gap-3">
										<HugeiconsIcon
											icon={CheckmarkCircle01Icon}
											className="text-muted-foreground size-4 flex-shrink-0 mt-0.5"
										/>
										<span className="text-sm text-foreground">
											Drizzle ORM + D1 SQLite
										</span>
									</div>
								</div>
							</div>
							<div className="sm:w-64 flex flex-col justify-end border-t sm:border-t-0 sm:border-l border-border/40 pt-6 sm:pt-0 sm:pl-8">
								<div className="mb-6">
									<div className="text-4xl font-semibold text-foreground tracking-tight">
										$99
									</div>
									<div className="text-xs text-muted-foreground mt-2 uppercase tracking-wider font-mono">
										One-time payment
									</div>
								</div>
								<Button className="w-full rounded-none h-12 bg-foreground text-background hover:bg-foreground/90 font-medium">
									Get Standard
								</Button>
							</div>
						</div>

						{/* Pro Plan */}
						<div className="border border-foreground p-8 bg-background relative flex flex-col sm:flex-row gap-8 rounded-none">
							<div className="absolute -top-3 left-8 bg-foreground text-background text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">
								Pro
							</div>
							<div className="flex-1 pt-2 sm:pt-0">
								<h3 className="text-xl font-semibold text-foreground mb-2">
									Tanflare Pro
								</h3>
								<p className="text-sm text-muted-foreground mb-8">
									Boilerplate + access to all premium
									templates.
								</p>
								<div className="space-y-4 mb-8 sm:mb-0">
									<div className="flex items-start gap-3">
										<HugeiconsIcon
											icon={CheckmarkCircle01Icon}
											className="text-foreground size-4 flex-shrink-0 mt-0.5"
										/>
										<span className="text-sm text-foreground font-medium">
											Everything in Standard
										</span>
									</div>
									<div className="flex items-start gap-3">
										<HugeiconsIcon
											icon={CheckmarkCircle01Icon}
											className="text-foreground size-4 flex-shrink-0 mt-0.5"
										/>
										<span className="text-sm text-foreground">
											All premium templates
										</span>
									</div>
									<div className="flex items-start gap-3">
										<HugeiconsIcon
											icon={CheckmarkCircle01Icon}
											className="text-foreground size-4 flex-shrink-0 mt-0.5"
										/>
										<span className="text-sm text-foreground">
											Priority email support
										</span>
									</div>
								</div>
							</div>
							<div className="sm:w-64 flex flex-col justify-end border-t sm:border-t-0 sm:border-l border-border/40 pt-6 sm:pt-0 sm:pl-8">
								<div className="mb-6">
									<div className="text-4xl font-semibold text-foreground tracking-tight">
										$299
									</div>
									<div className="text-xs text-muted-foreground mt-2 uppercase tracking-wider font-mono">
										One-time payment
									</div>
								</div>
								<Button className="w-full rounded-none h-12 bg-foreground text-background hover:bg-foreground/90 font-medium">
									Get Pro
								</Button>
							</div>
						</div>
					</div>
				</section>

				{/* FAQ Section */}
				<section className="py-20 border-b border-border/40">
					<div className="mb-12">
						<h2 className="text-3xl font-semibold tracking-tight text-foreground mb-4">
							Frequently Asked Questions
						</h2>
					</div>
					<div className="space-y-6">
						<div className="border border-border/50 p-6 bg-background rounded-none">
							<h3 className="text-base font-semibold text-foreground mb-2">
								What exactly is Tanflare?
							</h3>
							<p className="text-sm text-muted-foreground leading-relaxed">
								Tanflare is a full-stack SaaS Starter Kit — a
								premium, edge-ready codebase that you can use to
								build your SaaS product. It includes
								authentication, billing, organizations, and a
								beautiful UI out of the box.
							</p>
						</div>
						<div className="border border-border/50 p-6 bg-background rounded-none">
							<h3 className="text-base font-semibold text-foreground mb-2">
								Why should I buy Tanflare instead of another
								Boilerplate?
							</h3>
							<p className="text-sm text-muted-foreground leading-relaxed">
								Purchasing a Tanflare license is an investment
								in a production-grade foundation. We focus
								heavily on modern edge infrastructure
								(Cloudflare, TanStack, Hono) giving you insane
								performance and zero vendor lock-in. Think of us
								as your technical co-founder.
							</p>
						</div>
						<div className="border border-border/50 p-6 bg-background rounded-none">
							<h3 className="text-base font-semibold text-foreground mb-2">
								I don't know how to code. Should I buy Tanflare?
							</h3>
							<p className="text-sm text-muted-foreground leading-relaxed">
								No. Tanflare is a product for developers and
								requires programming knowledge. AI can help, but
								you will need to understand the underlying
								technologies (React, TypeScript).
							</p>
						</div>
						<div className="border border-border/50 p-6 bg-background rounded-none">
							<h3 className="text-base font-semibold text-foreground mb-2">
								Can I use this for unlimited client projects?
							</h3>
							<p className="text-sm text-muted-foreground leading-relaxed">
								Yes! The Developer License allows you to build
								and deploy as many personal or client projects
								as you want. You just cannot resell the
								boilerplate itself.
							</p>
						</div>
						<div className="border border-border/50 p-6 bg-background rounded-none">
							<h3 className="text-base font-semibold text-foreground mb-2">
								How hard is it to deploy?
							</h3>
							<p className="text-sm text-muted-foreground leading-relaxed">
								We use Cloudflare Workers. Deployment is as
								simple as running `npm run deploy`. Your
								database (D1) and storage (R2) are automatically
								provisioned via Wrangler.
							</p>
						</div>
						<div className="border border-border/50 p-6 bg-background rounded-none">
							<h3 className="text-base font-semibold text-foreground mb-2">
								Do I need to pay monthly for the tech stack?
							</h3>
							<p className="text-sm text-muted-foreground leading-relaxed">
								No. Cloudflare offers a very generous free tier.
								Better Auth is open-source. Dodo Payments only
								takes a small fee per transaction. Your running
								costs are virtually zero until you scale.
							</p>
						</div>
						<div className="border border-border/50 p-6 bg-background rounded-none">
							<h3 className="text-base font-semibold text-foreground mb-2">
								How is the codebase distributed?
							</h3>
							<p className="text-sm text-muted-foreground leading-relaxed">
								You will receive an invite to the private GitHub
								repositories immediately after purchase. Enter
								your GitHub username in the activation portal,
								and you'll get instant access.
							</p>
						</div>
						<div className="border border-border/50 p-6 bg-background rounded-none">
							<h3 className="text-base font-semibold text-foreground mb-2">
								What level of support do you offer?
							</h3>
							<p className="text-sm text-muted-foreground leading-relaxed">
								We provide priority email support for all Pro
								customers and community support via Discord for
								everyone. We'll help you with any questions
								setting up the product or clarifying doubts
								about the codebase.
							</p>
						</div>
						<div className="border border-border/50 p-6 bg-background rounded-none">
							<h3 className="text-base font-semibold text-foreground mb-2">
								Can I get a refund?
							</h3>
							<p className="text-sm text-muted-foreground leading-relaxed">
								Due to the non-returnable nature of the source
								code, we generally cannot offer refunds once
								access is redeemed. If you have questions before
								buying, feel free to reach out to our support.
							</p>
						</div>
						<div className="border border-border/50 p-6 bg-background rounded-none">
							<h3 className="text-base font-semibold text-foreground mb-2">
								For how long can I get updates?
							</h3>
							<p className="text-sm text-muted-foreground leading-relaxed">
								Forever. Purchasing a license gives you lifetime
								access to updates for the stack you purchased.
							</p>
						</div>
					</div>
				</section>
			</main>

			{/* Footer */}
			<footer className="py-12">
				<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
					<div className="flex items-center gap-3">
						<div className="w-8 h-8 bg-foreground flex items-center justify-center rounded-none">
							<HugeiconsIcon
								icon={FlashIcon}
								className="text-background size-4"
							/>
						</div>
						<span className="font-semibold text-foreground tracking-tight">
							Tanflare
						</span>
					</div>
					<div className="flex gap-6 text-sm">
						<a
							href="#"
							className="text-muted-foreground hover:text-foreground transition-colors font-medium"
						>
							Documentation
						</a>
						<a
							href="#"
							className="text-muted-foreground hover:text-foreground transition-colors font-medium"
						>
							Twitter
						</a>
						<a
							href="#"
							className="text-muted-foreground hover:text-foreground transition-colors font-medium"
						>
							GitHub
						</a>
					</div>
				</div>
			</footer>
		</div>
	);
}

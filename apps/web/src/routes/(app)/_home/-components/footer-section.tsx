import { Link } from "@tanstack/react-router";
import { Logo } from "@/routes/-components/logo";

const MARQUEE_WORDS = [
	"Ship faster",
	"Global by default",
	"Start on day one",
	"Zero lock-in",
	"Lifetime updates",
	"Built on TanStack",
	"Powered by Cloudflare",
	"Ship faster",
	"Global by default",
	"Start on day one",
	"Zero lock-in",
	"Lifetime updates",
	"Built on TanStack",
	"Powered by Cloudflare"
];

const FOOTER_GROUPS = [
	{
		title: "Product",
		links: [
			{ label: "Templates", href: "/templates", external: false },
			{ label: "Showcase", href: "/showcase", external: false },
			{ label: "Badge", href: "/badge", external: false }
		]
	},
	{
		title: "Company",
		links: [
			{ label: "Contact", href: "/contact", external: false },
			{
				label: "Privacy Policy",
				href: "/legals/privacy-policy",
				external: false
			},
			{
				label: "Terms of Service",
				href: "/legals/terms",
				external: false
			}
		]
	},
	{
		title: "Resources",
		links: [{ label: "Documentation", href: "/docs", external: true }]
	}
];

export function FooterSection() {
	const year = new Date().getFullYear();

	return (
		<footer>
			{/* Full-lime footer block */}
			<div className="bg-primary overflow-hidden">
				{/* Marquee */}
				<div className="border-b border-primary-foreground/10 py-5 overflow-hidden">
					<style>{`
						@keyframes marquee {
							from { transform: translateX(0); }
							to   { transform: translateX(-50%); }
						}
						.marquee-track {
							display: flex;
							width: max-content;
							animation: marquee 28s linear infinite;
						}
						.marquee-track:hover { animation-play-state: paused; }
					`}</style>
					<div className="marquee-track">
						{MARQUEE_WORDS.map((word, i) => (
							<span
								key={i}
								className="flex shrink-0 items-center gap-6 pr-12 font-heading font-medium text-primary-foreground/80"
								style={{
									fontSize: "clamp(1rem, 2.5vw, 1.25rem)",
									letterSpacing: "-0.02em"
								}}
							>
								<span
									className="h-1 w-1 shrink-0 rounded-full bg-primary-foreground/40"
									aria-hidden
								/>
								{word}
							</span>
						))}
					</div>
				</div>

				{/* Main CTA area */}
				<div className="px-8 py-16 md:px-16">
					<div className="flex flex-col gap-10">
						<div className="flex flex-col gap-4">
							<p
								className="font-heading font-medium text-primary-foreground/40 uppercase"
								style={{
									fontSize: "11px",
									letterSpacing: "0.12em"
								}}
							>
								Start building today
							</p>
							<a
								href="#pricing"
								className="font-heading font-medium text-primary-foreground underline decoration-primary-foreground/30 underline-offset-4 transition-opacity hover:opacity-70"
								style={{
									fontSize: "clamp(2.4rem, 7vw, 5rem)",
									letterSpacing: "-0.04em",
									lineHeight: "1.0"
								}}
							>
								Get Tanship
							</a>
						</div>

						{/* Footer bottom row */}
						<div className="grid grid-cols-1 md:grid-cols-5 gap-10 border-t border-primary-foreground/10 pt-12">
							<div className="flex flex-col gap-4 md:col-span-2">
								<div className="flex items-center gap-2">
									<Logo className="h-6 w-6" />
									<span
										className="font-semibold text-primary-foreground"
										style={{
											fontSize: "14px",
											letterSpacing: "-0.01em"
										}}
									>
										Tanship
									</span>
								</div>
								<p className="text-primary-foreground/60 text-[13px] leading-relaxed max-w-[280px]">
									The ultimate TanStack boilerplate for
									building modern web applications faster and
									better.
								</p>
								<span
									className="text-primary-foreground/40 mt-4"
									style={{ fontSize: "12px" }}
								>
									© {year} Tanship. All rights reserved.
								</span>
							</div>

							<div className="grid grid-cols-2 sm:grid-cols-3 gap-8 md:col-span-3">
								{FOOTER_GROUPS.map((group) => (
									<div
										key={group.title}
										className="flex flex-col gap-5"
									>
										<h3 className="font-semibold text-primary-foreground text-[14px] tracking-[-0.01em]">
											{group.title}
										</h3>
										<ul className="flex flex-col gap-3">
											{group.links.map(
												({ label, href, external }) => (
													<li key={label}>
														{external ? (
															<a
																href={href}
																target="_blank"
																rel="noreferrer"
																className="font-medium text-primary-foreground/60 transition-colors hover:text-primary-foreground text-[13px] tracking-[-0.01em]"
															>
																{label}
															</a>
														) : (
															<Link
																to={href}
																className="font-medium text-primary-foreground/60 transition-colors hover:text-primary-foreground text-[13px] tracking-[-0.01em]"
															>
																{label}
															</Link>
														)}
													</li>
												)
											)}
										</ul>
									</div>
								))}
							</div>
						</div>
					</div>
				</div>
			</div>
		</footer>
	);
}

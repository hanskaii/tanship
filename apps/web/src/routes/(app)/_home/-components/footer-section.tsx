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

const FOOTER_LINKS = [
	{ label: "Documentation", href: "/docs", external: true },
	{ label: "Templates", href: "/templates", external: false },
	{ label: "Showcase", href: "/showcase", external: false },
	{ label: "Contact", href: "/contact", external: false },
	{
		label: "Privacy Policy",
		href: "/legals/privacy-policy",
		external: false
	},
	{ label: "Terms of Service", href: "/legals/terms", external: false },
	{ label: "Badge", href: "/badge", external: false }
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
						<div className="flex flex-col gap-4 border-t border-primary-foreground/10 pt-8 sm:flex-row sm:items-center sm:justify-between">
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
								<span
									className="text-primary-foreground/40"
									style={{ fontSize: "12px" }}
								>
									© {year}
								</span>
							</div>

							<nav className="flex flex-wrap gap-x-6 gap-y-2">
								{FOOTER_LINKS.map(({ label, href, external }) =>
									external ? (
										<a
											key={label}
											href={href}
											target="_blank"
											rel="noreferrer"
											className="font-medium text-primary-foreground/60 transition-colors hover:text-primary-foreground"
											style={{
												fontSize: "13px",
												letterSpacing: "-0.01em"
											}}
										>
											{label}
										</a>
									) : (
										<Link
											key={label}
											to={href}
											className="font-medium text-primary-foreground/60 transition-colors hover:text-primary-foreground"
											style={{
												fontSize: "13px",
												letterSpacing: "-0.01em"
											}}
										>
											{label}
										</Link>
									)
								)}
							</nav>
						</div>
					</div>
				</div>
			</div>
		</footer>
	);
}

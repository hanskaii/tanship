import { Link } from "@tanstack/react-router";
import { HugeiconsIcon } from "@hugeicons/react";
import { FlashIcon } from "@hugeicons/core-free-icons";

const LINKS = [
	{ label: "Documentation", href: "/docs", external: true },
	{ label: "Templates", href: "/templates", external: false },
	{ label: "Showcase", href: "/showcase", external: false },
	{ label: "Contact", href: "/contact", external: false },
	{
		label: "Twitter",
		href: "https://twitter.com/tanship",
		external: true
	},
	{
		label: "GitHub",
		href: "https://github.com/inurhuda00",
		external: true
	}
];

export function FooterSection() {
	const year = new Date().getFullYear();

	return (
		<footer className="border-t border-border/40 py-12">
			<div className="flex flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">
				{/* Brand */}
				<div className="flex items-center gap-2.5">
					<div className="flex h-7 w-7 items-center justify-center bg-foreground">
						<HugeiconsIcon
							icon={FlashIcon}
							className="size-3.5 text-background"
						/>
					</div>
					<span className="font-semibold tracking-tight text-foreground">
						Tanship
					</span>
					<span className="hidden text-xs text-muted-foreground sm:block">
						— Edge-native SaaS Starter Kit
					</span>
				</div>

				{/* Links */}
				<div className="flex flex-wrap gap-x-5 gap-y-2">
					{LINKS.map(({ label, href, external }) =>
						external ? (
							<a
								key={label}
								href={href}
								target="_blank"
								rel="noreferrer"
								className="text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground"
							>
								{label}
							</a>
						) : (
							<Link
								key={label}
								to={href}
								className="text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground"
							>
								{label}
							</Link>
						)
					)}
				</div>
			</div>

			<div className="mt-8 border-t border-border/30 pt-6">
				<p className="text-xs text-muted-foreground">
					© {year} Tanship. All rights reserved.
				</p>
			</div>
		</footer>
	);
}

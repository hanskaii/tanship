import { Link } from "@tanstack/react-router";
import { Badge, Button } from "@workspace/ui";
import { HugeiconsIcon } from "@hugeicons/react";
import { FlashIcon, GithubIcon } from "@hugeicons/core-free-icons";
import { authClient } from "@/auth/client";
import { appConfig } from "@workspace/config";

export function HomeNav() {
	const { data: session } = authClient.useSession();

	return (
		<nav className="fixed top-0 z-50 flex w-full justify-center border-b border-border/40 bg-background/60 backdrop-blur-xl">
			<div className="flex h-14 w-full max-w-3xl items-center justify-between px-6">
				<div className="flex items-center gap-2">
					<Link
						to="/"
						className="flex items-center gap-2 transition-opacity hover:opacity-80"
					>
						<div className="h-6 w-6 rounded-md bg-primary flex items-center justify-center">
							<HugeiconsIcon
								icon={FlashIcon}
								className="size-4 text-primary-foreground"
							/>
						</div>
						<span className="font-bold text-lg tracking-tight">
							Tanflare
						</span>
					</Link>
					<Badge
						variant="outline"
						className="text-[10px] py-0 px-1.5 opacity-60"
					>
						Beta
					</Badge>
				</div>
				<div className="flex items-center gap-6">
					<Link
						to="/docs"
						className="text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors hidden sm:block"
					>
						Docs
					</Link>
					<Link
						to="/templates"
						className="text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors hidden sm:block"
					>
						Templates
					</Link>
					<Link
						to="/showcase"
						className="text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors hidden sm:block"
					>
						Showcase
					</Link>
					<Link
						to="/changelog"
						className="text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors hidden sm:block"
					>
						Changelog
					</Link>
					<div className="flex items-center gap-3">
						<Button
							variant="ghost"
							size="sm"
							asChild
							className="hidden sm:flex h-8 text-[11px]"
						>
							<a
								href="https://github.com"
								target="_blank"
								rel="noreferrer"
							>
								<HugeiconsIcon
									icon={GithubIcon}
									className="size-3.5 mr-2"
								/>
								GitHub
							</a>
						</Button>
						<Button
							size="sm"
							asChild
							className="h-8 text-[11px] px-3"
						>
							<Link
								to={
									session?.user
										? appConfig.authDefaultRedirect
										: "/login"
								}
							>
								{session?.user ? "Dashboard" : "Sign in"}
							</Link>
						</Button>
					</div>
				</div>
			</div>
		</nav>
	);
}

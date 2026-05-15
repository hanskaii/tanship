import { Link } from "@tanstack/react-router";
import { Badge, Button } from "@workspace/ui";
import { HugeiconsIcon } from "@hugeicons/react";
import { FlashIcon, GithubIcon } from "@hugeicons/core-free-icons";
import { authClient } from "@/auth/client";
import { appConfig } from "@workspace/config";

export function HomeNav() {
	const { data: session } = authClient.useSession();

	return (
		<nav className="fixed top-0 z-50 flex w-full justify-center border-b border-border/40 bg-background/80 backdrop-blur-md">
			<div className="flex h-14 w-full max-w-3xl items-center justify-between px-4 sm:px-6">
				<div className="flex items-center gap-3">
					<Link
						to="/"
						className="flex items-center gap-2 transition-opacity hover:opacity-80"
					>
						<div className="h-6 w-6 rounded-none bg-foreground flex items-center justify-center">
							<HugeiconsIcon
								icon={FlashIcon}
								className="size-3 text-background"
							/>
						</div>
						<span className="font-semibold text-foreground tracking-tight">
							Tanship
						</span>
					</Link>
					<Badge
						variant="outline"
						className="text-[10px] py-0 px-2 rounded-full border-border/50 text-muted-foreground font-medium"
					>
						Beta
					</Badge>
				</div>
				<div className="flex items-center gap-6">
					<Link
						to="/docs"
						className="text-[12px] font-medium text-muted-foreground hover:text-foreground transition-colors hidden sm:block"
					>
						Docs
					</Link>
					<Link
						to="/templates"
						className="text-[12px] font-medium text-muted-foreground hover:text-foreground transition-colors hidden sm:block"
					>
						Templates
					</Link>
					<div className="flex items-center gap-3">
						<Button
							variant="ghost"
							size="sm"
							asChild
							className="hidden sm:flex h-8 text-[12px] rounded-none border border-transparent hover:border-border/50"
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
							className="h-8 text-[12px] px-4 rounded-none bg-foreground text-background hover:bg-foreground/90"
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

import { Link } from "@tanstack/react-router";
import { Badge, Button } from "@workspace/ui";
import { HugeiconsIcon } from "@hugeicons/react";
import { FlashIcon, GithubIcon } from "@hugeicons/core-free-icons";
import { authClient } from "@/auth/client";
import { appConfig } from "@workspace/config";
import { useEffect, useState } from "react";

export function HomeNav() {
	const { data: session } = authClient.useSession();
	const [scrolled, setScrolled] = useState(false);

	useEffect(() => {
		const onScroll = () => setScrolled(window.scrollY > 12);
		window.addEventListener("scroll", onScroll, { passive: true });
		return () => window.removeEventListener("scroll", onScroll);
	}, []);

	return (
		<nav
			className={`fixed top-0 z-50 flex w-full justify-center transition-all duration-200 ${
				scrolled
					? "border-b border-border/50 bg-background/90 backdrop-blur-md shadow-sm"
					: "border-b border-transparent bg-transparent"
			}`}
		>
			<div className="flex h-14 w-full max-w-3xl items-center justify-between px-4 sm:px-6">
				{/* Logo */}
				<div className="flex items-center gap-3">
					<Link
						to="/"
						className="flex items-center gap-2 transition-opacity hover:opacity-75"
					>
						<div className="flex h-6 w-6 items-center justify-center bg-foreground">
							<HugeiconsIcon
								icon={FlashIcon}
								className="size-3 text-background"
							/>
						</div>
						<span className="font-semibold tracking-tight text-foreground">
							Tanship
						</span>
					</Link>
					<Badge
						variant="outline"
						className="rounded-full border-border/40 px-2 py-0 text-[10px] font-medium text-muted-foreground"
					>
						Beta
					</Badge>
				</div>

				{/* Links */}
				<div className="flex items-center gap-5">
					<div className="hidden items-center gap-5 sm:flex">
						<a
							href="/docs"
							className="text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground"
						>
							Docs
						</a>
						<Link
							to="/templates"
							className="text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground"
						>
							Templates
						</Link>
						<a
							href="https://github.com/inurhuda00"
							target="_blank"
							rel="noreferrer"
							className="flex items-center gap-1.5 text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground"
						>
							<HugeiconsIcon
								icon={GithubIcon}
								className="size-3.5"
							/>
							GitHub
						</a>
					</div>

					<Button
						size="sm"
						asChild
						className="h-8 rounded-none bg-foreground px-4 text-[13px] text-background hover:bg-foreground/85"
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
		</nav>
	);
}

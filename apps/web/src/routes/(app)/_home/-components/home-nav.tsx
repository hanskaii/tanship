import { Link } from "@tanstack/react-router";
import { Button } from "@workspace/ui";
import { Logo } from "@/routes/-components/logo";
import { authClient } from "@/auth/client";
import { appConfig } from "@workspace/config";
import { ThemeToggle } from "@/routes/-components/layouts/theme-toggle";
import { motion, useScroll, useTransform } from "framer-motion";

export function HomeNav() {
	const { data: session } = authClient.useSession();
	const { scrollY } = useScroll();

	// Border fades in from invisible after 80px of scroll
	const borderOpacity = useTransform(scrollY, [0, 80], [0, 1]);

	return (
		<header className="fixed top-0 z-50 mx-auto flex h-14 w-full max-w-4xl items-center justify-between bg-background px-4 sm:px-6">
			{/* Scroll-aware bottom border */}
			<motion.div
				className="absolute inset-x-0 bottom-0 h-px bg-border"
				style={{ opacity: borderOpacity }}
			/>

			<div className="flex items-center gap-4">
				<Link
					to="/"
					className="flex flex-shrink-0 items-center justify-center gap-2 transition-opacity hover:opacity-80"
				>
					<Logo />
					<span className="font-semibold tracking-tight text-foreground">
						Tanship
					</span>
				</Link>
			</div>

			<div className="flex items-center gap-2">
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
					<Link
						to="/showcase"
						className="text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground"
					>
						Showcase
					</Link>
				</div>
				<ThemeToggle />
				<Button
					size="sm"
					asChild
					className="h-8 bg-foreground px-4 text-[13px] text-background hover:bg-foreground/85"
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
		</header>
	);
}

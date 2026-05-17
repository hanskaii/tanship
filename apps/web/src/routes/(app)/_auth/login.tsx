import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { Logo } from "@/routes/-components/logo";
import { z } from "zod";
import { ThemeToggle } from "@/routes/-components/layouts/theme-toggle";
import { LoginForm } from "./-components/login-form";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons";
import { buttonVariants } from "@workspace/ui";

const loginSearchSchema = z.object({
	redirect: z.string().optional()
});

export const Route = createFileRoute("/(app)/_auth/login")({
	validateSearch: loginSearchSchema,
	component: LoginPage,
	head: () => ({
		meta: [
			{ title: "Sign in — Tanship" },
			{ name: "description", content: "Sign in to your Tanship account." }
		]
	})
});

function LoginPage() {
	const search = useSearch({ from: "/(app)/_auth/login" });

	return (
		<div className="flex min-h-screen w-full">
			{/* Left — dark editorial panel */}
			<div className="relative hidden lg:flex lg:w-1/2 flex-col justify-between bg-foreground p-12">
				{/* Logo */}
				<Link
					to="/"
					className="flex items-center gap-2 transition-opacity hover:opacity-70"
				>
					<Logo />
					<span className="text-sm font-semibold tracking-tight text-background">
						Tanship
					</span>
				</Link>

				{/* Tagline */}
				<div className="flex flex-col gap-4">
					<p
						className="font-heading font-medium leading-[0.95] text-background"
						style={{
							fontSize: "clamp(2.4rem, 4vw, 3.2rem)",
							letterSpacing: "-0.04em"
						}}
					>
						Ship faster.
						<br />
						<span className="bg-primary px-1 text-primary-foreground">
							Start today.
						</span>
					</p>
					<p className="max-w-xs text-sm leading-relaxed text-background/50">
						Access your boilerplate, templates, and the complete
						SaaS stack built for Cloudflare.
					</p>
				</div>

				<p className="text-[11px] text-background/25">
					© {new Date().getFullYear()} Tanship
				</p>
			</div>

			{/* Right — form */}
			<div className="relative flex flex-1 flex-col">
				{/* Top bar */}
				<div className="flex items-center justify-between px-6 py-4 sm:px-10">
					{/* Logo — mobile only */}
					<Link
						to="/"
						className="flex items-center gap-2 transition-opacity hover:opacity-70 lg:hidden"
					>
						<Logo />
						<span className="text-sm font-semibold tracking-tight text-foreground">
							Tanship
						</span>
					</Link>
					<div className="hidden lg:block" />

					<div className="flex items-center gap-2">
						<ThemeToggle />
						<Link
							to="/"
							className={`${buttonVariants({ variant: "ghost", size: "sm" })} gap-1.5 text-[13px] font-medium text-muted-foreground hover:text-foreground`}
						>
							<HugeiconsIcon
								icon={ArrowLeft01Icon}
								className="size-3.5"
							/>
							Back
						</Link>
					</div>
				</div>

				{/* Centered form */}
				<div className="flex flex-1 items-center justify-center px-6 pb-12 sm:px-10">
					<div className="w-full max-w-sm">
						<div className="mb-8">
							<h1 className="text-2xl font-semibold tracking-[-0.02em] text-foreground">
								Welcome back
							</h1>
							<p className="mt-1.5 text-sm text-muted-foreground">
								Sign in to your Tanship account.
							</p>
						</div>

						<LoginForm redirectTo={search.redirect} />

						<p className="mt-6 text-[11px] text-muted-foreground">
							By continuing you agree to our{" "}
							<Link
								to="/legals/terms"
								className="underline underline-offset-2 hover:text-foreground"
							>
								Terms
							</Link>{" "}
							and{" "}
							<Link
								to="/legals/privacy-policy"
								className="underline underline-offset-2 hover:text-foreground"
							>
								Privacy Policy
							</Link>
							.
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}

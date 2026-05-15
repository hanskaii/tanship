import { ArrowLeft01Icon, FlashIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { buttonVariants } from "@workspace/ui";
import { z } from "zod";
import { ThemeToggle } from "@/routes/-components/layouts/theme-toggle";
import { LoginForm } from "./-components/login-form";

const loginSearchSchema = z.object({
	redirect: z.string().optional()
});

export const Route = createFileRoute("/(app)/_auth/login")({
	validateSearch: loginSearchSchema,
	component: LoginPage,
	head: () => ({
		meta: [
			{ title: "Sign in — Tanship" },
			{
				name: "description",
				content: "Sign in to your Tanship account."
			}
		]
	})
});

function LoginPage() {
	const search = useSearch({ from: "/(app)/_auth/login" });

	return (
		<div className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-background">
			{/* Subtle grid background */}
			<div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border)/0.3)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.3)_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_70%_70%_at_50%_50%,#000_40%,transparent_100%)]" />

			{/* Top-left: back button */}
			<Link
				to="/"
				className={`${buttonVariants({ variant: "ghost", size: "sm" })} absolute left-4 top-4 gap-1.5 text-[13px] font-medium text-muted-foreground hover:text-foreground`}
			>
				<HugeiconsIcon icon={ArrowLeft01Icon} className="size-3.5" />
				Home
			</Link>

			{/* Top-right: theme toggle */}
			<div className="absolute right-4 top-4">
				<ThemeToggle />
			</div>

			{/* Card */}
			<div className="relative z-10 w-full max-w-sm px-4">
				<div className="flex flex-col border border-border/60 bg-background p-8 shadow-sm dark:bg-muted/5">
					{/* Brand mark */}
					<div className="mb-8 flex flex-col items-center gap-3 text-center">
						<div className="flex h-10 w-10 items-center justify-center bg-foreground">
							<HugeiconsIcon
								icon={FlashIcon}
								className="size-5 text-background"
							/>
						</div>
						<div>
							<h1 className="text-xl font-semibold tracking-tight text-foreground">
								Sign in to Tanship
							</h1>
							<p className="mt-1 text-sm text-muted-foreground">
								Welcome back — let's build something great.
							</p>
						</div>
					</div>

					<LoginForm redirectTo={search.redirect} />
				</div>

				<p className="mt-4 text-center text-[11px] text-muted-foreground">
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
	);
}

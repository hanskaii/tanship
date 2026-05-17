import { Link } from "@tanstack/react-router";
import { Button } from "@workspace/ui";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { authClient } from "@/auth/client";

export function HeroSection() {
	const { data: session } = authClient.useSession();
	return (
		<section className="pb-24 pt-32">
			<div className="flex flex-col gap-10">
				{/* Eyebrow */}
				<div className="flex items-center gap-2">
					<div className="h-1.5 w-1.5 rounded-full bg-primary" />
					<span className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
						SaaS Boilerplate for Builders
					</span>
				</div>

				{/* Headline — Albert Sans, weight 400, tight tracking like Eleveight */}
				<div className="flex flex-col gap-5">
					<h1
						className="font-heading font-medium text-foreground"
						style={{
							fontSize: "clamp(2.8rem, 9vw, 4.8rem)",
							letterSpacing: "-0.04em",
							lineHeight: "1.0"
						}}
					>
						Ship faster with{" "}
						<span className="bg-primary px-1 text-primary-foreground">
							TanStack.
						</span>
						<br />
						Cost less with Cloudflare.
					</h1>
					<p
						className="max-w-lg text-muted-foreground"
						style={{
							fontSize: "17px",
							lineHeight: "1.6",
							letterSpacing: "-0.02em"
						}}
					>
						The complete boilerplate for building profitable SaaS —
						auth, payments, AI, database, storage, email, blog,
						dashboard, SEO and more.
					</p>
				</div>

				{/* CTAs */}
				<div className="flex flex-wrap items-center gap-3">
					<Button
						size="lg"
						className="h-11 bg-foreground px-6 text-sm font-medium text-background hover:bg-foreground/90"
						asChild
					>
						<a href="#pricing">
							Get Access
							<HugeiconsIcon
								icon={ArrowRight01Icon}
								className="ml-2 size-4"
							/>
						</a>
					</Button>
					<Button
						variant="ghost"
						size="lg"
						className="h-11 border border-border px-6 text-sm font-medium text-foreground hover:bg-secondary"
						asChild
					>
						{session?.user ? (
							<Link search={{ license: "" }} to="/activate">
								Activate
							</Link>
						) : (
							<Link to="/login">Sign in</Link>
						)}
					</Button>
				</div>
			</div>
		</section>
	);
}

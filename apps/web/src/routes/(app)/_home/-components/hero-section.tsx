import { Link } from "@tanstack/react-router";
import { Button } from "@workspace/ui";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { authClient } from "@/auth/client";
import { motion } from "framer-motion";
import { useHeroVariants } from "../-lib/motion";

export function HeroSection() {
	const { data: session } = authClient.useSession();
	const { container, item } = useHeroVariants();

	return (
		<section className="pb-24 pt-32">
			<motion.div
				className="flex flex-col gap-10"
				variants={container}
				initial="hidden"
				animate="show"
			>
				{/* Eyebrow */}
				<motion.div variants={item} className="flex items-center gap-2">
					{/* Pulsing dot — "edge is live" indicator */}
					<motion.div
						className="h-1.5 w-1.5 rounded-full bg-primary"
						animate={{ opacity: [1, 0.3, 1] }}
						transition={{
							duration: 2,
							ease: "easeInOut",
							repeat: Infinity,
							repeatType: "loop"
						}}
					/>
					<span className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
						SaaS Boilerplate for Builders
					</span>
				</motion.div>

				{/* Headline */}
				<motion.div variants={item} className="flex flex-col gap-5">
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
				</motion.div>

				{/* CTAs */}
				<motion.div
					variants={item}
					className="flex flex-wrap items-center gap-3"
				>
					<Button
						size="lg"
						className="group h-11 bg-foreground px-6 text-sm font-medium text-background hover:bg-foreground/90"
						asChild
					>
						<a href="#pricing">
							Get Access
							<HugeiconsIcon
								icon={ArrowRight01Icon}
								className="ml-2 size-4 transition-transform duration-200 group-hover:translate-x-1"
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
				</motion.div>
			</motion.div>
		</section>
	);
}

import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@workspace/ui";
import { motion } from "framer-motion";
import { EASE_OUT_EXPO } from "../-lib/motion";
import { HugeiconsIcon } from "@hugeicons/react";
import {
	ArrowRight01Icon,
	ArrowUpRight01Icon,
	GlobeIcon,
	TwitterIcon
} from "@hugeicons/core-free-icons";
import {
	showcasesQueryOptions,
	type ShowcaseItem
} from "@/routes/-fn/showcase";
import { FooterSection } from "../-components/footer-section";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/(app)/_home/showcase/")({
	head: () =>
		seo({
			title: "Showcase",
			description:
				"Real products shipped with Tanship. See what builders are launching on the edge-native TanStack Start + Cloudflare stack.",
			path: "/showcase",
			ogEyebrow: "Showcase"
		}),
	component: ShowcasePage
});

function ShowcaseCardSkeleton() {
	return (
		<div className="rounded-2xl bg-secondary p-2 animate-pulse">
			<div className="flex flex-col gap-6 rounded-xl bg-card px-5 py-6 sm:grid sm:grid-cols-3 sm:gap-6 sm:px-6 sm:py-8">
				<div className="flex flex-col gap-3">
					<div className="h-4 w-2/3 rounded bg-secondary" />
					<div className="h-3 w-full rounded bg-secondary" />
					<div className="h-3 w-4/5 rounded bg-secondary" />
				</div>
				<div className="col-span-2 aspect-[14/9] rounded-xl bg-secondary" />
			</div>
		</div>
	);
}

function ShowcaseCard({ item }: { item: ShowcaseItem }) {
	const imageUrl = item.imageKey ? `/api/files/${item.imageKey}` : null;
	const [isLoaded, setIsLoaded] = useState(false);

	return (
		<motion.div
			initial={{ opacity: 0, y: 12 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.45, ease: EASE_OUT_EXPO }}
			className="rounded-2xl bg-secondary p-2"
		>
			<div className="group flex flex-col gap-6 rounded-xl bg-card px-5 py-6 sm:grid sm:grid-cols-3 sm:gap-6 sm:px-6 sm:py-8">
				{/* Text column */}
				<div className="flex flex-col gap-4 justify-between">
					<div className="flex flex-col gap-2">
						<div className="flex items-start justify-between gap-2">
							<h3
								className="text-base font-semibold leading-tight text-foreground"
								style={{ letterSpacing: "-0.02em" }}
							>
								{item.projectName}
							</h3>
							<a
								href={item.projectUrl}
								target="_blank"
								rel="noreferrer"
								className="shrink-0 text-muted-foreground transition-colors hover:text-foreground"
								title="Visit project"
							>
								<HugeiconsIcon
									icon={ArrowUpRight01Icon}
									className="size-4"
								/>
							</a>
						</div>
						<p className="text-sm leading-relaxed text-muted-foreground">
							{item.description}
						</p>
					</div>

					<div className="flex items-center justify-between">
						<span className="text-xs font-medium text-muted-foreground">
							{item.submitterName}
						</span>
						{item.twitterHandle && (
							<a
								href={`https://twitter.com/${item.twitterHandle}`}
								target="_blank"
								rel="noreferrer"
								className="text-muted-foreground transition-colors hover:text-foreground"
							>
								<HugeiconsIcon
									icon={TwitterIcon}
									className="size-4"
								/>
							</a>
						)}
					</div>
				</div>

				{/* Image */}
				<div className="relative col-span-2 aspect-[14/9] overflow-hidden rounded-xl bg-card">
					{imageUrl ? (
						<>
							<img
								src={imageUrl}
								alt={item.projectName}
								onLoad={() => setIsLoaded(true)}
								className={`h-full w-full object-cover transition-all duration-500 group-hover:scale-[1.03] ${
									isLoaded
										? "opacity-100 scale-100"
										: "opacity-0 scale-95"
								}`}
							/>
							{!isLoaded && (
								<div className="absolute inset-0 bg-muted/20 animate-pulse" />
							)}
						</>
					) : (
						<div className="flex h-full w-full items-center justify-center bg-secondary">
							<HugeiconsIcon
								icon={GlobeIcon}
								className="size-10 text-muted-foreground/20"
							/>
						</div>
					)}
				</div>
			</div>
		</motion.div>
	);
}

function ShowcasePage() {
	const { data: showcases = [], isLoading } = useQuery(
		showcasesQueryOptions()
	);

	return (
		<>
			<main className="px-4 sm:px-6 pb-32 pt-24">
				<motion.div
					className="mb-16 flex flex-col gap-5 border-b border-border/40 pb-16"
					initial={{ opacity: 0, y: 16 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5, ease: EASE_OUT_EXPO }}
				>
					<div className="flex items-center gap-2">
						<div className="h-1.5 w-1.5 rounded-full bg-primary" />
						<span className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
							Showcase
						</span>
					</div>
					<h1
						className="font-heading font-medium text-foreground"
						style={{
							fontSize: "clamp(2rem, 5vw, 3rem)",
							letterSpacing: "-0.04em",
							lineHeight: "1.05"
						}}
					>
						Built with Tanship
					</h1>
					<p
						className="max-w-md text-base leading-relaxed text-muted-foreground"
						style={{ letterSpacing: "-0.01em" }}
					>
						Real products and projects built by our community.
					</p>
					<Button
						size="lg"
						className="h-11 w-fit px-6 text-sm font-medium bg-foreground text-background hover:bg-foreground/90"
						asChild
					>
						<Link to="/showcase/submit">
							Submit your project
							<HugeiconsIcon
								icon={ArrowRight01Icon}
								className="ml-2 size-4"
							/>
						</Link>
					</Button>
				</motion.div>

				{isLoading ? (
					<div className="flex flex-col gap-3">
						{Array.from({ length: 3 }).map((_, i) => (
							<ShowcaseCardSkeleton key={i} />
						))}
					</div>
				) : showcases.length === 0 ? (
					<div className="rounded-2xl bg-secondary p-2">
						<div className="rounded-xl bg-card flex flex-col items-center gap-5 py-20 text-center">
							<div className="flex size-14 items-center justify-center rounded-xl bg-secondary">
								<HugeiconsIcon
									icon={GlobeIcon}
									className="size-6 text-muted-foreground/40"
								/>
							</div>
							<div className="flex flex-col gap-1.5">
								<p className="text-sm font-semibold text-foreground">
									No projects yet
								</p>
								<p className="text-xs text-muted-foreground">
									Be the first to showcase what you built with
									Tanship.
								</p>
							</div>
							<Button
								size="sm"
								variant="outline"
								className="px-5 font-medium"
								asChild
							>
								<Link to="/showcase/submit">
									Submit your project
								</Link>
							</Button>
						</div>
					</div>
				) : (
					<div className="flex flex-col gap-3">
						{showcases.map((item) => (
							<ShowcaseCard key={item.id} item={item} />
						))}
					</div>
				)}
			</main>
			<FooterSection />
		</>
	);
}

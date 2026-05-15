import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Badge, Button } from "@workspace/ui";
import { motion } from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import {
	ArrowRight01Icon,
	GlobeIcon,
	TwitterIcon
} from "@hugeicons/core-free-icons";
import {
	showcasesQueryOptions,
	type ShowcaseItem
} from "@/routes/-fn/showcase";

export const Route = createFileRoute("/(app)/_home/showcase/")({
	component: ShowcasePage
});

function ShowcaseCardSkeleton() {
	return (
		<div className="flex flex-col border border-border/40 bg-background animate-pulse">
			<div className="h-44 bg-muted/30" />
			<div className="flex flex-col gap-3 p-5">
				<div className="h-3.5 w-2/3 rounded bg-muted/40" />
				<div className="h-3 w-full rounded bg-muted/30" />
				<div className="h-3 w-4/5 rounded bg-muted/30" />
				<div className="mt-2 h-3 w-1/3 rounded bg-muted/20" />
			</div>
		</div>
	);
}

function ShowcaseCard({ item }: { item: ShowcaseItem }) {
	const imageUrl = item.imageKey ? `/api/files/${item.imageKey}` : null;

	return (
		<motion.div
			initial={{ opacity: 0, y: 12 }}
			animate={{ opacity: 1, y: 0 }}
			className="group flex flex-col border border-border/50 bg-background transition-all hover:border-border hover:shadow-sm dark:bg-muted/5"
		>
			{/* Screenshot */}
			<div className="relative h-44 overflow-hidden border-b border-border/40 bg-muted/20">
				{imageUrl ? (
					<img
						src={imageUrl}
						alt={item.projectName}
						className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
					/>
				) : (
					<div className="flex h-full w-full items-center justify-center">
						<HugeiconsIcon
							icon={GlobeIcon}
							className="size-10 text-muted-foreground/20"
						/>
					</div>
				)}
			</div>

			{/* Info */}
			<div className="flex flex-col gap-3 p-5 flex-1">
				<div className="flex flex-col gap-1 flex-1">
					<div className="flex items-center justify-between gap-2">
						<h3 className="text-sm font-semibold leading-tight text-foreground">
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
								icon={ArrowRight01Icon}
								className="size-4"
							/>
						</a>
					</div>
					<p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
						{item.description}
					</p>
				</div>

				<div className="flex items-center justify-between border-t border-border/30 pt-3">
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
		</motion.div>
	);
}

function ShowcasePage() {
	const { data: showcases = [], isLoading } = useQuery(
		showcasesQueryOptions()
	);

	return (
		<div className="relative flex min-h-screen flex-col items-center overflow-hidden bg-background">
			{/* Background */}
			<div className="pointer-events-none fixed inset-0 z-0 bg-[linear-gradient(to_right,hsl(var(--border)/0.15)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.15)_1px,transparent_1px)] bg-[size:28px_28px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

			<main className="relative z-10 mx-auto flex w-full max-w-3xl flex-col px-4 pb-32 pt-24 sm:px-6">
				{/* Header */}
				<motion.div
					initial={{ opacity: 0, y: 16 }}
					animate={{ opacity: 1, y: 0 }}
					className="mb-16 flex flex-col gap-5 border-b border-border/40 pb-16"
				>
					<Badge
						variant="secondary"
						className="w-fit rounded-full border border-border/50 bg-muted/30 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-foreground"
					>
						Showcase
					</Badge>
					<h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
						Built with Tanship
					</h1>
					<p className="max-w-md text-base leading-relaxed text-muted-foreground">
						Real products and projects built by our community.
					</p>

					<Button
						size="lg"
						className="w-fit rounded-none bg-foreground px-6 text-sm font-medium text-background hover:bg-foreground/90"
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

				{/* Grid */}
				{isLoading ? (
					<div className="grid gap-5 sm:grid-cols-2">
						{Array.from({ length: 4 }).map((_, i) => (
							<ShowcaseCardSkeleton key={i} />
						))}
					</div>
				) : showcases.length === 0 ? (
					<div className="flex flex-col items-center gap-5 border border-border/50 bg-muted/5 py-20 text-center dark:bg-muted/10">
						<div className="flex h-14 w-14 items-center justify-center border border-border/50 bg-background">
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
							className="rounded-none px-5 font-medium"
							asChild
						>
							<Link to="/showcase/submit">
								Submit your project
							</Link>
						</Button>
					</div>
				) : (
					<div className="grid gap-5 sm:grid-cols-2">
						{showcases.map((item) => (
							<ShowcaseCard key={item.id} item={item} />
						))}
					</div>
				)}
			</main>
		</div>
	);
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Badge, Button } from "@workspace/ui";
import { motion } from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import {
	FlashIcon,
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

function ShowcaseCard({ item }: { item: ShowcaseItem }) {
	const imageUrl = item.imageKey ? `/api/files/${item.imageKey}` : null;

	return (
		<motion.div
			initial={{ opacity: 0, y: 16 }}
			animate={{ opacity: 1, y: 0 }}
			className="group flex flex-col rounded-none border border-border/50 bg-background overflow-hidden hover:bg-muted/5 transition-colors"
		>
			{/* Screenshot */}
			<div className="h-44 bg-muted/20 border-b border-border/50 relative overflow-hidden flex items-center justify-center">
				{imageUrl ? (
					<img
						src={imageUrl}
						alt={item.projectName}
						className="w-full h-full object-cover"
					/>
				) : (
					<HugeiconsIcon
						icon={GlobeIcon}
						className="size-10 text-muted-foreground/30"
					/>
				)}
			</div>

			{/* Info */}
			<div className="flex flex-col gap-3 p-5 flex-1">
				<div className="flex flex-col gap-1.5 flex-1">
					<div className="flex items-center justify-between gap-2">
						<h3 className="font-semibold text-sm leading-tight">
							{item.projectName}
						</h3>
						<a
							href={item.projectUrl}
							target="_blank"
							rel="noreferrer"
							className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
							title="Visit project"
						>
							<HugeiconsIcon
								icon={ArrowRight01Icon}
								className="size-4"
							/>
						</a>
					</div>
					<p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
						{item.description}
					</p>
				</div>

				<div className="flex items-center justify-between pt-3 border-t border-border/30">
					<span className="text-xs text-muted-foreground font-medium">
						{item.submitterName}
					</span>
					{item.twitterHandle && (
						<a
							href={`https://twitter.com/${item.twitterHandle}`}
							target="_blank"
							rel="noreferrer"
							className="text-muted-foreground hover:text-foreground transition-colors"
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
		<div className="relative flex min-h-screen flex-col items-center bg-background overflow-hidden">
			{/* Background */}
			<div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
				<div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
			</div>

			<main className="relative z-10 pt-24 pb-32 flex w-full max-w-3xl flex-col px-4 sm:px-6 mx-auto">
				{/* Header */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					className="flex flex-col gap-6 mb-16 border-b border-border/40 pb-16"
				>
					<Badge
						variant="secondary"
						className="w-fit px-3 py-1 bg-muted/30 text-foreground border border-border/50 text-[10px] uppercase tracking-widest font-bold rounded-full"
					>
						Showcase
					</Badge>
					<h1 className="text-4xl sm:text-5xl font-semibold tracking-tight">
						Built with Tanflare
					</h1>
					<p className="text-base text-muted-foreground max-w-md leading-relaxed">
						Real products and projects built by our community.
					</p>

					<div className="mt-2">
						<Button
							size="lg"
							className="rounded-none px-6 h-12 text-sm font-medium bg-foreground text-background hover:bg-foreground/90"
							asChild
						>
							<Link to="/showcase/submit">
								Submit your project
								<HugeiconsIcon
									icon={ArrowRight01Icon}
									className="size-4 ml-2"
								/>
							</Link>
						</Button>
					</div>
				</motion.div>

				{/* Grid */}
				{isLoading ? (
					<div className="grid gap-6 sm:grid-cols-2">
						{Array.from({ length: 4 }).map((_, i) => (
							<div
								key={i}
								className="h-64 rounded-none bg-muted/20 animate-pulse border border-border/50"
							/>
						))}
					</div>
				) : showcases.length === 0 ? (
					<div className="flex flex-col items-center gap-4 py-20 text-center border border-border/50 bg-muted/5 rounded-none">
						<div className="size-16 rounded-none bg-background border border-border/50 flex items-center justify-center">
							<HugeiconsIcon
								icon={GlobeIcon}
								className="size-6 text-muted-foreground/50"
							/>
						</div>
						<div className="flex flex-col gap-1">
							<p className="text-sm font-semibold">
								No projects yet
							</p>
							<p className="text-xs text-muted-foreground">
								Be the first to showcase what you built with
								Tanflare.
							</p>
						</div>
						<Button
							size="sm"
							variant="outline"
							className="rounded-none px-5 h-9 mt-2 font-medium"
							asChild
						>
							<Link to="/showcase/submit">
								Submit your project
							</Link>
						</Button>
					</div>
				) : (
					<div className="grid gap-6 sm:grid-cols-2">
						{showcases.map((item) => (
							<ShowcaseCard key={item.id} item={item} />
						))}
					</div>
				)}
			</main>
		</div>
	);
}

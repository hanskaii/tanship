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
	const imageUrl = item.imageKey
		? `/api/files/${item.imageKey}`
		: null;

	return (
		<motion.div
			initial={{ opacity: 0, y: 16 }}
			animate={{ opacity: 1, y: 0 }}
			className="group flex flex-col rounded-2xl border border-border/50 bg-muted/10 overflow-hidden hover:ring-1 hover:ring-primary/20 transition-all"
		>
			{/* Screenshot */}
			<div className="h-44 bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 relative overflow-hidden flex items-center justify-center">
				{imageUrl ? (
					<img
						src={imageUrl}
						alt={item.projectName}
						className="w-full h-full object-cover"
					/>
				) : (
					<HugeiconsIcon
						icon={GlobeIcon}
						className="size-10 text-muted-foreground/20"
					/>
				)}
			</div>

			{/* Info */}
			<div className="flex flex-col gap-3 p-4 flex-1">
				<div className="flex flex-col gap-1 flex-1">
					<div className="flex items-center justify-between gap-2">
						<h3 className="font-bold text-sm leading-tight">
							{item.projectName}
						</h3>
						<a
							href={item.projectUrl}
							target="_blank"
							rel="noreferrer"
							className="shrink-0 text-muted-foreground hover:text-primary transition-colors"
							title="Visit project"
						>
							<HugeiconsIcon
								icon={ArrowRight01Icon}
								className="size-3.5"
							/>
						</a>
					</div>
					<p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-3">
						{item.description}
					</p>
				</div>

				<div className="flex items-center justify-between pt-2 border-t border-border/30">
					<span className="text-[11px] text-muted-foreground font-medium">
						{item.submitterName}
					</span>
					{item.twitterHandle && (
						<a
							href={`https://twitter.com/${item.twitterHandle}`}
							target="_blank"
							rel="noreferrer"
							className="text-muted-foreground hover:text-primary transition-colors"
						>
							<HugeiconsIcon
								icon={TwitterIcon}
								className="size-3.5"
							/>
						</a>
					)}
				</div>
			</div>
		</motion.div>
	);
}

function ShowcasePage() {
	const { data: showcases = [], isLoading } = useQuery(showcasesQueryOptions());

	return (
		<div className="relative flex min-h-screen flex-col items-center bg-background overflow-hidden">
			{/* Background */}
			<div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
				<div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-30" />
				<div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-30" />
				<div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
			</div>

			<main className="relative z-10 mt-28 mb-32 w-full max-w-5xl px-6 flex flex-col gap-12">
				{/* Header */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					className="flex flex-col items-center text-center gap-4"
				>
					<div className="flex items-center justify-center size-12 rounded-2xl bg-primary/10 border border-primary/20">
						<HugeiconsIcon
							icon={FlashIcon}
							className="size-6 text-primary"
						/>
					</div>
					<div className="flex flex-col gap-2">
						<Badge
							variant="secondary"
							className="px-3 py-0.5 bg-primary/5 text-primary border-primary/20 text-[10px] uppercase tracking-wider font-bold mx-auto"
						>
							Showcase
						</Badge>
						<h1 className="text-3xl font-extrabold tracking-tight">
							Built with Tanflare
						</h1>
						<p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
							Real products and projects built by our community.
						</p>
					</div>
					<Button
						size="sm"
						className="rounded-full px-6 h-9 text-xs"
						asChild
					>
						<Link to="/showcase/submit">
							<HugeiconsIcon
								icon={ArrowRight01Icon}
								className="size-3 mr-2"
							/>
							Submit yours
						</Link>
					</Button>
				</motion.div>

				{/* Grid */}
				{isLoading ? (
					<div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
						{Array.from({ length: 6 }).map((_, i) => (
							<div
								key={i}
								className="h-64 rounded-2xl bg-muted/20 animate-pulse"
							/>
						))}
					</div>
				) : showcases.length === 0 ? (
					<div className="flex flex-col items-center gap-4 py-20 text-center">
						<div className="size-16 rounded-full bg-muted/20 flex items-center justify-center">
							<HugeiconsIcon
								icon={GlobeIcon}
								className="size-7 text-muted-foreground/30"
							/>
						</div>
						<div className="flex flex-col gap-1">
							<p className="text-sm font-medium">No projects yet</p>
							<p className="text-[11px] text-muted-foreground">
								Be the first to showcase what you built with Tanflare.
							</p>
						</div>
						<Button
							size="sm"
							variant="outline"
							className="rounded-full px-5 h-8 text-xs"
							asChild
						>
							<Link to="/showcase/submit">Submit your project</Link>
						</Button>
					</div>
				) : (
					<div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
						{showcases.map((item) => (
							<ShowcaseCard key={item.id} item={item} />
						))}
					</div>
				)}
			</main>
		</div>
	);
}

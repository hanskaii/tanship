import { createFileRoute, Link } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { source } from "./-lib/source";
import { Badge } from "@workspace/ui";
import { motion } from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import { FlashIcon, ArrowRight01Icon } from "@hugeicons/core-free-icons";

export const Route = createFileRoute("/(app)/_home/changelog/")({
	component: ChangelogListPage,
	loader: async () => serverLoader()
});

const serverLoader = createServerFn({ method: "GET" }).handler(async () => {
	const pages = source.getPages();

	// Sort newest first by date frontmatter
	const sorted = [...pages].sort((a, b) => {
		const dateA = new Date((a.data as any).date ?? 0).getTime();
		const dateB = new Date((b.data as any).date ?? 0).getTime();
		return dateB - dateA;
	});

	return sorted.map((page) => ({
		title: page.data.title,
		description: page.data.description ?? "",
		url: page.url,
		version: (page.data as any).version ?? "",
		date: (page.data as any).date ?? "",
		tags: ((page.data as any).tags ?? []) as string[]
	}));
});

const TAG_COLORS: Record<string, string> = {
	major: "bg-primary/10 text-primary border-primary/20",
	launch: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
	beta: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
	fix: "bg-red-500/10 text-red-500 border-red-500/20",
	improvement: "bg-blue-500/10 text-blue-500 border-blue-500/20"
};

function ChangelogListPage() {
	const entries = Route.useLoaderData() as Array<{
		title: string;
		description: string;
		url: string;
		version: string;
		date: string;
		tags: string[];
	}>;

	return (
		<div className="relative flex min-h-screen flex-col items-center bg-background overflow-hidden">
			{/* Background */}
			<div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
				<div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
			</div>

			<main className="relative z-10 pt-24 pb-32 w-full max-w-3xl px-4 sm:px-6 mx-auto flex flex-col gap-16">
				{/* Header */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.4 }}
					className="flex flex-col gap-6 border-b border-border/40 pb-12 text-center items-center"
				>
					<Badge
						variant="secondary"
						className="px-3 py-1 bg-muted/30 text-foreground border border-border/50 text-[10px] uppercase tracking-widest font-bold mx-auto rounded-full"
					>
						Changelog
					</Badge>
					<h1 className="text-4xl sm:text-5xl font-semibold tracking-tight">
						What's new in Tanflare
					</h1>
					<p className="text-base text-muted-foreground max-w-md leading-relaxed">
						Product updates, improvements, and release notes.
					</p>
				</motion.div>

				{/* Timeline */}
				<div className="relative flex flex-col">
					{/* Vertical line */}
					<div className="absolute left-[7px] top-2 bottom-0 w-px bg-border/50" />

					<div className="flex flex-col gap-12">
						{entries.map((entry, i) => (
							<motion.div
								key={entry.url}
								initial={{ opacity: 0, x: -10 }}
								animate={{ opacity: 1, x: 0 }}
								transition={{ duration: 0.3, delay: i * 0.05 }}
								className="relative pl-10"
							>
								{/* Dot */}
								<div className="absolute left-[-2px] top-1.5 size-4 rounded-none bg-background border-2 border-foreground ring-4 ring-background" />

								<div className="flex flex-col gap-4">
									{/* Meta */}
									<div className="flex flex-wrap items-center gap-3">
										{entry.version && (
											<span className="font-mono text-xs font-bold text-foreground bg-muted/30 border border-border/50 px-2 py-0.5 rounded-none">
												v{entry.version}
											</span>
										)}
										{entry.date && (
											<span className="text-xs text-muted-foreground font-mono uppercase tracking-wider">
												{new Date(
													entry.date
												).toLocaleDateString("en-US", {
													year: "numeric",
													month: "long",
													day: "numeric"
												})}
											</span>
										)}
										{entry.tags.map((tag) => (
											<span
												key={tag}
												className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-none border ${TAG_COLORS[tag] ?? "bg-muted/10 text-muted-foreground border-border/50"}`}
											>
												{tag}
											</span>
										))}
									</div>

									{/* Content */}
									<div className="flex flex-col gap-2">
										<h2 className="text-xl font-semibold leading-tight">
											{entry.title}
										</h2>
										{entry.description && (
											<p className="text-sm text-muted-foreground leading-relaxed">
												{entry.description}
											</p>
										)}
									</div>

									<Link
										to={entry.url as any}
										className="inline-flex items-center gap-1.5 text-xs font-semibold text-foreground hover:text-muted-foreground transition-colors w-fit mt-2 uppercase tracking-widest border-b border-foreground pb-0.5"
									>
										Read full release notes
										<HugeiconsIcon
											icon={ArrowRight01Icon}
											className="size-3"
										/>
									</Link>
								</div>
							</motion.div>
						))}
					</div>
				</div>
			</main>
		</div>
	);
}

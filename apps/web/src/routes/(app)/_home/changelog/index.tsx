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
				<div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-30" />
				<div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-30" />
				<div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
			</div>

			<main className="relative z-10 mt-28 mb-32 w-full max-w-2xl px-6 flex flex-col gap-16">
				{/* Header */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.4 }}
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
							Changelog
						</Badge>
						<h1 className="text-3xl font-extrabold tracking-tight">
							What's new in Tanflare
						</h1>
						<p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
							Product updates, improvements, and release notes.
						</p>
					</div>
				</motion.div>

				{/* Timeline */}
				<div className="relative flex flex-col">
					{/* Vertical line */}
					<div className="absolute left-[7px] top-2 bottom-0 w-px bg-border/50" />

					<div className="flex flex-col gap-10">
						{entries.map((entry, i) => (
							<motion.div
								key={entry.url}
								initial={{ opacity: 0, x: -10 }}
								animate={{ opacity: 1, x: 0 }}
								transition={{ duration: 0.3, delay: i * 0.05 }}
								className="relative pl-8"
							>
								{/* Dot */}
								<div className="absolute left-0 top-1.5 size-3.5 rounded-full bg-primary/20 border-2 border-primary/50 ring-4 ring-background" />

								<div className="flex flex-col gap-3">
									{/* Meta */}
									<div className="flex flex-wrap items-center gap-2">
										{entry.version && (
											<span className="font-mono text-xs font-bold text-foreground/70 bg-muted/30 px-2 py-0.5 rounded">
												v{entry.version}
											</span>
										)}
										{entry.date && (
											<span className="text-[11px] text-muted-foreground">
												{new Date(entry.date).toLocaleDateString(
													"en-US",
													{
														year: "numeric",
														month: "long",
														day: "numeric"
													}
												)}
											</span>
										)}
										{entry.tags.map((tag) => (
											<span
												key={tag}
												className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border ${TAG_COLORS[tag] ?? "bg-muted/40 text-muted-foreground border-border/50"}`}
											>
												{tag}
											</span>
										))}
									</div>

									{/* Content */}
									<div className="flex flex-col gap-1.5">
										<h2 className="text-base font-bold leading-tight">
											{entry.title}
										</h2>
										{entry.description && (
											<p className="text-[13px] text-muted-foreground leading-relaxed">
												{entry.description}
											</p>
										)}
									</div>

									<Link
										to={entry.url as any}
										className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:opacity-80 transition-opacity w-fit"
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

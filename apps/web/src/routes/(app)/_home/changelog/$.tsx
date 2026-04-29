import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { source } from "./-lib/source";
import { DocsBody, DocsPage } from "fumadocs-ui/layouts/docs/page";
import { Suspense } from "react";
import { useMDXComponents } from "../docs/-components/mdx";
import { Badge } from "@workspace/ui";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons";

// @ts-ignore - collections will be generated
import browserCollections from "collections/browser";

const changelogClientLoader = (browserCollections as any).changelog?.createClientLoader({
	component({ toc, default: MDX }: any) {
		return (
			<DocsPage toc={toc}>
				<DocsBody>
					<MDX components={useMDXComponents()} />
				</DocsBody>
			</DocsPage>
		);
	}
});

export const Route = createFileRoute("/(app)/_home/changelog/$")({
	component: ChangelogEntryPage,
	loader: async ({ params }) => {
		const slugs = params._splat?.split("/") ?? [];
		const data = await serverLoader({ data: slugs });
		if (changelogClientLoader) {
			await changelogClientLoader.preload(data.path);
		}
		return data;
	}
});

const serverLoader = createServerFn({ method: "GET" })
	.inputValidator((slugs: string[]) => slugs)
	.handler(async ({ data: slugs }) => {
		const page = source.getPage(slugs);
		if (!page) throw notFound();

		return {
			path: page.path,
			title: page.data.title,
			description: page.data.description ?? "",
			version: ((page.data as any).version ?? "") as string,
			date: ((page.data as any).date ?? "") as string,
			tags: (((page.data as any).tags ?? []) as string[])
		};
	});

const TAG_COLORS: Record<string, string> = {
	major: "bg-primary/10 text-primary border-primary/20",
	launch: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
	beta: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
	fix: "bg-red-500/10 text-red-500 border-red-500/20",
	improvement: "bg-blue-500/10 text-blue-500 border-blue-500/20"
};

function ChangelogEntryPage() {
	const data = Route.useLoaderData() as {
		path: string;
		title: string;
		description: string;
		version: string;
		date: string;
		tags: string[];
	};

	return (
		<div className="relative flex min-h-screen flex-col bg-background">
			<div className="mx-auto w-full max-w-2xl px-6 py-10">
				{/* Back link */}
				<Link
					to="/changelog"
					className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground hover:text-foreground transition-colors mb-8"
				>
					<HugeiconsIcon icon={ArrowLeft01Icon} className="size-3" />
					All releases
				</Link>

				{/* Header */}
				<div className="flex flex-col gap-3 mb-8 pb-8 border-b border-border/50">
					<div className="flex flex-wrap items-center gap-2">
						{data.version && (
							<span className="font-mono text-sm font-bold bg-muted/30 px-2 py-0.5 rounded">
								v{data.version}
							</span>
						)}
						{data.date && (
							<span className="text-xs text-muted-foreground">
								{new Date(data.date).toLocaleDateString("en-US", {
									year: "numeric",
									month: "long",
									day: "numeric"
								})}
							</span>
						)}
						{data.tags.map((tag: string) => (
							<Badge
								key={tag}
								variant="secondary"
								className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 h-auto border ${TAG_COLORS[tag] ?? "bg-muted/40 text-muted-foreground border-border/50"}`}
							>
								{tag}
							</Badge>
						))}
					</div>
					<h1 className="text-2xl font-extrabold tracking-tight">
						{data.title}
					</h1>
					{data.description && (
						<p className="text-sm text-muted-foreground leading-relaxed">
							{data.description}
						</p>
					)}
				</div>

				{/* MDX Content */}
				<div className="prose prose-sm dark:prose-invert max-w-none">
					{changelogClientLoader && (
						<Suspense>{changelogClientLoader.useContent(data.path)}</Suspense>
					)}
				</div>
			</div>
		</div>
	);
}

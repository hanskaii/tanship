import { createFileRoute, notFound } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { source } from "./-lib/source";
import { DocsLayout } from "fumadocs-ui/layouts/docs";
import {
	DocsBody,
	DocsDescription,
	DocsPage,
	DocsTitle
} from "fumadocs-ui/layouts/docs/page";
import { baseOptions } from "./-lib/layout.shared";
import { useFumadocsLoader } from "fumadocs-core/source/client";
import { Suspense } from "react";
import { useMDXComponents } from "../docs/-components/mdx";
import { Badge } from "@workspace/ui";

// @ts-ignore - collections will be generated
import browserCollections from "collections/browser";

const TAG_COLORS: Record<string, string> = {
	major: "bg-primary/10 text-primary border-primary/20",
	launch: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
	beta: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
	fix: "bg-red-500/10 text-red-500 border-red-500/20",
	improvement: "bg-blue-500/10 text-blue-500 border-blue-500/20"
};

const changelogClientLoader = (
	browserCollections as any
).changelog?.createClientLoader({
	component({ toc, frontmatter, default: MDX }: any) {
		const tags = (frontmatter?.tags ?? []) as string[];

		return (
			<DocsPage toc={toc}>
				<DocsTitle>{frontmatter?.title ?? ""}</DocsTitle>
				{frontmatter?.description && (
					<DocsDescription>{frontmatter.description}</DocsDescription>
				)}
				<div className="flex flex-wrap items-center gap-2 mb-6">
					{frontmatter?.version && (
						<span className="font-mono text-sm font-bold bg-muted/30 px-2 py-0.5 rounded">
							v{frontmatter.version}
						</span>
					)}
					{frontmatter?.date && (
						<span className="text-xs text-muted-foreground">
							{new Date(frontmatter.date).toLocaleDateString(
								"en-US",
								{
									year: "numeric",
									month: "long",
									day: "numeric"
								}
							)}
						</span>
					)}
					{tags.map((tag: string) => (
						<Badge
							key={tag}
							variant="secondary"
							className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 h-auto border ${TAG_COLORS[tag] ?? "bg-muted/40 text-muted-foreground border-border/50"}`}
						>
							{tag}
						</Badge>
					))}
				</div>
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
			pageTree: await source.serializePageTree(source.getPageTree())
		};
	});

function ChangelogEntryPage() {
	const data = useFumadocsLoader(Route.useLoaderData());

	return (
		<DocsLayout {...baseOptions()} tree={data.pageTree}>
			<Suspense>
				{changelogClientLoader &&
					changelogClientLoader.useContent(data.path)}
			</Suspense>
		</DocsLayout>
	);
}

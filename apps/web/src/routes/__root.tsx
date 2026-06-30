import type { QueryClient } from "@tanstack/react-query";
import {
	createRootRouteWithContext,
	HeadContent,
	Outlet,
	Scripts
} from "@tanstack/react-router";
import { DefaultErrorComponent } from "./-components/default-error-component";
import { DefaultNotFoundComponent } from "./-components/default-notfound-component";
import { DefaultPendingComponent } from "./-components/default-pending-components";
import { RootProvider } from "fumadocs-ui/provider/tanstack";
import { seo, SITE_NAME, SITE_URL } from "@/lib/seo";

export interface RouterAppContext {
	queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<RouterAppContext>()({
	head: () => {
		// Only the default meta from seo(); the canonical link is intentionally
		// dropped here so each route emits its own single canonical (TanStack
		// dedupes meta by name/property but does NOT dedupe <link>s).
		const { meta } = seo({ path: "/" });
		return {
			meta: [
				{ charSet: "utf-8" },
				{
					name: "viewport",
					content:
						"width=device-width, initial-scale=1, viewport-fit=cover"
				},
				{ name: "theme-color", content: "#000000" },
				{ name: "application-name", content: SITE_NAME },
				{ name: "apple-mobile-web-app-title", content: SITE_NAME },
				{ name: "format-detection", content: "telephone=no" },
				...meta
			],
			links: [
				{ rel: "icon", href: "/favicon.ico", sizes: "any" },
				{
					rel: "icon",
					type: "image/png",
					sizes: "192x192",
					href: "/logo192.png"
				},
				{ rel: "apple-touch-icon", href: "/logo192.png" },
				{ rel: "manifest", href: "/manifest.json" },
				{
					rel: "sitemap",
					type: "application/xml",
					href: "/sitemap.xml"
				},
				{ rel: "preconnect", href: SITE_URL }
			]
		};
	},
	errorComponent: DefaultErrorComponent,
	notFoundComponent: DefaultNotFoundComponent,
	pendingComponent: DefaultPendingComponent,
	component: RootComponent
});

function RootComponent() {
	return (
		<RootDocument>
			<Outlet />
		</RootDocument>
	);
}

function RootDocument({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				<HeadContent />
			</head>
			<body>
				<RootProvider>{children}</RootProvider>
				<Scripts />
			</body>
		</html>
	);
}

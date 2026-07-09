/**
 * Mount once in `__root.tsx`. Owns all reactive analytics concerns:
 *
 * - initializes PostHog on the client
 * - captures `$pageview` on initial load and every SPA navigation
 * - identifies the user (with person properties for cohorting) whenever a
 *   session is present — including returns from OAuth redirects
 * - exposes the PostHog React context, so components can also use
 *   `usePostHog()` from `posthog-js/react` directly when needed
 */
import { useRouter } from "@tanstack/react-router";
import posthog from "posthog-js";
import { PostHogProvider } from "posthog-js/react";
import { useEffect } from "react";
import { authClient } from "@/auth/client";
import { analytics, initAnalytics } from "./index";

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
	const router = useRouter();
	const { data: session } = authClient.useSession();
	const user = session?.user;

	useEffect(() => {
		initAnalytics();

		// The initial `onResolved` can fire before this effect runs, so
		// capture the landing pageview explicitly and dedupe by URL.
		let lastUrl: string | null = null;
		const capturePageview = () => {
			const url = window.location.href;
			if (url === lastUrl) return;
			lastUrl = url;
			analytics.capturePageview(url);
		};

		capturePageview();
		return router.subscribe("onResolved", capturePageview);
	}, [router]);

	useEffect(() => {
		if (!user) return;
		// subscriptionStatus is a Dodo-managed additional field not present in
		// the inferred client session type
		const { subscriptionStatus } = user as {
			subscriptionStatus?: string | null;
		};
		analytics.identify(user.id, {
			email: user.email,
			name: user.name,
			role: user.role,
			subscription_status: subscriptionStatus
		});
	}, [user]);

	return <PostHogProvider client={posthog}>{children}</PostHogProvider>;
}

/**
 * PostHog analytics core.
 *
 * Client-only: `initAnalytics()` is a no-op during SSR and when
 * `VITE_PUBLIC_POSTHOG_KEY` is not set (e.g. local development), so every
 * `analytics.*` call is safe to use unconditionally anywhere in the app.
 *
 * React integration (pageviews, user identification, PostHog context) lives
 * in `./provider.tsx` — mount `<AnalyticsProvider>` once in `__root.tsx`.
 * Event names and property contracts are defined in `./events.ts`.
 */
import posthog from "posthog-js";
import type { AnalyticsEventMap, AnalyticsEventName } from "./events";

export type { AnalyticsEventMap, AnalyticsEventName } from "./events";

const POSTHOG_KEY = import.meta.env.VITE_PUBLIC_POSTHOG_KEY as
	| string
	| undefined;
const POSTHOG_HOST =
	(import.meta.env.VITE_PUBLIC_POSTHOG_HOST as string | undefined) ??
	"https://us.i.posthog.com";

let initialized = false;

export function initAnalytics(): void {
	if (initialized || typeof window === "undefined" || !POSTHOG_KEY) return;

	posthog.init(POSTHOG_KEY, {
		api_host: POSTHOG_HOST,
		// Pageviews are captured by AnalyticsProvider (SPA navigations don't
		// fire full page loads), so automatic capture is disabled.
		capture_pageview: false,
		capture_pageleave: true,
		autocapture: true,
		persistence: "localStorage+cookie"
	});
	initialized = true;
}

export const analytics = {
	capturePageview(url: string): void {
		if (!initialized) return;
		posthog.capture("$pageview", { $current_url: url });
	},

	/** Capture an event from the typed catalog in `events.ts`. */
	capture<E extends AnalyticsEventName>(
		event: E,
		...[properties]: AnalyticsEventMap[E] extends undefined
			? []
			: [AnalyticsEventMap[E]]
	): void {
		if (!initialized) return;
		posthog.capture(event, properties);
	},

	/**
	 * Link events to a known user and set person properties (used for
	 * cohorting in retention/funnel insights). Called by AnalyticsProvider
	 * whenever a session is present.
	 */
	identify(userId: string, properties?: Record<string, unknown>): void {
		if (!initialized) return;
		posthog.identify(userId, properties);
	},

	/** Clear the identified user. Call on logout. */
	reset(): void {
		if (!initialized) return;
		posthog.reset();
	}
};

/**
 * Analytics event catalog — the single source of truth for event names and
 * their property contracts. Keeping every event here (instead of inline
 * strings at call sites) keeps PostHog dashboards consistent: funnels,
 * retention and acquisition reports break silently when names drift.
 *
 * Grouped by funnel stage:
 *
 * - **Acquisition** — how visitors find and enter the product. UTM params,
 *   referrers and initial pageviews are captured automatically by PostHog
 *   (`$initial_utm_*`, `$initial_referrer`), so only intent events live here.
 * - **Activation & funnel** — the paid conversion path:
 *   `checkout_started` → purchase → `license_activated`.
 * - **Retention & engagement** — recurring product usage. PostHog retention
 *   insights are built on any repeated event per identified user; `$pageview`
 *   and `feature_used` are the primary signals.
 */
export interface AnalyticsEventMap {
	// ── Acquisition ────────────────────────────────────────────────────────
	/** User began an auth flow (Google redirect or OTP email sent). */
	login_started: { method: "google" | "email-otp" };
	/** Auth flow completed client-side (Google completions are captured by identify on redirect return). */
	user_signed_in: { method: "email-otp" };

	// ── Activation & funnel ────────────────────────────────────────────────
	/** Checkout session requested. `path` distinguishes pricing section vs upgrade page. */
	checkout_started: { plan: string; path: string };
	/** Paywall hit — user is signed in but has no active purchase. */
	upgrade_page_viewed: undefined;
	/** License key redeemed; the real activation moment for this product. */
	license_activated: { plan: string };

	// ── Retention & engagement ─────────────────────────────────────────────
	/** Generic engagement signal — instrument features as they ship. */
	feature_used: { feature: string; [key: string]: unknown };
}

export type AnalyticsEventName = keyof AnalyticsEventMap;

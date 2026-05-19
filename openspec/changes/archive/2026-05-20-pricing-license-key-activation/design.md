## Context

Tanship's backend is fully wired: DodoPayments better-auth adapter creates checkout sessions, webhooks create `purchases` rows with license keys, and the GitHub handler at `/api/github/activate` validates + activates those keys. The gap is purely in the frontend:

1. No pricing UI exists on the home page — users cannot discover or buy plans.
2. The Tanship Pro product ID in `config/app.ts` is a placeholder (`pdt_tanship_pro_replace_me`), so its checkout slug is wrong.
3. The `/activate` page only handles authenticated users; guest buyers land there after payment with no path forward.
4. No Gate policies guard `purchase.initiate` or `license.activate` — these are currently unprotected or ad-hoc.

## Goals / Non-Goals

**Goals:**

- Surface Tanship Standard + Pro on the home page with a working "Buy" CTA
- Fix the Tanship Pro product ID so the checkout slug maps correctly
- Implement guest activation: preserve license key across the auth redirect and auto-connect after login
- Add Gate policies for `purchase.initiate` and `license.activate` following the 4-step RBAC pattern
- Keep the authenticated activation path unchanged (enter key → validate → activate)

**Non-Goals:**

- Individual template purchases (covered by same infrastructure but not part of this pricing section)
- Subscription billing or recurring payments (both plans are one-time)
- Upgrades / plan switching logic
- Admin tooling for managing purchases

## Decisions

### D1 — Config as single source of truth for plan data

The `appConfig.payments` array in `config/app.ts` is already the source for checkout product slugs (`App.getPayments()` feeds `packages/auth/auth.ts`). The pricing section will import `appConfig.payments` and filter to `tanship` and `tanship-pro` slugs. No duplicate plan definitions.

_Alternative considered:_ Hardcode plan data in the UI component. Rejected — diverges from config immediately when prices or features change.

### D2 — `authClient.dodopayments.checkoutSession({ slug })` for checkout

The DodoPay better-auth adapter's `checkoutSession` method handles redirect-to-payment. The buy button calls this with the plan slug. Guests hitting this endpoint are redirected to login by the adapter (if `authenticatedUsersOnly: true`) or are allowed through as guest checkouts. Since DodoPay can handle guest payments and maps the license to `metadata.userId`, we set `authenticatedUsersOnly: false` and let DodoPay collect email at checkout.

_Alternative considered:_ Require login before checkout. Rejected — adds friction; DodoPay handles guest checkout natively and the license can be claimed post-login.

### D3 — URL param strategy for guest activation

When a guest buyer lands on `/activate` after payment, DodoPay appends the license key as a query param (`?licenseKey=xxx`) via the `successUrl` template. The activate page reads this param, stores it in session storage, redirects the user to login, and after successful auth the activate page reads from session storage and auto-submits activation. This avoids any server-side state for the pending key.

_Alternative considered:_ Store pending license key in a KV entry. Rejected — over-engineering; session storage survives the OAuth redirect and is simpler.

### D4 — Policy placement follows existing 4-step pattern

`purchase.initiate` and `license.activate` go into a new `config/policies/purchase.ts`. Both start with `authorize()` + RBAC check. The `license.activate` policy checks that the license key belongs to the actor (passed as `resource.userId`). Guest checkout is allowed via the `public` role having `purchase:initiate` permission (guests can start checkout; DodoPay handles payment collection).

_Alternative considered:_ Skip policies for guest checkout (no session). Accepted partial: `purchase.initiate` policy runs only when a session exists (logged-in buy flow). Guest checkout bypasses the gate entirely at the Hono handler level, consistent with how other public endpoints work.

### D5 — No new API endpoints

The existing `/api/github/activate` endpoint already validates ownership and calls `dodo.licenses.activate()`. The guest-post-login flow reuses this same endpoint. The only new server function is a thin wrapper that auto-fires activation when a pending key is found in session storage after login.

## Risks / Trade-offs

- **Session storage cleared on browser close** → If a guest pays, closes the browser, then creates an account, the pending key is lost. Mitigation: the license key is in the purchase confirmation email, so the user can manually enter it on `/activate`.
- **DodoPay guest checkout + metadata.userId** → If the buyer is a guest, `metadata.userId` in the webhook payload is null; the webhook handler must handle this gracefully (skip GitHub invite, still create purchase row with `userId = null`). The user claims it post-login by license key lookup. Mitigation: update webhook handler to allow `userId: null` and surface unclaimed keys on the activate page by email match after login.
- **Tanship Pro product ID change** → Existing test purchases made with the placeholder slug will not resolve. This is expected — the placeholder was never a real product.

## Migration Plan

1. Update `config/app.ts` product ID — zero-downtime, only affects new checkouts.
2. Deploy policy additions before UI — policies add restrictions, not remove them. Safe.
3. Deploy UI (pricing section + activate page update) — purely additive.
4. Verify webhook handler gracefully handles `userId: null` for guest purchases.

## Open Questions

- Should unclaimed purchases (guest checkout, no account yet) be matchable by email after signup? Currently the webhook stores `userId` from metadata — guest checkouts would have no userId. Recommend: on signup, run a query to match `purchases` rows by dodoCustomerId or email and assign userId retroactively. This is a follow-up; not in scope for this change.

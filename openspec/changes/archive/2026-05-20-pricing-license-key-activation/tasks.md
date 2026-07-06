## 1. Config Fix

- [x] 1.1 Update `config/app.ts`: change `tanship-pro` `productId` from `pdt_tanship_pro_replace_me` to `pdt_0NckxPorlzacS6mGIUiXc`
- [x] 1.2 Verify `App.getPayments()` in `packages/core` returns the updated config (no changes needed if it reads from `appConfig.payments` directly)

## 2. Purchase Policy

- [x] 2.1 Add `"purchase:initiate"` and `"license:activate"` to `user` role in `config/permissions.ts` under `ROLE_PERMISSIONS`
- [x] 2.2 Create `config/policies/purchase.ts` with `PurchasePolicy.initiate` using `authorize("purchase:initiate")`
- [x] 2.3 Add `LicensePolicy.activate` to `config/policies/purchase.ts` using `combine(authorize("license:activate"), ownership check on ctx.resource.userId)`
- [x] 2.4 Extend `GateActions` in `config/index.ts` with `"purchase.initiate"` and `"license.activate"` via `InferPolicyActions<typeof PurchasePolicy>`
- [x] 2.5 Register `PurchasePolicy` in `Gate.policies({...})` in `config/index.ts`

## 3. Pricing Section UI

- [x] 3.1 Create `apps/web/src/routes/(app)/_home/-components/pricing-section.tsx` — filter `appConfig.payments` to `tanship` and `tanship-pro` slugs and render plan cards
- [x] 3.2 Each plan card shows: name, price, description, feature list (checkmark bullets), CTA button, footer text, and "Most Popular" badge for `popular: true`
- [x] 3.3 Add `<PricingSection />` to the home page route `apps/web/src/routes/(app)/_home/index.tsx` below the hero/features section

## 4. Checkout Flow

- [x] 4.1 Create `apps/web/src/routes/-fn/checkout.ts` with a `createCheckoutSessionFn` server function that calls `authClient.dodopayments.checkoutSession({ slug })` and returns the session URL
- [x] 4.2 Wire the CTA button in `pricing-section.tsx` to call `createCheckoutSessionFn` and redirect to the returned URL on success
- [x] 4.3 Add loading state to the CTA button (disable + spinner while session is being created)
- [x] 4.4 Add error toast (`toast.error(...)`) when checkout session creation fails
- [x] 4.5 If user is unauthenticated, redirect to `/login?redirect=/` instead of calling checkout (detect via `authClient.useSession()`)

## 5. Guest Activation Flow — `/activate` Page Update

- [x] 5.1 Read the existing activate page at `apps/web/src/routes/(app)/_home/activate/index.tsx` and understand its current structure
- [x] 5.2 On page mount, check for `?licenseKey=` query param — if present and user is unauthenticated: save to `sessionStorage["pendingLicenseKey"]` and redirect to `/login?redirect=/activate`
- [x] 5.3 On page mount, if user is authenticated: check `sessionStorage["pendingLicenseKey"]` — if found, pre-populate the license key field and clear it from storage
- [x] 5.4 After pre-population, auto-trigger validation so the user sees the key status immediately (no manual submit needed)
- [x] 5.5 Apply `Gate.can("license.activate", { actor: user, resource: { userId: purchase.userId } })` check before calling the activate API endpoint in the server function

## 6. Activate Policy Enforcement in Server Function

- [x] 6.1 In `apps/web/src/routes/-fn/purchases.ts` (or the activate server function), after fetching the purchase row, call `Gate.can("license.activate", { actor: session.user, resource: { userId: purchase.userId } })` and throw if not allowed
- [x] 6.2 Ensure the `handleError()` wrapper is applied so gate denials surface as readable error messages in the UI

## 7. Activation Success State

- [x] 7.1 After successful activation response from `/api/github/activate`, render a success state on the activate page showing plan name, invited GitHub username, and a link to `/account/billing`
- [x] 7.2 Replace the form UI with the success state (no redirect — stay on `/activate`)

## 8. Verification

- [x] 8.1 Test: logged-in user clicks "Buy Tanship" → redirected to DodoPay checkout
- [x] 8.2 Test: logged-in user clicks "Buy Tanship Pro" → redirected to DodoPay checkout with correct product
- [x] 8.3 Test: guest user clicks buy → redirected to `/login` → after login returns to home
- [x] 8.4 Test: guest buyer lands on `/activate?licenseKey=XXX` → key saved → redirected to login → returns to `/activate` with key pre-filled → activates successfully
- [x] 8.5 Test: `Gate.can("license.activate", ...)` returns denied when `actor.id !== resource.userId`
- [x] 8.6 Test: pricing section renders both plans with correct data from `appConfig.payments`

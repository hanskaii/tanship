## Why

The pricing section on the home page has no working buy buttons — users have no path to purchase Tanship Standard or Tanship Pro. The existing DodoPayments + better-auth integration and license key infrastructure are already wired up in the backend; we need to connect the frontend checkout, fix the Tanship Pro product ID in config, and implement the guest activation flow so buyers can claim their license even before creating an account.

## What Changes

- **Fix Tanship Pro product ID** in `config/app.ts` from placeholder `pdt_tanship_pro_replace_me` to the real ID `pdt_0NckxPorlzacS6mGIUiXc`
- **Pricing section UI** on the home page displaying Tanship Standard ($99) and Tanship Pro ($299) plans with feature lists, CTAs, and popular badge — sourced from `appConfig.payments`
- **Checkout flow**: buy button calls `authClient.dodopayments.checkoutSession({ slug })` which redirects to DodoPay and returns to `/activate`
- **Guest activation flow**: unauthenticated user lands on `/activate` with a license key → validates key → prompted to sign in/register → after auth, key is auto-connected to their account
- **Logged-in activation flow**: user on `/activate` enters license key → validates → activates (existing GitHub handler) → done
- **Purchase policy** (`purchase.initiate`): controls who can initiate a checkout session — guests allowed, but policy enforces no double-purchasing the same product
- **Activate policy** (`license.activate`): ensures the license key belongs to the authenticated user before activation is allowed

## Capabilities

### New Capabilities

- `pricing-section`: Home page pricing UI displaying Tanship Standard and Tanship Pro plans with checkout CTAs sourced from `appConfig.payments`
- `checkout-flow`: Client-side checkout initiation via `authClient.dodopayments.checkoutSession()` connecting buy button to DodoPay; includes guest redirect-back-after-auth
- `license-activate-flow`: Two-path activation — guest path (validate → auth redirect with key in URL param → post-login connect) and authenticated path (validate → activate immediately); replaces/extends existing activate page
- `purchase-policy`: Gate policy enforcing checkout and activation business rules

### Modified Capabilities

- `config-product-ids`: Update Tanship Pro product ID to correct value (implementation detail — no spec needed)

## Impact

- **`config/app.ts`**: Fix `productId` for Tanship Pro
- **`packages/auth/auth.ts`**: Ensure checkout products include both `tanship` and `tanship-pro` slugs (already uses `App.getPayments()` — picking up config fix automatically)
- **`apps/web/src/routes/(app)/_home/`**: New pricing section component; updated activate page for guest flow
- **`apps/web/src/routes/-fn/purchases.ts`**: New server function for pending license key claim after login
- **`config/policies/`**: New `purchase.ts` policy file with `purchase.initiate` and `license.activate` policies
- **`config/permissions.ts`**: Add `purchase:initiate` and `license:activate` to applicable roles
- **`config/index.ts`**: Register new policies in `GateActions`
- **No new DB schema** — existing `purchases` table covers all needs
- **No new API endpoints** — existing `/api/github/activate` endpoint is sufficient

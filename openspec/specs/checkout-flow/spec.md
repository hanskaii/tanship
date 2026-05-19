# Spec: checkout-flow

### Requirement: Checkout session is created via DodoPay adapter

When a user initiates purchase, the system SHALL call `authClient.dodopayments.checkoutSession({ slug })` where `slug` matches the plan's slug from `appConfig.payments`. On success, the system SHALL redirect the browser to the returned `session.url`.

#### Scenario: Successful checkout session creation

- **WHEN** an authenticated user clicks "Buy Tanship — $99"
- **THEN** `authClient.dodopayments.checkoutSession({ slug: "tanship" })` is called
- **THEN** the browser is redirected to the DodoPay payment URL
- **THEN** after payment, DodoPay redirects to `/activate`

#### Scenario: Tanship Pro checkout uses correct product

- **WHEN** an authenticated user clicks "Buy Tanship Pro — $299"
- **THEN** `authClient.dodopayments.checkoutSession({ slug: "tanship-pro" })` is called
- **THEN** the correct product (`pdt_0NckxPorlzacS6mGIUiXc`) is used for the session

### Requirement: CTA button shows loading state during checkout creation

The buy button SHALL display a loading indicator while the checkout session request is in-flight and SHALL be disabled to prevent double-clicks.

#### Scenario: Loading state during checkout

- **WHEN** the user clicks the CTA button
- **THEN** the button becomes disabled and shows a spinner or loading text
- **THEN** once redirected, the loading state is irrelevant

#### Scenario: Checkout creation error

- **WHEN** `authClient.dodopayments.checkoutSession()` returns an error
- **THEN** a toast notification is shown with a human-readable error message
- **THEN** the button returns to its default state

### Requirement: Guest user is redirected to login before checkout (authenticated flow)

If the user is unauthenticated and `authenticatedUsersOnly` is enforced, the system SHALL redirect the user to the login page with a `redirect` param pointing back to the pricing section. After successful login, the user is returned to the page and can initiate checkout.

#### Scenario: Guest clicks buy and is redirected to login

- **WHEN** a guest user clicks a plan CTA
- **THEN** the system detects no active session
- **THEN** the user is redirected to `/login?redirect=/`
- **THEN** after login, the user is returned to the home page where they can click buy again

### Requirement: Config product ID is correct for Tanship Pro

The `productId` for the `tanship-pro` plan in `config/app.ts` SHALL be `pdt_0NckxPorlzacS6mGIUiXc`. The `tanship` plan SHALL remain `pdt_0NckxDjwzwWTyMiEdEb7y`.

#### Scenario: Tanship Pro product ID is set correctly

- **WHEN** `appConfig.payments` is read
- **THEN** the entry with `slug: "tanship-pro"` has `productId: "pdt_0NckxPorlzacS6mGIUiXc"`

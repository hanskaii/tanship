# Spec: pricing-section

### Requirement: Pricing section displays Tanship Standard and Tanship Pro plans

The home page SHALL render a pricing section sourced from `appConfig.payments`, filtered to the `tanship` and `tanship-pro` slugs. Each plan card SHALL display: name, price, description, feature list, CTA button, and footer text. The plan marked `popular: true` SHALL render a visual "Most Popular" badge.

#### Scenario: Both plans render with correct data

- **WHEN** a visitor loads the home page
- **THEN** two plan cards are visible — "Tanship" at $99 and "Tanship Pro" at $299
- **THEN** each card shows the feature list from `appConfig.payments`
- **THEN** the Tanship Pro card displays a "Most Popular" badge

#### Scenario: Plan data comes from config — no hardcoded values

- **WHEN** the pricing section renders
- **THEN** all plan names, prices, descriptions, features, CTAs, and footers are read from `appConfig.payments`
- **THEN** no plan-specific strings are hardcoded in the component

### Requirement: Pricing section is positioned on the home page

The pricing section SHALL be placed on the home page (`routes/(app)/_home/index.tsx`) in a visible, discoverable position (after the hero section or features section). It SHALL be co-located in `-components/` or rendered inline in the route file.

#### Scenario: Pricing section appears on home page load

- **WHEN** a visitor navigates to the root URL `/`
- **THEN** the pricing section is visible without requiring a route change

### Requirement: CTA button initiates checkout or redirects to checkout

Each plan card's CTA button SHALL call the checkout flow when clicked. If the user is a guest, the button SHALL still be clickable and the checkout handler is responsible for redirecting appropriately.

#### Scenario: Logged-in user clicks CTA

- **WHEN** an authenticated user clicks a plan's CTA button
- **THEN** a DodoPay checkout session is created and the user is redirected to the payment page

#### Scenario: Guest user clicks CTA

- **WHEN** an unauthenticated visitor clicks a plan's CTA button
- **THEN** the checkout flow is initiated; guest checkout or login redirect is handled by the checkout flow capability

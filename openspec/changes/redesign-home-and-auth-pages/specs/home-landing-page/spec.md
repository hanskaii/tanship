## ADDED Requirements

### Requirement: Navigation bar is sticky with scroll-aware styling

The navigation bar SHALL remain fixed at the top of the viewport with a backdrop blur and semi-transparent background that activates on scroll, improving readability over page content.

#### Scenario: Nav renders on all home routes

- **WHEN** a user visits any `_home` route
- **THEN** the HomeNav SHALL appear fixed at top with the Tanship logo, Docs link, Templates link, GitHub button, and a session-aware Sign In / Dashboard CTA

#### Scenario: Nav background activates on scroll

- **WHEN** the user scrolls more than 10px from the top
- **THEN** the nav SHALL apply a `backdrop-blur` and subtle border-bottom to visually separate from page content

### Requirement: Hero section communicates value clearly with high visual impact

The hero section SHALL present a bold headline, a supporting subline, two CTAs ("Start Building" → /login, "Explore Docs"), and a visual element (code mockup or terminal preview) that communicates the product's technical nature.

#### Scenario: Hero renders above the fold

- **WHEN** a user lands on the homepage
- **THEN** the headline, subline, and both CTA buttons SHALL be visible without scrolling on a 1280px viewport

#### Scenario: Hero visual element is present

- **WHEN** the hero section renders
- **THEN** a code preview, terminal mockup, or animated visual SHALL appear alongside the text content

### Requirement: Features section presents capabilities in a scannable card grid

The features section SHALL display core Tanship capabilities (Cloudflare Edge, TanStack & Hono, Better Auth, Dodo Payments, Minimalist UI, SEO Ready) in a 3-column card grid on desktop with icons, titles, and brief descriptions.

#### Scenario: Features section renders 6 feature cards

- **WHEN** the features section mounts
- **THEN** exactly 6 feature cards SHALL render, each with a `HugeiconsIcon`, a feature title, and a 1-2 sentence description

#### Scenario: Feature grid is responsive

- **WHEN** the viewport is below 768px
- **THEN** the grid SHALL collapse to 1 column

### Requirement: Tech stack section displays 8 technologies in a styled grid

The tech stack section SHALL render 8 technology tiles (TanStack Start, Cloudflare, OXC, Better Auth, Drizzle ORM, Dodo Payments, Hono, Tailwind CSS v4) with logo icons and descriptions.

#### Scenario: All 8 tech tiles render

- **WHEN** the tech stack section mounts
- **THEN** 8 tiles SHALL each show a technology logo, name, and description

### Requirement: Pricing section visually differentiates tiers with a recommended plan highlight

The pricing section SHALL render Standard ($99) and Pro ($299) tiers in side-by-side cards, with the Pro tier visually highlighted as recommended via a badge, border accent, or color treatment.

#### Scenario: Pro tier is visually prominent

- **WHEN** the pricing section renders
- **THEN** the Pro card SHALL have a visual distinction (badge, ring, or background accent) that draws the eye relative to Standard

#### Scenario: Both CTA buttons link to checkout

- **WHEN** a user clicks either pricing CTA
- **THEN** the existing checkout flow SHALL be triggered (no change to business logic)

### Requirement: Testimonials section shows social proof with avatar and attribution

The testimonials section SHALL display at least 2 testimonial cards, each with a quote, author name, role/company, and an avatar (real image or styled placeholder).

#### Scenario: Testimonials render with attribution

- **WHEN** the testimonials section mounts
- **THEN** each testimonial card SHALL display a quoted text block, author name, and role/company attribution

### Requirement: FAQ section uses an accordion pattern for scannability

The FAQ section SHALL render questions in an accordion component (from `@workspace/ui`) so only one answer is expanded at a time, reducing visual clutter.

#### Scenario: FAQ items are collapsed by default

- **WHEN** the FAQ section first renders
- **THEN** all answer bodies SHALL be hidden; only question titles SHALL be visible

#### Scenario: Clicking a question reveals the answer

- **WHEN** a user clicks a FAQ question
- **THEN** the corresponding answer SHALL expand and other open items SHALL collapse

### Requirement: Footer provides navigation links and branding

The footer SHALL display the Tanship logo/wordmark, navigation links (Documentation, Twitter, GitHub), and a copyright notice.

#### Scenario: Footer links are functional

- **WHEN** a user clicks a footer link
- **THEN** they SHALL be taken to the correct destination (external links open in new tab)

### Requirement: All sections support dark mode

Every redesigned section SHALL apply correct Tailwind `dark:` variants so the page is visually coherent in dark mode.

#### Scenario: Dark mode renders without visual regressions

- **WHEN** the user switches to dark mode via the theme toggle
- **THEN** all section backgrounds, text, borders, and icons SHALL use appropriate dark palette values

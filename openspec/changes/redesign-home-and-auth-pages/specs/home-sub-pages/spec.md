## ADDED Requirements

### Requirement: Upgrade page presents plans with clear visual hierarchy

The upgrade page SHALL display pricing plans from `appConfig.payments` in styled cards, with the recommended plan visually highlighted, feature lists using check icons, original price shown with strikethrough, and a prominent checkout CTA per plan.

#### Scenario: Recommended plan is visually dominant

- **WHEN** the upgrade page renders
- **THEN** the highlighted plan card SHALL have a distinct border, background, or badge treatment compared to non-highlighted plans

#### Scenario: Checkout flow is triggered on CTA click

- **WHEN** a user clicks a plan CTA button
- **THEN** the existing checkout integration SHALL be invoked (no change to business logic)

#### Scenario: Logout button is accessible

- **WHEN** the upgrade page renders
- **THEN** a logout button SHALL be visible, allowing the user to sign out

### Requirement: Showcase gallery uses an improved card grid with hover states

The showcase gallery page SHALL render project cards in a responsive masonry or uniform grid with: project image/screenshot, project name, description truncated to 2 lines, and Twitter attribution. Cards SHALL have a hover state (scale, shadow, or border highlight).

#### Scenario: Cards render with hover interaction

- **WHEN** a user hovers over a showcase card on desktop
- **THEN** the card SHALL apply a visual hover effect (shadow lift, scale, or border highlight)

#### Scenario: Empty state is friendly and informative

- **WHEN** no showcase entries exist
- **THEN** an illustrated or icon-based empty state SHALL be shown with a prompt to submit a project

#### Scenario: Skeleton renders while data is loading

- **WHEN** the showcase data is being fetched
- **THEN** a card skeleton grid SHALL be shown matching the expected card layout

### Requirement: Showcase submission form has a polished multi-field layout

The submission form SHALL present fields (submitter name, project name, project URL, description with character counter, optional Twitter handle, screenshot upload) in a clean two-column or single-column layout with clear labels and inline validation.

#### Scenario: Character counter updates in real time

- **WHEN** a user types in the description field
- **THEN** a character counter SHALL update showing remaining characters out of 500

#### Scenario: Success state shows a celebration UI

- **WHEN** a submission is successfully sent
- **THEN** the form SHALL be replaced with a success state including a positive illustration or icon, a thank-you message, and a link to view the showcase gallery

### Requirement: Templates marketplace renders template cards with live preview support

The templates page SHALL render template cards showing: template preview image or placeholder, template name, tag badges (e.g., "SaaS", "Marketing"), pricing ($99 individual / $299 Pro), and action buttons ("Preview", "Purchase", or "Owned" badge). Cards SHALL have a hover state.

#### Scenario: Owned templates show an "Owned" badge

- **WHEN** a user has access to a template via Pro or individual purchase
- **THEN** the template card SHALL display an "Owned" badge instead of purchase CTA

#### Scenario: Live preview button opens external URL

- **WHEN** a template has a `previewUrl` and the user clicks "Preview"
- **THEN** the preview URL SHALL open in a new tab

#### Scenario: Purchase button triggers checkout

- **WHEN** a user clicks "Purchase" on a template they don't own
- **THEN** the existing checkout integration SHALL be invoked

### Requirement: Contact page uses card-based layout for contact options

The contact page SHALL display contact options (Documentation, Telegram, GitHub) as styled cards with icons, titles, descriptions, and action links. The FAQ section SHALL also be rendered below.

#### Scenario: Contact cards render with icons and links

- **WHEN** the contact page mounts
- **THEN** 3 contact cards SHALL render, each with a `HugeiconsIcon`, a title, a description, and a working link

### Requirement: Legal pages (Privacy Policy, Terms) have readable typography

The legal pages SHALL use a comfortable reading layout: constrained max-width, generous line-height, and clear heading hierarchy.

#### Scenario: Legal pages render with readable layout

- **WHEN** a user navigates to `/legals/privacy-policy` or `/legals/terms`
- **THEN** the content SHALL be presented in a max-w-prose constrained column with comfortable spacing

### Requirement: All sub-pages support dark mode

Every redesigned sub-page SHALL apply correct Tailwind `dark:` variants so pages are visually coherent in dark mode.

#### Scenario: Sub-pages in dark mode have no visual regressions

- **WHEN** the theme is set to dark on any sub-page
- **THEN** backgrounds, text, borders, and icons SHALL use appropriate dark palette values

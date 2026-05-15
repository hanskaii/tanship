## ADDED Requirements

### Requirement: Login page uses a centered card layout with brand background

The login page SHALL render the login form inside a centered card on a full-viewport background that uses a subtle gradient, pattern, or brand illustration — replacing the plain background.

#### Scenario: Login card is centered on all screen sizes

- **WHEN** the login page mounts at any viewport width ≥ 320px
- **THEN** the login card SHALL be horizontally and vertically centered within the viewport

#### Scenario: Background is visually distinguished from app interior pages

- **WHEN** the login page renders
- **THEN** the background SHALL use a gradient, mesh, or geometric pattern that differentiates it from dashboard pages

### Requirement: Login form email step has a clear visual hierarchy

The email step SHALL present the Tanship logo or wordmark, a heading ("Sign in to Tanship"), a subline, a Google OAuth button, an "or" divider, and an email input with a submit button.

#### Scenario: Google OAuth button is the primary CTA on email step

- **WHEN** the email step renders
- **THEN** the Google OAuth button SHALL appear above the email input and be the visually dominant action

#### Scenario: Email input and submit are styled consistently with design system

- **WHEN** the email step renders
- **THEN** the email input SHALL use the `Input` component from `@workspace/ui` and the submit button SHALL use the `Button` component

### Requirement: OTP step renders a branded 6-digit code input with resend option

The OTP step SHALL display a clear instruction ("Enter the 6-digit code sent to {email}"), a segmented or grouped OTP input, a resend link with cooldown timer, and a back button to return to the email step.

#### Scenario: OTP input accepts only digits

- **WHEN** a user types in the OTP field
- **THEN** only numeric characters SHALL be accepted; letters and symbols SHALL be ignored

#### Scenario: Resend link is disabled during cooldown

- **WHEN** an OTP has just been sent and the cooldown period is active
- **THEN** the resend link SHALL be visually disabled and show a countdown timer

#### Scenario: Back button returns user to email step

- **WHEN** a user clicks the back button on the OTP step
- **THEN** the form SHALL transition back to the email step with the email field pre-filled

### Requirement: Step transitions are smooth

The transition between the email step and OTP step SHALL use a fade or slide animation to indicate progression.

#### Scenario: Transitioning to OTP step

- **WHEN** a valid email is submitted and OTP is sent
- **THEN** the form SHALL animate from the email step content to the OTP step content without a jarring flash

### Requirement: Login page has a back-to-home link and theme toggle

The login page SHALL include a link to return to the homepage and a theme toggle button, both accessible without scrolling.

#### Scenario: Back link navigates to homepage

- **WHEN** a user clicks the back-to-home link
- **THEN** they SHALL be navigated to `/` (homepage)

#### Scenario: Theme toggle changes color mode

- **WHEN** a user clicks the theme toggle
- **THEN** the login page SHALL switch between light and dark mode

### Requirement: Login page dark mode is polished

The login card, background, inputs, and buttons SHALL all have correct dark mode styling.

#### Scenario: Login page in dark mode has no visual regressions

- **WHEN** the theme is set to dark
- **THEN** the login card background, text, input borders, and button styles SHALL use appropriate dark palette values

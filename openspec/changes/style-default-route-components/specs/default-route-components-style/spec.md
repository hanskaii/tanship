## ADDED Requirements

### Requirement: Error component uses sharp square icon container

The error icon container SHALL use no border radius (`rounded-none` or no class) and SHALL use the `bg-destructive/10 text-destructive` color tokens, matching the design system's square geometry.

#### Scenario: Error component renders without rounded corners

- **WHEN** the error component mounts
- **THEN** the icon container SHALL have no visible border radius

### Requirement: Error component buttons use design-system styles

The "Try Again" and "Home" action buttons SHALL use `rounded-none`, `border border-border` styling consistent with the rest of the app — no `rounded-md`.

#### Scenario: Try Again button renders with sharp corners

- **WHEN** the error component renders
- **THEN** the "Try Again" button SHALL have `rounded-none` and a `border border-border` style

#### Scenario: Home button renders with sharp corners

- **WHEN** the error component renders
- **THEN** the "Home" link SHALL have `rounded-none` styling

### Requirement: 404 component uses English copy

The not-found component SHALL display English copy only. The description SHALL read "The page you're looking for doesn't exist." and the link SHALL read "← Back to Home".

#### Scenario: Not-found page displays English text

- **WHEN** the not-found component mounts
- **THEN** the description text SHALL be in English, not Indonesian

### Requirement: 404 component link uses design-system button style

The back-to-home link SHALL use `rounded-none` and `border border-border` styling — no `rounded-md`.

#### Scenario: Back to home link has sharp corners

- **WHEN** the not-found component renders
- **THEN** the anchor link SHALL have no border radius

### Requirement: Pending component uses `Spinner` from `@workspace/ui`

The pending component SHALL render the `Spinner` component imported from `@workspace/ui` instead of a raw inline SVG, ensuring consistency with other loading states in the app.

#### Scenario: Pending component renders a Spinner

- **WHEN** a route is loading and the pending component mounts
- **THEN** the `Spinner` component from `@workspace/ui` SHALL be visible and centered

### Requirement: All three components are dark-mode compatible

All components SHALL use Tailwind CSS design-system color tokens (`bg-background`, `text-foreground`, `text-muted-foreground`, `border-border`, `bg-destructive`) so they render correctly in both light and dark mode.

#### Scenario: Components render correctly in dark mode

- **WHEN** the theme is set to dark
- **THEN** backgrounds, text, borders, and icons SHALL use appropriate dark palette values via CSS variable tokens

---
name: Tanship
description: Invite-only TanStack Start boilerplate for profitable SaaS on Cloudflare Workers
colors:
    void: "oklch(0.145 0 0)"
    surface: "oklch(0.185 0 0)"
    chalk: "oklch(0.935 0 0)"
    ground: "oklch(0.948 0 0)"
    ink: "oklch(0.2 0 0)"
    muted-bg: "oklch(0.967 0 0)"
    muted-fg: "oklch(0.483 0 0)"
    border-light: "oklch(0.872 0 0)"
    signal-lime: "color(display-p3 0.789306 1 0)"
    circuit-blue: "oklch(0.488 0.243 264.376)"
    signal-red: "oklch(0.577 0.245 27.325)"
    signal-red-dark: "oklch(0.704 0.191 22.216)"
typography:
    display:
        fontFamily: "Albert Sans Variable, system-ui, sans-serif"
        fontSize: "clamp(2.8rem, 9vw, 4.8rem)"
        fontWeight: 600
        lineHeight: 1.0
        letterSpacing: "-0.04em"
    headline:
        fontFamily: "Albert Sans Variable, system-ui, sans-serif"
        fontSize: "clamp(2rem, 5vw, 3rem)"
        fontWeight: 600
        lineHeight: 1.1
        letterSpacing: "-0.04em"
    title:
        fontFamily: "Albert Sans Variable, system-ui, sans-serif"
        fontSize: "1.25rem"
        fontWeight: 600
        lineHeight: 1.25
        letterSpacing: "-0.01em"
    body:
        fontFamily: "Inter Variable, system-ui, sans-serif"
        fontSize: "1rem"
        fontWeight: 400
        lineHeight: 1.6
        letterSpacing: "-0.02em"
    label:
        fontFamily: "Inter Variable, system-ui, sans-serif"
        fontSize: "0.75rem"
        fontWeight: 500
        lineHeight: 1.5
rounded:
    none: "0"
    sm: "calc(1rem - 4px)"
    md: "calc(1rem - 2px)"
    lg: "1rem"
    xl: "calc(1rem + 4px)"
    2xl: "calc(1rem + 8px)"
    full: "9999px"
spacing:
    xs: "4px"
    sm: "8px"
    md: "16px"
    lg: "24px"
    xl: "32px"
    2xl: "48px"
components:
    button-cta:
        backgroundColor: "{colors.ink}"
        textColor: "{colors.chalk}"
        rounded: "{rounded.none}"
        padding: "11px 24px"
    button-cta-hover:
        backgroundColor: "oklch(0.2 0 0 / 90%)"
        textColor: "{colors.chalk}"
        rounded: "{rounded.none}"
        padding: "11px 24px"
    button-ghost-cta:
        backgroundColor: "transparent"
        textColor: "{colors.ink}"
        border: "1px solid oklch(0.872 0 0 / 50%)"
        rounded: "{rounded.none}"
        padding: "11px 24px"
    button-default:
        backgroundColor: "{colors.ink}"
        textColor: "{colors.chalk}"
        rounded: "{rounded.md}"
        padding: "0 8px"
        height: "1.75rem"
    button-outline:
        backgroundColor: "transparent"
        textColor: "{colors.ink}"
        border: "1px solid {colors.border-light}"
        rounded: "{rounded.md}"
        padding: "0 8px"
        height: "1.75rem"
    button-ghost:
        backgroundColor: "transparent"
        textColor: "{colors.ink}"
        rounded: "{rounded.md}"
        padding: "0 8px"
        height: "1.75rem"
    input-default:
        backgroundColor: "{colors.ground}"
        textColor: "{colors.ink}"
        border: "1px solid {colors.border-light}"
        rounded: "{rounded.md}"
        padding: "8px 12px"
        height: "2.5rem"
    card-default:
        backgroundColor: "oklch(1 0 0)"
        textColor: "{colors.ink}"
        ring: "ring-1 ring-foreground/10"
        rounded: "{rounded.lg}"
        padding: "24px"
    card-featured:
        backgroundColor: "{colors.ink}"
        textColor: "{colors.chalk}"
        rounded: "{rounded.lg}"
        padding: "32px"
---

# Design System: Tanship

## 1. Overview

**Creative North Star: "The Founder's Workbench"**

This is a design system built for someone who has been burned before. They've seen the SaaS cream generators, the purple blob heroes, the identical feature grids. They know exactly what they need and have no patience for packaging that costs them trust. The Tanship design system earns its place the same way good tooling earns it: by not getting in the way, by working exactly as expected, and by looking like it was made by someone who uses what they build.

The system is achromatic at its core. Every neutral — backgrounds, cards, borders, text — sits at chroma zero. Pure grays, no warmth baked in. The only color in the system is Signal Lime, a vivid display-p3 green that functions like a live indicator: it means something is active, selected, or ready. It never decorates. The result is a palette that reads as precision, not poverty — a deliberate choice to let structure carry the design rather than color.

Dark mode is not a feature. It is the face of this brand. A solo founder at 11pm, terminal glow on their face, reading a landing page to decide if this stack saves them a weekend. That scene is the design brief. Light mode serves reading and daytime use; dark mode serves the identity.

**Key Characteristics:**

- Achromatic neutrals with zero chroma — no warm or cool tint on any gray
- Flat-by-default with ring-based depth, never shadow-first
- Square corners on marketing CTAs; gently rounded (1rem base) on UI components
- Two typefaces: Albert Sans (display/headings, `font-heading`) and Inter (body/labels, `font-sans`)
- Signal Lime is the only chromatic color; held in strict reserve
- Active feedback on every interactive element: `translate-y-px` on press, opacity on hover
- Every element earns its space; no decoration that adds no signal

## 2. Colors: The Void & Lime Palette

An achromatic system with a single saturated accent held in reserve. Pure neutrals do the structural work; Signal Lime punctuates.

### Dark Mode Ground

- **Void** (`oklch(0.145 0 0)` — `--background` dark): The dark-mode page ground. A deep neutral near-black with zero chroma; cooler and more precise than warm-tinted alternatives.
- **Surface** (`oklch(0.185 0 0)` — `--card` dark): Card surfaces in dark mode. The tonal step above Void creates elevation without shadows. The 0.04 lightness difference is the entire depth vocabulary.

### Dark Mode Text

- **Chalk** (`oklch(0.935 0 0)` — `--foreground` dark): Primary text in dark mode. Near-white, no warm tint. High contrast against Void without the harshness of pure white.

### Light Mode

- **Ground** (`oklch(0.948 0 0)` — `--background` light): Light-mode page background. A pale neutral gray — not white — that reduces eye strain and distinguishes the page from card surfaces.
- **Ink** (`oklch(0.2 0 0)` — `--foreground` light): Primary text and primary button fill in light mode. The structural near-black that carries authority without cold aggression.
- **Card** (`oklch(1 0 0)` — `--card` light): White card surfaces lift from Ground by tonal contrast alone. No shadow needed.

### Neutral Scale (both modes)

- **Muted Background** (`oklch(0.967 0 0)` light / `oklch(0.22 0 0)` dark — `--muted`): Subdued section fills, secondary button backgrounds.
- **Muted Foreground** (`oklch(0.483 0 0)` light / `oklch(0.55 0 0)` dark — `--muted-foreground`): Supporting text, placeholders, secondary labels.
- **Border** (`oklch(0.872 0 0)` light / `oklch(1 0 0 / 10%)` dark — `--border`): Dividers and input strokes. Full value in light; 10% white in dark.

### Accent

- **Signal Lime** (`color(display-p3 0.789306 1 0)` — `--primary`): The charged accent. A display-p3 lime-green that reads as "edge is live" — the color of a terminal cursor on a dark background, a deployment status light, a worker spinning up. Its foreground is near-black (`oklch(0.1 0 0)`) for legibility. Used for logo mark, active selection states, rare single-element highlights. Never as a fill on large surfaces. Its rarity is the charge; spend it only where the eye must land.
- **Circuit Blue** (`oklch(0.488 0.243 264.376)` — `--sidebar-primary` dark): Dark-mode sidebar active state. Lower energy than Signal Lime; a workhorse accent for navigation state. Does not appear in light mode sidebar or on marketing surfaces.

### Tertiary

- **Signal Red** (`oklch(0.577 0.245 27.325)` light / `oklch(0.704 0.191 22.216)` dark — `--destructive`): Destructive states only. Error borders, danger buttons, validation failures. Used at 10% opacity for backgrounds; full value for text and borders.

### Named Rules

**The Chroma-Zero Rule.** Every neutral in this system has chroma 0. No warm tints, no cool shifts. The only chroma in the palette comes from Signal Lime, Circuit Blue, and Signal Red. Introducing a tinted neutral (even subtly) breaks the intentional precision of the system.

**The Signal Reserve.** Signal Lime appears on the logo mark and in at most two additional elements per screen. It is never used as a background fill on large surfaces. Its rarity is the charge; spend it only where the eye must land.

## 3. Typography: Albert Sans + Inter

**Display/Heading Font:** Albert Sans Variable (Tailwind: `font-heading`, `--font-heading`)
**Body/Label Font:** Inter Variable (Tailwind: `font-sans`, `--font-sans`)

**Character:** Albert Sans is geometric with a clean precision that reads as structural confidence: the right font for founders who want authority without aggression. Inter is the most-read typeface on the web for good reason — it covers extended reading at small sizes without fatigue. Together they split duties cleanly: Albert Sans for anything the eye scans, Inter for anything the eye reads.

### Hierarchy

- **Display** (semibold 600, `clamp(2.8rem, 9vw, 4.8rem)`, line-height 1.0, tracking -0.04em): Hero headlines only. One per page. Compressed text at this size reads as carved, not printed — the density signals conviction. Use `font-heading`.
- **Headline** (semibold 600, `clamp(2rem, 5vw, 3rem)`, line-height 1.1, tracking -0.04em): Section headings, feature titles. The wide clamp range lets sections feel distinct at any viewport. Use `font-heading`.
- **Title** (semibold 600, 1.25rem, line-height 1.25, tracking -0.01em): Card titles, sidebar section labels, modal headings. Use `font-heading`.
- **Body** (regular 400, 1rem, line-height 1.6, tracking -0.02em): Primary reading text. Cap line length at 65–75ch using `max-w-xl` or equivalent. Muted foreground on supporting copy. Use `font-sans`.
- **Label** (medium 500, 0.75rem, line-height 1.5): Button text, input labels, navigation items, badges, breadcrumbs, `text-[11px]` micro-labels in dense admin surfaces. Use `font-sans`.

### Named Rules

**The One-Font-Per-Role Rule.** `font-heading` (Albert Sans) is for structure, scanning, and hierarchy. `font-sans` (Inter) is for reading. Never swap them. Don't introduce a third family unless a monospace element is explicitly required by a feature (API key display, code blocks).

**The Scale Ratio Rule.** Minimum 1.25 ratio between any two adjacent type steps. Flat type scales are prohibited: if two elements look the same size, one of them shouldn't exist.

## 4. Elevation

This system is flat-by-default. Depth is conveyed through tonal steps and ring strokes, not shadows. A card does not float above the page; it is distinguished from the page by a 1px ring (`ring-1 ring-foreground/10`) and, in dark mode, a slightly lighter background than the ground surface.

Shadows appear in exactly one context: dialogs (`shadow-lg`). This concentration makes the shadow semantically meaningful: a dialog is the only element that truly floats above the rest of the UI. Everything else stays on the plane.

### Shadow Vocabulary

- **Dialog elevation**: Applied to modals and command palettes only. Never to cards, dropdowns, or nav elements.
- **Subtle ring** (`ring-1 ring-foreground/10`): The standard card and container boundary. Not a shadow; a stroke at 10% foreground opacity. Present in both modes.

### Named Rules

**The Flat-By-Default Rule.** Surfaces are on the plane at rest. The only element that lifts is a dialog. Hover states shift color, not elevation. Sidebar panels use a border, not a shadow.

**The Ring-First Rule.** When a container needs visual separation, reach for `ring-1 ring-foreground/10` before any shadow value. If a ring is insufficient, reconsider whether the element needs separation at all.

## 5. Border Radius

Base radius `--radius: 1rem`. All variants are calculated from this single value:

- `rounded-sm`: `calc(1rem - 4px)` = 12px — compact elements, tight badges
- `rounded-md`: `calc(1rem - 2px)` = 14px — default UI buttons, inputs, dropdowns
- `rounded-lg`: `1rem` = 16px — cards, panels, modals
- `rounded-xl`: `calc(1rem + 4px)` = 20px — large surface containers
- `rounded-none`: `0` — marketing CTA buttons (intentional brand signal)
- `rounded-full`: `9999px` — pills, avatars, circular icons

**Rule: marketing CTAs are always `rounded-none`.** Square corners on the landing page signal deliberate brand choice, not a default. Any rounding of marketing CTAs blurs them into generic UI components.

## 6. Components

### Buttons

Two tiers: marketing CTA and UI compact. They coexist in the same system but serve different surfaces.

**Marketing CTA (landing pages):**

- **Shape:** `rounded-none`. Square corners signal no-compromise confidence on brand surfaces.
- **Primary CTA:** Ink background (`oklch(0.2 0 0)`), Chalk text, `padding: 11px 24px`, `height: 2.75rem`. `hover:opacity-90`. `active:translate-y-px`.
- **Ghost CTA:** Transparent background, Ink text, `border border-border/50`. Same size and corners as Primary CTA. Secondary action only; Primary CTA is always present when Ghost CTA appears.

**UI Compact (app, dashboard, admin):**

- **Sizes:** xs (`h-5`), sm (`h-6`), default (`h-7`), lg (`h-8`). Padding `px-2` default; icon variants use equal padding.
- **Shape:** `rounded-md` (`calc(1rem - 2px)`). Gently rounded.
- **Default:** Ink background, Chalk text, `text-xs`.
- **Outline:** Border from `--border`, transparent background. `hover:bg-input/50`.
- **Ghost:** No border, no background. `hover:bg-muted`. Used for toolbar actions and secondary icon buttons.
- **Destructive:** `bg-destructive/10 text-destructive`. Background at 10% opacity; text at full Signal Red.
- **Focus:** `focus-visible:ring-2 focus-visible:ring-ring/30`. Ring inset focus, not outline.
- **Disabled:** `opacity-50 pointer-events-none`. No alternative treatment.
- **Active press:** `active:translate-y-px` on all variants. The tactile confirmation the user pressed something.

### Cards / Containers

- **Corner Style:** `rounded-lg` (1rem). Gently rounded.
- **Background:** Light mode — white (`oklch(1 0 0)`) on Ground (`oklch(0.948 0 0)`). Dark mode — Surface (`oklch(0.185 0 0)`) above Void (`oklch(0.145 0 0)`).
- **Shadow Strategy:** None. Separation via `ring-1 ring-foreground/10`. See Elevation.
- **Border:** The ring serves as the border; no explicit `border` property.
- **Internal Padding:** `p-6` (24px) default. Compact variant `p-4` (16px). CardHeader uses `pb-0`; CardFooter uses `pt-0` to prevent double-padding with CardContent.

**Featured Card (Dark Surface):** When a single card needs to claim visual authority on a light-mode page (pricing highlight, CTA block, featured tier), use Ink (`oklch(0.2 0 0)`) as the card background with Chalk text and `p-8` (32px) padding. Never apply this to more than one card per section or it loses its emphasis.

### Inputs / Fields

- **Style:** `height: 2.5rem`, `border border-input`, `bg-background`, `rounded-md`, `px-3 py-2`, `text-base` (md: `text-sm`).
- **Focus:** `ring-2 ring-ring` with `ring-offset-2`. Ring wraps the border on focus.
- **Error/Invalid:** `aria-invalid:border-destructive` with `aria-invalid:ring-destructive/20`. Border shifts to Signal Red; a soft red ring wraps.
- **Disabled:** `opacity-50 cursor-not-allowed`.
- **Placeholder:** `text-muted-foreground` at default opacity.
- **Field wrapper:** `<Field>` component handles vertical/horizontal orientation. `<FieldError>` uses `text-destructive text-xs`. `<FieldLabel>` pairs with `<FieldTitle>` for consistent label hierarchy.

### Badges / Chips

- **Style:** `rounded-full`, compact `px-2`, `inline-flex items-center`.
- **Default:** Ink background, Chalk text. Status indication, category tags.
- **Secondary:** Muted background, Ink text. Lower-emphasis labels.
- **Outline:** Border only, transparent background. Least emphasis.
- **Destructive:** Signal Red at 10% background, Signal Red text. Error/danger status only.

### Navigation

- **Marketing nav:** Logo left, links center-right, CTA button far right. Links use `text-sm font-medium text-muted-foreground hover:text-foreground` transitions.
- **App sidebar:** 16rem expanded, 3rem icon-only collapsed, toggled via keyboard shortcut 'b'. Sidebar uses `--sidebar-*` token set independent of main palette.
- **Active state (dark sidebar):** Circuit Blue (`oklch(0.488 0.243 264.376)`) for `--sidebar-primary`. Active items in light sidebar use Ink foreground.
- **Mobile:** Sidebar slides in as a sheet. Full-width nav becomes hamburger.

### Signature Component: The Square CTA Block

The marketing hero CTA pair is a signature pattern: one filled Ink button (square) and one ghost border button (square), side-by-side with `gap-3`, never stacked vertically at desktop. The square corners signal brand surface, not a UI component. Maintain this pattern on all landing-page call-to-action sections.

## 7. Do's and Don'ts

### Do:

- **Do** use `ring-1 ring-foreground/10` as the primary container boundary. It reads in both light and dark mode without adjustment.
- **Do** use `rounded-none` for all CTA buttons on marketing surfaces. Square corners are intentional brand identity on the landing.
- **Do** use `font-heading` (Albert Sans) for all display, headline, and title elements.
- **Do** use `font-sans` (Inter) for all body text, labels, and UI copy.
- **Do** keep Signal Lime (`color(display-p3 0.789306 1 0)`) for the logo mark and at most two additional accent moments per page.
- **Do** apply `active:translate-y-px` to every interactive button. The 1px press is the system's tactile signature.
- **Do** keep all neutral colors at chroma 0. No warm or cool tints on grays.
- **Do** cap body line length at 65–75ch (`max-w-xl` or `max-w-prose`).
- **Do** use `focus-visible:ring-2 focus-visible:ring-ring/30` for all interactive elements.
- **Do** write dark mode as the primary brand identity surface.

### Don't:

- **Don't** use generic SaaS cream: soft gradients, rounded cards, purple-to-blue hero blobs, pastel feature grids.
- **Don't** use decorative shadows on cards, nav elements, or page sections. `shadow-lg` belongs on dialogs only.
- **Don't** add decoration that adds no signal: background pattern textures, floating blobs, colored dividers, gradient overlays on images.
- **Don't** use `border-left` or `border-right` greater than 1px as a colored accent stripe on any element. Rewrite with a full border, background tint, or nothing.
- **Don't** use gradient text (`background-clip: text`). Use weight and size for emphasis; never a gradient.
- **Don't** use glassmorphism decoratively.
- **Don't** round CTA buttons on marketing surfaces. `rounded-none` is the choice.
- **Don't** introduce a third typeface. Albert Sans for structure, Inter for reading. Monospace only where a feature demands it.
- **Don't** use Signal Lime as a background fill on large surfaces or apply it to more than two additional elements per screen beyond the logo.
- **Don't** introduce chroma into neutrals. The palette's strength is its achromatic discipline.

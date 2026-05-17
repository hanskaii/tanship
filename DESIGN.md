---
name: Tanship
description: Invite-only TanStack Start boilerplate for profitable SaaS on Cloudflare Workers
colors:
    ironwood: "oklch(0.216 0.006 56.043)"
    ironwood-surface: "oklch(0.147 0.004 49.25)"
    ironwood-foreground: "oklch(0.985 0.001 106.423)"
    neutral-subtle: "oklch(0.97 0.001 106.424)"
    neutral-mid: "oklch(0.553 0.013 58.071)"
    neutral-border: "oklch(0.923 0.003 48.717)"
    signal-lime: "oklch(0.9 0.25 140)"
    circuit-blue: "oklch(0.488 0.243 264.376)"
    signal-red: "oklch(0.577 0.245 27.325)"
typography:
    display:
        fontFamily: "Figtree Variable, system-ui, sans-serif"
        fontSize: "clamp(3rem, 8vw, 3.75rem)"
        fontWeight: 600
        lineHeight: 1.0
        letterSpacing: "-0.04em"
    headline:
        fontFamily: "Figtree Variable, system-ui, sans-serif"
        fontSize: "2.25rem"
        fontWeight: 600
        lineHeight: 1.1
        letterSpacing: "-0.03em"
    title:
        fontFamily: "Figtree Variable, system-ui, sans-serif"
        fontSize: "1.25rem"
        fontWeight: 600
        lineHeight: 1.25
    body:
        fontFamily: "Nunito Sans Variable, system-ui, sans-serif"
        fontSize: "1rem"
        fontWeight: 400
        lineHeight: 1.625
    label:
        fontFamily: "Nunito Sans Variable, system-ui, sans-serif"
        fontSize: "0.75rem"
        fontWeight: 500
        lineHeight: 1.5
rounded:
    none: "0"
    sm: "calc(0.625rem - 4px)"
    md: "calc(0.625rem - 2px)"
    lg: "0.625rem"
    xl: "calc(0.625rem + 4px)"
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
        backgroundColor: "{colors.ironwood}"
        textColor: "{colors.ironwood-foreground}"
        rounded: "{rounded.none}"
        padding: "11px 24px"
    button-cta-hover:
        backgroundColor: "oklch(0.216 0.006 56.043 / 90%)"
        textColor: "{colors.ironwood-foreground}"
        rounded: "{rounded.none}"
        padding: "11px 24px"
    button-ghost-cta:
        backgroundColor: "transparent"
        textColor: "{colors.ironwood}"
        rounded: "{rounded.none}"
        padding: "11px 24px"
    button-default:
        backgroundColor: "{colors.ironwood}"
        textColor: "{colors.ironwood-foreground}"
        rounded: "{rounded.md}"
        padding: "0 8px"
        height: "1.75rem"
    button-outline:
        backgroundColor: "transparent"
        textColor: "{colors.ironwood}"
        rounded: "{rounded.md}"
        padding: "0 8px"
        height: "1.75rem"
    button-ghost:
        backgroundColor: "transparent"
        textColor: "{colors.ironwood}"
        rounded: "{rounded.md}"
        padding: "0 8px"
        height: "1.75rem"
    input-default:
        backgroundColor: "{colors.neutral-subtle}"
        textColor: "{colors.ironwood}"
        rounded: "{rounded.md}"
        padding: "8px 12px"
        height: "2.5rem"
    card-default:
        backgroundColor: "transparent"
        textColor: "{colors.ironwood}"
        rounded: "{rounded.lg}"
        padding: "24px"
    card-featured:
        backgroundColor: "{colors.ironwood}"
        textColor: "{colors.ironwood-foreground}"
        rounded: "{rounded.lg}"
        padding: "32px"
---

# Design System: Tanship

## 1. Overview

**Creative North Star: "The Founder's Workbench"**

This is a design system built for someone who has been burned before. They've seen the SaaS cream generators, the purple blob heroes, the identical feature grids. They know exactly what they need and have no patience for packaging that costs them trust. The Tanship design system earns its place the same way good tooling earns it: by not getting in the way, by working exactly as expected, and by looking like it was made by someone who uses what they build.

The system is structural, not decorative. Density and contrast create interest. Ironwood, the core dark near-black tone, carries the weight of nearly every surface decision: it is the foreground in light mode, the background in dark mode, the card surface that lifts from the dark ground. Signal Lime appears only where it means something: in the logo mark, as a charged punctuation, never as ambient decoration. Motion is minimal: an active button press is the most animation most elements will ever perform.

Dark mode is not a feature. It is the face of this brand. A solo founder at 11pm, terminal glow on their face, reading a landing page to decide if this stack saves them a weekend. That scene is the design brief. Light mode serves reading and daytime use; dark mode serves the identity.

**Key Characteristics:**

- Flat-by-default with ring-based depth, never shadow-first
- Square corners on marketing surfaces; gently rounded on UI components
- Two typefaces, one voice: Figtree (structure, headings) and Nunito Sans (reading, body)
- Ironwood and its tonal steps do the work; Signal Lime is reserved
- Active feedback on every interactive element: translate-y-px on press, color shift on hover
- Every element earns its space; no decoration that adds no signal

## 2. Colors: The Ironwood Palette

A restrained two-color system with a single saturated accent held in reserve. Ironwood dominates, Signal Lime punctuates.

### Primary

- **Ironwood** (`oklch(0.216 0.006 56.043)`): The structural spine of the system. In light mode this is the foreground and primary button background. In dark mode it becomes card surfaces that lift from the deeper `ironwood-surface`. Warm, dense, authoritative without being cold.
- **Ironwood Surface** (`oklch(0.147 0.004 49.25)`): The true dark-mode ground. Darker than Ironwood by two tonal steps, creating a clear elevation relationship without shadows.
- **Ironwood Foreground** (`oklch(0.985 0.001 106.423)`): Off-white with the barest warm tint. Text on dark. Also the light-mode page background in practice.

### Secondary

- **Signal Lime** (`oklch(0.9 0.25 140)`): The charged accent. A vivid lime-green that reads as "edge is live" — the color of a terminal cursor on a dark background, a deployment status light, a worker spinning up. It vibrates against Ironwood in dark mode and pops against the off-white foreground in light mode. Used for the logo mark, rare accent moments (active chips, status indicators, a single highlight per section), and in dark mode for the sidebar active state. Never as a background fill on large surfaces. Its rarity is the charge; spend it only where the eye must land.
- **Circuit Blue** (`oklch(0.488 0.243 264.376)`): A deeper blue-violet, used for the sidebar primary in dark mode UI. Lower energy than Signal Lime; a workhorse accent for navigation state.

### Neutral

- **Neutral Subtle** (`oklch(0.97 0.001 106.424)`): Muted backgrounds, secondary button fill, input fields. The barely-there surface.
- **Neutral Mid** (`oklch(0.553 0.013 58.071)`): Muted foreground. Body text on supporting content, placeholder text, secondary labels.
- **Neutral Border** (`oklch(0.923 0.003 48.717)`): Dividers and input strokes. Warm-shifted light gray.

### Tertiary

- **Signal Red** (`oklch(0.577 0.245 27.325)`): Destructive states only. Error borders, danger buttons, validation failures. Appears at 10% opacity for backgrounds; full value for text.

### Named Rules

**The Ironwood Economy.** Ironwood is the only color that changes structural meaning between modes. Every surface, every elevated layer, every primary action traces back to this one color's tonal scale. Secondary and Tertiary colors are visitors, not residents.

**The Signal Reserve.** Signal Lime appears on the logo mark and in maximum three additional elements per screen. It is never used as a background fill on large surfaces. Its rarity is the charge; spend it only where the eye must land. When it appears, it should feel earned, not decorative.

## 3. Typography: Figtree + Nunito Sans

**Display Font:** Figtree Variable (with system-ui, sans-serif fallback)
**Body Font:** Nunito Sans Variable (with system-ui, sans-serif fallback)

**Character:** Figtree is geometric with just enough warmth to avoid coldness: the right font for founders who want structure without aggression. Nunito Sans has the slight roundness that makes sustained reading comfortable without going soft. Together they cover authority (headings) and approachability (body) without contradicting each other.

### Hierarchy

- **Display** (semibold 600, clamp 3rem–3.75rem, line-height 1.0, tracking -0.04em): Hero headlines only. One per page. Compressed text at this size reads as carved, not printed — the density signals conviction. Line-height is 1.0: multi-line display text stacks tightly like a stamp, not a paragraph.
- **Headline** (semibold 600, 2.25rem, line-height 1.1, tracking -0.03em): Section headings, feature titles, modal headings. The size gap between headline (2.25rem) and title (1.25rem) is intentional — hierarchy drama over uniformity.
- **Title** (semibold 600, 1.25rem, line-height 1.25, tracking 0): Card titles, sidebar section labels, sub-section headings.
- **Body** (regular 400, 1rem, line-height 1.625): Primary reading text. Cap line length at 65–75ch using `max-w-xl` or equivalent. Muted foreground on supporting copy.
- **Label** (medium 500, 0.75rem, line-height 1.5): Button text, input labels, navigation items, badges, breadcrumbs. Compact but readable.

### Named Rules

**The One-Font-Per-Role Rule.** Figtree is for structural labels and headings. Nunito Sans is for reading. Never swap them. Don't introduce a third family for "code" or "mono" unless a monospace element is explicitly required by a feature (API key display, code blocks).

**The Scale Ratio Rule.** Minimum 1.25 ratio between any two adjacent type steps. Flat type scales are prohibited: if two elements look the same size, one of them shouldn't exist.

## 4. Elevation

This system is flat-by-default. Depth is conveyed through tonal steps and ring strokes, not shadows. A card does not float above the page; it is distinguished from the page by a 1px ring (`ring-1 ring-foreground/10`) and, in dark mode, a slightly lighter background than the ground surface.

Shadows appear in exactly one context: dialogs (`shadow-lg`). This concentration makes the shadow semantically meaningful: a dialog is the only element that truly floats above the rest of the UI. Everything else stays on the plane.

### Shadow Vocabulary

- **Dialog elevation** (`box-shadow: 0 10px 15px -3px oklch(0 0 0 / 0.1), 0 4px 6px -4px oklch(0 0 0 / 0.1)`): Applied to modals and command palettes only. Never to cards, dropdowns, or nav elements.
- **Subtle ring** (`ring-1 ring-foreground/10`): The standard card and container boundary. Not a shadow; a stroke at 10% foreground opacity. Present in both modes.

### Named Rules

**The Flat-By-Default Rule.** Surfaces are on the plane at rest. The only element that lifts is a dialog. Hover states shift color, not elevation. Sidebar panels use a border, not a shadow.

**The Ring-First Rule.** When a container needs visual separation, reach for `ring-1 ring-foreground/10` before any shadow value. If a ring is insufficient, reconsider whether the element needs separation at all.

## 5. Components

### Buttons

Two tiers: marketing CTA and UI compact. They coexist in the same system but serve different surfaces.

**Marketing CTA (landing pages):**

- **Shape:** Zero radius (rounded-none). Square corners signal no-compromise confidence on brand surfaces.
- **Primary CTA:** Ironwood background, Ironwood Foreground text, `padding: 11px 24px`, `height: 2.75rem`. `hover:opacity-90`. `active:translate-y-px`.
- **Ghost CTA:** Transparent background, Ironwood text, `border border-border/50`. Same size and corners as Primary CTA. Secondary action only; Primary CTA is always present when Ghost CTA appears.

**UI Compact (app, dashboard, admin):**

- **Shape:** `calc(0.625rem - 2px)` radius (rounded-md equivalent from the base scale). Gently curved.
- **Default:** Ironwood background, Ironwood Foreground text, `height: 1.75rem`, `padding: 0 8px`, `text-xs`.
- **Outline:** Border stroke from Neutral Border, transparent background. `hover:bg-input/50`.
- **Ghost:** No border, no background. `hover:bg-muted`. Used for toolbar actions and secondary icon buttons.
- **Destructive:** `bg-destructive/10 text-destructive`. Background at 10% opacity; text at full Signal Red.
- **Focus:** `ring-2 ring-ring/30 border-ring`. Ring inset focus, not outline.
- **Disabled:** `opacity-50 pointer-events-none`. No alternative treatment.
- **Active press:** `translate-y-px` on all variants. The tactile confirmation the user pressed something.

### Cards / Containers

- **Corner Style:** 0.625rem (rounded-lg from the base scale). Gently rounded.
- **Background:** In light mode, same as page background (`bg-card = oklch(1 0 0)`). In dark mode, slightly elevated above ground (`oklch(0.216 0.006 56.043)` vs ground at `oklch(0.147 0.004 49.25)`).
- **Shadow Strategy:** None. Separation via `ring-1 ring-foreground/10`. See Elevation.
- **Border:** The ring serves as the border; no explicit `border` property.
- **Internal Padding:** `p-6` (24px) default. Compact variant `p-4` (16px). CardHeader uses `pb-0`; CardFooter uses `pt-0` to prevent double-padding with CardContent.

**Featured Card (Ironwood Dark Surface):** When a single card needs to claim visual authority on a light-mode page (pricing highlight, CTA block, featured tier), use Ironwood as the card background with Ironwood Foreground text and `p-8` (32px) padding. This is the light-mode inversion of the dark-mode elevation pattern: the same Ironwood color anchors both modes, just with swapped roles. Never apply this to more than one card per section or it loses its emphasis. Ring stroke not needed; the color contrast is sufficient.

### Inputs / Fields

- **Style:** `height: 2.5rem`, `border border-input` (Neutral Border), `bg-background`, `rounded-md`, `px-3 py-2`, `text-base` (md: `text-sm`).
- **Focus:** `ring-2 ring-ring` with `ring-offset-2`. Ring replaces border color on focus; border remains present.
- **Error/Invalid:** `aria-invalid:border-destructive` with `aria-invalid:ring-destructive/20`. The border shifts to Signal Red; a soft red ring wraps.
- **Disabled:** `opacity-50 cursor-not-allowed`.
- **Placeholder:** `text-muted-foreground` at default opacity.
- **Field wrapper:** `<Field>` component handles vertical/horizontal orientation. `<FieldError>` uses `text-destructive text-xs`. `<FieldLabel>` pairs with `<FieldTitle>` for consistent label hierarchy.

### Badges / Chips

- **Style:** `height: 1.25rem`, `rounded-full`, `text-[0.625rem]`, `px-2`, `inline-flex items-center`.
- **Default:** Ironwood background, Ironwood Foreground text. Status indication, category tags.
- **Secondary:** Neutral Subtle background, Ironwood text. Lower-emphasis labels.
- **Outline:** Border only, transparent background. Least emphasis.
- **Destructive:** Signal Red at 10% background, Signal Red text. Error/danger status only.

### Navigation

- **Style:** Horizontal nav on marketing surfaces; sidebar nav on app surfaces.
- **Marketing nav:** Logo left, links center-right, CTA button far right. Links use `text-sm font-medium text-muted-foreground hover:text-foreground` transitions.
- **App sidebar:** 16rem expanded, 3rem icon-only collapsed, toggled via keyboard shortcut 'b'. Sidebar uses its own token set (`--sidebar-*`) which mirrors the main scale but allows independent theming.
- **Active state:** `bg-accent text-accent-foreground` in app sidebar. Tab active: `bg-background shadow-sm`.
- **Mobile:** Sidebar slides in as a sheet. Full-width nav becomes hamburger.

### Signature Component: The Square CTA Block

The marketing hero CTA pair is a signature pattern: one filled Ironwood button (square) and one ghost border button (square), side-by-side with `gap-3`, never stacked vertically at desktop. The square corners are the signal that says this is a brand surface, not a UI component. Maintain this pattern on all landing-page call-to-action sections.

## 6. Do's and Don'ts

### Do:

- **Do** use `ring-1 ring-foreground/10` as the primary container boundary. It reads in both light and dark mode without adjustment.
- **Do** use `rounded-none` for all CTA buttons on marketing surfaces (hero, pricing, feature sections). Square corners are intentional brand identity on the landing.
- **Do** use Ironwood (`oklch(0.216 0.006 56.043)`) as the primary button fill in light mode and card surface in dark mode. The same color anchors both modes.
- **Do** keep Signal Lime (`oklch(0.9 0.25 140)`) for the logo mark and at most two additional accent moments per page. Its rarity is the charge.
- **Do** apply `active:translate-y-px` to every interactive button. The 1px press is the system's tactile signature.
- **Do** write display copy at clamp(3rem, 8vw, 3.75rem) with tracking -0.04em and line-height 1.0. Compressed at scale reads as carved, not typed. Flat type scales are prohibited.
- **Do** cap body line length at 65–75ch (`max-w-xl` or `max-w-prose`).
- **Do** use `focus-visible:ring-2 focus-visible:ring-ring/30` for all interactive elements. Keyboard focus must be visible.
- **Do** write dark mode as the primary brand identity surface. Light mode is functional; dark mode is the face.

### Don't:

- **Don't** use generic SaaS cream: soft gradients, rounded cards, purple-to-blue hero blobs, or pastel feature grids. The anti-reference is explicit; the violation is obvious.
- **Don't** copy ShipFast or similar boilerplate-marketing aesthetics: identical feature section grids (icon, heading, one-line description, 4 columns), gradient-filled headline text, hero illustration blobs.
- **Don't** use decorative shadows on cards, nav elements, or page sections. `shadow-lg` belongs on dialogs only.
- **Don't** add decoration that adds no signal: background pattern textures, floating blobs, colored dividers, gradient overlays on images.
- **Don't** use `border-left` or `border-right` greater than 1px as a colored accent stripe on any element. Rewrite with a full border, background tint, or nothing.
- **Don't** use gradient text (`background-clip: text`). Use weight and size for emphasis; never a gradient.
- **Don't** use glassmorphism decoratively. Backdrop blur on a floating card just to look premium is prohibited.
- **Don't** use the hero-metric template: big number, small label, gradient accent. This is a boilerplate starter, not a dashboard product. The metrics format reads like a generic SaaS pricing page.
- **Don't** round CTA buttons on marketing surfaces. `rounded-none` is the choice; rounding marketing buttons makes them look like generic UI components, not brand decisions.
- **Don't** introduce a third typeface. Figtree for structure, Nunito Sans for reading. No mono unless a specific feature demands it (API key fields, code blocks).
- **Don't** use Signal Lime as a background fill on large surfaces or apply it to more than three elements per screen. It is a punctuation mark, not a palette.

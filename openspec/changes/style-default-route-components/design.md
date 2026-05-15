## Context

Three global fallback components render for every route in the app:

- `default-error-component.tsx` — shown when any route throws an unhandled error
- `default-notfound-component.tsx` — shown for 404 routes
- `default-pending-components.tsx` — shown during route transitions/loading

After the `redesign-home-and-auth-pages` change, these components feel out-of-place: they use `rounded-md`, `rounded-full`, and Indonesian copy that conflicts with the English-only, sharp-corners, monochrome aesthetic. The fix is purely visual — no logic changes.

Design system rules to apply:

- No `rounded-*` — use `rounded-none` or remove radius entirely
- Buttons use `border border-border` + `bg-background` pattern or `bg-foreground text-background`
- Typography: `text-sm`/`text-xs`, `font-semibold`, `tracking-tight`, `text-muted-foreground`
- Icons: use `HugeiconsIcon` where appropriate, or keep inline SVG but style consistently
- `Spinner` from `@workspace/ui` for loading state

## Goals / Non-Goals

**Goals:**

- All three components visually match the new design system
- English copy throughout
- Sharp corners, correct text scale, muted palette

**Non-Goals:**

- No logic or routing changes
- No new animation or interaction patterns beyond what exists
- No changes to how/when these components are invoked

## Decisions

### D1: Use `Spinner` from `@workspace/ui` for pending

Replaces the raw `animate-spin` SVG. The UI package already exports `Spinner` — using it ensures consistent loading state across the app.

### D2: Keep inline SVG for error icon (no HugeiconsIcon swap)

The error icon is a custom circle-with-exclamation that maps well to the existing destructive color token. No need to swap to HugeiconsIcon — just restyle the container from `rounded-full` to a square.

### D3: 404 copy stays minimal English

Replace "Halaman yang kamu cari tidak ditemukan." → "The page you're looking for doesn't exist." and "Kembali ke Beranda" → "Back to Home". No other copy changes.

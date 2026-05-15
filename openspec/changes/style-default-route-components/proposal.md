## Why

The three default route components (error, not-found, pending) were built before the homepage redesign and now feel visually inconsistent — they use rounded corners, Indonesian copy ("Halaman yang kamu cari tidak ditemukan"), and generic styling that doesn't match the sharp, minimalist Tanship aesthetic established in the redesign.

## What Changes

- **`default-error-component.tsx`**: Replace rounded error icon with a sharp square container; align typography, button styles, and spacing to the new design system (no rounded-md, use `rounded-none`, match text scale)
- **`default-notfound-component.tsx`**: Update copy to English, match the large ghost-text "404" treatment to the new palette, replace rounded link button with `rounded-none` border style
- **`default-pending-components.tsx`**: Replace bare SVG spinner with the `Spinner` component from `@workspace/ui` for consistency, maintain centered full-viewport layout

## Capabilities

### New Capabilities

- `default-route-components-style`: Visual consistency of the three global default route components with the redesigned design system

### Modified Capabilities

## Impact

- `apps/web/src/routes/-components/default-error-component.tsx`
- `apps/web/src/routes/-components/default-notfound-component.tsx`
- `apps/web/src/routes/-components/default-pending-components.tsx`
- No API, schema, or routing changes

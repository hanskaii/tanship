## Context

Tanship's marketing homepage and auth pages are composed of ~15 components across `_home/-components/` and `_auth/-components/`. They're functional but visually generic — they don't reflect the premium quality of the boilerplate they sell. The redesign will use the `frontend-design` and `stitch-design-taste` skills to generate high-end, production-grade UI. All components are co-located per the TanStack Router `-` prefix convention. No API, schema, or data contract changes are involved.

Current stack constraints:

- Tailwind CSS v4 (no `tailwind.config.ts` — config in CSS file)
- `@workspace/ui` shadcn components (Button, Card, Dialog, Accordion, Input, etc.)
- `HugeiconsIcon` for all iconography
- TanStack Router file-based routing (no layout changes)
- `appConfig` for payments/templates data — keep existing data wiring intact

## Goals / Non-Goals

**Goals:**

- Elevate visual quality to match premium SaaS landing pages (Vercel, Linear, Resend aesthetic)
- Improve conversion UX: clearer CTAs, better pricing hierarchy, trust signals
- Make the login/OTP flow feel polished and brand-aligned
- Maintain all existing functionality and data wiring (no regressions)
- Keep components co-located and following project conventions

**Non-Goals:**

- No new routes or data-fetching patterns
- No changes to API handlers or database schema
- No changes to auth logic — only visual layer of login-form
- No internationalization
- No A/B testing infrastructure

## Decisions

### D1: Skills-first approach using `frontend-design` skill

**Decision**: Use the `frontend-design` skill (and `stitch-design-taste` for taste direction) to generate each redesigned component, then review and integrate.

**Rationale**: The skill produces high-quality, non-generic UI with strong aesthetic sensibility. It's faster than hand-crafting every component and produces more consistent visual output.

**Alternative**: Hand-write each component from scratch. Rejected — slower, higher risk of generic output.

### D2: Component-by-component replacement (no big-bang rewrite)

**Decision**: Replace components one at a time in logical groups (nav → hero → sections → pricing → auth). Each group is independently testable.

**Rationale**: Reduces risk of breaking the page layout. Easier to review and iterate per section.

**Alternative**: Full page rewrite in one pass. Rejected — hard to review, risk of broken composition.

### D3: Keep existing data wiring intact

**Decision**: Do not change how data flows into components (`appConfig.payments`, query results from server functions, `sessionsOptions()`). Only change the visual layer.

**Rationale**: Avoids scope creep and regression risk. The data contracts are already correct.

### D4: Tailwind v4 utility classes, no custom CSS files

**Decision**: All styling via Tailwind utility classes inline on JSX. No new CSS files or `@apply` blocks.

**Rationale**: Consistent with the existing codebase pattern. Tailwind v4 has full design-system support via CSS variables.

### D5: Dark mode via Tailwind `dark:` variants

**Decision**: All components must have dark mode variants. The existing site already has a theme toggle.

**Rationale**: Consistency. A premium product must look good in both modes.

## Risks / Trade-offs

- **Visual regression in composition** → Mitigation: test each section visually in the browser before moving to the next; use the preview MCP tool.
- **`HugeiconsIcon` missing icon names** → Mitigation: search available icons before using; fall back to inline SVG for one-offs.
- **Tailwind v4 class changes** → Mitigation: check existing component files for patterns before introducing new utilities.
- **Login form multi-step state** → Mitigation: preserve the email/OTP step state machine exactly; only restyle the wrapping layout and input components.
- **Template/showcase pages depend on real data** → Mitigation: keep all existing query hooks and data mapping; only change card and grid rendering.

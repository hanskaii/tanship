# Plan 006: Branded Interactive Analytics Dashboard (Overview)

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat 99272a4..HEAD -- apps/web/src/routes/\(app\)/_app/overview/index.tsx`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P2
- **Effort**: M
- **Risk**: LOW
- **Depends on**: none
- **Category**: direction
- **Planned at**: commit `99272a4`, 2026-07-21

## Why this matters

Tanship is billed as a complete boilerplate for profitable SaaS products. Currently, the main logged-in dashboard homepage (`/overview`) is just a static string placeholder (`Hello "/(app)/_app/overview/"!`). Replacing it with a responsive, beautifully styled analytics dashboard showcases the kit's components, charts, and billing integration, and provides founders with a production-ready starting point.

## Current state

- The relevant files:
    - `apps/web/src/routes/(app)/_app/overview/index.tsx` — current placeholder overview page.
    - `packages/ui` — UI package containing shadcn/ui building blocks.
    - `@workspace/config` — contains the `appConfig` with pricing details.

- The current `overview/index.tsx`:

    ```ts
    import { createFileRoute } from "@tanstack/react-router";

    export const Route = createFileRoute("/(app)/_app/overview/")({
        component: RouteComponent
    });

    function RouteComponent() {
        return <div>Hello "/(app)/_app/overview/"!</div>;
    }
    ```

- Design guidelines from `DESIGN.md`:
    - **Colors**: Achromatic system. Background is `--background` (`oklch(0.145 0 0)` dark), cards are `--card` (`oklch(0.185 0 0)` dark).
    - **Accent**: Signal Lime (`--primary`, `color(display-p3 0.789306 1 0)`) used rare and intentionally (rare highlights, never large backgrounds).
    - **Elevation**: Flat-by-default. Depth via tonal steps and ring strokes (`ring-1 ring-foreground/10`). No shadows on cards.
    - **Typography**: Albert Sans (`font-heading`) for titles/headings, Inter (`font-sans`) for body/labels.

## Commands you will need

| Purpose   | Command                 | Expected on success |
| --------- | ----------------------- | ------------------- |
| Typecheck | `pnpm -F web run build` | exit 0, no errors   |
| Dev       | `pnpm -F web run dev`   | runs without errors |

## Scope

**In scope**:

- `apps/web/src/routes/(app)/_app/overview/index.tsx`
- `apps/web/src/routes/(app)/_app/overview/-components/` (create if needed for subcomponents)

**Out of scope**:

- Modifying backend endpoints.
- Modifying authentication flow or route guards in `apps/web`.

## Git workflow

- Branch: `advisor/006-analytics-dashboard`
- Commit message: standard lowercase git message style (e.g. `implement interactive analytics dashboard for app overview`)

## Steps

### Step 1: Design the Dashboard Layout

Create a clean, responsive layout structure in `apps/web/src/routes/(app)/_app/overview/index.tsx`:

- Header showing welcome back message and date range selector (e.g. "Last 30 Days").
- Grid layout with 4 KPI cards:
    1. **MRR / Revenue** (e.g. "$1,250", +12.5% from last month)
    2. **Total Users** (e.g. "84", +8% from last week)
    3. **API Key Requests** (e.g. "45,200", status indicator)
    4. **Credits Remaining** (integrated with `session.user.credits` or `credits` from API)

### Step 2: Use Tonal & Flat card design matching `DESIGN.md`

Format the KPI cards using Tailwind:
`rounded-xl bg-card border border-border/40 p-5 ring-1 ring-foreground/5 shadow-none`
Ensure typography uses `font-heading font-semibold text-lg` for card titles, and `font-sans text-sm text-muted-foreground` for sub-labels.

### Step 3: Implement usage chart component

Implement a stylized SVG area/line chart or Recharts component inside the overview page showing daily usage (requests, signups, or revenue over time) to simulate production metrics.

- Keep the chart color palette clean: stroke using `--primary` (Signal Lime) or `--border/muted-foreground`.
- Ensure it supports dark mode seamlessly (using CSS variables).

### Step 4: Add User Context and Action Links

- Fetch the user session via `authClient.useSession()`.
- Add quick action links (e.g. "Generate API Key", "Manage Subscriptions", "View Docs") pointing to `/account/api-key`, `/account/billing` to guide users.

**Verify**: `pnpm -F web run build` exits 0.

## Done criteria

- [ ] `pnpm -F web run build` completes successfully.
- [ ] Overview page displays a rich SaaS dashboard with 4 metric cards and 1 chart.
- [ ] Dashboard is responsive and follows the exact theme guidelines (chroma-zero neutral backgrounds, Signal Lime accent, no shadows).

## STOP conditions

- If Recharts or chart rendering libraries throw compilation errors due to TanStack Start server-side rendering (hydrate/SSR) mismatch. Wrap client-side chart components with a dynamic fallback if needed.

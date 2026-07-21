# Plan 006: Branded Interactive Analytics Dashboard (Overview)

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat 1928924..HEAD -- apps/web/src/routes/\(app\)/_app/overview/index.tsx`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P2
- **Effort**: M
- **Risk**: LOW
- **Depends on**: none
- **Category**: direction
- **Planned at**: commit `1928924`, 2026-07-21

## Why this matters

Tanship is billed as a complete boilerplate for profitable SaaS products. Currently, the main logged-in dashboard homepage (`/overview`) is just a static string placeholder (`Hello "/(app)/_app/overview/"!`). Replacing it with a responsive, beautifully styled analytics dashboard showcases the kit's components, charts, and billing integration, and provides founders with a production-ready starting point.

To achieve maximum performance and elite UX, the dashboard must load instantly using React Suspense, provide granular Skeleton loaders for every visual piece, and trigger quick actions (such as generating API Keys) directly using the existing global `AppModalContext` instead of full page redirects.

## Current state

- The relevant files:
    - `apps/web/src/routes/(app)/_app/overview/index.tsx` — current placeholder overview page.
    - `apps/web/src/routes/-components/providers/app-modal-provider.tsx` — defines `AppModalContext` for triggering modals (e.g. `openCreateApiKeyModal`, `openConfirmModal`).
    - `packages/ui` — UI package containing shadcn/ui building blocks.

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
- `apps/web/src/routes/(app)/_app/overview/-components/` (create)

**Out of scope**:

- Modifying backend endpoints.
- Modifying authentication flow or route guards in `apps/web`.

## Git workflow

- Branch: `advisor/006-analytics-dashboard`
- Commit message: standard lowercase git message style (e.g. `implement fast loading interactive analytics dashboard for app overview`)

## Steps

### Step 1: Create Dashboard Sub-Components and Skeleton Loaders

To ensure instant feedback and maintain structural separation, create a dedicated `-components/` directory:
`apps/web/src/routes/(app)/_app/overview/-components/`

Create the following files:

1. `dashboard-skeleton.tsx`:
    - Renders animated pulsing skeleton loaders matching the layout of the stats cards and chart.
    - Use Tailwind's `animate-pulse` on flat gray panels (`bg-muted/20`).
2. `dashboard-stats.tsx`:
    - Queries metrics or utilizes mock statistics (e.g., MRR: $1,250, Users: 84, Requests: 45k, Credits: 10k).
    - Card design: `rounded-xl bg-card border border-border/40 p-5 ring-1 ring-foreground/5 shadow-none`.
3. `dashboard-charts.tsx`:
    - Renders a stylized line or bar chart using `Recharts` representing daily API load or user signups.
    - Use Signal Lime (`var(--primary)`) or Circuit Blue accents for chart elements.
4. `dashboard-actions.tsx`:
    - Renders quick-action buttons (e.g., "Create API Key", "Upgrade Subscription").
    - Import `AppModalContext` from `@/routes/-components/providers/app-modal-provider` and consume it using `useContext`.
    - Set up the "Create API Key" action to invoke `openCreateApiKeyModal` directly from the dashboard context, providing instant modal interaction instead of redirecting the user to `/account/api-key`.

### Step 2: Assemble Dashboard with Suspense

Update `apps/web/src/routes/(app)/_app/overview/index.tsx` to mount the components inside React `<Suspense>` boundaries:

```tsx
import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from "react";
import { DashboardStats } from "./-components/dashboard-stats";
import { DashboardCharts } from "./-components/dashboard-charts";
import { DashboardActions } from "./-components/dashboard-actions";
import { DashboardSkeleton } from "./-components/dashboard-skeleton";

export const Route = createFileRoute("/(app)/_app/overview/")({
	component: DashboardPage
});

function DashboardPage() {
	return (
		<div className="flex flex-col gap-6 w-full mt-2 pb-16">
			{/* Page Header */}
			<div className="flex flex-col gap-1">
				<h1 className="text-xl font-heading font-semibold text-foreground tracking-tight">
					Dashboard Overview
				</h1>
				<p className="text-xs text-muted-foreground">
					Real-time analytics and quick actions for your application.
				</p>
			</div>

			{/* Main Actions Panel */}
			<DashboardActions />

			{/* Suspenseful Stats and Charts */}
			<Suspense fallback={<DashboardSkeleton />}>
				<div className="grid gap-6">
					<DashboardStats />
					<DashboardCharts />
				</div>
			</Suspense>
		</div>
	);
}
```

### Step 3: Run Typechecks and build checks

Run the build script to ensure no typescript issues in `apps/web`.

**Verify**: `pnpm -F web run build` exits 0.

## Done criteria

- [ ] `pnpm -F web run build` completes successfully.
- [ ] Overview page displays a rich SaaS dashboard with stats cards, a chart, and quick action panels.
- [ ] Skeleton loaders show instantly before the main statistics resolve.
- [ ] Modal for creating API keys triggers directly on the dashboard page via `AppModalContext`.

## STOP conditions

- If Recharts or component imports throw SSR compilation errors. Wrap client-only elements in hydrated check blocks.

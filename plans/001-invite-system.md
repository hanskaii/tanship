# Plan 001: Implement GitHub organization and repository invitations based on plan

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat bb81a7f..HEAD -- apps/api/src/handlers/github.handler.ts apps/web/src/routes/(app)/_home/activate/index.tsx`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: bug | direction
- **Planned at**: commit `bb81a7f`, 2026-07-21

## Why this matters

The prior logic did not support templates in the GitHub invitation flow (they were manual downloads only) and invited all boilerplate buyers directly to individual repositories. This plan implements organization-wide member invitations for the Pro plan ("tanship-pro") and dynamic individual repository collaborator invitations for Tanship Standard ("tanship") and all individual template plans (e.g. "template-saas-dashboard"). This matches the business goal of inviting Pro users directly to the organization and Standard/Template users to specific repositories.

## Current state

- The relevant files:
    - `apps/api/src/handlers/github.handler.ts` — API router handling `/claim` and `/activate` endpoints.
    - `apps/web/src/routes/(app)/_home/activate/index.tsx` — Front-end activate license page.
    - `apps/web/src/routes/(app)/_app/account/billing/-components/license-section.tsx` — Profile billing and GitHub claim card.
    - `apps/web/src/routes/-fn/purchases.ts` — Types and client-side server functions wrapper for purchases API.
    - `apps/api/src/handlers/github.handler.test.ts` — Vitest handler tests.

## Commands you will need

| Purpose   | Command                                                                       | Expected on success |
| --------- | ----------------------------------------------------------------------------- | ------------------- |
| Typecheck | `pnpm --filter api exec tsc --noEmit` & `pnpm --filter web exec tsc --noEmit` | exit 0, no errors   |
| Tests     | `pnpm --filter api exec vitest run src/handlers/github.handler.test.ts`       | all pass            |

## Scope

**In scope**:

- `apps/api/src/handlers/github.handler.ts`
- `apps/api/src/handlers/github.handler.test.ts`
- `apps/web/src/routes/-fn/purchases.ts`
- `apps/web/src/routes/(app)/_home/activate/index.tsx`
- `apps/web/src/routes/(app)/_app/account/billing/-components/license-section.tsx`

**Out of scope**:

- `apps/api/src/handlers/template-download.handler.ts` (downloading template archives is kept as-is)

## Steps

### Step 1: Update API Handlers for Dynamic GitHub Invitations

Modify `/claim` and `/activate` in `apps/api/src/handlers/github.handler.ts`:

- Check if `planSlug === "tanship-pro"`. If yes, call GitHub Org Memberships API:
  `PUT https://api.github.com/orgs/${repoOwner}/memberships/${githubUsername}` with body `{ role: "member" }`.
- Else, call GitHub Repository Collaborators API:
  `PUT https://api.github.com/repos/${repoOwner}/${repo}/collaborators/${githubUsername}` with body `{ permission: "pull" }`.
- Resolve the repository name dynamically:
    - If `planSlug === "tanship"`, use `boilerplateRepo` from env.
    - Else, use the `planSlug` directly (e.g. `template-saas-dashboard`).

**Verify**: `pnpm --filter api exec tsc --noEmit` exits with 0.

### Step 2: Implement Unit Tests

Create or update `apps/api/src/handlers/github.handler.test.ts` with mocks for the Hono context, Database operations, and GitHub fetch API to verify the three core cases:

1. `tanship-pro` invites user to organization.
2. `tanship` invites user to standard boilerplate repository.
3. `template-saas-dashboard` invites user to template repository.

**Verify**: `pnpm --filter api exec vitest run src/handlers/github.handler.test.ts` passes successfully.

### Step 3: Update Front-end activate & billing UI

- Update `apps/web/src/routes/-fn/purchases.ts` to reflect the updated `ClaimGithubResult` and `ActivateResult` structures (`type` and `target` instead of `repos[]`).
- In `apps/web/src/routes/(app)/_home/activate/index.tsx`, enable the GitHub username claim form for template purchases so that they can be activated via GitHub instead of only allowing a file download.
- In `apps/web/src/routes/(app)/_app/account/billing/-components/license-section.tsx`, display the correct title ("Claim GitHub Organization Access" / "Claim GitHub Repository Access") based on the plan.

**Verify**: `pnpm --filter web exec tsc --noEmit` exits with 0.

## Test plan

- Integration/Unit Tests are contained in `apps/api/src/handlers/github.handler.test.ts`.
- Run: `pnpm --filter api exec vitest run src/handlers/github.handler.test.ts`
- Verification: 3 unit tests passed (representing Pro, Standard, and Template plans).

## Done criteria

- [ ] `pnpm --filter api exec tsc --noEmit` exits 0.
- [ ] `pnpm --filter web exec tsc --noEmit` exits 0.
- [ ] `pnpm --filter api exec vitest run src/handlers/github.handler.test.ts` passes.
- [ ] UI displays GitHub activation form for templates on `/activate`.
- [ ] `plans/README.md` status row updated.

## STOP conditions

- If GitHub API response properties format changed or the API rate-limit gets hit in local test environment.
- If Dodo Payments SDK integration changes drastically and activation schema fails validation.

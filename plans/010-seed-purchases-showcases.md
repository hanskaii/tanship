# Plan 010: Database Seeder Enhancements for Purchases & Showcases (DX)

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat 1928924..HEAD -- packages/database/seeder/seeds/users.ts`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P2
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: direction
- **Planned at**: commit `1928924`, 2026-07-21

## Why this matters

For developers starting out with the Tanship monorepo, having seeded mock data is key for exploring user interfaces right away. Currently, the database seeder creates default users and an API key, but creates no mock purchases (licenses) or showcase submissions. As a result, the billing licenses panel and the admin/public showcase sections look empty on first spin-up, forcing developers to manually invoke webhooks or payment mock flows. Seeding these entities completes the local sandbox experience.

## Current state

- Relevant files:
    - `packages/database/seeder/seeds/users.ts` — contains the seedUsers script.
    - `packages/database/schema/purchases.ts` — schema definitions for purchases.
    - `packages/database/schema/showcases.ts` — schema definitions for showcases.

- Existing seeds in `users.ts`:
    - `user_pro_seed`: Pro user, has customer ID but no purchase history in purchases table.
    - `user_free_seed`: Normal user.
    - `user_admin_seed`: Admin.

## Commands you will need

| Purpose   | Command                                   | Expected on success |
| --------- | ----------------------------------------- | ------------------- |
| Seed DB   | `pnpm -F @workspace/database run db:seed` | exit 0              |
| Typecheck | `pnpm -F @workspace/database exec tsc`    | exit 0, no errors   |

## Scope

**In scope**:

- `packages/database/seeder/seeds/users.ts`

**Out of scope**:

- Modifying schema definitions.

## Git workflow

- Branch: `advisor/010-seed-purchases-showcases`
- Commit message: standard lowercase git message style (e.g. `seed mock purchases and showcases to improve developer onboarding`)

## Steps

### Step 1: Add seed data for Purchases

Inside `packages/database/seeder/seeds/users.ts`, import `purchases` from `../../schema/purchases`.
Seed two mock purchases:

1. A Tanship Pro purchase for `user_pro_seed`:
    - `id`: `pur_pro_seed`
    - `userId`: `user_pro_seed`
    - `productId`: `pdt_pro_replace_me`
    - `planSlug`: `tanship-pro`
    - `licenseKey`: `tanship-pro-license-key-for-alice`
    - `githubUsername`: `null` (allows testing the activation/claim input form)
2. A Tanship Standard template purchase for `user_free_seed` or `user_admin_seed`:
    - `id`: `pur_std_seed`
    - `userId`: `user_free_seed`
    - `productId`: `pdt_tpl_saas_dashboard_replace_me`
    - `planSlug`: `template-saas-dashboard`
    - `licenseKey`: `tanship-saas-dashboard-license-key-for-bob`
    - `githubUsername`: `bob_free`

Use `.onConflictDoNothing()` to avoid seeding duplicate keys.

### Step 2: Add seed data for Showcases

Import `showcases` from `../../schema/showcases`.
Seed three mock showcase projects:

1. Approved showcase:
    - `id`: `show_approved_1`
    - `userId`: `user_pro_seed`
    - `submitterName`: `Alice Pro`
    - `projectName`: `FundaApp`
    - `projectUrl`: `https://funda.example.com`
    - `description`: `A beautiful dashboard launched using the Tanship edge stack.`
    - `status`: `approved`
2. Approved showcase:
    - `id`: `show_approved_2`
    - `userId`: `user_free_seed`
    - `submitterName`: `Bob Free`
    - `projectName`: `SaaS Boilerplate Reviewer`
    - `projectUrl`: `https://boilerplates.example.com`
    - `description`: `Audit and compare templates directly on Cloudflare.`
    - `status`: `approved`
3. Pending showcase (for testing admin showcase review):
    - `id`: `show_pending_1`
    - `userId`: `user_credits_seed`
    - `submitterName`: `Carol Credits`
    - `projectName`: `API Monitoring Hub`
    - `projectUrl`: `https://monitor.example.com`
    - `description`: `Real-time query performance monitoring for edge workers.`
    - `status`: `pending`

### Step 3: Run Database Seed

Run `pnpm -F @workspace/database run db:seed` to verify seeding completes without errors.

**Verify**: Seeder executes and prints check messages.

## Done criteria

- [ ] Seeder script builds and typechecks cleanly.
- [ ] Running `pnpm -F @workspace/database run db:seed` populates both `purchases` and `showcases` tables.
- [ ] Users see active licenses (claimed and unclaimed) on `/account/billing` right after seeding.
- [ ] Admin showcase page `/s/showcase` contains 1 pending project to review.

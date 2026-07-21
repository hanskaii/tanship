# Plan 002: Decouple pricing plan slugs from GitHub repository names

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat bb81a7f..HEAD -- config/app.ts apps/api/src/handlers/github.handler.ts`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding.

## Status

- **Priority**: P2
- **Effort**: S
- **Risk**: LOW
- **Depends on**: plans/001-invite-system.md
- **Category**: tech-debt
- **Planned at**: commit `bb81a7f`, 2026-07-21

## Why this matters

Currently, the GitHub invitation system dynamically maps the individual template plans to GitHub repositories by directly using the `planSlug` string (e.g. `template-saas-dashboard`). If the marketing team renames a plan or changes its pricing slug in `config/app.ts`, it immediately breaks the GitHub invitation flow because no repository with the new slug exists. Decoupling them by introducing an optional `githubRepo` field in the payment config makes the system more robust and independent of pricing/slug changes.

## Current state

- The relevant files:
    - `packages/core/src/types/payments.ts` or `packages/core/src/index.ts` — Type definition of `PaymentPlan`.
    - `config/app.ts` — Pricing plans configuration.
    - `apps/api/src/handlers/github.handler.ts` — Resolves repository names during claims.

- Code excerpt from `apps/api/src/handlers/github.handler.ts`:
    ```ts
    const repo =
    	purchase.planSlug === "tanship" ? boilerplateRepo : purchase.planSlug;
    ```

## Commands you will need

| Purpose   | Command                                                                 | Expected on success |
| --------- | ----------------------------------------------------------------------- | ------------------- |
| Typecheck | `pnpm build`                                                            | exit 0, no errors   |
| Tests     | `pnpm --filter api exec vitest run src/handlers/github.handler.test.ts` | all pass            |

## Scope

**In scope**:

- `packages/core/src/types/payments.ts` (or similar file defining `PaymentPlan`)
- `config/app.ts`
- `apps/api/src/handlers/github.handler.ts`
- `apps/api/src/handlers/github.handler.test.ts`

**Out of scope**:

- Database schema modification (no need to change the DB since we can resolve the configuration object from the saved `planSlug`).

## Git workflow

- Branch: `advisor/002-decouple-slugs`
- Commits style: Use standard lowercase git message style (e.g. `decouple pricing plan slugs from github repository names`).
- Do NOT push or open a PR unless instructed.

## Steps

### Step 1: Extend `PaymentPlan` Type

Locate the `PaymentPlan` interface definition in `@workspace/core`. Add an optional field:

```ts
export interface PaymentPlan {
	// ... existing fields
	githubRepo?: string;
}
```

### Step 2: Configure `githubRepo` on Pricing plans

In `config/app.ts`, add the `githubRepo` key explicitly to individual templates if different from their slugs, or add it for all templates explicitly for clarity:

```ts
{
    productId: "pdt_tpl_saas_dashboard_replace_me",
    slug: "template-saas-dashboard",
    githubRepo: "template-saas-dashboard",
    name: "SaaS Dashboard Template",
    // ...
}
```

### Step 3: Update Resolver in `github.handler.ts`

Update the logic in `apps/api/src/handlers/github.handler.ts` to look up the configured `githubRepo` from `appConfig.payments` using the `purchase.planSlug`:

```ts
const plan = appConfig.payments.find((p) => p.slug === purchase.planSlug);
const repo =
	purchase.planSlug === "tanship"
		? boilerplateRepo
		: (plan?.githubRepo ?? purchase.planSlug);
```

### Step 4: Fix Unit Tests

Update the mocked `appConfig` or inputs in `apps/api/src/handlers/github.handler.test.ts` to include the `githubRepo` key and verify it falls back properly.

**Verify**: `pnpm --filter api exec vitest run src/handlers/github.handler.test.ts` passes.

## Test plan

- Test coverage resides in `apps/api/src/handlers/github.handler.test.ts`.
- Run: `pnpm --filter api exec vitest run src/handlers/github.handler.test.ts`.

## Done criteria

- [ ] `pnpm build` typechecks successfully without errors.
- [ ] Vitest handler tests pass.
- [ ] Plans status row in `plans/README.md` updated.

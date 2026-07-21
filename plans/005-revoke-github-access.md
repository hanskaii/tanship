# Plan 005: Revoke GitHub Access on Refund or Subscription Cancellation

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat 99272a4..HEAD -- apps/api/src/boot.ts apps/api/src/handlers/github.handler.ts`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: direction
- **Planned at**: commit `99272a4`, 2026-07-21

## Why this matters

Tanship is an invite-only starter kit that grants access to private GitHub repositories or organization membership upon purchase. Currently, when a customer requests a refund or cancels their subscription, the payment webhooks are received, but the GitHub collaborator or organization access is never revoked. This allows users to exploit the refund policy while retaining permanent access to the boilerplate code. Implementing automated revocation closes this loophole.

## Current state

- The relevant files:
    - `apps/api/src/boot.ts` — contains the `Gate.after` event subscribers (such as `subscription.cancelled`, `payment.succeeded`, etc.).
    - `packages/auth/hooks/payment.hooks.ts` — defines payment webhooks mapped to Gate events, including `onRefundSucceeded` and `onSubscriptionCancelled`.
    - `apps/api/src/handlers/github.handler.ts` — contains the logic and environment variables used to invite users to GitHub org/repos.

- Environment variables in `github.handler.ts`:

    ```ts
    const env = c.env as any;
    const githubToken: string | undefined = env.GITHUB_TOKEN;
    const repoOwner: string | undefined = env.GITHUB_REPO_OWNER;
    const boilerplateRepo: string | undefined = env.GITHUB_REPO_BOILERPLATE;
    ```

- Subscription cancellation handler in `apps/api/src/boot.ts`:

    ```ts
    Gate.after("subscription.cancelled", async (ctx) => {
    	const { db, payload } = ctx;
    	const userId =
    		payload.data?.metadata?.userId || payload.data?.metadata?.user_id;
    	if (userId) {
    		console.log(
    			`[Billing Sync] Subscription cancelled: ${ctx.subscriptionId} for user ${userId}`
    		);
    		await db
    			.update(users)
    			.set({
    				subscriptionStatus: "cancelled"
    			})
    			.where(eq(users.id, userId));
    	}
    });
    ```

- Missing handler: `refund.succeeded` has no subscriber in `boot.ts`.

## Commands you will need

| Purpose   | Command                   | Expected on success |
| --------- | ------------------------- | ------------------- |
| Typecheck | `pnpm -F api run build`   | exit 0, no errors   |
| Tests     | `pnpm -F api exec vitest` | all pass            |

## Scope

**In scope**:

- `apps/api/src/boot.ts`
- `apps/api/src/handlers/github.handler.test.ts`

**Out of scope**:

- Direct modifications to client-side pages in `apps/web`.
- Modifying standard Better-Auth tables.

## Git workflow

- Branch: `advisor/005-revoke-github-access`
- Commit message: standard lowercase git message style (e.g. `revoke github access on subscription cancellation and refund`)

## Steps

### Step 1: Implement GitHub Revocation Helper

Add a helper function inside `apps/api/src/boot.ts` to call the GitHub API and remove access for a given user.
Use native `fetch` requests similar to the ones in `github.handler.ts`.

Organization revocation endpoint:
`DELETE https://api.github.com/orgs/{org}/memberships/{username}`

Repository collaborator revocation endpoint:
`DELETE https://api.github.com/repos/{owner}/{repo}/collaborators/{username}`

Signature pattern:

```ts
async function revokeGithubAccess(
	githubUsername: string,
	planSlug: string,
	env: any
) {
	const githubToken = env.GITHUB_TOKEN;
	const repoOwner = env.GITHUB_REPO_OWNER;
	const boilerplateRepo = env.GITHUB_REPO_BOILERPLATE;

	if (!githubToken || !repoOwner || !boilerplateRepo) {
		console.warn("[GitHub Revocation] Missing config, skipping.");
		return;
	}

	const isPro = planSlug === "tanship-pro";
	const url = isPro
		? `https://api.github.com/orgs/${repoOwner}/memberships/${githubUsername}`
		: `https://api.github.com/repos/${repoOwner}/${planSlug === "tanship" ? boilerplateRepo : planSlug}/collaborators/${githubUsername}`;

	const res = await fetch(url, {
		method: "DELETE",
		headers: {
			Authorization: `Bearer ${githubToken}`,
			Accept: "application/vnd.github+json",
			"X-GitHub-Api-Version": "2022-11-28",
			"User-Agent": "Tanship-App"
		}
	});

	if (res.status === 204) {
		console.log(`[GitHub Revocation] Revoked @${githubUsername} access`);
	} else {
		console.error(
			`[GitHub Revocation] Failed to revoke access: status ${res.status}`
		);
	}
}
```

### Step 2: Handle `subscription.cancelled` event in `boot.ts`

Modify the `subscription.cancelled` handler to also fetch the corresponding user's purchases, perform revocation, and clear the database's GitHub details:

1. Query the `purchases` table for all records belonging to the `userId` where `githubUsername` is not null.
2. For each purchase, call `revokeGithubAccess(purchase.githubUsername, purchase.planSlug, env)`.
3. Set the purchase record's `githubUsername` and `githubInvitedAt` to `null` to mark it as un-claimed/deactivated (or delete the record).

### Step 3: Handle `refund.succeeded` event in `boot.ts`

Add a subscriber for `refund.succeeded` in `boot.ts`:

```ts
Gate.after("refund.succeeded", async (ctx) => {
	const { db, payload } = ctx as any;
	const paymentId = payload.data?.payment_id;
	if (!paymentId) return;

	// Find the purchase related to this paymentId
	const purchase = await db.query.purchases.findFirst({
		where: eq(purchases.paymentId, paymentId)
	});

	if (purchase && purchase.githubUsername) {
		const env = (ctx as any).env;
		await revokeGithubAccess(
			purchase.githubUsername,
			purchase.planSlug,
			env
		);

		// Clear details in DB
		await db
			.update(purchases)
			.set({
				githubUsername: null,
				githubInvitedAt: null
			})
			.where(eq(purchases.id, purchase.id));
	}
});
```

**Verify**: `pnpm -F api run build` exits 0.

### Step 4: Add Unit Tests

Add tests to `apps/api/src/handlers/github.handler.test.ts` (or create a dedicated unit test file) mocking the fetch `DELETE` request to verify the revocation triggers on subscription cancellation and refund.

**Verify**: `pnpm -F api exec vitest` all pass.

## Done criteria

- [ ] `pnpm -F api run build` exits 0.
- [ ] `pnpm -F api exec vitest` runs and all tests pass.
- [ ] Subscriptions cancellations trigger DELETE requests to the GitHub API.
- [ ] Refunds trigger DELETE requests to the GitHub API.

## STOP conditions

- If the Dodo Payments payload signature changes or metadata structure is inconsistent.
- If the environment variables for GitHub are not loaded during the Gate events execution.

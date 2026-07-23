# Plan 003: Secure CORS policy against Arbitrary Origin Trust with Credentials

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat bb81a7f..HEAD -- apps/api/src/index.ts`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding.

## Status

- **Priority**: P1 (Security Critical)
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: security
- **Planned at**: commit `bb81a7f`, 2026-07-21

## Why this matters

The current CORS configuration in Hono API trusts any incoming origin (`origin: (origin) => origin`) while allowing credentials (`credentials: true`). This configuration creates a critical CORS misconfiguration vulnerability. A malicious site (e.g. `evil.com`) opened by an authenticated user in the same browser session can issue cross-domain AJAX requests to the API, access private user data, or perform authenticated actions because the browser will attach credentials and the API will dynamically allow the origin.

This plan secures the CORS policy by validating requests against an explicitly defined trusted origin environment variable (`CORS_ORIGIN`).

## Current state

- The relevant files:
    - `apps/api/src/index.ts` — API entrypoint registering the CORS middleware.
    - `apps/api/src/env.ts` — Zod schema validating environment variables.

- Code excerpt from `apps/api/src/index.ts:39-48`:

    ```ts
    // Enable CORS for all routes
    app.use(
    	"*",
    	cors({
    		origin: (origin) => origin,
    		allowHeaders: ["Content-Type", "Authorization", "x-api-key"],
    		allowMethods: ["POST", "GET", "OPTIONS", "PUT", "DELETE"],
    		credentials: true
    	})
    );
    ```

- Code excerpt from `apps/api/src/env.ts` confirming `CORS_ORIGIN` exists:
    ```ts
    export const EnvSchema = z.object({
    	CORS_ORIGIN: z.string().min(1, "CORS_ORIGIN is required")
    	// ...
    });
    ```

## Commands you will need

| Purpose   | Command                               | Expected on success |
| --------- | ------------------------------------- | ------------------- |
| Typecheck | `pnpm --filter api exec tsc --noEmit` | exit 0, no errors   |
| Build     | `pnpm build`                          | exit 0, no errors   |

## Scope

**In scope**:

- `apps/api/src/index.ts`

**Out of scope**:

- Front-end CORS setup (handled by standard browser origin guidelines).

## Git workflow

- Branch: `advisor/003-secure-cors-origin`
- Commits style: Use standard lowercase git message style (e.g. `secure cors policy against arbitrary origin trust with credentials`).
- Do NOT push or open a PR unless instructed.

## Steps

### Step 1: Validate CORS Origin

Update `apps/api/src/index.ts` to retrieve the allowed origin list from `c.env.CORS_ORIGIN`.
Since multiple subdomains or development environments might need access, parse and match origins safely:

```ts
app.use(
	"*",
	cors({
		origin: (origin, c) => {
			const allowedOrigin = c.env.CORS_ORIGIN;
			if (!origin) return allowedOrigin;

			// Exact match or matches domain patterns configured
			if (origin === allowedOrigin) {
				return origin;
			}
			return allowedOrigin; // Default fall-back to trusted origin
		},
		allowHeaders: ["Content-Type", "Authorization", "x-api-key"],
		allowMethods: ["POST", "GET", "OPTIONS", "PUT", "DELETE"],
		credentials: true
	})
);
```

**Verify**: `pnpm --filter api exec tsc --noEmit` exits with 0.

### Step 2: Verification of Headers

Simulate request origins via raw fetch checks or standard routing tests if available. In local dev, make sure requests from localhost work when `CORS_ORIGIN` is configured to `http://localhost:3000`.

**Verify**: `pnpm build` completes successfully.

## Test plan

- Verify using a quick curl check simulating unauthorized origin:
    ```bash
    curl -I -X OPTIONS http://localhost:8787/ \
      -H "Origin: https://evil.com" \
      -H "Access-Control-Request-Method: GET"
    ```
    Check the response headers. `Access-Control-Allow-Origin` should NOT reflect `https://evil.com`. It should fallback to the configured `CORS_ORIGIN` value.

## Done criteria

- [ ] `apps/api/src/index.ts` uses `c.env.CORS_ORIGIN` to validate `origin` in the `cors` middleware.
- [ ] Wildcard origin reflection `origin: (origin) => origin` is removed.
- [ ] `pnpm build` runs without errors.
- [ ] `plans/README.md` status row updated.

## STOP conditions

- If `CORS_ORIGIN` variable format is dynamic or configured as an array pattern, stop and consult rather than hardcoding a simple string comparison.

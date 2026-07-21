# Plan 008: OpenAPI Specification and Swagger UI Setup

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat 1928924..HEAD -- apps/api/src/contract.ts apps/api/src/index.ts`
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

For developer-oriented SaaS applications built on Tanship, providing clear, interactive API documentation is essential. Since Hono utilizes structured schemas and route handlers, we can auto-generate OpenAPI specifications and serve an interactive Swagger UI. This allows users to test their API keys, verify inputs, and explore endpoints directly in the browser, simplifying integration.

## Current state

- Relevant files:
    - `apps/api/src/index.ts` — API entry point.
    - `apps/api/src/contract.ts` — mounts RPC routes that use Zod schemas.
    - `apps/api/package.json` — contains API dependencies.

- Current dependencies:
    - `@hono/zod-validator` is used for validation, but we don't have `@hono/zod-openapi` or `@hono/swagger-ui` installed.

## Commands you will need

| Purpose   | Command                 | Expected on success |
| --------- | ----------------------- | ------------------- |
| Install   | `pnpm install`          | exit 0              |
| Typecheck | `pnpm -F api run build` | exit 0, no errors   |

## Scope

**In scope**:

- `apps/api/src/index.ts`
- `apps/api/package.json`
- `apps/api/src/handlers/swagger.handler.ts` (create)

**Out of scope**:

- Rewriting existing handlers to use `@hono/zod-openapi` class abstractions (this plan will generate manually or semi-automatically using Swagger UI middleware and a light contract definition).

## Git workflow

- Branch: `advisor/008-openapi-swagger`
- Commit message: standard lowercase git message style (e.g. `add openapi specification and swagger ui interactive documentation`)

## Steps

### Step 1: Install Swagger dependencies

Add `@hono/swagger-ui` to dependencies in `apps/api/package.json`:

- Run `pnpm -F api add @hono/swagger-ui`

### Step 2: Implement Swagger Handler

Create `apps/api/src/handlers/swagger.handler.ts` that serves the Swagger HTML and the OpenAPI JSON.
Since we want to keep handler routing lightweight, compile the OpenAPI JSON using a basic static helper or schema extraction matching the contract:

```ts
import { Hono } from "hono";
import { swaggerUI } from "@hono/swagger-ui";

const swaggerHandler = new Hono()
	.get("/swagger-ui", swaggerUI({ url: "/doc" }))
	.get("/doc", (c) => {
		return c.json({
			openapi: "3.0.0",
			info: {
				title: "Tanship API",
				version: "1.0.0",
				description:
					"Interactive API documentation for Tanship Boilerplate"
			},
			paths: {
				"/api/showcase": {
					get: {
						summary: "List approved showcases",
						responses: {
							200: { description: "Success" }
						}
					}
				}
				// Add other critical contract paths here
			}
		});
	});

export default swaggerHandler;
```

### Step 3: Mount Swagger Route

Register the handler in `apps/api/src/index.ts`:

```ts
import swaggerHandler from "./handlers/swagger.handler";

// Mount Swagger endpoints (public, or protected by admin middleware if desired)
app.route("/", swaggerHandler);
```

**Verify**: `pnpm -F api run build` exits 0. Opening `/swagger-ui` in the browser renders the Swagger UI page successfully.

## Done criteria

- [ ] `pnpm -F api run build` exits 0.
- [ ] Swagger UI middleware renders successfully at `/swagger-ui`.
- [ ] OpenAPI specification document is accessible at `/doc`.

## STOP conditions

- If `@hono/swagger-ui` throws compilation issues with Cloudflare Workers' wrangler build due to Node.js built-in dependencies. Ensure only browser-safe web-standards modules are loaded.

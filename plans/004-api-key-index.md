# Plan 004: Add indexing for Better Auth API Key lookup in SQLite schema

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat bb81a7f..HEAD -- packages/database/schema/api-keys.ts`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding.

## Status

- **Priority**: P2
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: tech-debt | perf
- **Planned at**: commit `bb81a7f`, 2026-07-21

## Why this matters

The Better Auth `apiKey` plugin validates incoming API requests by performing a database lookup on the `key` column. In the current SQLite database schema, the `api_keys` table does not define any index on the `key` column. This forces SQLite to perform a full-table scan for every authenticated API request using an API key, causing a significant performance bottleneck as the user base and the number of API keys grow.

Adding a unique index on the `key` column optimizes lookup performance to $O(1)$ and guarantees token uniqueness in SQLite.

## Current state

- The relevant files:
    - `packages/database/schema/api-keys.ts` — Definition of `apiKeys` SQLite table.

- Code excerpt from `packages/database/schema/api-keys.ts`:

    ```ts
    import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

    export const apiKeys = sqliteTable("api_keys", {
    	id: text("id").primaryKey(),
    	configId: text("config_id").notNull().default("default"),
    	name: text("name"),
    	start: text("start"),
    	prefix: text("prefix"),
    	key: text("key").notNull()
    	// ...
    });
    ```

## Commands you will need

| Purpose   | Command            | Expected on success               |
| --------- | ------------------ | --------------------------------- |
| Typecheck | `pnpm build`       | exit 0, no errors                 |
| DB Proto  | `pnpm db:generate` | exit 0, generates migration files |

## Scope

**In scope**:

- `packages/database/schema/api-keys.ts`

**Out of scope**:

- Modifications to Hono API endpoint handlers or Better Auth plugin configuration.

## Git workflow

- Branch: `advisor/004-api-key-index`
- Commits style: Use standard lowercase git message style (e.g. `add indexing for better auth api key lookup in sqlite schema`).
- Do NOT push or open a PR unless instructed.

## Steps

### Step 1: Add Index to `apiKeys` Schema

Open `packages/database/schema/api-keys.ts`. Update the imports to include `uniqueIndex` and add the third parameter defining database indices:

```ts
import {
	integer,
	sqliteTable,
	text,
	uniqueIndex
} from "drizzle-orm/sqlite-core";

export const apiKeys = sqliteTable(
	"api_keys",
	{
		id: text("id").primaryKey(),
		configId: text("config_id").notNull().default("default"),
		name: text("name"),
		start: text("start"),
		prefix: text("prefix"),
		key: text("key").notNull(),
		/** Owner ID — userId for user-owned keys, orgId for org-owned keys */
		referenceId: text("reference_id").notNull(),
		refillInterval: integer("refill_interval"),
		refillAmount: integer("refill_amount"),
		lastRefillAt: integer("last_refill_at", { mode: "timestamp" }),
		enabled: integer("enabled", { mode: "boolean" }),
		rateLimitEnabled: integer("rate_limit_enabled", { mode: "boolean" }),
		rateLimitTimeWindow: integer("rate_limit_time_window"),
		rateLimitMax: integer("rate_limit_max"),
		requestCount: integer("request_count"),
		remaining: integer("remaining"),
		lastRequest: integer("last_request", { mode: "timestamp" }),
		expiresAt: integer("expires_at", { mode: "timestamp" }),
		createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
		updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
		permissions: text("permissions"),
		metadata: text("metadata", { mode: "json" })
	},
	(t) => [uniqueIndex("idx_api_keys_key").on(t.key)]
);
```

**Verify**: `pnpm build` exits with 0.

### Step 2: Generate Drizzle Migrations

Run the Drizzle schema generation script to create the corresponding SQL migration file.

```bash
pnpm db:generate
```

**Verify**: A new SQL file is created under `packages/database/drizzle/` containing `CREATE UNIQUE INDEX "idx_api_keys_key" ON "api_keys" ("key");`.

## Test plan

- Perform typechecking and build verification:
    - `pnpm build`
- Confirm that Drizzle ORM compiles correctly with the index definition.

## Done criteria

- [ ] `packages/database/schema/api-keys.ts` contains the unique index definition on `key`.
- [ ] Drizzle migration file is successfully generated with the index creation statement.
- [ ] `plans/README.md` status row updated.

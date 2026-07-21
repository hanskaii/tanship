# Plan 009: Automated D1 Database Backup Cron to R2 Storage

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat 1928924..HEAD -- apps/api/src/index.ts apps/api/wrangler.jsonc`
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

Data safety and backups are critical features of any production-ready SaaS starter kit. While Cloudflare D1 maintains automated system-level restore points, solo founders benefit immensely from custom, file-level daily backups stored directly in their own R2 Storage bucket. This enables simple download, offline inspection, migration, and custom disaster recovery policies.

## Current state

- Relevant files:
    - `apps/api/src/index.ts` — contains the exported fetch handler.
    - `apps/api/wrangler.jsonc` (or wrangler configuration file) — manages bindings and cron triggers.

- Current exported handler in `apps/api/src/index.ts`:
    ```ts
    export default {
        fetch: async (
            request: Request,
            env: CloudflareBindings,
            ctx: ExecutionContext
        ) => {
            ...
        }
    } satisfies ExportedHandler<CloudflareBindings>;
    ```

## Commands you will need

| Purpose   | Command                 | Expected on success |
| --------- | ----------------------- | ------------------- |
| Typecheck | `pnpm -F api run build` | exit 0, no errors   |

## Scope

**In scope**:

- `apps/api/src/index.ts`
- `apps/api/src/services/backup.service.ts` (create)
- `apps/api/wrangler.jsonc` (or `wrangler.toml` if it exists)

**Out of scope**:

- Direct client-side visual changes.

## Git workflow

- Branch: `advisor/009-db-backups`
- Commit message: standard lowercase git message style (e.g. `implement automated d1 database backup to r2 storage via cron triggers`)

## Steps

### Step 1: Create Backup Service

Create `apps/api/src/services/backup.service.ts` which performs a backup by dumping all records from D1 and saving them into R2.
Since SQLite does not have a direct native dump command on the D1 client, we can retrieve all user tables, query their contents, serialize them as JSON or dump them as a consolidated file, and store them inside R2:

```ts
import { drizzle } from "drizzle-orm/d1";

export class BackupService {
	static async runBackup(db: D1Database, storage: any) {
		// Retrieve all table names
		const result = await db
			.prepare("SELECT name FROM sqlite_master WHERE type='table'")
			.all();
		const tables = result.results.map((r: any) => r.name);

		const dump: Record<string, any[]> = {};
		for (const table of tables) {
			if (table.startsWith("sqlite_") || table.startsWith("_cf_"))
				continue;
			const data = await db.prepare(`SELECT * FROM \`${table}\``).all();
			dump[table] = data.results;
		}

		const backupKey = `backups/db_${new Date().toISOString().slice(0, 10)}.json`;
		await storage.put(backupKey, JSON.stringify(dump, null, 2), {
			httpMetadata: { contentType: "application/json" }
		});
		console.log(`[Backup] Completed backup saved to: ${backupKey}`);
	}
}
```

### Step 2: Implement the `scheduled` handler in `index.ts`

Add the `scheduled` method to the exported handler in `apps/api/src/index.ts`:

```ts
import { BackupService } from "./services/backup.service";

export default {
	fetch: async (
		request: Request,
		env: CloudflareBindings,
		ctx: ExecutionContext
	) => {
		// ... existing fetch logic
	},
	scheduled: async (
		event: ScheduledEvent,
		env: CloudflareBindings,
		ctx: ExecutionContext
	) => {
		ctx.waitUntil(
			BackupService.runBackup(env.DATABASE, env.STORAGE).catch((err) => {
				console.error("[Backup] Backup failed:", err);
			})
		);
	}
} satisfies ExportedHandler<CloudflareBindings>;
```

### Step 3: Configure wrangler triggers

If a `wrangler.jsonc` (or similar wrangler configuration) is present in `apps/api/`, add a `triggers` section configuring the cron schedules:

```jsonc
"triggers": {
  "crons": ["0 2 * * *"] // Runs daily at 2:00 AM
}
```

**Verify**: `pnpm -F api run build` exits 0.

## Done criteria

- [ ] `pnpm -F api run build` completes successfully.
- [ ] BackupService queries SQLite tables and saves a JSON database snapshot into R2 storage.
- [ ] Exported handler supports `scheduled` execution.

## STOP conditions

- If query size on large tables exceeds D1 Workers memory limits. Implement pagination or streaming if tables are exceptionally large.

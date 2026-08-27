import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

import { ApiError } from "@/helpers/errors.helper";
import { ApiResponse } from "@/helpers/response.helper";
import type { HonoEnv } from "@/types/hono.types";

const QuerySchema = z.object({
	sql: z.string().min(1).max(10_000),
	params: z
		.array(z.union([z.string(), z.number(), z.null()]))
		.max(100)
		.default([])
});

const ExecSchema = z.object({
	sql: z.string().min(1).max(10_000),
	params: z
		.array(z.union([z.string(), z.number(), z.null()]))
		.max(100)
		.default([])
});

const BatchSchema = z.object({
	statements: z
		.array(
			z.object({
				sql: z.string().min(1).max(10_000),
				params: z
					.array(z.union([z.string(), z.number(), z.null()]))
					.max(100)
					.default([])
			})
		)
		.min(1)
		.max(50)
});

const MigrateSchema = z.object({
	migrations: z
		.array(
			z.object({
				id: z.string().min(1).max(64),
				sql: z.string().min(1).max(10_000)
			})
		)
		.min(1)
		.max(20)
});

// Hard cap on total database size. Writes are rejected past this so a
// one-time-paid write can never grow storage cost without bound.
const MAX_DB_BYTES = 500 * 1024 * 1024; // 500 MB

/** Reject writes once the database exceeds MAX_DB_BYTES. */
async function assertUnderSizeCap(db: D1Database): Promise<void> {
	const row = await db
		.prepare(
			"SELECT page_count * page_size AS bytes FROM pragma_page_count(), pragma_page_size()"
		)
		.first<{ bytes: number }>();
	if (row && row.bytes >= MAX_DB_BYTES) {
		throw ApiError.badRequest(
			`Database is at its ${Math.round(MAX_DB_BYTES / 1024 / 1024)}MB capacity. Delete rows before writing more.`
		);
	}
}

const dbHandler = new Hono<HonoEnv>()
	.post("/query", zValidator("json", QuerySchema), async (c) => {
		const { sql, params } = c.req.valid("json");

		// Only allow SELECT/PRAGMA/EXPLAIN for reads
		const normalized = sql.trim().toUpperCase();
		if (
			!normalized.startsWith("SELECT") &&
			!normalized.startsWith("PRAGMA") &&
			!normalized.startsWith("EXPLAIN")
		) {
			throw ApiError.badRequest(
				"Only SELECT, PRAGMA, and EXPLAIN statements are allowed on /query. Use /exec for writes."
			);
		}

		const stmt = c.env.DB.prepare(sql).bind(...params);
		const result = await stmt.all();

		return ApiResponse.ok(c, "Query executed", {
			columns:
				result.results.length > 0
					? Object.keys(result.results[0] as object)
					: [],
			rows: result.results,
			meta: {
				rowsRead: result.meta.rows_read,
				rowsWritten: result.meta.rows_written,
				duration: result.meta.duration
			}
		});
	})
	.post("/exec", zValidator("json", ExecSchema), async (c) => {
		const { sql, params } = c.req.valid("json");

		// Block dangerous DDL
		const normalized = sql.trim().toUpperCase();
		if (
			normalized.startsWith("DROP DATABASE") ||
			normalized.startsWith("DROP ALL")
		) {
			throw ApiError.badRequest("Destructive DDL not allowed");
		}

		// Non-DELETE writes must respect the size cap.
		if (
			!normalized.startsWith("DELETE") &&
			!normalized.startsWith("DROP")
		) {
			await assertUnderSizeCap(c.env.DB);
		}

		const stmt = c.env.DB.prepare(sql).bind(...params);
		const result = await stmt.run();

		return ApiResponse.ok(c, "Statement executed", {
			success: result.success,
			meta: {
				rowsRead: result.meta.rows_read,
				rowsWritten: result.meta.rows_written,
				duration: result.meta.duration,
				lastRowId: result.meta.last_row_id,
				changes: result.meta.changes
			}
		});
	})
	.post("/batch", zValidator("json", BatchSchema), async (c) => {
		const { statements } = c.req.valid("json");

		await assertUnderSizeCap(c.env.DB);

		const stmts = statements.map((s) =>
			c.env.DB.prepare(s.sql).bind(...s.params)
		);
		const results = await c.env.DB.batch(stmts);

		return ApiResponse.ok(c, "Batch executed", {
			count: results.length,
			results: results.map((r) => ({
				success: r.success,
				meta: {
					rowsRead: r.meta.rows_read,
					rowsWritten: r.meta.rows_written,
					duration: r.meta.duration,
					changes: r.meta.changes
				}
			}))
		});
	})
	.post("/migrate", zValidator("json", MigrateSchema), async (c) => {
		const { migrations } = c.req.valid("json");

		// Ensure the _migrations tracking table exists
		await c.env.DB.exec(`
			CREATE TABLE IF NOT EXISTS _migrations (
				id TEXT PRIMARY KEY,
				applied_at INTEGER NOT NULL
			)
		`);

		const applied = await c.env.DB.prepare(
			"SELECT id FROM _migrations"
		).all<{ id: string }>();
		const appliedSet = new Set(applied.results.map((r) => r.id));

		const pending = migrations.filter((m) => !appliedSet.has(m.id));
		if (pending.length === 0) {
			return ApiResponse.ok(c, "All migrations already applied", {
				applied: migrations.map((m) => m.id),
				skipped: migrations.map((m) => m.id),
				applied_count: 0
			});
		}

		const stmts = [
			...pending.map((m) =>
				c.env.DB.prepare(
					"INSERT INTO _migrations (id, applied_at) VALUES (?, ?)"
				).bind(m.id, Date.now())
			),
			...pending.map((m) => c.env.DB.prepare(m.sql))
		];
		await c.env.DB.batch(stmts);

		return ApiResponse.ok(c, "Migrations applied", {
			applied: pending.map((m) => m.id),
			skipped: migrations
				.filter((m) => appliedSet.has(m.id))
				.map((m) => m.id),
			applied_count: pending.length
		});
	});

export default dbHandler;

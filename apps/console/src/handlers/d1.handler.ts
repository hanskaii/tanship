import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

import { ApiResponse } from "@/helpers/response.helper";
import type { HonoEnv } from "@/types/hono.types";

const BulkWriteSchema = z.object({
	table: z.string().min(1).max(256),
	records: z.array(z.record(z.string(), z.unknown())).min(1).max(200)
});

/**
 * Simplified bulk-write endpoint for D1.
 * Accepts an array of records and generates parameterized INSERT OR REPLACE
 * statements, executed atomically via D1 batch().
 *
 * CF cost: $0.000001 per row written (D1 batch is same as single writes).
 * Blue ocean: orisha-data (only D1 x402 competitor) charges $0.010 and
 * exposes raw SQL; this endpoint provides a structured, schema-free interface.
 */
const d1Handler = new Hono<HonoEnv>().post(
	"/bulk-write",
	zValidator("json", BulkWriteSchema),
	async (c) => {
		const { table, records } = c.req.valid("json");

		// Sanitize table name — only allow alphanumeric + underscore
		if (!/^[a-zA-Z_][a-zA-Z0-9_]{0,255}$/.test(table)) {
			return c.json(
				{
					success: false,
					message: `Invalid table name "${table}". Use alphanumeric + underscore only.`
				},
				400
			);
		}

		if (records.length === 0) {
			return c.json(
				{
					success: false,
					message: "records array is empty"
				},
				400
			);
		}

		// Derive columns from first record (all records must have same keys)
		const columns = Object.keys(records[0]);
		if (columns.length === 0) {
			return c.json(
				{
					success: false,
					message: "records must have at least one column"
				},
				400
			);
		}

		// Validate all records have the same columns
		for (let i = 0; i < records.length; i++) {
			const keys = Object.keys(records[i]);
			if (keys.length !== columns.length) {
				return c.json(
					{
						success: false,
						message: `Record ${i} has ${keys.length} columns but expected ${columns.length}. All records must have the same schema.`
					},
					400
				);
			}
		}

		// Build parameterized INSERT OR REPLACE statement
		const placeholders = columns.map((_, j) => `?${j + 1}`).join(", ");
		const sql = `INSERT OR REPLACE INTO ${table} (${columns.join(", ")}) VALUES (${placeholders})`;

		const stmts = records.map((record) => {
			const values = columns.map((col) => {
				const val = record[col];
				// D1 doesn't support null directly in bind — convert to None
				if (val === null || val === undefined) return null;
				if (typeof val === "object") return JSON.stringify(val);
				return val;
			});
			return c.env.DB.prepare(sql).bind(...values);
		});

		const results = await c.env.DB.batch(stmts);

		const totalWritten = results.reduce(
			(sum, r) => sum + (r.meta.changes ?? 0),
			0
		);

		return ApiResponse.ok(c, "Bulk write completed", {
			table,
			recordsProvided: records.length,
			statementsExecuted: results.length,
			rowsWritten: totalWritten,
			allSucceeded: results.every((r) => r.success)
		});
	}
);

export default d1Handler;

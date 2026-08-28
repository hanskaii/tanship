import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

import { ApiError } from "@/helpers/errors.helper";
import { ApiResponse } from "@/helpers/response.helper";
import type { HonoEnv } from "@/types/hono.types";

// Cap on how much of the D1 schema we feed the model. Keeps the prompt under
// context budget even for very wide schemas.
const SCHEMA_BUDGET = 12_000;

// System prompt: forces a single safe SELECT, no DDL, no multi-statement.
const NL_TO_SQL_SYSTEM =
	"You are a SQL generation engine for a read-only SQLite query.\n" +
	"Given a user question and the live database schema, output EXACTLY ONE SQLite SELECT statement that answers the question.\n" +
	"Rules:\n" +
	"1. Return ONLY the SQL statement. No prose, no markdown, no code fences, no explanations.\n" +
	"2. Use only SELECT, FROM, WHERE, JOIN, GROUP BY, ORDER BY, LIMIT, OFFSET, AS, AND, OR, NOT, IN, BETWEEN, LIKE, IS NULL, COUNT, SUM, AVG, MIN, MAX, CAST, COALESCE, EXISTS.\n" +
	"3. NEVER use INSERT, UPDATE, DELETE, DROP, ALTER, CREATE, REPLACE, ATTACH, PRAGMA, EXPLAIN, or multiple statements separated by semicolons.\n" +
	"4. Use real table and column names from the provided schema. Do not invent columns.\n" +
	"5. If the question cannot be answered with a SELECT, output exactly: SELECT 'cannot answer' AS error;\n" +
	"6. Always include a LIMIT (max 1000) unless the question asks for an aggregate count.\n";

const NLQuerySchema = z.object({
	question: z.string().min(1).max(2048),
	tables: z.array(z.string().min(1).max(64)).min(1).max(20).optional(),
	limit: z.number().int().min(1).max(1000).default(100)
});

interface ColumnInfo {
	name: string;
	type: string | null;
	notnull: number;
	pk: number;
}

interface TableInfo {
	name: string;
	sql: string | null;
	columns: ColumnInfo[];
}

/** Pulls CREATE statements + column lists for every user table in D1. */
async function introspectSchema(
	db: D1Database,
	allowed?: string[]
): Promise<TableInfo[]> {
	const tablesResult = await db
		.prepare(
			"SELECT name, sql FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name"
		)
		.all<{ name: string; sql: string | null }>();

	const tables: TableInfo[] = [];
	for (const row of tablesResult.results ?? []) {
		if (allowed && !allowed.includes(row.name)) continue;

		const colsResult = await db
			.prepare(
				`PRAGMA table_info(${row.name.replace(/[^a-zA-Z0-9_]/g, "")})`
			)
			.all<ColumnInfo>();

		tables.push({
			name: row.name,
			sql: row.sql,
			columns: colsResult.results ?? []
		});
	}
	return tables;
}

/** Trims the schema dump to fit a token budget, preferring CREATE statements. */
function compactSchema(tables: TableInfo[]): string {
	const parts: string[] = [];
	let used = 0;
	for (const t of tables) {
		const cols = t.columns
			.map((c) => `  ${c.name} ${c.type ?? ""}`)
			.join("\n");
		const block = `-- ${t.name}\n${t.sql ?? `CREATE TABLE ${t.name} (\n${cols}\n)`}`;
		if (used + block.length > SCHEMA_BUDGET) {
			// Fall back to just the column list so the model at least knows names
			const trimmed = `-- ${t.name}\nCREATE TABLE ${t.name} (\n${cols}\n)`;
			if (used + trimmed.length > SCHEMA_BUDGET) break;
			parts.push(trimmed);
			used += trimmed.length;
		} else {
			parts.push(block);
			used += block.length;
		}
	}
	return parts.join("\n\n");
}

/** Hardens the model's output before letting it near D1. */
function sanitizeSql(raw: string): string {
	let sql = raw.trim();
	// Strip markdown fences if the model ignored the rules
	sql = sql.replace(/^```(?:sql)?\s*/i, "").replace(/```$/g, "");
	// Take only the first statement (block any injected `;DROP...`)
	const semi = sql.indexOf(";");
	if (semi >= 0) sql = sql.slice(0, semi + 1);
	return sql.trim();
}

/** True iff the statement is purely read-only at the top level. */
function isReadOnlySelect(sql: string): boolean {
	const head = sql.trim().toUpperCase();
	if (
		!head.startsWith("SELECT") &&
		!head.startsWith("PRAGMA") &&
		!head.startsWith("EXPLAIN")
	) {
		return false;
	}
	// Belt-and-suspenders: block any write keyword anywhere in the string
	const banned =
		/\b(INSERT|UPDATE|DELETE|DROP|ALTER|CREATE|REPLACE|ATTACH)\b/i;
	return !banned.test(sql);
}

const nlHandler = new Hono<HonoEnv>().post(
	"/query",
	zValidator("json", NLQuerySchema),
	async (c) => {
		const { question, tables, limit } = c.req.valid("json");

		const schemaTables = await introspectSchema(c.env.DB, tables);
		if (schemaTables.length === 0) {
			throw ApiError.badRequest(
				tables
					? `No matching tables found for filter: ${tables.join(", ")}`
					: "Database contains no user tables"
			);
		}

		const schemaText = compactSchema(schemaTables);

		// 1) NL → SQL via Workers AI
		const aiResult = (await c.env.AI.run(
			"@cf/meta/llama-3.3-70b-instruct-fp8-fast",
			{
				messages: [
					{ role: "system", content: NL_TO_SQL_SYSTEM },
					{
						role: "user",
						content: `Schema:\n${schemaText}\n\nQuestion: ${question}\n\nReturn a single SQLite SELECT statement.`
					}
				],
				max_tokens: 512
			}
		)) as { response?: string };

		const generated = sanitizeSql(aiResult.response ?? "");

		if (!generated) {
			throw ApiError.badGateway("AI returned an empty SQL statement");
		}

		if (!isReadOnlySelect(generated)) {
			throw ApiError.badRequest(
				`Generated statement is not a read-only SELECT: ${generated.slice(0, 120)}`
			);
		}

		// 2) Execute the validated SELECT against D1
		let result: D1Result;
		try {
			const stmt = c.env.DB.prepare(generated);
			const isAggregate = /\b(COUNT|SUM|AVG|MIN|MAX)\s*\(/i.test(
				generated
			);
			result = isAggregate ? await stmt.all() : await stmt.all();
		} catch (err: any) {
			throw ApiError.badRequest(
				`SQL execution failed: ${err?.message ?? String(err)}`,
				{ generatedSql: generated }
			);
		}

		// 3) Truncate in JS even if the model forgot a LIMIT
		const rows = (result.results ?? []).slice(0, limit);

		return ApiResponse.ok(c, "Natural-language query executed", {
			question,
			generatedSql: generated,
			tablesUsed: schemaTables.map((t) => t.name),
			columns: rows.length > 0 ? Object.keys(rows[0] as object) : [],
			rowCount: rows.length,
			rows
		});
	}
);

export default nlHandler;

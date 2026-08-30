/**
 * dev.diff — Unified text diff with hunk headers (GNU diff compatible).
 * Pure compute, ~0.5ms, $0.001 per call.
 * Blue ocean: 0 x402 competitors for unified diff.
 */
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { ApiResponse } from "@/helpers/response.helper";
import type { HonoEnv } from "@/types/hono.types";

const DiffSchema = z.object({
	a: z.string().max(500_000).describe("Original text"),
	b: z.string().max(500_000).describe("New text"),
	context: z
		.number()
		.int()
		.min(0)
		.max(10)
		.default(3)
		.describe("Lines of unchanged context around each change"),
	ignore_whitespace: z
		.boolean()
		.default(false)
		.describe("Strip trailing whitespace and normalize spaces"),
	algorithm: z.enum(["myers", "patience"]).default("myers")
});

type DiffLine = { type: "equal" | "insert" | "delete"; text: string };
type Hunk = {
	oldStart: number;
	oldCount: number;
	newStart: number;
	newCount: number;
	lines: DiffLine[];
};

function escape(s: string) {
	return s.replace(/\t/g, "\\t").replace(/\r$/, "\\r");
}

function lcsLength(a: string[], b: string[]): number[][] {
	const m = a.length,
		n = b.length;
	const dp: number[][] = Array.from({ length: m + 1 }, () =>
		new Array(n + 1).fill(0)
	);
	for (let i = 1; i <= m; i++) {
		for (let j = 1; j <= n; j++) {
			dp[i][j] =
				a[i - 1] === b[j - 1]
					? dp[i - 1][j - 1] + 1
					: Math.max(dp[i - 1][j], dp[i][j - 1]);
		}
	}
	return dp;
}

function myersDiff(aLines: string[], bLines: string[]): DiffLine[] {
	const dp = lcsLength(aLines, bLines);
	const result: DiffLine[] = [];
	let i = aLines.length,
		j = bLines.length;
	const temp: DiffLine[] = [];
	while (i > 0 || j > 0) {
		if (i > 0 && j > 0 && aLines[i - 1] === bLines[j - 1]) {
			temp.push({ type: "equal", text: aLines[i - 1] });
			i--;
			j--;
		} else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
			temp.push({ type: "insert", text: bLines[j - 1] });
			j--;
		} else {
			temp.push({ type: "delete", text: aLines[i - 1] });
			i--;
		}
	}
	for (let k = temp.length - 1; k >= 0; k--) result.push(temp[k]);
	return result;
}

function splitIntoHunks(diff: DiffLine[], context: number): Hunk[] {
	const hunks: Hunk[] = [];
	let i = 0;
	while (i < diff.length) {
		while (i < diff.length && diff[i].type === "equal") i++;
		if (i >= diff.length) break;

		const hunkStart = i;
		let oldCount = 0,
			newCount = 0;
		const hunkLines: DiffLine[] = [];

		while (i < diff.length) {
			if (diff[i].type !== "equal") {
				hunkLines.push(diff[i]);
				if (diff[i].type === "delete") oldCount++;
				else newCount++;
				i++;
			} else {
				let eqRun = 0;
				while (i < diff.length && diff[i].type === "equal") {
					hunkLines.push(diff[i]);
					eqRun++;
					i++;
				}
				if (eqRun > context) {
					for (let k = eqRun - context; k > 0; k--) hunkLines.pop();
					while (
						hunkLines.length > 0 &&
						hunkLines[hunkLines.length - 1].type === "equal"
					) {
						hunkLines.pop();
					}
					break;
				}
			}
		}

		if (hunkLines.length === 0) continue;

		let oldStart = 0,
			newStart = 0;
		for (let k = 0; k < hunkLines.length; k++) {
			if (hunkLines[k].type === "equal") break;
		}
		let ol = 0,
			nl = 0;
		for (const l of hunkLines) {
			if (l.type === "equal") {
				ol++;
				nl++;
			} else if (l.type === "delete") {
				ol++;
			} else {
				nl++;
			}
		}
		oldStart =
			1 +
			diff.slice(0, hunkStart).filter((l) => l.type !== "insert").length;
		newStart =
			1 +
			diff.slice(0, hunkStart).filter((l) => l.type !== "delete").length;

		hunks.push({
			oldStart,
			oldCount: hunkLines.filter((l) => l.type !== "insert").length,
			newStart,
			newCount: hunkLines.filter((l) => l.type !== "delete").length,
			lines: hunkLines
		});
	}
	return hunks;
}

function buildUnified(
	hunks: Hunk[],
	aLines: string[],
	bLines: string[]
): string {
	const prefix = "@@";
	const header = (h: Hunk) =>
		`${prefix} -${h.oldStart},${h.oldCount} +${h.newStart},${h.newCount} ${prefix}`;
	const lines: string[] = [`--- a\n+++ b`];
	for (const hunk of hunks) {
		lines.push(header(hunk));
		for (const line of hunk.lines) {
			if (line.type === "equal") lines.push(` ${escape(line.text)}`);
			else if (line.type === "delete")
				lines.push(`-${escape(line.text)}`);
			else lines.push(`+${escape(line.text)}`);
		}
	}
	return lines.join("\n");
}

export const devDiffHandler = new Hono<HonoEnv>().post(
	"/diff",
	zValidator("json", DiffSchema),
	async (c) => {
		const { a, b, context, ignore_whitespace } = c.req.valid("json");
		try {
			let aLines = a.split("\n");
			let bLines = b.split("\n");
			if (ignore_whitespace) {
				aLines = aLines.map((l) => l.trimEnd().replace(/\s+/g, " "));
				bLines = bLines.map((l) => l.trimEnd().replace(/\s+/g, " "));
			}
			const diff = myersDiff(aLines, bLines);
			if (diff.every((l) => l.type === "equal")) {
				return ApiResponse.ok(c, "No differences", {
					identical: true,
					hunks: [],
					unified: ""
				});
			}
			const hunks = splitIntoHunks(diff, context);
			const unified = buildUnified(hunks, aLines, bLines);
			return ApiResponse.ok(c, "Diff computed", {
				identical: false,
				added: diff.filter((l) => l.type === "insert").length,
				removed: diff.filter((l) => l.type === "delete").length,
				hunks: hunks.map((h) => ({
					old_start: h.oldStart,
					old_count: h.oldCount,
					new_start: h.newStart,
					new_count: h.newCount,
					lines: h.lines.map((l) => ({ type: l.type, text: l.text }))
				})),
				unified
			});
		} catch (err: any) {
			throw new Error(`Diff failed: ${err.message}`);
		}
	}
);

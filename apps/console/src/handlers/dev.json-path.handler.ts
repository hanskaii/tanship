/**
 * dev.json-path — Query JSON with basic path expressions.
 * Pure compute, $0.002 per call.
 * Blue ocean: 0 competitors on x402 bazaar.
 */
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { ApiError } from "@/helpers/errors.helper";
import { ApiResponse } from "@/helpers/response.helper";
import type { HonoEnv } from "@/types/hono.types";

const JsonPathSchema = z.object({
	json: z.union([
		z.string().max(200_000),
		z.record(z.string(), z.unknown()),
		z.array(z.unknown())
	]),
	path: z.string().min(1).max(500),
	callback: z.string().optional()
});

/** Simple path query: $.store.book[0].author -> drill down */
function queryJsonPath(data: unknown, expr: string): unknown[] {
	const results: unknown[] = [];

	function visit(node: unknown, path: string): void {
		if (!path || path === "$") {
			results.push(node);
			return;
		}

		const parts = path.split(".");
		let current: unknown = node;

		for (const part of parts) {
			if (current === null || current === undefined) {
				return;
			}

			if (part === "*") {
				if (Array.isArray(current)) {
					for (const item of current) {
						results.push(item);
					}
				} else if (typeof current === "object") {
					for (const v of Object.values(
						current as Record<string, unknown>
					)) {
						results.push(v);
					}
				}
				return;
			}

			const bracketMatch = part.match(/^(.+)\[(\d+|-?\d+)\]$/);
			if (bracketMatch && Array.isArray(current)) {
				const key = bracketMatch[1];
				const idx = parseInt(bracketMatch[2], 10);
				const resolved = idx < 0 ? current.length + idx : idx;
				if (resolved >= 0 && resolved < current.length) {
					const item = current[resolved];
					if (key && typeof item === "object" && item !== null) {
						current = (item as Record<string, unknown>)[key];
					} else {
						current = item;
					}
				} else {
					return;
				}
			} else if (Array.isArray(current)) {
				for (const item of current) {
					if (typeof item === "object" && item !== null) {
						const val = (item as Record<string, unknown>)[part];
						if (val !== undefined) results.push(val);
					}
				}
				return;
			} else if (typeof current === "object") {
				current = (current as Record<string, unknown>)[part];
			} else {
				return;
			}
		}

		results.push(current);
	}

	visit(data, expr.replace(/^\$\.?/, ""));
	return results;
}

export const devJsonPathHandler = new Hono<HonoEnv>().post(
	"/json-path",
	zValidator("json", JsonPathSchema),
	async (c) => {
		const { json, path, callback } = c.req.valid("json");

		let data: unknown;
		if (typeof json === "string") {
			try {
				data = JSON.parse(json);
			} catch {
				throw ApiError.badRequest("Invalid JSON string");
			}
		} else {
			data = json;
		}

		const results = queryJsonPath(data, path);

		const response = { path, results, count: results.length };

		if (callback) {
			return c.text(`${callback}(${JSON.stringify(response)})`, 200, {
				"Content-Type": "application/javascript"
			});
		}

		return ApiResponse.ok(c, "JSONPath query executed", response);
	}
);

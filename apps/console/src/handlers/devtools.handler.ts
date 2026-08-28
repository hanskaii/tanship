/**
 * devtools.handler.ts — 14 ultra-cheap developer utilities.
 * All are pure compute (no external API keys needed beyond fetch).
 * Price: $0.001 each (10x cheaper than main dev suite, still profitable on CF Workers).
 */
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { ApiError } from "@/helpers/errors.helper";
import { ApiResponse } from "@/helpers/response.helper";
import type { HonoEnv } from "@/types/hono.types";

// ── Schemas ──────────────────────────────────────────────────────────────────

const TimestampSchema = z.object({
	format: z
		.enum(["iso", "unix", "unix_ms", "rfc3339", "date", "time", "all"])
		.default("all"),
	offset_seconds: z.number().int().default(0)
});

const HttpStatusSchema = z.object({
	url: z.string().url().max(2048),
	method: z.enum(["HEAD", "GET"]).default("HEAD"),
	timeout_ms: z.number().int().min(100).max(30_000).default(10_000),
	follow_redirects: z.boolean().default(true)
});

const JsonValidateSchema = z.object({
	json: z.string().max(100_000),
	strict: z.boolean().default(false)
});

const SortLinesSchema = z.object({
	text: z.string().max(50_000),
	reverse: z.boolean().default(false),
	unique: z.boolean().default(false),
	case_insensitive: z.boolean().default(false)
});

const HtmlEntitySchema = z.object({
	text: z.string().max(50_000),
	operation: z.enum(["encode", "decode"]).default("decode")
});

const EmailNormalizeSchema = z.object({
	email: z.string().email()
});

const RobotsCheckSchema = z.object({
	url: z.string().url().max(2048),
	timeout_ms: z.number().int().min(100).max(15_000).default(8_000)
});

const UrlMetadataSchema = z.object({
	url: z.string().url().max(2048),
	timeout_ms: z.number().int().min(100).max(15_000).default(8_000)
});

const DomainExtractSchema = z.object({
	url: z.string().max(2048)
});

const X402PingSchema = z.object({
	target: z.string().max(512).optional()
});

const X402SiteAuditSchema = z.object({
	url: z.string().url().max(2048),
	timeout_ms: z.number().int().min(100).max(15_000).default(8_000)
});

const QueryParseSchema = z.object({
	query: z.string().max(10_000)
});

const DiffLinesSchema = z.object({
	a: z.string().max(50_000),
	b: z.string().max(50_000)
});

const JsonKeysSchema = z.object({
	json: z.string().max(100_000),
	deep: z.boolean().default(false)
});

const JsonMinifySchema = z.object({
	json: z.string().max(100_000)
});

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Encode text to HTML entities (numeric & named entities) */
function htmlEncode(text: string): string {
	return text.replace(/[&<>"']/g, (c) => {
		switch (c) {
			case "&":
				return "&amp;";
			case "<":
				return "&lt;";
			case ">":
				return "&gt;";
			case '"':
				return "&quot;";
			case "'":
				return "&#39;";
			default:
				return c;
		}
	});
}

/** Decode HTML entities back to characters */
function htmlDecode(text: string): string {
	return text
		.replace(/&#(\d+);/g, (_, code) =>
			String.fromCharCode(parseInt(code, 10))
		)
		.replace(/&#x([0-9a-fA-F]+);/g, (_, code) =>
			String.fromCharCode(parseInt(code, 16))
		)
		.replace(
			/&(nbsp|amp|lt|gt|quot|apos|mdash|ndash|hellip|copy|reg|trade|laquo|raquo);/gi,
			(_, name) => {
				const map: Record<string, string> = {
					nbsp: "\u00A0",
					amp: "&",
					lt: "<",
					gt: ">",
					quot: '"',
					apos: "'",
					mdash: "\u2014",
					ndash: "\u2013",
					hellip: "\u2026",
					copy: "\u00A9",
					reg: "\u00AE",
					trade: "\u2122",
					laquo: "\u00AB",
					raquo: "\u00BB"
				};
				return map[name.toLowerCase()] ?? `&${name};`;
			}
		);
}

/** Extract domain from a URL string */
function extractDomain(input: string): {
	domain: string;
	subdomain: string | null;
	publicSuffix: string | null;
} {
	try {
		const url = new URL(
			input.startsWith("http") ? input : `https://${input}`
		);
		const parts = url.hostname.split(".");
		const domain = parts.slice(-2).join(".");
		const subdomain =
			parts.length > 2 ? parts.slice(0, -2).join(".") : null;
		return { domain, subdomain, publicSuffix: domain };
	} catch {
		throw ApiError.badRequest(`Invalid URL: ${input}`);
	}
}

/** Compute line-level diff */
function computeLineDiff(
	a: string,
	b: string
): { added: string[]; removed: string[]; unchanged: number } {
	const aLines = a.split("\n");
	const bLines = b.split("\n");
	const aSet = new Set(aLines);
	const bSet = new Set(bLines);
	const added = bLines.filter((l) => !aSet.has(l));
	const removed = aLines.filter((l) => !bSet.has(l));
	const unchanged =
		Math.min(aLines.length, bLines.length) - added.length - removed.length;
	return { added, removed, unchanged: Math.max(0, unchanged) };
}

// ── Handlers ─────────────────────────────────────────────────────────────────

const handler = new Hono<HonoEnv>()

	// GET /timestamp — current time in multiple formats
	.post("/timestamp", zValidator("json", TimestampSchema), async (c) => {
		const { format, offset_seconds } = c.req.valid("json");
		const now = new Date(Date.now() + offset_seconds * 1000);
		const result: Record<string, unknown> = {};

		if (format === "all" || format === "iso")
			result.iso = now.toISOString();
		if (format === "all" || format === "unix")
			result.unix = Math.floor(now.getTime() / 1000);
		if (format === "all" || format === "unix_ms")
			result.unix_ms = now.getTime();
		if (format === "all" || format === "rfc3339")
			result.rfc3339 = now.toISOString();
		if (format === "all" || format === "date")
			result.date = now.toISOString().slice(0, 10);
		if (format === "all" || format === "time")
			result.time = now.toISOString().slice(11, 19) + "Z";
		if (format === "all") {
			result.utc = now.toUTCString();
			result.local = now.toString();
			result.day_of_week = now.getUTCDay();
			result.day_of_year = Math.floor(
				(now.getTime() -
					new Date(now.getUTCFullYear(), 0, 0).getTime()) /
					86_400_000
			);
		}

		return ApiResponse.ok(c, "Timestamp generated", {
			...result,
			offset_seconds
		});
	})

	// POST /http-status — fetch any URL and return status + headers
	.post("/http-status", zValidator("json", HttpStatusSchema), async (c) => {
		const { url, method, timeout_ms, follow_redirects } =
			c.req.valid("json");
		const controller = new AbortController();
		const timer = setTimeout(() => controller.abort(), timeout_ms);
		try {
			const res = await fetch(url, {
				method,
				signal: controller.signal,
				redirect: follow_redirects ? "follow" : "manual"
			});
			clearTimeout(timer);
			const headers: Record<string, string> = {};
			res.headers.forEach((v, k) => {
				headers[k] = v;
			});
			return ApiResponse.ok(c, "HTTP status retrieved", {
				url,
				method,
				status: res.status,
				statusText: res.statusText,
				ok: res.ok,
				headers,
				redirected: res.redirected,
				redirectUrl: res.url !== url ? res.url : null,
				contentType: res.headers.get("content-type"),
				contentLength: res.headers.get("content-length"),
				server: res.headers.get("server"),
				cacheControl: res.headers.get("cache-control")
			});
		} catch (err: any) {
			clearTimeout(timer);
			if (err.name === "AbortError") {
				throw ApiError.gatewayTimeout(
					`Request timed out after ${timeout_ms}ms`
				);
			}
			throw ApiError.badGateway(`Fetch failed: ${err.message}`);
		}
	})

	// POST /json-validate — check if JSON is valid
	.post(
		"/json-validate",
		zValidator("json", JsonValidateSchema),
		async (c) => {
			const { json, strict } = c.req.valid("json");
			try {
				const parsed = JSON.parse(json);
				const type = Array.isArray(parsed)
					? "array"
					: parsed !== null && typeof parsed === "object"
						? "object"
						: typeof parsed;
				return ApiResponse.ok(c, "JSON is valid", {
					valid: true,
					type,
					keys: type === "object" ? Object.keys(parsed) : null,
					keysCount:
						type === "object" ? Object.keys(parsed).length : null,
					arrayLength: type === "array" ? parsed.length : null,
					byteSize: new TextEncoder().encode(json).length
				});
			} catch (err: any) {
				if (strict) {
					throw ApiError.badRequest(`Invalid JSON: ${err.message}`);
				}
				return ApiResponse.ok(c, "JSON is invalid", {
					valid: false,
					error: err.message,
					byteSize: new TextEncoder().encode(json).length
				});
			}
		}
	)

	// POST /sort-lines — sort + deduplicate lines
	.post("/sort-lines", zValidator("json", SortLinesSchema), async (c) => {
		const { text, reverse, unique, case_insensitive } = c.req.valid("json");
		let lines = text.split(/\r?\n/);
		if (unique) lines = [...new Set(lines)];
		if (case_insensitive) {
			lines.sort((a, b) =>
				a.toLowerCase().localeCompare(b.toLowerCase())
			);
		} else {
			lines.sort((a, b) => a.localeCompare(b));
		}
		if (reverse) lines.reverse();
		return ApiResponse.ok(c, "Lines sorted", {
			inputLines: text.split(/\r?\n/).length,
			outputLines: lines.length,
			result: lines.join("\n")
		});
	})

	// POST /html-entity — encode or decode HTML entities
	.post("/html-entity", zValidator("json", HtmlEntitySchema), async (c) => {
		const { text, operation } = c.req.valid("json");
		const result =
			operation === "encode" ? htmlEncode(text) : htmlDecode(text);
		return ApiResponse.ok(c, `HTML entity ${operation} complete`, {
			operation,
			inputLength: text.length,
			outputLength: result.length,
			result
		});
	})

	// POST /email-normalize — normalize + validate email
	.post(
		"/email-normalize",
		zValidator("json", EmailNormalizeSchema),
		async (c) => {
			const { email } = c.req.valid("json");
			const normalized = email.trim().toLowerCase();
			const parts = normalized.split("@");
			const local = parts[0]
				.replace(/[.+_]+/g, "-")
				.replace(/^-+|-+$/g, "");
			const domain = parts[1];
			return ApiResponse.ok(c, "Email normalized", {
				original: email,
				normalized: `${local}@${domain}`,
				local,
				domain,
				valid: true
			});
		}
	)

	// POST /robots-check — check if a URL is allowed by robots.txt
	.post("/robots-check", zValidator("json", RobotsCheckSchema), async (c) => {
		const { url, timeout_ms } = c.req.valid("json");
		let robotsUrl: string;
		try {
			const parsed = new URL(url);
			robotsUrl = `${parsed.protocol}//${parsed.host}/robots.txt`;
		} catch {
			throw ApiError.badRequest(`Invalid URL: ${url}`);
		}
		const controller = new AbortController();
		const timer = setTimeout(() => controller.abort(), timeout_ms);
		try {
			const res = await fetch(robotsUrl, { signal: controller.signal });
			clearTimeout(timer);
			if (!res.ok) {
				return ApiResponse.ok(c, "No robots.txt found", {
					url,
					robotsUrl,
					allowed: true,
					reason: "robots.txt not accessible"
				});
			}
			const body = await res.text();
			const targetPath = new URL(url).pathname;

			// Parse simple robots.txt rules
			const lines = body.split(/\r?\n/);
			let userAgent: string | null = null;
			let disallows: string[] = [];
			let allows: string[] = [];

			for (const line of lines) {
				const l = line.trim();
				const lcl = l.toLowerCase();
				if (lcl.startsWith("user-agent:")) {
					if (userAgent && userAgent !== "*") {
						// Found rules for a previous UA, reset for new one
						userAgent = l.slice(11).trim();
					} else {
						userAgent = l.slice(11).trim();
					}
				} else if (lcl.startsWith("disallow:")) {
					const path = l.slice(9).trim();
					if (
						userAgent === "*" ||
						userAgent === "tership-agent" ||
						userAgent === "generic-agent"
					) {
						if (path) disallows.push(path);
					}
				} else if (lcl.startsWith("allow:")) {
					const path = l.slice(6).trim();
					if (
						userAgent === "*" ||
						userAgent === "tership-agent" ||
						userAgent === "generic-agent"
					) {
						if (path) allows.push(path);
					}
				}
			}

			// Check rules
			const matchesPattern = (pattern: string): boolean => {
				if (pattern === "/") return true;
				if (pattern.endsWith("$")) {
					return targetPath === pattern.slice(0, -1);
				}
				return targetPath.startsWith(pattern);
			};

			let allowed = true;
			let reason = "No applicable disallow rules";

			// Most specific rule wins: allow overrides disallow
			for (const allow of allows) {
				if (matchesPattern(allow)) {
					allowed = true;
					reason = `Allowed by: ${allow}`;
					break;
				}
			}
			for (const disallow of disallows) {
				if (matchesPattern(disallow)) {
					allowed = false;
					reason = `Disallowed by: ${disallow}`;
					break;
				}
			}

			return ApiResponse.ok(c, "robots.txt checked", {
				url,
				robotsUrl,
				allowed,
				reason,
				targetPath,
				rulesFound: disallows.length + allows.length
			});
		} catch (err: any) {
			clearTimeout(timer);
			if (err.name === "AbortError") {
				return ApiResponse.ok(c, "robots.txt check timed out", {
					url,
					allowed: true,
					reason: "timeout"
				});
			}
			return ApiResponse.ok(c, "robots.txt check failed", {
				url,
				allowed: true,
				reason: err.message
			});
		}
	})

	// POST /url-metadata — fetch page title + meta tags
	.post("/url-metadata", zValidator("json", UrlMetadataSchema), async (c) => {
		const { url, timeout_ms } = c.req.valid("json");
		const controller = new AbortController();
		const timer = setTimeout(() => controller.abort(), timeout_ms);
		try {
			const res = await fetch(url, {
				signal: controller.signal,
				headers: {
					"User-Agent": "TanshipBot/1.0 (+https://x402.tanship.dev)"
				}
			});
			clearTimeout(timer);
			const html = await res.text();

			const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
			const title = titleMatch ? titleMatch[1].trim() : null;

			const descMatch =
				html.match(
					/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i
				) ||
				html.match(
					/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']description["']/i
				);
			const description = descMatch ? descMatch[1].trim() : null;

			const ogImageMatch = html.match(
				/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i
			);
			const ogImage = ogImageMatch ? ogImageMatch[1].trim() : null;

			const canonicalMatch = html.match(
				/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i
			);
			const canonical = canonicalMatch ? canonicalMatch[1].trim() : null;

			return ApiResponse.ok(c, "URL metadata extracted", {
				url,
				finalUrl: res.url,
				status: res.status,
				title,
				description,
				ogImage,
				canonical,
				contentType: res.headers.get("content-type")
			});
		} catch (err: any) {
			clearTimeout(timer);
			if (err.name === "AbortError") {
				throw ApiError.gatewayTimeout(
					`Fetch timed out after ${timeout_ms}ms`
				);
			}
			throw ApiError.badGateway(`Fetch failed: ${err.message}`);
		}
	})

	// POST /domain-extract — parse domain components from URL
	.post(
		"/domain-extract",
		zValidator("json", DomainExtractSchema),
		async (c) => {
			const { url } = c.req.valid("json");
			const result = extractDomain(url);
			return ApiResponse.ok(c, "Domain extracted", result);
		}
	)

	// POST /x402-ping — probe if a URL speaks x402 protocol
	.post("/x402-ping", zValidator("json", X402PingSchema), async (c) => {
		const { target } = c.req.valid("json");
		const checkUrls = target
			? [target]
			: [
					"https://x402.tanship.dev",
					"https://api.payai.fun",
					"https://three.ws"
				];

		const results = await Promise.allSettled(
			checkUrls.map(async (url) => {
				const res = await fetch(url, {
					method: "HEAD",
					headers: { Accept: "application/json" }
				});
				const wwwAuth = res.headers.get("www-authenticate") ?? "";
				const hasX402 =
					wwwAuth.includes("x402") || wwwAuth.includes("price=");
				return {
					url,
					status: res.status,
					hasX402,
					wwwAuthenticate: wwwAuth || null
				};
			})
		);

		const probes = results.map((r, i) => {
			if (r.status === "rejected")
				return {
					url: checkUrls[i],
					error: r.reason?.message ?? "Unknown"
				};
			return r.value;
		});

		return ApiResponse.ok(c, "x402 ping complete", {
			probes,
			timestamp: new Date().toISOString()
		});
	})

	// POST /x402-site-audit — probe an x402 endpoint for compliance
	.post(
		"/x402-site-audit",
		zValidator("json", X402SiteAuditSchema),
		async (c) => {
			const { url, timeout_ms } = c.req.valid("json");
			const controller = new AbortController();
			const timer = setTimeout(() => controller.abort(), timeout_ms);
			try {
				// Probe with a bare request to get 402 challenge
				const res = await fetch(url, {
					method: "GET",
					signal: controller.signal,
					headers: {
						Accept: "application/json",
						"User-Agent": "TanshipAudit/1.0"
					}
				});
				clearTimeout(timer);

				const wwwAuth = res.headers.get("www-authenticate") ?? "";
				const contentType = res.headers.get("content-type") ?? "";
				const status = res.status;
				const body = await res.text().catch(() => "");

				const score = {
					has402: status === 402,
					hasWwwAuthenticate: !!wwwAuth,
					hasPrice:
						wwwAuth.includes("price=") || wwwAuth.includes("Price"),
					hasNetwork:
						wwwAuth.includes("network=") ||
						wwwAuth.includes("Network"),
					hasPayTo:
						wwwAuth.includes("pay-to=") ||
						wwwAuth.includes("Pay-To"),
					hasMaxAmount:
						wwwAuth.includes("max-amount=") ||
						wwwAuth.includes("Max-Amount"),
					hasVary: !!res.headers.get("vary"),
					hasContentType: !!contentType,
					isJson: contentType.includes("application/json"),
					bodyIsJson: (() => {
						try {
							JSON.parse(body);
							return true;
						} catch {
							return false;
						}
					})()
				};

				const complianceScore =
					Object.values(score).filter(Boolean).length;
				const grade: "A" | "B" | "C" | "D" | "F" =
					complianceScore >= 8
						? "A"
						: complianceScore >= 6
							? "B"
							: complianceScore >= 4
								? "C"
								: complianceScore >= 2
									? "D"
									: "F";

				return ApiResponse.ok(c, "x402 audit complete", {
					url,
					status,
					grade,
					complianceScore,
					maxScore: Object.keys(score).length,
					checks: score,
					wwwAuthenticate: wwwAuth || null,
					contentType,
					bodyPreview: body.slice(0, 200)
				});
			} catch (err: any) {
				clearTimeout(timer);
				if (err.name === "AbortError") {
					throw ApiError.gatewayTimeout(
						`Audit timed out after ${timeout_ms}ms`
					);
				}
				throw ApiError.badGateway(`Audit failed: ${err.message}`);
			}
		}
	)

	// POST /query-parse — parse URL query string into key-value pairs
	.post("/query-parse", zValidator("json", QueryParseSchema), async (c) => {
		const { query } = c.req.valid("json");
		const params = new URLSearchParams(
			query.startsWith("?") ? query.slice(1) : query
		);
		const result: Record<string, string | string[]> = {};
		for (const [k, v] of params) {
			if (result[k] !== undefined) {
				if (Array.isArray(result[k])) (result[k] as string[]).push(v);
				else result[k] = [result[k] as string, v];
			} else {
				result[k] = v;
			}
		}
		return ApiResponse.ok(c, "Query parsed", {
			query,
			params: result,
			count: params.size
		});
	})

	// POST /diff-lines — line-by-line diff
	.post("/diff-lines", zValidator("json", DiffLinesSchema), async (c) => {
		const { a, b } = c.req.valid("json");
		const diff = computeLineDiff(a, b);
		return ApiResponse.ok(c, "Line diff computed", {
			aLines: a.split(/\r?\n/).length,
			bLines: b.split(/\r?\n/).length,
			...diff,
			addedLines: diff.added,
			removedLines: diff.removed
		});
	})

	// POST /json-keys — extract all keys from JSON
	.post("/json-keys", zValidator("json", JsonKeysSchema), async (c) => {
		const { json: jsonStr, deep } = c.req.valid("json");
		try {
			const parsed = JSON.parse(jsonStr);
			const keys = new Set<string>();

			const extract = (obj: unknown, path = ""): void => {
				if (
					obj !== null &&
					typeof obj === "object" &&
					!Array.isArray(obj)
				) {
					for (const [k, v] of Object.entries(obj)) {
						const fullPath = path ? `${path}.${k}` : k;
						keys.add(fullPath);
						if (deep) extract(v, fullPath);
					}
				}
			};

			extract(parsed);
			return ApiResponse.ok(c, "JSON keys extracted", {
				valid: true,
				keys: [...keys],
				count: keys.size,
				deep
			});
		} catch (err: any) {
			throw ApiError.badRequest(`Invalid JSON: ${err.message}`);
		}
	})

	// POST /json-minify — minify JSON
	.post("/json-minify", zValidator("json", JsonMinifySchema), async (c) => {
		const { json: jsonStr } = c.req.valid("json");
		try {
			const parsed = JSON.parse(jsonStr);
			const minified = JSON.stringify(parsed);
			return ApiResponse.ok(c, "JSON minified", {
				originalSize: new TextEncoder().encode(jsonStr).length,
				minifiedSize: minified.length,
				savedBytes:
					new TextEncoder().encode(jsonStr).length - minified.length,
				result: minified
			});
		} catch (err: any) {
			throw ApiError.badRequest(`Invalid JSON: ${err.message}`);
		}
	});

export default handler;

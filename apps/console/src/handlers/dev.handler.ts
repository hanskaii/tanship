import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

import { ApiError } from "@/helpers/errors.helper";
import { ApiResponse } from "@/helpers/response.helper";
import type { HonoEnv } from "@/types/hono.types";

const HashSchema = z.object({
	text: z.string(),
	algorithm: z.enum(["MD5", "SHA-1", "SHA-256", "SHA-512"]).default("SHA-256")
});

const JwtDecodeSchema = z.object({
	token: z.string().min(1)
});

const DiffJsonSchema = z.object({
	a: z.record(z.string(), z.unknown()),
	b: z.record(z.string(), z.unknown())
});

const CsvToJsonSchema = z.object({
	csv: z.string(),
	delimiter: z.string().length(1).default(","),
	hasHeader: z.boolean().default(true)
});

const GeoIpSchema = z.object({
	ip: z.string().optional()
});

const RedactSchema = z.object({
	text: z.string(),
	replacement: z.string().default("[REDACTED]")
});

const DnsSchema = z.object({
	name: z.string().min(1),
	type: z.enum(["A", "AAAA", "MX", "TXT", "CNAME", "NS", "SOA"]).default("A")
});

const EmailSecuritySchema = z.object({
	domain: z.string().min(1)
});

const PII_PATTERNS = [
	{ name: "EMAIL", regex: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g },
	{ name: "IP_ADDRESS", regex: /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g },
	{ name: "CREDIT_CARD", regex: /\b(?:\d[ -]*?){13,16}\b/g },
	{
		name: "API_KEY",
		regex: /\b(sk-[a-zA-Z0-9]{20,}|key-[a-zA-Z0-9]{20,}|AIzaSy[a-zA-Z0-9-_]{33})\b/gi
	},
	{
		name: "JWT",
		regex: /ey[a-zA-Z0-9-_=]+\.[a-zA-Z0-9-_=]+\.[a-zA-Z0-9-_=]*/g
	}
];

/** Fetch DNS records via Cloudflare DoH (DNS over HTTPS) JSON API */
async function queryDns(name: string, type: string): Promise<any[]> {
	const res = await fetch(
		`https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(name)}&type=${type}`,
		{
			headers: { Accept: "application/dns-json" }
		}
	);
	if (!res.ok) {
		throw new Error(`DNS resolver failed: ${res.statusText}`);
	}
	const data = (await res.json()) as any;
	return data.Answer ?? [];
}

/** Helper to parse a basic CSV string */
function parseCsv(csv: string, delimiter: string, hasHeader: boolean) {
	const lines = csv.split(/\r?\n/).filter((line) => line.trim().length > 0);
	if (lines.length === 0) return [];

	const parseLine = (line: string) => {
		const result = [];
		let current = "";
		let inQuotes = false;
		for (let i = 0; i < line.length; i++) {
			const char = line[i];
			if (char === '"') {
				inQuotes = !inQuotes;
			} else if (char === delimiter && !inQuotes) {
				result.push(current.trim());
				current = "";
			} else {
				current += char;
			}
		}
		result.push(current.trim());
		return result;
	};

	if (hasHeader) {
		const headers = parseLine(lines[0] || "");
		return lines.slice(1).map((line) => {
			const values = parseLine(line);
			const obj: Record<string, string> = {};
			headers.forEach((header, index) => {
				obj[header] = values[index] ?? "";
			});
			return obj;
		});
	}

	return lines.map((line) => parseLine(line));
}

/** Helper to compute MD5 hash using Web Crypto (MD5 is not standard in SubtleCrypto, so we fallback to a simple JS implementation if needed, but Cloudflare Workers support MD5 in Web Crypto) */
async function computeHash(text: string, algorithm: string): Promise<string> {
	const encoder = new TextEncoder();
	const data = encoder.encode(text);
	const hashBuffer = await crypto.subtle.digest(
		algorithm === "MD5" ? "MD5" : algorithm,
		data
	);
	const hashArray = Array.from(new Uint8Array(hashBuffer));
	return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

/** Simple deep compare diff for JSON objects */
function diffObjects(a: any, b: any, path = ""): any[] {
	const diffs: any[] = [];
	const keys = new Set([...Object.keys(a), ...Object.keys(b)]);

	for (const key of keys) {
		const currentPath = path ? `${path}.${key}` : key;
		if (!(key in a)) {
			diffs.push({ path: currentPath, type: "added", value: b[key] });
		} else if (!(key in b)) {
			diffs.push({
				path: currentPath,
				type: "removed",
				oldValue: a[key]
			});
		} else if (
			typeof a[key] === "object" &&
			a[key] !== null &&
			typeof b[key] === "object" &&
			b[key] !== null
		) {
			diffs.push(...diffObjects(a[key], b[key], currentPath));
		} else if (a[key] !== b[key]) {
			diffs.push({
				path: currentPath,
				type: "modified",
				oldValue: a[key],
				newValue: b[key]
			});
		}
	}
	return diffs;
}

const devHandler = new Hono<HonoEnv>()
	.post("/hash", zValidator("json", HashSchema), async (c) => {
		const { text, algorithm } = c.req.valid("json");
		try {
			const hash = await computeHash(text, algorithm);
			return ApiResponse.ok(c, "Hash computed", { hash, algorithm });
		} catch (err: any) {
			throw ApiError.server(`Hash computation failed: ${err.message}`);
		}
	})
	.post("/jwt-decode", zValidator("json", JwtDecodeSchema), async (c) => {
		const { token } = c.req.valid("json");
		const parts = token.split(".");
		if (parts.length !== 3) {
			throw ApiError.badRequest(
				"Invalid JWT token format. Must have 3 parts."
			);
		}

		try {
			const decodePart = (str: string) => {
				let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
				while (base64.length % 4) {
					base64 += "=";
				}
				return JSON.parse(atob(base64));
			};

			const header = decodePart(parts[0] || "");
			const payload = decodePart(parts[1] || "");

			return ApiResponse.ok(c, "JWT token decoded", { header, payload });
		} catch (err: any) {
			throw ApiError.badRequest(`Failed to decode JWT: ${err.message}`);
		}
	})
	.post("/diff-json", zValidator("json", DiffJsonSchema), async (c) => {
		const { a, b } = c.req.valid("json");
		const diffs = diffObjects(a, b);
		return ApiResponse.ok(c, "JSON difference calculated", {
			equal: diffs.length === 0,
			diffs
		});
	})
	.post("/csv-to-json", zValidator("json", CsvToJsonSchema), async (c) => {
		const { csv, delimiter, hasHeader } = c.req.valid("json");
		try {
			const result = parseCsv(csv, delimiter, hasHeader);
			return ApiResponse.ok(c, "CSV converted to JSON", { result });
		} catch (err: any) {
			throw ApiError.badRequest(`CSV parsing failed: ${err.message}`);
		}
	})
	.post("/geo-ip", zValidator("json", GeoIpSchema), async (c) => {
		const { ip } = c.req.valid("json");

		// If no query IP is provided, use Cloudflare's request context
		if (!ip) {
			const cf = c.req.raw.cf as any;
			if (cf) {
				return ApiResponse.ok(c, "Geolocated request IP", {
					ip: c.req.header("CF-Connecting-IP") || "local",
					country: cf.country ?? null,
					city: cf.city ?? null,
					region: cf.region ?? null,
					timezone: cf.timezone ?? null,
					latitude: cf.latitude ?? null,
					longitude: cf.longitude ?? null,
					asn: cf.asn ?? null,
					colo: cf.colo ?? null
				});
			}
		}

		// Otherwise, query free keyless geolocation API (ip-api.com) for external IP
		const targetIp = ip || c.req.header("CF-Connecting-IP") || "8.8.8.8";
		try {
			const res = await fetch(`http://ip-api.com/json/${targetIp}`);
			if (!res.ok) {
				throw new Error("External geolocator failed");
			}
			const data = (await res.json()) as any;
			return ApiResponse.ok(c, "Geolocated target IP", {
				ip: targetIp,
				country: data.countryCode ?? null,
				city: data.city ?? null,
				region: data.region ?? null,
				timezone: data.timezone ?? null,
				latitude: data.lat ?? null,
				longitude: data.lon ?? null,
				asn: data.as
					? parseInt(data.as.split(" ")[0].replace("AS", ""))
					: null,
				colo: null
			});
		} catch (err: any) {
			throw ApiError.badGateway(`IP lookup failed: ${err.message}`);
		}
	})
	.post("/redact", zValidator("json", RedactSchema), async (c) => {
		const { text, replacement } = c.req.valid("json");
		let redactedText = text;
		const redactedTypes: string[] = [];

		for (const pattern of PII_PATTERNS) {
			if (pattern.regex.test(text)) {
				redactedText = redactedText.replace(pattern.regex, replacement);
				redactedTypes.push(pattern.name);
			}
		}

		return ApiResponse.ok(c, "Text redacted successfully", {
			originalLength: text.length,
			redactedLength: redactedText.length,
			redactedTypes,
			redactedText
		});
	})
	.post("/dns", zValidator("json", DnsSchema), async (c) => {
		const { name, type } = c.req.valid("json");
		try {
			const answers = await queryDns(name, type);
			return ApiResponse.ok(c, "DNS query completed", {
				name,
				type,
				answers: answers.map((a: any) => ({
					name: a.name,
					type: a.type,
					TTL: a.TTL,
					data: a.data
				}))
			});
		} catch (err: any) {
			throw ApiError.badGateway(`DNS lookup failed: ${err.message}`);
		}
	})
	.post(
		"/email-security",
		zValidator("json", EmailSecuritySchema),
		async (c) => {
			const { domain } = c.req.valid("json");
			try {
				const txtRecords = await queryDns(domain, "TXT");

				let spfRecord: string | null = null;
				let dmarcRecord: string | null = null;

				for (const r of txtRecords) {
					const val = (r.data ?? "").replace(/"/g, "").trim();
					if (val.startsWith("v=spf1")) {
						spfRecord = val;
					}
				}

				// DMARC is queried on _dmarc.domain
				try {
					const dmarcRecords = await queryDns(
						`_dmarc.${domain}`,
						"TXT"
					);
					for (const r of dmarcRecords) {
						const val = (r.data ?? "").replace(/"/g, "").trim();
						if (val.startsWith("v=DMARC1")) {
							dmarcRecord = val;
						}
					}
				} catch {}

				// Grade email security posture
				let score = 0;
				const issues: string[] = [];

				if (spfRecord) {
					score += 50;
					if (spfRecord.endsWith("-all")) {
						score += 10; // Hard fail is best
					} else if (spfRecord.endsWith("~all")) {
						issues.push(
							"SPF record uses SoftFail (~all) instead of HardFail (-all)."
						);
					} else {
						issues.push("SPF record has weak ending mechanism.");
					}
				} else {
					issues.push("Missing SPF record.");
				}

				if (dmarcRecord) {
					score += 30;
					if (dmarcRecord.includes("p=reject")) {
						score += 10;
					} else if (dmarcRecord.includes("p=quarantine")) {
						score += 5;
						issues.push(
							"DMARC policy set to quarantine instead of reject."
						);
					} else {
						issues.push(
							"DMARC policy set to none (monitoring mode)."
						);
					}
				} else {
					issues.push("Missing DMARC record.");
				}

				return ApiResponse.ok(c, "Email security audit completed", {
					domain,
					score,
					grade:
						score >= 90
							? "A"
							: score >= 70
								? "B"
								: score >= 50
									? "C"
									: "F",
					spf: {
						exists: !!spfRecord,
						record: spfRecord
					},
					dmarc: {
						exists: !!dmarcRecord,
						record: dmarcRecord
					},
					issues
				});
			} catch (err: any) {
				throw ApiError.badGateway(
					`Email security check failed: ${err.message}`
				);
			}
		}
	);

export default devHandler;

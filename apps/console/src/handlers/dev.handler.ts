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

const ConvertUnitSchema = z.object({
	value: z.number(),
	from: z.string().min(1),
	to: z.string().min(1),
	type: z.enum(["length", "mass", "volume", "temperature", "speed"])
});

const UuidSchema = z.object({
	version: z.enum(["v4", "v7"]).default("v4"),
	count: z.number().int().min(1).max(100).default(1)
});

const UlidSchema = z.object({
	count: z.number().int().min(1).max(100).default(1)
});

const CronParserSchema = z.object({
	expression: z
		.string()
		.min(1)
		.max(256)
		.describe(
			"5- or 6-field cron expression (e.g. '*/15 * * * *' or '0 0 * * 0')"
		),
	count: z
		.number()
		.int()
		.min(1)
		.max(20)
		.default(5)
		.describe("How many upcoming fire times to return (1-20)"),
	from: z
		.string()
		.optional()
		.describe("Optional ISO-8601 start timestamp (defaults to now)")
});

// Crockford-base32 ULID generator: 48-bit timestamp (ms) + 80-bit randomness.
// Sortable, collision-resistant, and faster than UUIDv4 for ID generation.
function generateUlid(): string {
	const ENCODING = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
	const TIME_LEN = 10;
	const RAND_LEN = 16;
	const time = Date.now();
	let id = "";
	let t = time;
	for (let i = TIME_LEN - 1; i >= 0; i--) {
		id = ENCODING[t % 32] + id;
		t = Math.floor(t / 32);
	}
	const rand = new Uint8Array(RAND_LEN);
	crypto.getRandomValues(rand);
	for (let i = 0; i < RAND_LEN; i++) {
		id += ENCODING[rand[i] % 32];
	}
	return id;
}

const RegexTestSchema = z.object({
	pattern: z.string().min(1),
	flags: z.string().default(""),
	text: z.string()
});

const TimeParseSchema = z.object({
	text: z.string().min(1)
});

const FlattenJsonSchema = z.object({
	data: z.record(z.string(), z.unknown()),
	delimiter: z.string().length(1).default(".")
});

const ConvertCurrencySchema = z.object({
	amount: z.number().min(0),
	from: z.string().length(3),
	to: z.string().length(3)
});

const PasswordExposureSchema = z.object({
	password: z.string().min(1)
});

const DomainWhoisSchema = z.object({
	domain: z.string().min(1)
});

const HtmlToMarkdownSchema = z.object({
	html: z.string()
});

const HtmlToTextSchema = z.object({
	html: z.string()
});

const JsonToXmlSchema = z.object({
	data: z.record(z.string(), z.unknown()),
	rootName: z.string().default("root")
});

const XmlToJsonSchema = z.object({
	xml: z.string()
});

const TextChunkerSchema = z.object({
	text: z.string(),
	chunkSize: z.number().int().min(10).max(50000).default(1000),
	chunkOverlap: z.number().int().min(0).max(25000).default(200)
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

/** Helper to compute MD5/SHA hashes using Web Crypto */
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

// Units definitions
const UNIT_CONVERSIONS: Record<string, Record<string, number>> = {
	length: {
		m: 1,
		km: 1000,
		cm: 0.01,
		mm: 0.001,
		mile: 1609.34,
		yard: 0.9144,
		foot: 0.3048,
		inch: 0.0254
	},
	mass: {
		kg: 1,
		g: 0.001,
		mg: 0.000001,
		lb: 0.453592,
		oz: 0.0283495
	},
	volume: {
		l: 1,
		ml: 0.001,
		gal: 3.78541,
		qt: 0.946353,
		pt: 0.473176,
		cup: 0.236588
	},
	speed: {
		"m/s": 1,
		"km/h": 1 / 3.6,
		mph: 0.44704,
		knot: 0.514444
	}
};

/** Convert temperature */
function convertTemp(value: number, from: string, to: string): number {
	let kelvin = value;
	if (from === "C") kelvin = value + 273.15;
	else if (from === "F") kelvin = ((value - 32) * 5) / 9 + 273.15;
	else if (from === "K") kelvin = value;
	else throw new Error(`Invalid from unit: ${from}`);

	if (to === "C") return kelvin - 273.15;
	if (to === "F") return ((kelvin - 273.15) * 9) / 5 + 32;
	if (to === "K") return kelvin;
	throw new Error(`Invalid to unit: ${to}`);
}

/** Flatten a nested JSON object */
function flatten(
	data: Record<string, any>,
	delimiter: string,
	prefix = "",
	result: Record<string, any> = {}
) {
	for (const key of Object.keys(data)) {
		const newKey = prefix ? `${prefix}${delimiter}${key}` : key;
		if (
			typeof data[key] === "object" &&
			data[key] !== null &&
			!Array.isArray(data[key])
		) {
			flatten(data[key], delimiter, newKey, result);
		} else {
			result[newKey] = data[key];
		}
	}
	return result;
}

const Base64Schema = z.object({
	text: z.string().max(100_000),
	operation: z.enum(["encode", "decode"]).default("encode"),
	url_safe: z.boolean().default(false)
});

const UrlCodecSchema = z.object({
	text: z.string().max(10_000),
	operation: z.enum(["encode", "decode"]).default("encode"),
	component: z.boolean().default(false) // false = encodeURIComponent, true = encodeURIComponent
});

const UserAgentParseSchema = z.object({
	user_agent: z.string().min(1).max(512)
});

const ColorConvertSchema = z.object({
	color: z.string().min(1).max(64),
	to: z.enum(["hex", "rgb", "hsl", "oklch"]).default("hex")
});

const QrGenerateSchema = z.object({
	text: z.string().min(1).max(1000),
	size: z.number().int().min(64).max(1024).default(256),
	margin: z.number().int().min(0).max(10).default(2),
	error_correction: z.enum(["L", "M", "Q", "H"]).default("M")
});

const Base64Handler = async (c: any) => {
	const { text, operation, url_safe } = c.req.valid("json");
	try {
		let result: string;
		if (operation === "encode") {
			const b64 = btoa(
				String.fromCharCode(...new TextEncoder().encode(text))
			);
			result = url_safe
				? b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")
				: b64;
		} else {
			const normalized = url_safe
				? text.replace(/-/g, "+").replace(/_/g, "/")
				: text;
			const padded =
				normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
			result = new TextDecoder().decode(
				new Uint8Array(
					atob(padded)
						.split("")
						.map((c) => c.charCodeAt(0))
				)
			);
		}
		return ApiResponse.ok(c, "Base64 operation complete", {
			operation,
			input_length: text.length,
			output_length: result.length,
			result
		});
	} catch (err: any) {
		throw ApiError.badRequest(`Base64 ${operation} failed: ${err.message}`);
	}
};

const UrlCodecHandler = async (c: any) => {
	const { text, operation, component } = c.req.valid("json");
	try {
		const result =
			operation === "encode"
				? component
					? encodeURIComponent(text)
					: encodeURI(text)
				: component
					? decodeURIComponent(text)
					: decodeURI(text);
		return ApiResponse.ok(c, "URL codec operation complete", {
			operation,
			mode: component ? "component" : "full",
			input_length: text.length,
			output_length: result.length,
			result
		});
	} catch (err: any) {
		throw ApiError.badRequest(`URL ${operation} failed: ${err.message}`);
	}
};

const UserAgentParseHandler = async (c: any) => {
	const { user_agent } = c.req.valid("json");
	const browserRe = /(?:Edg|OPR|Chrome|Safari|Firefox|Brave|Arc)\/([\d.]+)/;
	const osRe = /\(([^)]+)\)/;
	const deviceRe = /(Mobile|Tablet|iPhone|iPad|Android)/;
	const m = user_agent.match(browserRe);
	const browserName = user_agent.includes("Edg/")
		? "Edge"
		: user_agent.includes("OPR/")
			? "Opera"
			: user_agent.includes("Chrome/")
				? "Chrome"
				: user_agent.includes("Firefox/")
					? "Firefox"
					: user_agent.includes("Safari/")
						? "Safari"
						: "Unknown";
	const osMatch = user_agent.match(osRe);
	const osString = osMatch ? osMatch[1] : "";
	return ApiResponse.ok(c, "User-Agent parsed", {
		browser: browserName,
		version: m?.[1] ?? null,
		os: osString,
		isMobile: !!deviceRe.test(user_agent),
		isBot: /bot|crawl|spider/i.test(user_agent),
		raw_length: user_agent.length
	});
};

const ColorConvertHandler = async (c: any) => {
	const { color, to } = c.req.valid("json");
	// Accept #rgb, #rrggbb, rgb(r,g,b), or rgba(r,g,b,a)
	let r = 0,
		g = 0,
		b = 0,
		a = 1;
	let input = color.trim();
	if (input.startsWith("#")) {
		const hex = input.slice(1);
		if (hex.length === 3) {
			r = parseInt(hex[0] + hex[0], 16);
			g = parseInt(hex[1] + hex[1], 16);
			b = parseInt(hex[2] + hex[2], 16);
		} else if (hex.length === 6 || hex.length === 8) {
			r = parseInt(hex.slice(0, 2), 16);
			g = parseInt(hex.slice(2, 4), 16);
			b = parseInt(hex.slice(4, 6), 16);
			if (hex.length === 8) a = parseInt(hex.slice(6, 8), 16) / 255;
		} else {
			throw ApiError.badRequest("Hex color must be 3, 6, or 8 chars");
		}
	} else {
		const m = input.match(/rgba?\(([^)]+)\)/i);
		if (!m) throw ApiError.badRequest("Color must be hex or rgb/rgba");
		const parts = m[1].split(",").map((s: string) => parseFloat(s.trim()));
		[r, g, b] = parts;
		if (parts.length === 4) a = parts[3];
	}
	if ([r, g, b].some((v) => !Number.isFinite(v))) {
		throw ApiError.badRequest("Invalid numeric component");
	}
	r = Math.max(0, Math.min(255, Math.round(r)));
	g = Math.max(0, Math.min(255, Math.round(g)));
	b = Math.max(0, Math.min(255, Math.round(b)));

	const rgbToHsl = (r: number, g: number, b: number) => {
		let rr = r / 255,
			gg = g / 255,
			bb = b / 255;
		const max = Math.max(rr, gg, bb),
			min = Math.min(rr, gg, bb);
		let h = 0,
			s = 0;
		const l = (max + min) / 2;
		if (max !== min) {
			const d = max - min;
			s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
			switch (max) {
				case rr:
					h = (gg - bb) / d + (gg < bb ? 6 : 0);
					break;
				case gg:
					h = (bb - rr) / d + 2;
					break;
				case bb:
					h = (rr - gg) / d + 4;
					break;
			}
			h /= 6;
		}
		return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
	};
	const toHex = (n: number) => n.toString(16).padStart(2, "0");
	const result: Record<string, string> = {
		hex: `#${toHex(r)}${toHex(g)}${toHex(b)}`,
		rgb: `rgb(${r}, ${g}, ${b})`,
		hsl: `hsl(${rgbToHsl(r, g, b).join(", ")})`,
		rgba: `rgba(${r}, ${g}, ${b}, ${a})`
	};
	return ApiResponse.ok(c, "Color converted", {
		input: color,
		target: to,
		value: result[to],
		all: result
	});
};

const QrGenerateHandler = async (c: any) => {
	const { text, size, margin, error_correction } = c.req.valid("json");
	// Use the Google Chart Image API for QR generation (free, reliable, no auth)
	const params = new URLSearchParams({
		cht: "qr",
		chs: `${size}x${size}`,
		chld: `${error_correction}|${margin}`,
		chl: text
	});
	const url = `https://chart.googleapis.com/chart?${params}`;
	const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
	if (!res.ok)
		throw ApiError.badGateway(`QR generation failed: HTTP ${res.status}`);
	const buf = new Uint8Array(await res.arrayBuffer());
	const base64 = btoa(String.fromCharCode(...buf));
	return ApiResponse.ok(c, "QR code generated", {
		text,
		size,
		margin,
		error_correction,
		format: "png",
		dataUri: `data:image/png;base64,${base64}`,
		bytes: buf.length
	});
};

const devHandler = new Hono<HonoEnv>()
	.post("/base64", zValidator("json", Base64Schema), Base64Handler)
	.post("/url-codec", zValidator("json", UrlCodecSchema), UrlCodecHandler)
	.post(
		"/user-agent-parse",
		zValidator("json", UserAgentParseSchema),
		UserAgentParseHandler
	)
	.post(
		"/color-convert",
		zValidator("json", ColorConvertSchema),
		ColorConvertHandler
	)
	.post(
		"/qr-generate",
		zValidator("json", QrGenerateSchema),
		QrGenerateHandler
	)
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

				let score = 0;
				const issues: string[] = [];

				if (spfRecord) {
					score += 50;
					if (spfRecord.endsWith("-all")) {
						score += 10;
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
	)
	.post("/html-to-text", zValidator("json", HtmlToTextSchema), async (c) => {
		const { html } = c.req.valid("json");
		try {
			const text = html
				.replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/gi, "")
				.replace(/<[^>]+>/g, " ")
				.replace(/&nbsp;/g, " ")
				.replace(/&lt;/g, "<")
				.replace(/&gt;/g, ">")
				.replace(/&amp;/g, "&")
				.replace(/&quot;/g, '"')
				.replace(/&apos;/g, "'")
				.replace(/\s+/g, " ")
				.trim();
			return ApiResponse.ok(c, "HTML converted to plain text", { text });
		} catch (err: any) {
			throw ApiError.badRequest(err.message);
		}
	})
	.post("/json-to-xml", zValidator("json", JsonToXmlSchema), async (c) => {
		const { data, rootName } = c.req.valid("json");
		const toXml = (obj: any): string => {
			let xml = "";
			for (const key in obj) {
				if (Object.prototype.hasOwnProperty.call(obj, key)) {
					const val = obj[key];
					if (typeof val === "object" && val !== null) {
						if (Array.isArray(val)) {
							val.forEach((item) => {
								xml += `<${key}>${typeof item === "object" ? toXml(item) : String(item)}</${key}>`;
							});
						} else {
							xml += `<${key}>${toXml(val)}</${key}>`;
						}
					} else {
						xml += `<${key}>${String(val)}</${key}>`;
					}
				}
			}
			return xml;
		};
		const xml = `<?xml version="1.0" encoding="UTF-8"?><${rootName}>${toXml(data)}</${rootName}>`;
		return c.body(xml, 200, { "Content-Type": "application/xml" });
	})
	.post("/xml-to-json", zValidator("json", XmlToJsonSchema), async (c) => {
		const { xml } = c.req.valid("json");
		try {
			const parseXml = (xmlStr: string): any => {
				const obj: any = {};
				const regex = /<([^>\s/]+)([^>]*)>([^<]*)<\/\1>/g;
				let match;
				let found = false;
				while ((match = regex.exec(xmlStr)) !== null) {
					found = true;
					const tag = match[1];
					const val = match[3].trim();
					if (obj[tag]) {
						if (!Array.isArray(obj[tag])) {
							obj[tag] = [obj[tag]];
						}
						obj[tag].push(val);
					} else {
						obj[tag] = val;
					}
				}

				const nestedRegex = /<([^>\s/]+)([^>]*)>([\s\S]*?)<\/\1>/g;
				let nestedMatch;
				while ((nestedMatch = nestedRegex.exec(xmlStr)) !== null) {
					const tag = nestedMatch[1];
					const content = nestedMatch[3].trim();
					if (content.includes("<") && content.includes(">")) {
						found = true;
						const parsedNested = parseXml(content);
						if (obj[tag]) {
							if (!Array.isArray(obj[tag])) {
								obj[tag] = [obj[tag]];
							}
							obj[tag].push(parsedNested);
						} else {
							obj[tag] = parsedNested;
						}
					}
				}
				return found ? obj : xmlStr.trim();
			};

			const cleanXml = xml.replace(/<\?xml[^>]*>/i, "").trim();
			const result = parseXml(cleanXml);
			return ApiResponse.ok(c, "XML converted to JSON", { result });
		} catch (err: any) {
			throw ApiError.badRequest(`XML parsing failed: ${err.message}`);
		}
	})
	.post("/text-chunker", zValidator("json", TextChunkerSchema), async (c) => {
		const { text, chunkSize, chunkOverlap } = c.req.valid("json");
		if (chunkOverlap >= chunkSize) {
			throw ApiError.badRequest(
				"chunkOverlap must be less than chunkSize"
			);
		}
		const chunks: string[] = [];
		let start = 0;
		while (start < text.length) {
			const end = Math.min(start + chunkSize, text.length);
			chunks.push(text.slice(start, end));
			if (end === text.length) break;
			start += chunkSize - chunkOverlap;
		}
		return ApiResponse.ok(c, "Text chunked successfully", {
			chunks,
			count: chunks.length
		});
	})
	.post("/convert-unit", zValidator("json", ConvertUnitSchema), async (c) => {
		const { value, from, to, type } = c.req.valid("json");

		try {
			if (type === "temperature") {
				const result = convertTemp(value, from, to);
				return ApiResponse.ok(c, "Temperature converted", {
					value,
					from,
					to,
					result
				});
			}

			const typeTable = UNIT_CONVERSIONS[type];
			if (!typeTable) {
				throw new Error(`Unsupported unit type: ${type}`);
			}

			const fromRate = typeTable[from];
			const toRate = typeTable[to];

			if (fromRate === undefined || toRate === undefined) {
				throw new Error(
					`Unsupported unit conversion from ${from} to ${to}`
				);
			}

			const result = (value * fromRate) / toRate;

			return ApiResponse.ok(c, "Unit converted successfully", {
				value,
				from,
				to,
				result: parseFloat(result.toFixed(8))
			});
		} catch (err: any) {
			throw ApiError.badRequest(err.message);
		}
	})
	.post("/uuid", zValidator("json", UuidSchema), async (c) => {
		const { version, count } = c.req.valid("json");
		const uuids: string[] = [];

		for (let i = 0; i < count; i++) {
			if (version === "v4") {
				uuids.push(crypto.randomUUID());
			} else {
				const timestamp = Date.now();
				const rand = crypto.getRandomValues(new Uint8Array(10));

				const tsHex = timestamp.toString(16).padStart(12, "0");
				const randHex = Array.from(rand)
					.map((b) => b.toString(16).padStart(2, "0"))
					.join("");

				const part1 = tsHex.slice(0, 8);
				const part2 = tsHex.slice(8, 12);
				const part3 = `7${randHex.slice(0, 3)}`;
				const part4 = `${((parseInt(randHex.slice(3, 4), 16) & 0x3) | 0x8).toString(16)}${randHex.slice(4, 7)}`;
				const part5 = randHex.slice(7, 19);

				uuids.push(`${part1}-${part2}-${part3}-${part4}-${part5}`);
			}
		}

		return ApiResponse.ok(c, "UUIDs generated successfully", { uuids });
	})
	.post("/ulid", zValidator("json", UlidSchema), async (c) => {
		const { count } = c.req.valid("json");
		const ulids: string[] = [];
		for (let i = 0; i < count; i++) ulids.push(generateUlid());
		return ApiResponse.ok(c, "ULIDs generated successfully", { ulids });
	})
	.post("/regex-test", zValidator("json", RegexTestSchema), async (c) => {
		const { pattern, flags, text } = c.req.valid("json");

		try {
			if (flags && !/^[gimsuy]+$/.test(flags)) {
				throw new Error("Invalid regex flags");
			}

			const regex = new RegExp(pattern, flags);
			const matches = [];

			if (flags.includes("g")) {
				let match;
				while ((match = regex.exec(text)) !== null) {
					matches.push({
						match: match[0],
						index: match.index,
						groups: match.slice(1)
					});
					if (match[0].length === 0) {
						regex.lastIndex++;
					}
				}
			} else {
				const match = regex.exec(text);
				if (match) {
					matches.push({
						match: match[0],
						index: match.index,
						groups: match.slice(1)
					});
				}
			}

			return ApiResponse.ok(c, "Regex tested successfully", {
				pattern,
				flags,
				matches,
				count: matches.length
			});
		} catch (err: any) {
			throw ApiError.badRequest(`Invalid regex: ${err.message}`);
		}
	})
	.post("/time-parse", zValidator("json", TimeParseSchema), async (c) => {
		const { text } = c.req.valid("json");

		try {
			let date: Date;

			const lower = text.toLowerCase().trim();
			if (lower === "now") {
				date = new Date();
			} else if (lower === "today") {
				date = new Date();
				date.setHours(0, 0, 0, 0);
			} else if (lower === "yesterday") {
				date = new Date();
				date.setDate(date.getDate() - 1);
				date.setHours(0, 0, 0, 0);
			} else if (lower === "tomorrow") {
				date = new Date();
				date.setDate(date.getDate() + 1);
				date.setHours(0, 0, 0, 0);
			} else {
				const parsed = Date.parse(text);
				if (isNaN(parsed)) {
					const num = Number(text);
					if (!isNaN(num) && num > 0) {
						date = new Date(num < 99999999999 ? num * 1000 : num);
					} else {
						throw new Error("Unable to parse date string");
					}
				} else {
					date = new Date(parsed);
				}
			}

			return ApiResponse.ok(c, "Time parsed successfully", {
				iso: date.toISOString(),
				unix: Math.floor(date.getTime() / 1000),
				unixMs: date.getTime(),
				utcDate: date.toUTCString(),
				timezoneOffset: date.getTimezoneOffset()
			});
		} catch (err: any) {
			throw ApiError.badRequest(err.message);
		}
	})
	.post("/flatten-json", zValidator("json", FlattenJsonSchema), async (c) => {
		const { data, delimiter } = c.req.valid("json");
		try {
			const result = flatten(data, delimiter);
			return ApiResponse.ok(c, "JSON flattened successfully", { result });
		} catch (err: any) {
			throw ApiError.badRequest(err.message);
		}
	})
	.post(
		"/convert-currency",
		zValidator("json", ConvertCurrencySchema),
		async (c) => {
			const { amount, from, to } = c.req.valid("json");

			const cleanFrom = from.toUpperCase();
			const cleanTo = to.toUpperCase();

			if (cleanFrom === cleanTo) {
				return ApiResponse.ok(c, "Currency converted", {
					amount,
					from: cleanFrom,
					to: cleanTo,
					result: amount
				});
			}

			try {
				const res = await fetch(
					`https://api.frankfurter.app/latest?amount=${amount}&from=${cleanFrom}&to=${cleanTo}`
				);
				if (!res.ok) {
					throw new Error("Exchange rate provider failed");
				}
				const data = (await res.json()) as any;
				const result = data.rates[cleanTo];
				if (result === undefined) {
					throw new Error(
						`Conversion rate from ${cleanFrom} to ${cleanTo} not found`
					);
				}

				return ApiResponse.ok(c, "Currency converted successfully", {
					amount,
					from: cleanFrom,
					to: cleanTo,
					result: parseFloat(result.toFixed(4))
				});
			} catch (err: any) {
				throw ApiError.badGateway(
					`Currency conversion failed: ${err.message}`
				);
			}
		}
	)
	.post(
		"/password-exposure",
		zValidator("json", PasswordExposureSchema),
		async (c) => {
			const { password } = c.req.valid("json");

			try {
				const sha1 = await computeHash(password, "SHA-1");
				const cleanSha1 = sha1.toUpperCase();
				const prefix = cleanSha1.slice(0, 5);
				const suffix = cleanSha1.slice(5);

				const res = await fetch(
					`https://api.pwnedpasswords.com/range/${prefix}`
				);
				if (!res.ok) {
					throw new Error("HIBP API request failed");
				}

				const text = await res.text();
				const lines = text.split(/\r?\n/);
				let count = 0;

				for (const line of lines) {
					const [hashSuffix, matchCount] = line.split(":");
					if (hashSuffix === suffix) {
						count = parseInt(matchCount || "0", 10);
						break;
					}
				}

				return ApiResponse.ok(c, "Password exposure check completed", {
					exposed: count > 0,
					breachesCount: count
				});
			} catch (err: any) {
				throw ApiError.badGateway(
					`Failed to check password exposure: ${err.message}`
				);
			}
		}
	)
	.post("/domain-whois", zValidator("json", DomainWhoisSchema), async (c) => {
		const { domain } = c.req.valid("json");

		try {
			const cleanDomain = domain
				.toLowerCase()
				.trim()
				.replace(/^(https?:\/\/)?(www\.)?/, "");

			const res = await fetch(`https://rdap.org/domain/${cleanDomain}`);
			if (!res.ok) {
				throw new Error(`RDAP registry returned status ${res.status}`);
			}

			const data = (await res.json()) as any;

			const status = data.status ?? [];
			const registrar =
				data.entities
					?.find((e: any) => e.roles?.includes("registrar"))
					?.vcardArray?.[1]?.find((vc: any) => vc[0] === "fn")?.[3] ??
				"Unknown";

			const events = data.events ?? [];
			const registrationDate =
				events.find((e: any) => e.eventAction === "registration")
					?.eventDate ?? null;
			const expirationDate =
				events.find((e: any) => e.eventAction === "expiration")
					?.eventDate ?? null;

			return ApiResponse.ok(c, "Domain WHOIS (RDAP) completed", {
				domain: cleanDomain,
				registrar,
				registrationDate,
				expirationDate,
				status
			});
		} catch (err: any) {
			throw ApiError.badGateway(`WHOIS lookup failed: ${err.message}`);
		}
	})
	.post(
		"/html-to-markdown",
		zValidator("json", HtmlToMarkdownSchema),
		async (c) => {
			const { html } = c.req.valid("json");

			try {
				let markdown = html
					.replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/gi, "")
					.replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, "\n# $1\n")
					.replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, "\n## $1\n")
					.replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, "\n### $1\n")
					.replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, "\n$1\n")
					.replace(/<br\s*\/?>/gi, "\n")
					.replace(/<strong[^>]*>([\s\S]*?)<\/strong>/gi, "**$1**")
					.replace(/<b[^>]*>([\s\S]*?)<\/b>/gi, "**$1**")
					.replace(/<em[^>]*>([\s\S]*?)<\/em>/gi, "*$1*")
					.replace(/<i[^>]*>([\s\S]*?)<\/i>/gi, "*$1*")
					.replace(
						/<a[^+]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi,
						"[$2]($1)"
					)
					.replace(/<[^>]+>/g, "");

				markdown = markdown
					.split(/\r?\n/)
					.map((line) => line.trim())
					.filter(
						(line, i, arr) =>
							line.length > 0 || (i > 0 && arr[i - 1].length > 0)
					)
					.join("\n");

				return ApiResponse.ok(c, "HTML converted to Markdown", {
					markdown
				});
			} catch (err: any) {
				throw ApiError.badRequest(`Conversion failed: ${err.message}`);
			}
		}
	)
	.post(
		"/pdf-text",
		zValidator(
			"json",
			z.object({
				url: z.string().url().max(2048)
			})
		),
		async (c) => {
			const { url } = c.req.valid("json");

			try {
				const res = await fetch(url, {
					signal: AbortSignal.timeout(10_000)
				});
				if (!res.ok) {
					throw new Error(`PDF fetch returned ${res.status}`);
				}
				const buf = await res.arrayBuffer();
				if (buf.byteLength === 0) {
					throw new Error("Empty response body");
				}

				// Stream-decode the PDF text content. Real PDF text lives inside
				// parenthesized byte sequences after " Tj"/" TJ" operators, often
				// encoded as UTF-16BE or with PDFDocEncoding.
				const bytes = new Uint8Array(buf);
				const decoder = new TextDecoder("utf-8");
				const raw = decoder.decode(bytes);

				// Extract text from within BT...ET blocks (text objects)
				const textBlocks: string[] = [];
				const btEtRe = /BT([\s\S]*?)ET/g;
				let m: RegExpExecArray | null;
				while ((m = btEtRe.exec(raw)) !== null) {
					const block = m[1];
					// Heuristic: collect parenthesized strings (escapes handled lightly)
					const strs: string[] = [];
					const parenRe = /\(((?:\\.|[^()\\])*)\)\s*(Tj|TJ)/g;
					let pm: RegExpExecArray | null;
					while ((pm = parenRe.exec(block)) !== null) {
						strs.push(pm[1]);
					}
					if (strs.length > 0) {
						textBlocks.push(strs.join(""));
					}
				}

				// Fallback for compressed / image-only PDFs: try a flat whitespace
				// extraction so we still return something rather than empty.
				let text = textBlocks.join("\n").trim();
				if (!text) {
					const flat = raw
						.replace(/[^\x20-\x7E\n]/g, " ")
						.replace(/\s{3,}/g, " ")
						.trim();
					text = flat.slice(0, 8000);
				}

				// Cheap page-count heuristic — count "/Type /Page" markers
				const pageMatches = raw.match(/\/Type\s*\/Page[^s]/g) || [];
				const pages = pageMatches.length;

				return ApiResponse.ok(c, "PDF text extracted", {
					url,
					pages,
					characters: text.length,
					text
				});
			} catch (err: any) {
				throw ApiError.badGateway(
					`PDF text extraction failed: ${err.message}`
				);
			}
		}
	)
	// 5- or 6-field cron parser. Computes the next N fire times after a given
	// instant. Returns ISO-8601 strings + epoch ms for each fire time, plus
	// a normalized expression echo. No deps — pure-date arithmetic.
	.post("/cron-parser", zValidator("json", CronParserSchema), async (c) => {
		const { expression, count, from } = c.req.valid("json");
		const parsed = parseCron(expression);
		if (!parsed) {
			throw ApiError.badRequest(
				`Invalid cron expression: "${expression}". Expected 5 or 6 whitespace-separated fields (minute, hour, day-of-month, month, day-of-week[, second]).`
			);
		}
		const start = from ? new Date(from) : new Date();
		if (Number.isNaN(start.getTime())) {
			throw ApiError.badRequest(`Invalid 'from' timestamp: ${from}`);
		}
		// Walk forward in 1-minute increments (sub-minute only if 6-field).
		const step = parsed.hasSeconds ? 1000 : 60_000;
		const fires: { iso: string; epochMs: number }[] = [];
		const maxIterations = 60_000; // safety: ~1000 days at minute resolution
		let t = start.getTime();
		for (let i = 0; i < maxIterations && fires.length < count; i++) {
			t += step;
			if (matchesCron(parsed, new Date(t))) {
				fires.push({ iso: new Date(t).toISOString(), epochMs: t });
			}
		}
		return ApiResponse.ok(c, "Cron expression parsed", {
			expression,
			normalized: parsed.normalized,
			fields: parsed.fields,
			hasSeconds: parsed.hasSeconds,
			from: start.toISOString(),
			next: fires
		});
	});

// ----------------------------------------------------------------------------
// Cron helpers
// ----------------------------------------------------------------------------

type CronField = {
	raw: string;
	min: number;
	max: number;
	values: Set<number>;
};

type ParsedCron = {
	hasSeconds: boolean;
	fields: Record<
		"second" | "minute" | "hour" | "day" | "month" | "weekday",
		CronField
	>;
	normalized: string;
};

const FIELD_BOUNDS = {
	second: [0, 59],
	minute: [0, 59],
	hour: [0, 23],
	day: [1, 31],
	month: [1, 12],
	weekday: [0, 6] // 0 = Sunday
} as const;

const MONTH_NAMES: Record<string, number> = {
	jan: 1,
	feb: 2,
	mar: 3,
	apr: 4,
	may: 5,
	jun: 6,
	jul: 7,
	aug: 8,
	sep: 9,
	oct: 10,
	nov: 11,
	dec: 12
};

const WEEKDAY_NAMES: Record<string, number> = {
	sun: 0,
	mon: 1,
	tue: 2,
	wed: 3,
	thu: 4,
	fri: 5,
	sat: 6
};

function expandField(
	raw: string,
	min: number,
	max: number,
	names?: Record<string, number>
): CronField | null {
	const values = new Set<number>();
	const parts = raw.split(",");
	for (const part of parts) {
		const match = part.match(/^(.+)\/(\d+)$/);
		const rangePart = match ? match[1] : part;
		const step = match ? parseInt(match[2], 10) : 1;
		if (step < 1) return null;
		let range: [number, number];
		if (rangePart === "*") {
			range = [min, max];
		} else if (rangePart.includes("-")) {
			const [a, b] = rangePart.split("-");
			const lo = resolveToken(a, names);
			const hi = resolveToken(b, names);
			if (lo === null || hi === null || lo < min || hi > max || lo > hi)
				return null;
			range = [lo, hi];
		} else {
			const v = resolveToken(rangePart, names);
			if (v === null || v < min || v > max) return null;
			if (match) {
				range = [v, max];
			} else {
				values.add(v);
				continue;
			}
		}
		for (let v = range[0]; v <= range[1]; v += step) values.add(v);
	}
	if (values.size === 0) return null;
	return { raw, min, max, values };
}

function resolveToken(
	token: string,
	names?: Record<string, number>
): number | null {
	const lower = token.toLowerCase();
	if (names && lower in names) return names[lower];
	if (/^\d+$/.test(token)) {
		const n = parseInt(token, 10);
		return Number.isFinite(n) ? n : null;
	}
	return null;
}

function parseCron(expr: string): ParsedCron | null {
	const tokens = expr.trim().split(/\s+/);
	if (tokens.length !== 5 && tokens.length !== 6) return null;
	const hasSeconds = tokens.length === 6;
	const order: (
		| "second"
		| "minute"
		| "hour"
		| "day"
		| "month"
		| "weekday"
	)[] = hasSeconds
		? ["second", "minute", "hour", "day", "month", "weekday"]
		: ["minute", "hour", "day", "month", "weekday"];
	const fields = {} as ParsedCron["fields"];
	for (const name of order) {
		const raw = tokens.shift()!;
		const [min, max] = FIELD_BOUNDS[name];
		const names =
			name === "month"
				? MONTH_NAMES
				: name === "weekday"
					? WEEKDAY_NAMES
					: undefined;
		const field = expandField(raw, min, max, names);
		if (!field) return null;
		fields[name] = field;
	}
	return {
		hasSeconds,
		fields,
		normalized: order.map((n) => fields[n].raw).join(" ")
	};
}

function matchesCron(parsed: ParsedCron, d: Date): boolean {
	const { second, minute, hour, day, month, weekday } = parsed.fields;
	if (second && !second.values.has(d.getUTCSeconds())) return false;
	if (!minute.values.has(d.getUTCMinutes())) return false;
	if (!hour.values.has(d.getUTCHours())) return false;
	// Day-of-month AND day-of-week: standard cron semantics — when BOTH are
	// constrained, match if EITHER matches; otherwise each is independent.
	const domConstrained = day.raw !== "*";
	const dowConstrained = weekday.raw !== "*";
	const utcDay = d.getUTCDate();
	const utcMonth = d.getUTCMonth() + 1;
	const utcDow = d.getUTCDay();
	if (!month.values.has(utcMonth)) return false;
	if (domConstrained && dowConstrained) {
		if (!day.values.has(utcDay) && !weekday.values.has(utcDow))
			return false;
	} else if (domConstrained) {
		if (!day.values.has(utcDay)) return false;
	} else if (dowConstrained) {
		if (!weekday.values.has(utcDow)) return false;
	}
	return true;
}

export default devHandler;

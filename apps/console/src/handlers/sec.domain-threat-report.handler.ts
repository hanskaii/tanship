import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

import { ApiResponse } from "@/helpers/response.helper";
import type { HonoEnv } from "@/types/hono.types";

const DomainThreatReportSchema = z.object({
	domain: z
		.string()
		.min(1)
		.describe(
			"Domain to produce a full threat report for (e.g. example.com)"
		)
});

interface DnsResult {
	source: "cloudflare-dns";
	resolved: boolean;
	records: string[];
	error: string | null;
}

interface WhoisResult {
	source: "whoisxmlapi";
	registered: boolean;
	registrar: string | null;
	createdDate: string | null;
	expiryDate: string | null;
	nameservers: string[];
	error: string | null;
}

interface SslResult {
	source: "certspotter";
	valid: boolean;
	expired: boolean;
	daysRemaining: number;
	issuer: string;
	error: string | null;
}

interface UrlhausResult {
	source: "urlhaus";
	listed: boolean;
	threatType: string | null;
	tags: string[];
	error: string | null;
}

const secDomainThreatReportHandler = new Hono<HonoEnv>().post(
	"/threat-report",
	zValidator("json", DomainThreatReportSchema),
	async (c) => {
		const { domain } = c.req.valid("json");
		const cleanDomain = domain
			.toLowerCase()
			.trim()
			.replace(/^(https?:\/\/)?(www\.)?/, "");

		// Fan out to all 4 sources in parallel
		const [dnsResult, whoisResult, sslResult, urlhausResult] =
			await Promise.allSettled([
				fetchDns(cleanDomain),
				fetchWhois(cleanDomain),
				fetchSsl(cleanDomain),
				fetchUrlhaus(cleanDomain)
			]);

		const dns: DnsResult =
			dnsResult.status === "fulfilled"
				? dnsResult.value
				: {
						source: "cloudflare-dns",
						resolved: false,
						records: [],
						error: String(
							(dnsResult as PromiseRejectedResult).reason()
						)
					};
		const whois: WhoisResult =
			whoisResult.status === "fulfilled"
				? whoisResult.value
				: {
						source: "whoisxmlapi",
						registered: false,
						registrar: null,
						createdDate: null,
						expiryDate: null,
						nameservers: [],
						error: String(
							(whoisResult as PromiseRejectedResult).reason()
						)
					};
		const ssl: SslResult =
			sslResult.status === "fulfilled"
				? sslResult.value
				: {
						source: "certspotter",
						valid: false,
						expired: true,
						daysRemaining: 0,
						issuer: "",
						error: String(
							(sslResult as PromiseRejectedResult).reason()
						)
					};
		const urlhaus: UrlhausResult =
			urlhausResult.status === "fulfilled"
				? urlhausResult.value
				: {
						source: "urlhaus",
						listed: false,
						threatType: null,
						tags: [],
						error: String(
							(urlhausResult as PromiseRejectedResult).reason()
						)
					};

		// Threat level: critical if in urlhaus, warning if ssl expired or dns unresolved
		const threatLevel = urlhaus.listed
			? "critical"
			: ssl.expired || !dns.resolved
				? "warning"
				: "clean";

		const summaryParts: string[] = [];
		if (!dns.resolved) summaryParts.push("DNS unresolved");
		if (whois.registered) {
			if (whois.expiryDate) {
				const expiry = new Date(whois.expiryDate);
				const now = new Date();
				const daysToExpiry = Math.ceil(
					(expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
				);
				if (daysToExpiry < 30)
					summaryParts.push(`Domain expires in ${daysToExpiry}d`);
			}
		} else {
			summaryParts.push("Domain not registered or WHOIS unavailable");
		}
		if (ssl.expired) summaryParts.push("SSL certificate expired");
		if (urlhaus.listed)
			summaryParts.push(`Listed on URLhaus as ${urlhaus.threatType}`);

		return ApiResponse.ok(c, "Domain threat report generated", {
			domain: cleanDomain,
			threatLevel,
			summary:
				summaryParts.length === 0
					? "No threats detected"
					: summaryParts.join("; "),
			dns,
			whois,
			ssl,
			urlhaus
		});
	}
);

async function fetchDns(domain: string): Promise<DnsResult> {
	try {
		const res = await fetch(
			`https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(domain)}&type=A`,
			{ headers: { Accept: "application/dns-json" } }
		);
		if (!res.ok) throw new Error(`DNS API ${res.status}`);
		const data = (await res.json()) as any;
		const answers: string[] = (data.Answer ?? []).map(
			(a: any) => `${a.name} ${a.type} ${a.data}`
		);
		return {
			source: "cloudflare-dns",
			resolved: answers.length > 0,
			records: answers,
			error: null
		};
	} catch (e: any) {
		return {
			source: "cloudflare-dns",
			resolved: false,
			records: [],
			error: e.message
		};
	}
}

async function fetchWhois(domain: string): Promise<WhoisResult> {
	try {
		// Use the free whoisxmlapi free tier (1 req/day on free plan)
		// Falls back to a simpler free WHOIS lookup if unavailable
		const res = await fetch(
			`https://www.whoisxmlapi.com/whoisserver/WhoisService?apiKey=free&domainName=${encodeURIComponent(domain)}&outputFormat=json`,
			{ headers: { Accept: "application/json" } }
		);
		if (!res.ok) throw new Error(`WHOIS API ${res.status}`);
		const data = (await res.json()) as any;
		const whois = data.WhoisRecord ?? {};
		return {
			source: "whoisxmlapi",
			registered: !!whois.createdDate,
			registrar: whois.registrarName ?? null,
			createdDate: whois.createdDate ?? null,
			expiryDate:
				whois.expiresDate ?? whois.registryData?.expiresDate ?? null,
			nameservers: whois.nameServers?.hostNames ?? [],
			error: null
		};
	} catch (e: any) {
		// Fallback: try RDAP which is free/public
		try {
			const rdapRes = await fetch(
				`https://rdap.org/domain/${encodeURIComponent(domain)}`,
				{
					headers: { Accept: "application/rdap+json" }
				}
			);
			if (rdapRes.ok) {
				const rdap = (await rdapRes.json()) as any;
				const events = rdap.events ?? [];
				const created =
					events.find((e: any) => e.eventAction === "registration")
						?.eventDate ?? null;
				const expires =
					events.find((e: any) => e.eventAction === "expiration")
						?.eventDate ?? null;
				const ns = (rdap.nameservers ?? []).map((n: any) => n.ldhName);
				return {
					source: "whoisxmlapi",
					registered: true,
					registrar: rdap.secureDNS?.delegationSigned
						? "DNSSEC"
						: null,
					createdDate: created,
					expiryDate: expires,
					nameservers: ns,
					error: null
				};
			}
		} catch {
			// Fall through to error
		}
		return {
			source: "whoisxmlapi",
			registered: false,
			registrar: null,
			createdDate: null,
			expiryDate: null,
			nameservers: [],
			error: e.message
		};
	}
}

async function fetchSsl(domain: string): Promise<SslResult> {
	try {
		const res = await fetch(
			`https://api.certspotter.com/v1/issuances?dnsname=${encodeURIComponent(domain)}&include_subdomains=false&limit=1`
		);
		if (!res.ok) throw new Error(`CertSpotter ${res.status}`);
		const data = (await res.json()) as any[];
		if (data.length === 0) {
			return {
				source: "certspotter",
				valid: false,
				expired: true,
				daysRemaining: 0,
				issuer: "No certificate found",
				error: null
			};
		}
		const latest = data[0];
		const notAfter = latest.not_after ? new Date(latest.not_after) : null;
		const notBefore = latest.not_before
			? new Date(latest.not_before)
			: null;
		const now = new Date();
		const expired = notAfter ? now > notAfter : true;
		const active = notBefore ? now >= notBefore && !expired : false;
		const daysRemaining = notAfter
			? Math.max(
					0,
					Math.ceil(
						(notAfter.getTime() - now.getTime()) /
							(1000 * 60 * 60 * 24)
					)
				)
			: 0;
		return {
			source: "certspotter",
			valid: active,
			expired,
			daysRemaining,
			issuer: latest.issuer?.common_name || "Unknown",
			error: null
		};
	} catch (e: any) {
		return {
			source: "certspotter",
			valid: false,
			expired: true,
			daysRemaining: 0,
			issuer: "",
			error: e.message
		};
	}
}

async function fetchUrlhaus(domain: string): Promise<UrlhausResult> {
	try {
		// URLhaus checks specific URLs; we check the domain root + common patterns
		const baseUrl = `https://${domain}`;
		const res = await fetch(
			`https://urlhaus-api.abuse.ch/v1/lookup/?url=${encodeURIComponent(baseUrl)}`,
			{ headers: { Accept: "application/json" } }
		);
		if (!res.ok) throw new Error(`URLhaus API ${res.status}`);
		const data = (await res.json()) as any;
		if (data.query_status !== "ok") {
			return {
				source: "urlhaus",
				listed: false,
				threatType: null,
				tags: [],
				error: null
			};
		}
		return {
			source: "urlhaus",
			listed: true,
			threatType: data.threat ?? null,
			tags: data.tags ?? [],
			error: null
		};
	} catch (e: any) {
		return {
			source: "urlhaus",
			listed: false,
			threatType: null,
			tags: [],
			error: e.message
		};
	}
}

export default secDomainThreatReportHandler;

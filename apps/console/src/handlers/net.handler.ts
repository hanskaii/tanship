import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

import { ApiError } from "@/helpers/errors.helper";
import { ApiResponse } from "@/helpers/response.helper";
import type { HonoEnv } from "@/types/hono.types";

const SslCheckSchema = z.object({
	domain: z.string().min(1)
});

const netHandler = new Hono<HonoEnv>().post(
	"/ssl-check",
	zValidator("json", SslCheckSchema),
	async (c) => {
		const { domain } = c.req.valid("json");
		const cleanDomain = domain
			.toLowerCase()
			.trim()
			.replace(/^(https?:\/\/)?(www\.)?/, "");

		try {
			// Query Cert Spotter free certificate transparency log API for the domain
			const res = await fetch(
				`https://api.certspotter.com/v1/issuances?dnsname=${cleanDomain}&include_subdomains=false&limit=1`
			);
			if (!res.ok) {
				throw new Error(`CertSpotter returned status ${res.status}`);
			}

			const data = (await res.json()) as any[];
			if (data.length === 0) {
				return ApiResponse.ok(
					c,
					"No certificate records found for domain",
					{
						domain: cleanDomain,
						valid: false,
						info: null
					}
				);
			}

			const latest = data[0];
			const notBefore = latest.not_before
				? new Date(latest.not_before)
				: null;
			const notAfter = latest.not_after
				? new Date(latest.not_after)
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

			return ApiResponse.ok(c, "SSL Certificate check completed", {
				domain: cleanDomain,
				valid: active,
				expired,
				daysRemaining,
				validFrom: notBefore ? notBefore.toISOString() : null,
				validTo: notAfter ? notAfter.toISOString() : null,
				issuer: latest.issuer?.common_name || "Unknown Issuer",
				dnsNames: latest.dns_names || []
			});
		} catch (err: any) {
			throw ApiError.badGateway(`SSL check failed: ${err.message}`);
		}
	}
);

export default netHandler;

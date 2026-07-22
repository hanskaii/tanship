import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

import { ApiError } from "@/helpers/errors.helper";
import { ApiResponse } from "@/helpers/response.helper";
import type { HonoEnv } from "@/types/hono.types";

const SubdomainReconSchema = z.object({
	domain: z.string().min(1)
});

const securityHandler = new Hono<HonoEnv>().post(
	"/subdomain-recon",
	zValidator("json", SubdomainReconSchema),
	async (c) => {
		const { domain } = c.req.valid("json");
		const cleanDomain = domain
			.toLowerCase()
			.trim()
			.replace(/^(https?:\/\/)?(www\.)?/, "");

		try {
			// Query crt.sh Certificate Transparency logs JSON API
			const res = await fetch(
				`https://crt.sh/?q=%.${cleanDomain}&output=json`
			);
			if (!res.ok) {
				throw new Error(`crt.sh API returned status ${res.status}`);
			}

			const data = (await res.json()) as Array<{
				common_name: string;
				name_value: string;
			}>;

			// Extract unique subdomains
			const subdomains = new Set<string>();
			for (const cert of data) {
				const names = cert.name_value.split("\n");
				for (const name of names) {
					const cleanName = name.trim().toLowerCase();
					if (
						cleanName &&
						cleanName.endsWith(cleanDomain) &&
						!cleanName.includes("*")
					) {
						subdomains.add(cleanName);
					}
				}
				const common = cert.common_name.trim().toLowerCase();
				if (
					common &&
					common.endsWith(cleanDomain) &&
					!common.includes("*")
				) {
					subdomains.add(common);
				}
			}

			const sortedSubdomains = Array.from(subdomains).sort();

			return ApiResponse.ok(c, "Subdomains gathered successfully", {
				domain: cleanDomain,
				count: sortedSubdomains.length,
				subdomains: sortedSubdomains
			});
		} catch (err: any) {
			throw ApiError.badGateway(`Subdomain recon failed: ${err.message}`);
		}
	}
);

export default securityHandler;

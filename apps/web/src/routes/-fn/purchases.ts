import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { createApiClient } from "@/routes/-fn/api-client";
import { handleError } from "@/routes/-fn/handle-error";

export interface Purchase {
	id: string;
	planSlug: string;
	licenseKey: string;
	githubUsername: string | null;
	githubInvitedAt: string | Date | null;
	createdAt: string | Date;
}

export interface ClaimGithubResult {
	githubUsername: string;
	repos: string[];
}

export interface ActivateResult {
	githubUsername: string;
	repos: string[];
	planSlug: string;
}

// ─── Fetch purchases ─────────────────────────────────────────────────────────

export const getPurchasesFn = createServerFn({ method: "GET" }).handler(() =>
	handleError(async () => {
		const api = createApiClient();
		const res = await api.api.github.status.$get();
		if (!res.ok) return [] as Purchase[];
		const json = await res.json();
		return (json.data ?? []) as Purchase[];
	})
);

export const purchasesQueryOptions = () =>
	queryOptions({
		queryKey: ["purchases"],
		queryFn: () => getPurchasesFn()
	});

// ─── Claim GitHub access ─────────────────────────────────────────────────────

export const claimGithubFn = createServerFn({ method: "POST" })
	.inputValidator((githubUsername: string) => githubUsername)
	.handler(({ data: githubUsername }) =>
		handleError(async () => {
			const api = createApiClient();
			const res = await api.api.github.claim.$post({
				json: { githubUsername }
			});
			const json = await res.json();
			if (!res.ok) {
				throw new Error(
					(json as any).message ?? "Failed to claim GitHub access"
				);
			}
			return json.data as ClaimGithubResult;
		})
	);

// ─── Activate license + GitHub access (used on /activate page) ───────────────

export interface ActivateLicenseInput {
	licenseKey: string;
	githubUsername: string;
}

export const activateLicenseFn = createServerFn({ method: "POST" })
	.inputValidator((input: ActivateLicenseInput) => input)
	.handler(({ data }) =>
		handleError(async () => {
			const api = createApiClient();
			const res = await api.api.github.activate.$post({
				json: data
			});
			const json = await res.json();
			if (!res.ok) {
				throw new Error(
					(json as any).message ?? "Failed to activate license"
				);
			}
			return json.data as ActivateResult;
		})
	);

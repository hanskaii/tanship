import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { getApi, postApi } from "@/routes/-fn/api-client";
import type { User } from "@workspace/auth";

export interface AdminUsersResult {
	users: User[];
	total: number;
}

export interface ListUsersQuery {
	limit?: number;
	offset?: number;
	sortBy?: string;
	sortDirection?: "asc" | "desc";
	searchField?: string;
	searchOperator?: string;
	searchValue?: string;
}

export const listAdminUsersFn = createServerFn({ method: "GET" })
	.inputValidator((q: ListUsersQuery) => q)
	.handler(async ({ data }) => {
		const params = new URLSearchParams();
		if (data?.limit != null) params.set("limit", String(data.limit));
		if (data?.offset != null) params.set("offset", String(data.offset));
		if (data?.sortBy) params.set("sortBy", data.sortBy);
		if (data?.sortDirection)
			params.set("sortDirection", data.sortDirection);
		if (data?.searchField) params.set("searchField", data.searchField);
		if (data?.searchOperator)
			params.set("searchOperator", data.searchOperator);
		if (data?.searchValue) params.set("searchValue", data.searchValue);

		const res = await getApi(
			`/api/auth/admin/list-users?${params.toString()}`
		);

		if (!res.ok) {
			const text = await res.text().catch(() => "");
			throw new Error(
				`Admin API error ${res.status}: ${text || res.statusText}`
			);
		}

		return (await res.json()) as AdminUsersResult;
	});

export const adminUsersQueryOptions = (query: ListUsersQuery = {}) =>
	queryOptions({
		queryKey: ["admin", "users", query],
		queryFn: () => listAdminUsersFn({ data: query })
	});

export const banUserFn = createServerFn({ method: "POST" })
	.inputValidator(
		(input: {
			userId: string;
			banReason?: string;
			banExpiresIn?: number;
		}) => input
	)
	.handler(async ({ data }) => {
		const res = await postApi("/api/auth/admin/ban-user", data);
		if (!res.ok) {
			const text = await res.text().catch(() => "");
			throw new Error(`Failed to ban user: ${text || res.statusText}`);
		}
		return res.json();
	});

export const unbanUserFn = createServerFn({ method: "POST" })
	.inputValidator((userId: string) => userId)
	.handler(async ({ data: userId }) => {
		const res = await postApi("/api/auth/admin/unban-user", { userId });
		if (!res.ok) {
			const text = await res.text().catch(() => "");
			throw new Error(`Failed to unban user: ${text || res.statusText}`);
		}
		return res.json();
	});

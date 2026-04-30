import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { fetchApi, fetchApiWithAuth } from "@/routes/-fn/api-client";
import { handleError } from "@/routes/-fn/handle-error";

export interface ShowcaseItem {
	id: string;
	submitterName: string;
	projectName: string;
	projectUrl: string;
	description: string;
	imageKey: string | null;
	twitterHandle: string | null;
	createdAt: string | Date;
}

export interface PendingShowcaseItem extends ShowcaseItem {
	userId: string | null;
	status: "pending" | "approved" | "rejected";
}

// ─── Public: list approved showcases ─────────────────────────────────────────

export const getShowcasesFn = createServerFn({ method: "GET" }).handler(() =>
	handleError(async () => {
		const res = await fetchApi("/api/showcase");
		if (!res.ok) return [] as ShowcaseItem[];
		const json = (await res.json()) as any;
		return (json.data ?? []) as ShowcaseItem[];
	})
);

export const showcasesQueryOptions = () =>
	queryOptions({
		queryKey: ["showcases"],
		queryFn: () => getShowcasesFn()
	});

// ─── Admin: list pending ──────────────────────────────────────────────────────

export const getPendingShowcasesFn = createServerFn({ method: "GET" }).handler(
	() =>
		handleError(async () => {
			const res = await fetchApiWithAuth("/api/showcase/pending");
			if (!res.ok) return [] as PendingShowcaseItem[];
			const json = (await res.json()) as any;
			return (json.data ?? []) as PendingShowcaseItem[];
		})
);

export const pendingShowcasesQueryOptions = () =>
	queryOptions({
		queryKey: ["showcases", "pending"],
		queryFn: () => getPendingShowcasesFn()
	});

// ─── Admin: approve ───────────────────────────────────────────────────────────

export const approveShowcaseFn = createServerFn({ method: "POST" })
	.inputValidator((id: string) => id)
	.handler(({ data: id }) =>
		handleError(async () => {
			const res = await fetchApiWithAuth(`/api/showcase/${id}/approve`, {
				method: "PATCH"
			});
			const json = (await res.json()) as any;
			if (!res.ok) throw new Error(json.message ?? "Failed to approve");
			return true;
		})
	);

// ─── Admin: reject ────────────────────────────────────────────────────────────

export const rejectShowcaseFn = createServerFn({ method: "POST" })
	.inputValidator((id: string) => id)
	.handler(({ data: id }) =>
		handleError(async () => {
			const res = await fetchApiWithAuth(`/api/showcase/${id}/reject`, {
				method: "PATCH"
			});
			const json = (await res.json()) as any;
			if (!res.ok) throw new Error(json.message ?? "Failed to reject");
			return true;
		})
	);

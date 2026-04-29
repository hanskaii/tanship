import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery, useQueryClient } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";
import { Button, Badge, Spinner, toast } from "@workspace/ui";
import { HugeiconsIcon } from "@hugeicons/react";
import {
	CheckmarkCircle01Icon,
	Cancel01Icon,
	GlobeIcon,
	TwitterIcon
} from "@hugeicons/core-free-icons";
import { Suspense } from "react";
import {
	pendingShowcasesQueryOptions,
	approveShowcaseFn,
	rejectShowcaseFn,
	type PendingShowcaseItem
} from "@/routes/-fn/showcase";

export const Route = createFileRoute("/(app)/_admin/s/showcase/")({
	component: AdminShowcasePage
});

function AdminShowcasePage() {
	return (
		<div className="flex flex-col gap-0 min-h-screen">
			<div className="px-6 pt-8 pb-5">
				<h1 className="text-2xl font-bold tracking-tight">
					Showcase Review
				</h1>
				<p className="text-sm text-muted-foreground mt-1">
					Approve or reject pending showcase submissions.
				</p>
			</div>

			<div className="px-6 pb-10">
				<Suspense
					fallback={
						<div className="flex flex-col gap-3">
							{Array.from({ length: 3 }).map((_, i) => (
								<div
									key={i}
									className="h-32 rounded-xl bg-muted/20 animate-pulse"
								/>
							))}
						</div>
					}
				>
					<PendingList />
				</Suspense>
			</div>
		</div>
	);
}

function PendingList() {
	const { data: pending } = useSuspenseQuery(pendingShowcasesQueryOptions());
	const queryClient = useQueryClient();

	const approveMutation = useMutation({
		mutationFn: (id: string) => approveShowcaseFn({ data: id }),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["showcases"] });
			toast.success("Showcase approved");
		},
		onError: (err: any) => toast.error(err.message ?? "Failed to approve")
	});

	const rejectMutation = useMutation({
		mutationFn: (id: string) => rejectShowcaseFn({ data: id }),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["showcases"] });
			toast.success("Showcase rejected");
		},
		onError: (err: any) => toast.error(err.message ?? "Failed to reject")
	});

	const isLoading =
		approveMutation.isPending || rejectMutation.isPending;

	if (pending.length === 0) {
		return (
			<div className="flex flex-col items-center gap-3 py-16 text-center">
				<HugeiconsIcon
					icon={CheckmarkCircle01Icon}
					className="size-10 text-emerald-500/40"
				/>
				<p className="text-sm text-muted-foreground">
					No pending submissions. All caught up!
				</p>
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-4">
			<p className="text-xs text-muted-foreground">
				{pending.length} pending submission{pending.length !== 1 ? "s" : ""}
			</p>

			{pending.map((item: PendingShowcaseItem) => (
				<ShowcaseReviewCard
					key={item.id}
					item={item}
					isLoading={isLoading}
					onApprove={() => approveMutation.mutate(item.id)}
					onReject={() => rejectMutation.mutate(item.id)}
				/>
			))}
		</div>
	);
}

function ShowcaseReviewCard({
	item,
	isLoading,
	onApprove,
	onReject
}: {
	item: PendingShowcaseItem;
	isLoading: boolean;
	onApprove: () => void;
	onReject: () => void;
}) {
	const imageUrl = item.imageKey ? `/api/files/${item.imageKey}` : null;

	return (
		<div className="rounded-xl border border-border/50 bg-muted/5 overflow-hidden">
			<div className="flex gap-4 p-4">
				{/* Thumbnail */}
				{imageUrl && (
					<div className="shrink-0 w-28 h-20 rounded-lg overflow-hidden bg-muted/20">
						<img
							src={imageUrl}
							alt={item.projectName}
							className="w-full h-full object-cover"
						/>
					</div>
				)}

				{/* Info */}
				<div className="flex-1 min-w-0 flex flex-col gap-2">
					<div className="flex items-start justify-between gap-2">
						<div>
							<h3 className="font-bold text-sm">{item.projectName}</h3>
							<p className="text-[11px] text-muted-foreground">
								by {item.submitterName}
							</p>
						</div>
						<Badge
							variant="secondary"
							className="text-[9px] shrink-0 bg-yellow-500/10 text-yellow-600 border-yellow-500/20"
						>
							Pending
						</Badge>
					</div>

					<p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2">
						{item.description}
					</p>

					<div className="flex items-center gap-3">
						<a
							href={item.projectUrl}
							target="_blank"
							rel="noreferrer"
							className="inline-flex items-center gap-1 text-[11px] text-primary hover:opacity-80 transition-opacity"
						>
							<HugeiconsIcon icon={GlobeIcon} className="size-3" />
							{item.projectUrl.replace(/^https?:\/\//, "")}
						</a>
						{item.twitterHandle && (
							<a
								href={`https://twitter.com/${item.twitterHandle}`}
								target="_blank"
								rel="noreferrer"
								className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-primary transition-colors"
							>
								<HugeiconsIcon
									icon={TwitterIcon}
									className="size-3"
								/>
								@{item.twitterHandle}
							</a>
						)}
					</div>
				</div>
			</div>

			{/* Actions */}
			<div className="flex items-center gap-2 px-4 py-3 border-t border-border/30 bg-muted/5">
				<Button
					size="sm"
					className="h-7 text-[11px] bg-emerald-500 hover:bg-emerald-600 text-white"
					onClick={onApprove}
					disabled={isLoading}
				>
					{isLoading ? (
						<Spinner className="size-3 mr-1" />
					) : (
						<HugeiconsIcon
							icon={CheckmarkCircle01Icon}
							className="size-3 mr-1.5"
						/>
					)}
					Approve
				</Button>
				<Button
					size="sm"
					variant="outline"
					className="h-7 text-[11px] text-red-500 border-red-500/30 hover:bg-red-500/5"
					onClick={onReject}
					disabled={isLoading}
				>
					<HugeiconsIcon
						icon={Cancel01Icon}
						className="size-3 mr-1.5"
					/>
					Reject
				</Button>
				<span className="text-[10px] text-muted-foreground ml-auto">
					{new Date(item.createdAt).toLocaleDateString("en-US", {
						month: "short",
						day: "numeric",
						year: "numeric"
					})}
				</span>
			</div>
		</div>
	);
}

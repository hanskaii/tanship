import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Badge, Button, Input, Spinner, toast } from "@workspace/ui";
import { HugeiconsIcon } from "@hugeicons/react";
import {
	GithubIcon,
	CheckmarkCircle01Icon,
	Copy01Icon,
	FlashIcon
} from "@hugeicons/core-free-icons";
import { claimGithubFn, type Purchase } from "@/routes/-fn/purchases";

function CopyButton({ text }: { text: string }) {
	const [copied, setCopied] = useState(false);
	const handleCopy = async () => {
		await navigator.clipboard.writeText(text);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};
	return (
		<Button
			variant="ghost"
			size="sm"
			className="h-7 px-2 text-[11px] shrink-0"
			onClick={handleCopy}
		>
			<HugeiconsIcon icon={Copy01Icon} className="size-3.5 mr-1" />
			{copied ? "Copied!" : "Copy"}
		</Button>
	);
}

function GithubClaimForm({ purchaseId: _purchaseId }: { purchaseId: string }) {
	const [username, setUsername] = useState("");
	const [isClaiming, setIsClaiming] = useState(false);
	const queryClient = useQueryClient();

	const handleClaim = async () => {
		const trimmed = username.trim();
		if (!trimmed) return;
		setIsClaiming(true);
		try {
			await claimGithubFn({ data: trimmed });
			await queryClient.invalidateQueries({ queryKey: ["purchases"] });
			toast.success(
				"GitHub invitation sent! Check your GitHub notifications."
			);
		} catch (err: any) {
			toast.error(err.message ?? "Failed to send invitation");
		} finally {
			setIsClaiming(false);
		}
	};

	return (
		<div className="flex flex-col gap-3 pt-3 border-t border-border/50">
			<div className="flex flex-col gap-0.5">
				<p className="text-xs font-medium text-foreground">
					Claim GitHub Repository Access
				</p>
				<p className="text-[11px] text-muted-foreground">
					Enter your GitHub username to receive a repository
					invitation.
				</p>
			</div>
			<div className="flex items-center gap-2">
				<div className="relative flex-1">
					<span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">
						@
					</span>
					<Input
						className="pl-6 h-8 text-xs"
						placeholder="your-github-username"
						value={username}
						onChange={(e) => setUsername(e.target.value)}
						onKeyDown={(e) =>
							e.key === "Enter" && !isClaiming && handleClaim()
						}
						disabled={isClaiming}
					/>
				</div>
				<Button
					size="sm"
					className="h-8 text-xs shrink-0"
					onClick={handleClaim}
					disabled={isClaiming || !username.trim()}
				>
					{isClaiming ? (
						<Spinner className="size-3.5 mr-1.5" />
					) : (
						<HugeiconsIcon
							icon={GithubIcon}
							className="size-3.5 mr-1.5"
						/>
					)}
					{isClaiming ? "Sending..." : "Claim Access"}
				</Button>
			</div>
		</div>
	);
}

function PurchaseCard({ purchase }: { purchase: Purchase }) {
	const isClaimed = !!purchase.githubInvitedAt;

	return (
		<div className="rounded-xl border border-border bg-muted/10 p-5 flex flex-col gap-4">
			<div className="flex items-start justify-between gap-3">
				<div className="flex items-center gap-3">
					<div className="flex items-center justify-center size-9 rounded-xl bg-primary/10 shrink-0">
						<HugeiconsIcon
							icon={FlashIcon}
							className="size-4.5 text-primary"
						/>
					</div>
					<div className="flex flex-col gap-0.5">
						<p className="text-sm font-semibold leading-tight capitalize">
							{purchase.planSlug === "tanflare-pro"
								? "Tanflare Pro"
								: "Tanflare"}
						</p>
						<Badge
							variant="secondary"
							className="w-fit text-[10px] px-1.5 py-0 h-4 bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
						>
							Lifetime
						</Badge>
					</div>
				</div>
				{isClaimed && (
					<div className="flex items-center gap-1.5 text-[11px] text-emerald-600 shrink-0">
						<HugeiconsIcon
							icon={CheckmarkCircle01Icon}
							className="size-3.5"
						/>
						GitHub access granted
					</div>
				)}
			</div>

			{/* License Key */}
			<div className="flex flex-col gap-1.5">
				<div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
					License Key
				</div>
				<div className="flex items-center gap-2 bg-muted/30 border border-border/60 rounded-lg px-3 py-2">
					<code className="text-[11px] font-mono text-foreground/80 flex-1 truncate">
						{purchase.licenseKey}
					</code>
					<CopyButton text={purchase.licenseKey} />
				</div>
			</div>

			{/* GitHub status */}
			{isClaimed ? (
				<div className="flex items-center gap-2 text-[11px] text-muted-foreground border-t border-border/50 pt-3">
					<HugeiconsIcon icon={GithubIcon} className="size-3.5" />
					Repository access granted to{" "}
					<span className="font-semibold text-foreground">
						@{purchase.githubUsername}
					</span>
				</div>
			) : (
				<GithubClaimForm purchaseId={purchase.id} />
			)}
		</div>
	);
}

export function LicensesSection({ purchases }: { purchases: Purchase[] }) {
	if (purchases.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center gap-3 py-10 rounded-xl border border-dashed border-border text-center">
				<HugeiconsIcon
					icon={FlashIcon}
					className="size-7 text-muted-foreground/40"
				/>
				<div className="flex flex-col gap-1">
					<p className="text-sm font-medium text-muted-foreground">
						No licenses yet
					</p>
					<p className="text-xs text-muted-foreground/60">
						Purchase a plan to get your license key and GitHub
						access.
					</p>
				</div>
				<Button size="sm" className="h-8 text-xs mt-1" asChild>
					<a href="/#pricing">View Plans</a>
				</Button>
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-3">
			{purchases.map((purchase) => (
				<PurchaseCard key={purchase.id} purchase={purchase} />
			))}
		</div>
	);
}

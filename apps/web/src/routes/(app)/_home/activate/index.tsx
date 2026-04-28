import { createFileRoute, Link } from "@tanstack/react-router";
import { Badge, Button, Input, Spinner } from "@workspace/ui";
import { motion } from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import {
	FlashIcon,
	GithubIcon,
	CheckmarkCircle01Icon,
	ArrowRight01Icon
} from "@hugeicons/core-free-icons";
import { authClient } from "@/auth/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { toast } from "@workspace/ui";
import {
	purchasesQueryOptions,
	activateLicenseFn,
	type Purchase
} from "@/routes/-fn/purchases";

export const Route = createFileRoute("/(app)/_home/activate/")({
	component: ActivatePage
});

function ActivatePage() {
	const { data: session } = authClient.useSession();
	const queryClient = useQueryClient();

	const [githubUsername, setGithubUsername] = useState("");
	const [isActivating, setIsActivating] = useState(false);
	const [activated, setActivated] = useState<{
		githubUsername: string;
		planSlug: string;
	} | null>(null);

	// Poll for unclaimed purchase (webhook may be slightly delayed)
	const [pollCount, setPollCount] = useState(0);
	const maxPolls = 15; // ~30 seconds at 2s interval

	const { data: purchases, isLoading } = useQuery({
		...purchasesQueryOptions(),
		enabled: !!session?.user,
		refetchInterval:
			session?.user && pollCount < maxPolls && !activated ? 2000 : false
	});

	const unclaimedPurchase = purchases?.find((p: Purchase) => !p.githubInvitedAt);

	// Increment poll count on each refetch
	useEffect(() => {
		if (purchases !== undefined) {
			setPollCount((c) => c + 1);
		}
	}, [purchases]);

	const handleActivate = async () => {
		if (!unclaimedPurchase || !githubUsername.trim()) return;

		setIsActivating(true);
		try {
			const result = await activateLicenseFn({
				data: {
					licenseKey: unclaimedPurchase.licenseKey,
					githubUsername: githubUsername.trim()
				}
			});
			await queryClient.invalidateQueries({ queryKey: ["purchases"] });
			setActivated({
				githubUsername: result.githubUsername,
				planSlug: result.planSlug
			});
			toast.success("License activated! GitHub invitation sent.");
		} catch (err: any) {
			toast.error(err.message ?? "Activation failed. Please try again.");
		} finally {
			setIsActivating(false);
		}
	};

	return (
		<div className="relative flex min-h-screen flex-col items-center bg-background overflow-hidden">
			{/* Background */}
			<div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
				<div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-30" />
				<div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-30" />
				<div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
			</div>

			<main className="relative z-10 mt-28 mb-32 flex w-full max-w-lg flex-col items-center px-6">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5 }}
					className="w-full flex flex-col items-center gap-8"
				>
					{/* Header */}
					<div className="flex flex-col items-center text-center gap-4">
						<div className="flex items-center justify-center size-14 rounded-2xl bg-primary/10 border border-primary/20">
							<HugeiconsIcon
								icon={FlashIcon}
								className="size-7 text-primary"
							/>
						</div>
						<div className="flex flex-col gap-2">
							<Badge
								variant="secondary"
								className="px-3 py-0.5 bg-primary/5 text-primary border-primary/20 text-[10px] uppercase tracking-wider font-bold mx-auto"
							>
								Activation
							</Badge>
							<h1 className="text-2xl font-extrabold tracking-tight">
								Activate your license
							</h1>
							<p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
								Enter your GitHub username to activate your license
								and receive a repository invitation.
							</p>
						</div>
					</div>

					{/* Card */}
					<div className="w-full rounded-2xl border border-border bg-muted/10 backdrop-blur-sm p-6 flex flex-col gap-6">
						{/* Not logged in */}
						{!session?.user && (
							<div className="flex flex-col items-center gap-4 py-4">
								<p className="text-sm text-muted-foreground text-center">
									Sign in to activate your license.
								</p>
								<Button size="sm" className="rounded-full px-6 h-9 text-xs" asChild>
									<Link to="/login">
										<HugeiconsIcon
											icon={ArrowRight01Icon}
											className="size-3.5 mr-2"
										/>
										Sign in
									</Link>
								</Button>
							</div>
						)}

						{/* Success state */}
						{activated && (
							<motion.div
								initial={{ opacity: 0, scale: 0.95 }}
								animate={{ opacity: 1, scale: 1 }}
								className="flex flex-col items-center gap-4 py-4 text-center"
							>
								<div className="flex items-center justify-center size-12 rounded-full bg-emerald-500/10 border border-emerald-500/20">
									<HugeiconsIcon
										icon={CheckmarkCircle01Icon}
										className="size-6 text-emerald-500"
									/>
								</div>
								<div className="flex flex-col gap-1.5">
									<p className="text-base font-bold">
										License activated!
									</p>
									<p className="text-sm text-muted-foreground leading-relaxed">
										A GitHub invitation has been sent to{" "}
										<span className="font-semibold text-foreground">
											@{activated.githubUsername}
										</span>
										. Check your GitHub notifications to accept.
									</p>
								</div>
								<div className="flex gap-2 mt-2">
									<Button
										size="sm"
										variant="outline"
										className="rounded-full px-5 h-9 text-xs"
										asChild
									>
										<a
											href="https://github.com/notifications"
											target="_blank"
											rel="noreferrer"
										>
											<HugeiconsIcon
												icon={GithubIcon}
												className="size-3.5 mr-1.5"
											/>
											Open GitHub
										</a>
									</Button>
									<Button
										size="sm"
										className="rounded-full px-5 h-9 text-xs"
										asChild
									>
										<Link to="/account/billing">View billing</Link>
									</Button>
								</div>
							</motion.div>
						)}

						{/* Logged in, not yet activated */}
						{session?.user && !activated && (
							<>
								{/* Waiting for webhook */}
								{isLoading || (!unclaimedPurchase && pollCount < maxPolls) ? (
									<div className="flex flex-col items-center gap-3 py-4">
										<Spinner className="size-5 text-muted-foreground" />
										<p className="text-sm text-muted-foreground text-center">
											Confirming your purchase…
										</p>
									</div>
								) : !unclaimedPurchase ? (
									/* No unclaimed purchase found */
									<div className="flex flex-col items-center gap-4 py-4 text-center">
										<p className="text-sm text-muted-foreground">
											No pending activation found for your account.
										</p>
										<div className="flex gap-2">
											<Button
												size="sm"
												variant="outline"
												className="rounded-full px-5 h-9 text-xs"
												asChild
											>
												<Link to="/account/billing">
													View billing
												</Link>
											</Button>
											<Button
												size="sm"
												className="rounded-full px-5 h-9 text-xs"
												asChild
											>
												<Link to="/">Buy a plan</Link>
											</Button>
										</div>
									</div>
								) : (
									/* Activation form */
									<div className="flex flex-col gap-5">
										{/* Plan badge */}
										<div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 border border-border/60">
											<div className="flex items-center justify-center size-8 rounded-lg bg-primary/10 shrink-0">
												<HugeiconsIcon
													icon={FlashIcon}
													className="size-4 text-primary"
												/>
											</div>
											<div className="flex flex-col gap-0.5 flex-1 min-w-0">
												<p className="text-xs font-semibold">
													{unclaimedPurchase.planSlug === "tanflare-pro"
														? "Tanflare Pro"
														: "Tanflare"}
												</p>
												<p className="text-[11px] text-muted-foreground font-mono truncate">
													{unclaimedPurchase.licenseKey}
												</p>
											</div>
											<Badge
												variant="secondary"
												className="text-[9px] px-1.5 py-0 h-4 bg-emerald-500/10 text-emerald-600 border-emerald-500/20 shrink-0"
											>
												Purchased
											</Badge>
										</div>

										{/* GitHub username input */}
										<div className="flex flex-col gap-2">
											<label className="text-xs font-semibold">
												GitHub username
											</label>
											<div className="relative">
												<span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
													@
												</span>
												<Input
													className="pl-7 h-10 text-sm"
													placeholder="your-github-username"
													value={githubUsername}
													onChange={(e) =>
														setGithubUsername(e.target.value)
													}
													onKeyDown={(e) =>
														e.key === "Enter" &&
														!isActivating &&
														handleActivate()
													}
													disabled={isActivating}
												/>
											</div>
											<p className="text-[11px] text-muted-foreground">
												This will be used as the device name in your license and to invite you to the GitHub repository.
											</p>
										</div>

										<Button
											className="w-full h-10 text-sm font-semibold"
											onClick={handleActivate}
											disabled={
												isActivating || !githubUsername.trim()
											}
										>
											{isActivating ? (
												<Spinner className="size-4 mr-2" />
											) : (
												<HugeiconsIcon
													icon={GithubIcon}
													className="size-4 mr-2"
												/>
											)}
											{isActivating
												? "Activating…"
												: "Activate & Get GitHub Access"}
										</Button>
									</div>
								)}
							</>
						)}
					</div>

					{/* Footer hint */}
					{!activated && (
						<p className="text-[11px] text-muted-foreground text-center">
							Already activated?{" "}
							<Link
								to="/account/billing"
								className="underline underline-offset-2 hover:text-foreground transition-colors"
							>
								View your billing page
							</Link>
						</p>
					)}
				</motion.div>
			</main>
		</div>
	);
}

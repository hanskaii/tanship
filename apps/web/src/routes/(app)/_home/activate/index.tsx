import { createFileRoute, Link } from "@tanstack/react-router";
import { Badge, Button, Input, Spinner } from "@workspace/ui";
import { motion } from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import {
	FlashIcon,
	GithubIcon,
	CheckmarkCircle01Icon,
	ArrowRight01Icon,
	Download01Icon
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

function planDisplayName(slug: string) {
	if (slug === "tanflare-pro") return "Tanflare Pro";
	if (slug === "tanflare") return "Tanflare";
	if (slug.startsWith("template-")) {
		const id = slug.replace("template-", "");
		return (
			id
				.split("-")
				.map((w) => w[0].toUpperCase() + w.slice(1))
				.join(" ") + " Template"
		);
	}
	return slug;
}

function templateIdFromSlug(slug: string) {
	return slug.replace("template-", "");
}

function ActivatePage() {
	const { data: session } = authClient.useSession();
	const queryClient = useQueryClient();

	const [githubUsername, setGithubUsername] = useState("");
	const [isActivating, setIsActivating] = useState(false);
	const [activated, setActivated] = useState<{
		githubUsername: string;
		planSlug: string;
	} | null>(null);

	// Poll for any new purchase (webhook may be slightly delayed)
	const [pollCount, setPollCount] = useState(0);
	const maxPolls = 15; // ~30 seconds at 2s interval

	const { data: purchases, isLoading } = useQuery({
		...purchasesQueryOptions(),
		enabled: !!session?.user,
		refetchInterval:
			session?.user && pollCount < maxPolls && !activated ? 2000 : false
	});

	useEffect(() => {
		if (purchases !== undefined) {
			setPollCount((c) => c + 1);
		}
	}, [purchases]);

	// Most recent purchase — sorted desc by createdAt
	const latestPurchase = purchases
		?.slice()
		.sort(
			(a, b) =>
				new Date(b.createdAt).getTime() -
				new Date(a.createdAt).getTime()
		)[0];

	const isTemplatePurchase = latestPurchase?.planSlug.startsWith("template-");

	// Unclaimed boilerplate purchase (needs GitHub activation)
	const unclaimedBoilerplatePurchase = purchases?.find(
		(p: Purchase) =>
			!p.githubInvitedAt && !p.planSlug.startsWith("template-")
	);

	const handleActivate = async () => {
		if (!unclaimedBoilerplatePurchase || !githubUsername.trim()) return;

		setIsActivating(true);
		try {
			const result = await activateLicenseFn({
				data: {
					licenseKey: unclaimedBoilerplatePurchase.licenseKey,
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

	// Determine what to show once purchases are loaded
	const hasPurchase = !!latestPurchase;
	const isWaiting =
		isLoading || (!hasPurchase && pollCount < maxPolls && !activated);

	return (
		<div className="relative flex min-h-screen flex-col items-center bg-background overflow-hidden pt-24 pb-32 px-4 sm:px-6">
			{/* Background */}
			<div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
				<div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
			</div>

			<main className="relative z-10 flex w-full max-w-lg flex-col items-center mx-auto">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5 }}
					className="w-full flex flex-col items-center gap-8"
				>
					{/* Header */}
					<div className="flex flex-col items-center text-center gap-4">
						<div className="flex items-center justify-center size-14 rounded-none bg-muted/10 border border-border/50">
							<HugeiconsIcon
								icon={FlashIcon}
								className="size-6 text-foreground"
							/>
						</div>
						<div className="flex flex-col gap-3 mt-2">
							<Badge
								variant="secondary"
								className="w-fit px-3 py-1 bg-muted/30 text-foreground border border-border/50 text-[10px] uppercase tracking-widest font-bold mx-auto rounded-full"
							>
								{isTemplatePurchase ? "Download" : "Activation"}
							</Badge>
							<h1 className="text-3xl font-semibold tracking-tight">
								{isTemplatePurchase
									? "Your template is ready"
									: "Activate your license"}
							</h1>
							<p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
								{isTemplatePurchase
									? "Download your template zip file to get started."
									: "Enter your GitHub username to activate your license and receive a repository invitation."}
							</p>
						</div>
					</div>

					{/* Card */}
					<div className="w-full rounded-none border border-border/60 bg-background shadow-sm p-8 flex flex-col gap-6">
						{/* Not logged in */}
						{!session?.user && (
							<div className="flex flex-col items-center gap-4 py-4">
								<p className="text-sm text-muted-foreground text-center">
									Sign in to access your purchase.
								</p>
								<Button
									size="lg"
									className="rounded-none px-6 h-12 text-sm font-medium bg-foreground text-background hover:bg-foreground/90"
									asChild
								>
									<Link to="/login">
										Sign in
										<HugeiconsIcon
											icon={ArrowRight01Icon}
											className="size-4 ml-2"
										/>
									</Link>
								</Button>
							</div>
						)}

						{/* GitHub activation success */}
						{activated && (
							<motion.div
								initial={{ opacity: 0, scale: 0.95 }}
								animate={{ opacity: 1, scale: 1 }}
								className="flex flex-col items-center gap-4 py-4 text-center"
							>
								<div className="flex items-center justify-center size-12 rounded-none bg-emerald-500/10 border border-emerald-500/20">
									<HugeiconsIcon
										icon={CheckmarkCircle01Icon}
										className="size-6 text-emerald-500"
									/>
								</div>
								<div className="flex flex-col gap-2">
									<p className="text-lg font-semibold">
										License activated!
									</p>
									<p className="text-sm text-muted-foreground leading-relaxed">
										A GitHub invitation has been sent to{" "}
										<span className="font-medium text-foreground">
											@{activated.githubUsername}
										</span>
										. Check your GitHub notifications to
										accept.
									</p>
								</div>
								<div className="flex flex-col sm:flex-row gap-3 w-full mt-4">
									<Button
										size="lg"
										variant="outline"
										className="w-full rounded-none h-12 text-sm font-medium border-border/50 hover:bg-muted/10"
										asChild
									>
										<a
											href="https://github.com/notifications"
											target="_blank"
											rel="noreferrer"
										>
											<HugeiconsIcon
												icon={GithubIcon}
												className="size-4 mr-2"
											/>
											Open GitHub
										</a>
									</Button>
									<Button
										size="lg"
										className="w-full rounded-none h-12 text-sm font-medium bg-foreground text-background hover:bg-foreground/90"
										asChild
									>
										<Link to="/account/billing">
											View billing
										</Link>
									</Button>
								</div>
							</motion.div>
						)}

						{/* Logged in, not yet shown success */}
						{session?.user && !activated && (
							<>
								{/* Waiting for webhook */}
								{isWaiting && (
									<div className="flex flex-col items-center gap-4 py-8">
										<Spinner className="size-6 text-muted-foreground" />
										<p className="text-sm font-medium text-muted-foreground text-center animate-pulse">
											Confirming your purchase…
										</p>
									</div>
								)}

								{/* No purchase found after polling */}
								{!isWaiting && !hasPurchase && (
									<div className="flex flex-col items-center gap-4 py-4 text-center">
										<p className="text-sm text-muted-foreground">
											No pending purchase found for your
											account.
										</p>
										<div className="flex flex-col sm:flex-row gap-3 w-full mt-2">
											<Button
												size="lg"
												variant="outline"
												className="w-full rounded-none h-12 text-sm font-medium border-border/50 hover:bg-muted/10"
												asChild
											>
												<Link to="/account/billing">
													View billing
												</Link>
											</Button>
											<Button
												size="lg"
												className="w-full rounded-none h-12 text-sm font-medium bg-foreground text-background hover:bg-foreground/90"
												asChild
											>
												<Link to="/">Buy a plan</Link>
											</Button>
										</div>
									</div>
								)}

								{/* Template purchase — show download */}
								{!isWaiting &&
									hasPurchase &&
									isTemplatePurchase && (
										<div className="flex flex-col gap-6">
											{/* Plan info */}
											<div className="flex items-center gap-4 p-4 rounded-none bg-muted/5 border border-border/50">
												<div className="flex items-center justify-center size-10 rounded-none bg-background border border-border/50 shrink-0">
													<HugeiconsIcon
														icon={FlashIcon}
														className="size-5 text-foreground"
													/>
												</div>
												<div className="flex flex-col gap-1 flex-1 min-w-0">
													<p className="text-sm font-semibold">
														{planDisplayName(
															latestPurchase.planSlug
														)}
													</p>
													<p className="text-xs text-muted-foreground font-mono truncate">
														{
															latestPurchase.licenseKey
														}
													</p>
												</div>
												<Badge
													variant="secondary"
													className="text-[10px] uppercase tracking-widest px-2 py-0.5 bg-muted/10 text-foreground border border-border/50 shrink-0 rounded-none"
												>
													Purchased
												</Badge>
											</div>

											<div className="flex flex-col items-center gap-4 py-4 text-center">
												<div className="flex items-center justify-center size-12 rounded-none bg-emerald-500/10 border border-emerald-500/20">
													<HugeiconsIcon
														icon={
															CheckmarkCircle01Icon
														}
														className="size-6 text-emerald-500"
													/>
												</div>
												<p className="text-sm text-muted-foreground leading-relaxed">
													Your template is ready to
													download. You can
													re-download anytime from the{" "}
													<Link
														to="/templates"
														className="underline underline-offset-4 hover:text-foreground transition-colors font-medium text-foreground"
													>
														Templates page
													</Link>
													.
												</p>
											</div>

											<a
												href={`/api/templates/${templateIdFromSlug(latestPurchase.planSlug)}/download`}
												download
											>
												<Button
													size="lg"
													className="w-full h-12 rounded-none text-sm font-medium bg-foreground text-background hover:bg-foreground/90"
												>
													<HugeiconsIcon
														icon={Download01Icon}
														className="size-4 mr-2"
													/>
													Download Template
												</Button>
											</a>
										</div>
									)}

								{/* Boilerplate purchase — show GitHub form */}
								{!isWaiting &&
									hasPurchase &&
									!isTemplatePurchase &&
									unclaimedBoilerplatePurchase && (
										<div className="flex flex-col gap-6">
											{/* Plan info */}
											<div className="flex items-center gap-4 p-4 rounded-none bg-muted/5 border border-border/50">
												<div className="flex items-center justify-center size-10 rounded-none bg-background border border-border/50 shrink-0">
													<HugeiconsIcon
														icon={FlashIcon}
														className="size-5 text-foreground"
													/>
												</div>
												<div className="flex flex-col gap-1 flex-1 min-w-0">
													<p className="text-sm font-semibold">
														{planDisplayName(
															unclaimedBoilerplatePurchase.planSlug
														)}
													</p>
													<p className="text-xs text-muted-foreground font-mono truncate">
														{
															unclaimedBoilerplatePurchase.licenseKey
														}
													</p>
												</div>
												<Badge
													variant="secondary"
													className="text-[10px] uppercase tracking-widest px-2 py-0.5 bg-muted/10 text-foreground border border-border/50 shrink-0 rounded-none"
												>
													Purchased
												</Badge>
											</div>

											<div className="flex flex-col gap-3">
												<label className="text-sm font-medium">
													GitHub username
												</label>
												<div className="relative">
													<span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
														@
													</span>
													<Input
														className="pl-8 h-12 text-sm rounded-none border-border/60 focus-visible:ring-foreground bg-transparent"
														placeholder="your-github-username"
														value={githubUsername}
														onChange={(e) =>
															setGithubUsername(
																e.target.value
															)
														}
														onKeyDown={(e) =>
															e.key === "Enter" &&
															!isActivating &&
															handleActivate()
														}
														disabled={isActivating}
													/>
												</div>
												<p className="text-xs text-muted-foreground leading-relaxed">
													Used as the device name in
													your license and to invite
													you to the GitHub
													repository.
												</p>
											</div>

											<Button
												size="lg"
												className="w-full h-12 rounded-none text-sm font-medium bg-foreground text-background hover:bg-foreground/90 mt-2"
												onClick={handleActivate}
												disabled={
													isActivating ||
													!githubUsername.trim()
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

								{/* All boilerplate purchases already claimed */}
								{!isWaiting &&
									hasPurchase &&
									!isTemplatePurchase &&
									!unclaimedBoilerplatePurchase && (
										<div className="flex flex-col items-center gap-5 py-4 text-center">
											<div className="flex items-center justify-center size-12 rounded-none bg-emerald-500/10 border border-emerald-500/20">
												<HugeiconsIcon
													icon={CheckmarkCircle01Icon}
													className="size-6 text-emerald-500"
												/>
											</div>
											<p className="text-sm text-muted-foreground leading-relaxed">
												Your license is already
												activated. Check your GitHub
												notifications for the repository
												invitation.
											</p>
											<div className="flex flex-col sm:flex-row gap-3 w-full mt-2">
												<Button
													size="lg"
													variant="outline"
													className="w-full rounded-none h-12 text-sm font-medium border-border/50 hover:bg-muted/10"
													asChild
												>
													<a
														href="https://github.com/notifications"
														target="_blank"
														rel="noreferrer"
													>
														<HugeiconsIcon
															icon={GithubIcon}
															className="size-4 mr-2"
														/>
														GitHub
													</a>
												</Button>
												<Button
													size="lg"
													className="w-full rounded-none h-12 text-sm font-medium bg-foreground text-background hover:bg-foreground/90"
													asChild
												>
													<Link to="/account/billing">
														View billing
													</Link>
												</Button>
											</div>
										</div>
									)}
							</>
						)}
					</div>

					{!activated && (
						<p className="text-xs text-muted-foreground text-center">
							Need help?{" "}
							<a
								href="mailto:support@tanflare.com"
								className="underline underline-offset-4 hover:text-foreground transition-colors text-foreground font-medium"
							>
								Contact support
							</a>
						</p>
					)}
				</motion.div>
			</main>
		</div>
	);
}

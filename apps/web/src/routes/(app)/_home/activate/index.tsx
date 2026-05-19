import { createFileRoute, Link } from "@tanstack/react-router";
import { Badge, Button, Input, Spinner } from "@workspace/ui";
import { motion } from "framer-motion";
import { EASE_OUT_EXPO } from "../-lib/motion";
import { HugeiconsIcon } from "@hugeicons/react";
import {
	FlashIcon,
	GithubIcon,
	CheckmarkCircle01Icon,
	ArrowRight01Icon,
	Download01Icon,
	Search01Icon
} from "@hugeicons/core-free-icons";
import { authClient } from "@/auth/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "@workspace/ui";
import {
	purchasesQueryOptions,
	activateLicenseFn,
	type Purchase
} from "@/routes/-fn/purchases";
import { FooterSection } from "../-components/footer-section";

export const Route = createFileRoute("/(app)/_home/activate/")({
	validateSearch: (search: Record<string, unknown>) => ({
		license: typeof search.license === "string" ? search.license : undefined
	}),
	component: ActivatePage
});

function planDisplayName(slug: string) {
	if (slug === "tanship-pro") return "Tanship Pro";
	if (slug === "tanship") return "Tanship";
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
	const { license: licenseParam } = Route.useSearch();
	const { data: session } = authClient.useSession();
	const queryClient = useQueryClient();

	const [licenseKey, setLicenseKey] = useState(licenseParam ?? "");
	const [submittedKey, setSubmittedKey] = useState(licenseParam ?? "");
	const [githubUsername, setGithubUsername] = useState("");
	const [isActivating, setIsActivating] = useState(false);
	const [activated, setActivated] = useState<{
		githubUsername: string;
	} | null>(null);

	const { data: purchases, isLoading } = useQuery({
		...purchasesQueryOptions(),
		enabled: !!session?.user
	});

	const matchedPurchase =
		purchases?.find(
			(p: Purchase) => p.licenseKey === submittedKey.trim()
		) ?? null;
	const isTemplate =
		matchedPurchase?.planSlug.startsWith("template-") ?? false;
	const isAlreadyActivated = !!matchedPurchase?.githubInvitedAt;

	const handleLookup = () => {
		setActivated(null);
		setGithubUsername("");
		setSubmittedKey(licenseKey);
	};

	const handleActivate = async () => {
		if (!matchedPurchase || !githubUsername.trim()) return;
		setIsActivating(true);
		try {
			const result = await activateLicenseFn({
				data: {
					licenseKey: matchedPurchase.licenseKey,
					githubUsername: githubUsername.trim()
				}
			});
			await queryClient.invalidateQueries({ queryKey: ["purchases"] });
			setActivated({ githubUsername: result.githubUsername });
			toast.success("License activated! GitHub invitation sent.");
		} catch (err: any) {
			toast.error(err.message ?? "Activation failed. Please try again.");
		} finally {
			setIsActivating(false);
		}
	};

	return (
		<>
			<main className="px-4 sm:px-6 pb-32 pt-24">
				<motion.section
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5, ease: EASE_OUT_EXPO }}
					className="flex flex-col gap-6 mb-16 border-b border-border/40 pb-16"
				>
					<div className="flex items-center gap-2">
						<div className="h-1.5 w-1.5 rounded-full bg-primary" />
						<span className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
							Activate
						</span>
					</div>
					<h1
						className="font-heading font-medium text-foreground"
						style={{
							fontSize: "clamp(2rem, 5vw, 3rem)",
							letterSpacing: "-0.04em",
							lineHeight: "1.05"
						}}
					>
						Activate your license
					</h1>
					<p
						className="max-w-xl text-base text-muted-foreground leading-relaxed"
						style={{ letterSpacing: "-0.01em" }}
					>
						Enter your license key to download your template or get
						access to the GitHub repository.
					</p>
				</motion.section>

				{!session?.user ? (
					<div className="rounded-2xl bg-secondary p-2">
						<div className="rounded-xl bg-card px-6 py-12 flex flex-col items-center gap-4 text-center">
							<p className="text-sm text-muted-foreground">
								Sign in to activate your license.
							</p>
							<Button
								size="lg"
								className="h-11 px-6 text-sm font-medium bg-foreground text-background hover:bg-foreground/90"
								asChild
							>
								<Link to="/login">
									Sign in
									<HugeiconsIcon
										icon={ArrowRight01Icon}
										className="ml-2 size-4"
									/>
								</Link>
							</Button>
						</div>
					</div>
				) : (
					<div className="flex flex-col gap-3">
						{/* License key input */}
						<div className="rounded-2xl bg-secondary p-2">
							<div className="rounded-xl bg-card px-6 py-8 flex flex-col gap-5">
								<div className="flex flex-col gap-1.5">
									<label
										htmlFor="license-key"
										className="text-sm font-medium text-foreground"
									>
										License key
									</label>
									<p className="text-xs text-muted-foreground">
										Found in your purchase confirmation
										email.
									</p>
								</div>
								<div className="flex gap-2">
									<Input
										id="license-key"
										placeholder="XXXX-XXXX-XXXX-XXXX"
										value={licenseKey}
										onChange={(e) =>
											setLicenseKey(e.target.value)
										}
										onKeyDown={(e) =>
											e.key === "Enter" && handleLookup()
										}
										className="font-mono text-sm"
									/>
									<Button
										className="h-10 shrink-0 px-5 text-sm font-medium bg-foreground text-background hover:bg-foreground/90"
										onClick={handleLookup}
										disabled={
											!licenseKey.trim() || isLoading
										}
									>
										{isLoading ? (
											<Spinner className="size-4" />
										) : (
											<>
												<HugeiconsIcon
													icon={Search01Icon}
													className="size-4 mr-2"
												/>
												Validate
											</>
										)}
									</Button>
								</div>
								{submittedKey.trim() &&
									!isLoading &&
									!matchedPurchase && (
										<p className="text-xs text-destructive">
											No purchase found for this license
											key.
										</p>
									)}
							</div>
						</div>

						{/* Result */}
						{matchedPurchase && (
							<motion.div
								initial={{ opacity: 0, y: 8 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.4, ease: EASE_OUT_EXPO }}
								className="rounded-2xl bg-secondary p-2"
							>
								<div className="rounded-xl bg-card px-6 py-8 flex flex-col gap-6">
									{/* Purchase info */}
									<div className="flex items-center gap-4 p-4 rounded-xl bg-secondary">
										<div className="flex items-center justify-center size-10 rounded-lg bg-card ring-1 ring-border/40 shrink-0">
											<HugeiconsIcon
												icon={FlashIcon}
												className="size-5 text-foreground"
											/>
										</div>
										<div className="flex flex-col gap-0.5 flex-1 min-w-0">
											<p className="text-sm font-semibold text-foreground">
												{planDisplayName(
													matchedPurchase.planSlug
												)}
											</p>
											<p className="text-xs text-muted-foreground font-mono truncate">
												{matchedPurchase.licenseKey}
											</p>
										</div>
										<Badge
											variant="secondary"
											className="text-[10px] uppercase tracking-widest px-2 py-0.5 shrink-0"
										>
											Purchased
										</Badge>
									</div>

									{/* Template download */}
									{isTemplate && (
										<div className="flex flex-col gap-4">
											<div className="flex items-center gap-3 text-sm text-muted-foreground">
												<HugeiconsIcon
													icon={CheckmarkCircle01Icon}
													className="size-4 text-emerald-500 shrink-0"
												/>
												Your template is ready to
												download.
											</div>
											<a
												href={`/api/templates/${templateIdFromSlug(matchedPurchase.planSlug)}/download`}
												download
											>
												<Button
													size="lg"
													className="h-11 px-6 text-sm font-medium bg-foreground text-background hover:bg-foreground/90"
												>
													<HugeiconsIcon
														icon={Download01Icon}
														className="mr-2 size-4"
													/>
													Download Template
												</Button>
											</a>
										</div>
									)}

									{/* Already activated boilerplate */}
									{!isTemplate &&
										isAlreadyActivated &&
										!activated && (
											<div className="flex flex-col gap-4">
												<div className="flex items-center gap-3 text-sm text-muted-foreground">
													<HugeiconsIcon
														icon={
															CheckmarkCircle01Icon
														}
														className="size-4 text-emerald-500 shrink-0"
													/>
													Already activated for{" "}
													<span className="font-medium text-foreground">
														@
														{
															matchedPurchase.githubUsername
														}
													</span>
													. Check your GitHub
													notifications.
												</div>
												<Button
													size="lg"
													variant="outline"
													className="h-11 w-fit px-6 text-sm font-medium"
													asChild
												>
													<a
														href="https://github.com/notifications"
														target="_blank"
														rel="noreferrer"
													>
														<HugeiconsIcon
															icon={GithubIcon}
															className="mr-2 size-4"
														/>
														Open GitHub
													</a>
												</Button>
											</div>
										)}

									{/* Success after activation */}
									{activated && (
										<motion.div
											initial={{
												opacity: 0,
												scale: 0.97
											}}
											animate={{ opacity: 1, scale: 1 }}
											transition={{ duration: 0.35, ease: EASE_OUT_EXPO }}
											className="flex flex-col gap-4"
										>
											<div className="flex items-center gap-3 text-sm text-muted-foreground">
												<motion.span
													initial={{ scale: 0.3, opacity: 0 }}
													animate={{ scale: 1, opacity: 1 }}
													transition={{ duration: 0.4, ease: EASE_OUT_EXPO, delay: 0.15 }}
													className="shrink-0"
												>
													<HugeiconsIcon
														icon={CheckmarkCircle01Icon}
														className="size-4 text-emerald-500"
													/>
												</motion.span>
												GitHub invitation sent to{" "}
												<span className="font-medium text-foreground">
													@{activated.githubUsername}
												</span>
												.
											</div>
											<Button
												size="lg"
												variant="outline"
												className="h-11 w-fit px-6 text-sm font-medium"
												asChild
											>
												<a
													href="https://github.com/notifications"
													target="_blank"
													rel="noreferrer"
												>
													<HugeiconsIcon
														icon={GithubIcon}
														className="mr-2 size-4"
													/>
													Open GitHub
												</a>
											</Button>
										</motion.div>
									)}

									{/* Unclaimed boilerplate — enter GitHub username */}
									{!isTemplate &&
										!isAlreadyActivated &&
										!activated && (
											<div className="flex flex-col gap-5">
												<div className="flex flex-col gap-3">
													<div className="flex flex-col gap-1.5">
														<label
															htmlFor="github-username"
															className="text-sm font-medium text-foreground"
														>
															GitHub username
														</label>
														<p className="text-xs text-muted-foreground">
															You'll receive a
															repository
															invitation at this
															account.
														</p>
													</div>
													<div className="relative">
														<span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
															@
														</span>
														<Input
															id="github-username"
															className="pl-8 text-sm"
															placeholder="your-github-username"
															value={
																githubUsername
															}
															onChange={(e) =>
																setGithubUsername(
																	e.target
																		.value
																)
															}
															onKeyDown={(e) =>
																e.key ===
																	"Enter" &&
																!isActivating &&
																handleActivate()
															}
															disabled={
																isActivating
															}
														/>
													</div>
												</div>
												<Button
													size="lg"
													className="h-11 w-fit px-6 text-sm font-medium bg-foreground text-background hover:bg-foreground/90"
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
															className="mr-2 size-4"
														/>
													)}
													{isActivating
														? "Activating…"
														: "Activate & Get GitHub Access"}
												</Button>
											</div>
										)}
								</div>
							</motion.div>
						)}
					</div>
				)}

				<p className="mt-8 text-xs text-muted-foreground">
					Need help?{" "}
					<a
						href="mailto:support@tanship.dev"
						className="underline underline-offset-4 hover:text-foreground transition-colors text-foreground font-medium"
					>
						Contact support
					</a>
				</p>
			</main>
			<FooterSection />
		</>
	);
}

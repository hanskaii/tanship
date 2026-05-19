import { createFileRoute, Link } from "@tanstack/react-router";
import { authClient } from "@/auth/client";
import { useState, useRef } from "react";
import { Button, Input, Spinner, toast } from "@workspace/ui";
import { motion } from "framer-motion";
import { EASE_OUT_EXPO } from "../../-lib/motion";
import { HugeiconsIcon } from "@hugeicons/react";
import {
	CheckmarkCircle01Icon,
	ImageUpload01Icon,
	ArrowRight01Icon
} from "@hugeicons/core-free-icons";
import { FooterSection } from "../../-components/footer-section";

export const Route = createFileRoute("/(app)/_home/showcase/submit/")({
	component: ShowcaseSubmitPage
});

function ShowcaseSubmitPage() {
	const { data: session } = authClient.useSession();

	const [isSubmitting, setIsSubmitting] = useState(false);
	const [submitted, setSubmitted] = useState(false);
	const [screenshot, setScreenshot] = useState<File | null>(null);
	const [screenshotPreview, setScreenshotPreview] = useState<string | null>(
		null
	);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const [form, setForm] = useState({
		submitterName: session?.user?.name ?? "",
		projectName: "",
		projectUrl: "",
		description: "",
		twitterHandle: ""
	});

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;
		setScreenshot(file);
		setScreenshotPreview(URL.createObjectURL(file));
	};

	const handleSubmit = async () => {
		if (
			!form.submitterName ||
			!form.projectName ||
			!form.projectUrl ||
			!form.description
		) {
			toast.error("Please fill in all required fields.");
			return;
		}
		setIsSubmitting(true);
		try {
			const formData = new FormData();
			formData.append("submitterName", form.submitterName);
			formData.append("projectName", form.projectName);
			formData.append("projectUrl", form.projectUrl);
			formData.append("description", form.description);
			if (form.twitterHandle)
				formData.append("twitterHandle", form.twitterHandle);
			if (screenshot) formData.append("screenshot", screenshot);

			const res = await fetch("/api/showcase", {
				method: "POST",
				body: formData
			});
			const json = (await res.json()) as any;
			if (!res.ok) throw new Error(json.message ?? "Submission failed");
			setSubmitted(true);
		} catch (err: any) {
			toast.error(err.message ?? "Submission failed. Please try again.");
		} finally {
			setIsSubmitting(false);
		}
	};

	const MAX_DESC = 500;

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
							Showcase
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
						Submit your project
					</h1>
					<p
						className="max-w-xl text-base text-muted-foreground leading-relaxed"
						style={{ letterSpacing: "-0.01em" }}
					>
						Show the community what you built with Tanship. We
						review every submission before publishing.
					</p>
				</motion.section>

				<div className="w-full">
					{submitted ? (
						<motion.div
							initial={{ opacity: 0, y: 8 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.4, ease: EASE_OUT_EXPO }}
							className="rounded-2xl bg-secondary p-2"
						>
							<div className="rounded-xl bg-card px-6 py-16 flex flex-col items-center gap-5 text-center">
								<motion.div
								className="flex size-14 items-center justify-center rounded-xl bg-emerald-500/10"
								initial={{ scale: 0.4, opacity: 0 }}
								animate={{ scale: 1, opacity: 1 }}
								transition={{ duration: 0.45, ease: EASE_OUT_EXPO, delay: 0.2 }}
							>
								<HugeiconsIcon
									icon={CheckmarkCircle01Icon}
									className="size-7 text-emerald-500"
								/>
							</motion.div>
								<div className="flex flex-col gap-2">
									<p className="text-base font-semibold text-foreground">
										Submitted for review
									</p>
									<p className="text-sm text-muted-foreground leading-relaxed">
										We'll review your project and add it to
										the showcase shortly.
									</p>
								</div>
								<Button
									size="lg"
									className="h-11 px-6 text-sm font-medium bg-foreground text-background hover:bg-foreground/90"
									asChild
								>
									<Link to="/showcase">
										View showcase
										<HugeiconsIcon
											icon={ArrowRight01Icon}
											className="ml-2 size-4"
										/>
									</Link>
								</Button>
							</div>
						</motion.div>
					) : !session?.user ? (
						<div className="rounded-2xl bg-secondary p-2">
							<div className="rounded-xl bg-card px-6 py-16 flex flex-col items-center gap-4 text-center">
								<p className="text-sm text-muted-foreground">
									Sign in to submit your project.
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
						<div className="rounded-2xl bg-secondary p-2">
							<div className="rounded-xl bg-card px-6 py-8">
								<div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
									{/* Col 1 */}
									<div className="flex flex-col gap-5">
										<label className="flex flex-col gap-1.5">
											<span className="text-xs font-semibold text-foreground">
												Your name{" "}
												<span className="text-destructive">
													*
												</span>
											</span>
											<Input
												className="h-9 text-sm"
												placeholder="Jane Smith"
												value={form.submitterName}
												onChange={(e) =>
													setForm((f) => ({
														...f,
														submitterName:
															e.target.value
													}))
												}
												disabled={isSubmitting}
											/>
										</label>

										<label className="flex flex-col gap-1.5">
											<span className="text-xs font-semibold text-foreground">
												Project name{" "}
												<span className="text-destructive">
													*
												</span>
											</span>
											<Input
												className="h-9 text-sm"
												placeholder="My SaaS App"
												value={form.projectName}
												onChange={(e) =>
													setForm((f) => ({
														...f,
														projectName:
															e.target.value
													}))
												}
												disabled={isSubmitting}
											/>
										</label>

										<label className="flex flex-col gap-1.5">
											<span className="text-xs font-semibold text-foreground">
												Project URL{" "}
												<span className="text-destructive">
													*
												</span>
											</span>
											<Input
												className="h-9 text-sm"
												placeholder="https://myapp.com"
												type="url"
												value={form.projectUrl}
												onChange={(e) =>
													setForm((f) => ({
														...f,
														projectUrl:
															e.target.value
													}))
												}
												disabled={isSubmitting}
											/>
										</label>

										<label className="flex flex-col gap-1.5">
											<span className="text-xs font-semibold text-foreground">
												Twitter / X{" "}
												<span className="font-normal text-muted-foreground">
													(optional)
												</span>
											</span>
											<div className="relative">
												<span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
													@
												</span>
												<Input
													className="h-9 pl-7 text-sm"
													placeholder="yourhandle"
													value={form.twitterHandle}
													onChange={(e) =>
														setForm((f) => ({
															...f,
															twitterHandle:
																e.target.value
														}))
													}
													disabled={isSubmitting}
												/>
											</div>
										</label>
									</div>

									{/* Col 2 */}
									<div className="flex flex-col gap-5">
										<div className="flex flex-col gap-1.5">
											<div className="flex items-center justify-between">
												<span className="text-xs font-semibold text-foreground">
													Description{" "}
													<span className="text-destructive">
														*
													</span>
												</span>
												<span
													className={`text-[10px] font-mono ${form.description.length > MAX_DESC * 0.9 ? "text-destructive" : "text-muted-foreground"}`}
												>
													{form.description.length}/
													{MAX_DESC}
												</span>
											</div>
											<textarea
												className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-none"
												placeholder="Tell us what you built and how you used Tanship…"
												maxLength={MAX_DESC}
												value={form.description}
												onChange={(e) =>
													setForm((f) => ({
														...f,
														description:
															e.target.value
													}))
												}
												disabled={isSubmitting}
											/>
										</div>

										<div className="flex flex-col gap-1.5">
											<span className="text-xs font-semibold text-foreground">
												Screenshot{" "}
												<span className="font-normal text-muted-foreground">
													(optional, max 3 MB)
												</span>
											</span>
											<input
												ref={fileInputRef}
												type="file"
												accept="image/jpeg,image/png,image/webp"
												className="hidden"
												onChange={handleFileChange}
												disabled={isSubmitting}
											/>
											{screenshotPreview ? (
												<div className="relative overflow-hidden rounded-xl border border-border/40">
													<img
														src={screenshotPreview}
														alt="Preview"
														className="h-44 w-full object-cover"
													/>
													<button
														onClick={() => {
															setScreenshot(null);
															setScreenshotPreview(
																null
															);
															if (
																fileInputRef.current
															)
																fileInputRef.current.value =
																	"";
														}}
														className="absolute right-2 top-2 rounded-md bg-background/90 px-2 py-0.5 text-[10px] text-foreground border border-border/40 transition hover:bg-background"
													>
														Remove
													</button>
												</div>
											) : (
												<button
													onClick={() =>
														fileInputRef.current?.click()
													}
													disabled={isSubmitting}
													className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border/60 py-8 text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground"
												>
													<HugeiconsIcon
														icon={ImageUpload01Icon}
														className="size-6"
													/>
													<span className="text-xs">
														Click to upload
														screenshot
													</span>
												</button>
											)}
										</div>
									</div>
								</div>

								<div className="mt-6 border-t border-border/40 pt-6 flex justify-end">
									<Button
										size="lg"
										className="h-11 px-6 text-sm font-medium bg-foreground text-background hover:bg-foreground/90"
										onClick={handleSubmit}
										disabled={
											isSubmitting ||
											!form.submitterName ||
											!form.projectName ||
											!form.projectUrl ||
											!form.description
										}
									>
										{isSubmitting ? (
											<Spinner className="mr-2 size-4" />
										) : (
											<HugeiconsIcon
												icon={ArrowRight01Icon}
												className="mr-2 size-4"
											/>
										)}
										{isSubmitting
											? "Submitting…"
											: "Submit for review"}
									</Button>
								</div>
							</div>
						</div>
					)}
				</div>
			</main>
			<FooterSection />
		</>
	);
}

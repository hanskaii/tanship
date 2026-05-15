import { createFileRoute, Link } from "@tanstack/react-router";
import { authClient } from "@/auth/client";
import { useState, useRef } from "react";
import { Badge, Button, Input, Spinner, toast } from "@workspace/ui";
import { motion } from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import {
	CheckmarkCircle01Icon,
	ImageUpload01Icon,
	ArrowRight01Icon,
	FlashIcon
} from "@hugeicons/core-free-icons";

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
		<div className="relative flex min-h-screen flex-col items-center overflow-hidden bg-background">
			{/* Background */}
			<div className="pointer-events-none fixed inset-0 z-0 bg-[linear-gradient(to_right,hsl(var(--border)/0.15)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.15)_1px,transparent_1px)] bg-[size:28px_28px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

			<main className="relative z-10 mx-auto mb-32 mt-28 w-full max-w-md px-4 sm:px-6">
				<motion.div
					initial={{ opacity: 0, y: 16 }}
					animate={{ opacity: 1, y: 0 }}
					className="flex flex-col gap-8"
				>
					{/* Header */}
					<div className="flex flex-col items-center gap-4 text-center">
						<div className="flex h-11 w-11 items-center justify-center bg-foreground">
							<HugeiconsIcon
								icon={FlashIcon}
								className="size-5 text-background"
							/>
						</div>
						<div className="flex flex-col gap-2">
							<Badge
								variant="secondary"
								className="mx-auto rounded-full border border-border/50 bg-muted/30 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-foreground"
							>
								Showcase
							</Badge>
							<h1 className="text-2xl font-semibold tracking-tight text-foreground">
								Submit your project
							</h1>
							<p className="text-sm leading-relaxed text-muted-foreground">
								Show the community what you built with Tanship.
								We review every submission before publishing.
							</p>
						</div>
					</div>

					{/* Card */}
					<div className="flex flex-col gap-6 border border-border/50 bg-background p-7 dark:bg-muted/5">
						{/* Not logged in */}
						{!session?.user && (
							<div className="flex flex-col items-center gap-4 py-6 text-center">
								<p className="text-sm text-muted-foreground">
									Sign in to submit your project.
								</p>
								<Button
									size="sm"
									className="rounded-none px-6"
									asChild
								>
									<Link to="/login">
										<HugeiconsIcon
											icon={ArrowRight01Icon}
											className="mr-2 size-4"
										/>
										Sign in
									</Link>
								</Button>
							</div>
						)}

						{/* Success */}
						{submitted && (
							<motion.div
								initial={{ opacity: 0, scale: 0.97 }}
								animate={{ opacity: 1, scale: 1 }}
								className="flex flex-col items-center gap-5 py-6 text-center"
							>
								<div className="flex h-14 w-14 items-center justify-center rounded-full border border-emerald-500/20 bg-emerald-500/10">
									<HugeiconsIcon
										icon={CheckmarkCircle01Icon}
										className="size-7 text-emerald-500"
									/>
								</div>
								<div className="flex flex-col gap-1.5">
									<p className="font-semibold text-foreground">
										Submitted for review!
									</p>
									<p className="text-sm text-muted-foreground">
										We'll review your project and add it to
										the showcase shortly.
									</p>
								</div>
								<Button
									size="sm"
									variant="outline"
									className="rounded-none px-5"
									asChild
								>
									<Link to="/showcase">View showcase</Link>
								</Button>
							</motion.div>
						)}

						{/* Form */}
						{session?.user && !submitted && (
							<div className="flex flex-col gap-4">
								{/* Name */}
								<label className="flex flex-col gap-1.5">
									<span className="text-xs font-semibold text-foreground">
										Your name{" "}
										<span className="text-red-400">*</span>
									</span>
									<Input
										className="h-9 text-sm"
										placeholder="Jane Smith"
										value={form.submitterName}
										onChange={(e) =>
											setForm((f) => ({
												...f,
												submitterName: e.target.value
											}))
										}
										disabled={isSubmitting}
									/>
								</label>

								{/* Project name */}
								<label className="flex flex-col gap-1.5">
									<span className="text-xs font-semibold text-foreground">
										Project name{" "}
										<span className="text-red-400">*</span>
									</span>
									<Input
										className="h-9 text-sm"
										placeholder="My SaaS App"
										value={form.projectName}
										onChange={(e) =>
											setForm((f) => ({
												...f,
												projectName: e.target.value
											}))
										}
										disabled={isSubmitting}
									/>
								</label>

								{/* URL */}
								<label className="flex flex-col gap-1.5">
									<span className="text-xs font-semibold text-foreground">
										Project URL{" "}
										<span className="text-red-400">*</span>
									</span>
									<Input
										className="h-9 text-sm"
										placeholder="https://myapp.com"
										type="url"
										value={form.projectUrl}
										onChange={(e) =>
											setForm((f) => ({
												...f,
												projectUrl: e.target.value
											}))
										}
										disabled={isSubmitting}
									/>
								</label>

								{/* Description */}
								<div className="flex flex-col gap-1.5">
									<div className="flex items-center justify-between">
										<span className="text-xs font-semibold text-foreground">
											Description{" "}
											<span className="text-red-400">
												*
											</span>
										</span>
										<span
											className={`text-[10px] font-mono ${
												form.description.length >
												MAX_DESC * 0.9
													? "text-red-400"
													: "text-muted-foreground"
											}`}
										>
											{form.description.length}/{MAX_DESC}
										</span>
									</div>
									<textarea
										className="flex min-h-[90px] w-full border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-none"
										placeholder="Tell us what you built and how you used Tanship…"
										maxLength={MAX_DESC}
										value={form.description}
										onChange={(e) =>
											setForm((f) => ({
												...f,
												description: e.target.value
											}))
										}
										disabled={isSubmitting}
									/>
								</div>

								{/* Twitter */}
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

								{/* Screenshot */}
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
										<div className="relative overflow-hidden border border-border/50">
											<img
												src={screenshotPreview}
												alt="Preview"
												className="h-40 w-full object-cover"
											/>
											<button
												onClick={() => {
													setScreenshot(null);
													setScreenshotPreview(null);
													if (fileInputRef.current)
														fileInputRef.current.value =
															"";
												}}
												className="absolute right-2 top-2 border border-border/60 bg-background/90 px-2 py-0.5 text-[10px] text-foreground transition hover:bg-background"
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
											className="flex flex-col items-center gap-2 border border-dashed border-border/60 py-8 text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground"
										>
											<HugeiconsIcon
												icon={ImageUpload01Icon}
												className="size-6"
											/>
											<span className="text-xs">
												Click to upload screenshot
											</span>
										</button>
									)}
								</div>

								<Button
									className="mt-2 h-10 w-full rounded-none text-sm font-semibold"
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
						)}
					</div>
				</motion.div>
			</main>
		</div>
	);
}

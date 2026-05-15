import { createFileRoute, Link } from "@tanstack/react-router";
import { authClient } from "@/auth/client";
import { useState, useRef } from "react";
import { Badge, Button, Input, Spinner, toast } from "@workspace/ui";
import { motion } from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import {
	FlashIcon,
	ArrowRight01Icon,
	CheckmarkCircle01Icon,
	ImageUpload01Icon
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
		const url = URL.createObjectURL(file);
		setScreenshotPreview(url);
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
			// Direct browser fetch — same-origin, auth cookies sent automatically
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
			if (!res.ok) {
				throw new Error(json.message ?? "Submission failed");
			}
			setSubmitted(true);
		} catch (err: any) {
			toast.error(err.message ?? "Submission failed. Please try again.");
		} finally {
			setIsSubmitting(false);
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

			<main className="relative z-10 mt-28 mb-32 w-full max-w-lg px-6">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					className="flex flex-col gap-8"
				>
					{/* Header */}
					<div className="flex flex-col items-center text-center gap-4">
						<div className="flex items-center justify-center size-12 rounded-2xl bg-primary/10 border border-primary/20">
							<HugeiconsIcon
								icon={FlashIcon}
								className="size-6 text-primary"
							/>
						</div>
						<div className="flex flex-col gap-2">
							<Badge
								variant="secondary"
								className="px-3 py-0.5 bg-primary/5 text-primary border-primary/20 text-[10px] uppercase tracking-wider font-bold mx-auto"
							>
								Showcase
							</Badge>
							<h1 className="text-2xl font-extrabold tracking-tight">
								Submit your project
							</h1>
							<p className="text-sm text-muted-foreground leading-relaxed">
								Show the community what you built with Tanship.
								We review every submission before publishing.
							</p>
						</div>
					</div>

					{/* Card */}
					<div className="w-full rounded-2xl border border-border bg-muted/10 backdrop-blur-sm p-6 flex flex-col gap-6">
						{/* Not logged in */}
						{!session?.user && (
							<div className="flex flex-col items-center gap-4 py-4 text-center">
								<p className="text-sm text-muted-foreground">
									Sign in to submit your project.
								</p>
								<Button
									size="sm"
									className="rounded-full px-6 h-9 text-xs"
									asChild
								>
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

						{/* Success */}
						{submitted && (
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
								<div className="flex flex-col gap-1">
									<p className="font-bold">
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
									className="rounded-full px-5 h-9 text-xs"
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
								<div className="flex flex-col gap-1.5">
									<label className="text-xs font-semibold">
										Your name{" "}
										<span className="text-red-400">*</span>
									</label>
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
								</div>

								{/* Project name */}
								<div className="flex flex-col gap-1.5">
									<label className="text-xs font-semibold">
										Project name{" "}
										<span className="text-red-400">*</span>
									</label>
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
								</div>

								{/* URL */}
								<div className="flex flex-col gap-1.5">
									<label className="text-xs font-semibold">
										Project URL{" "}
										<span className="text-red-400">*</span>
									</label>
									<Input
										className="h-9 text-sm"
										placeholder="https://myapp.com"
										value={form.projectUrl}
										onChange={(e) =>
											setForm((f) => ({
												...f,
												projectUrl: e.target.value
											}))
										}
										disabled={isSubmitting}
									/>
								</div>

								{/* Description */}
								<div className="flex flex-col gap-1.5">
									<label className="text-xs font-semibold">
										Description{" "}
										<span className="text-red-400">*</span>
									</label>
									<textarea
										className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
										placeholder="Tell us what you built and how you used Tanship…"
										maxLength={500}
										value={form.description}
										onChange={(e) =>
											setForm((f) => ({
												...f,
												description: e.target.value
											}))
										}
										disabled={isSubmitting}
									/>
									<p className="text-[10px] text-muted-foreground text-right">
										{form.description.length}/500
									</p>
								</div>

								{/* Twitter */}
								<div className="flex flex-col gap-1.5">
									<label className="text-xs font-semibold">
										Twitter / X{" "}
										<span className="text-muted-foreground font-normal">
											(optional)
										</span>
									</label>
									<div className="relative">
										<span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
											@
										</span>
										<Input
											className="pl-7 h-9 text-sm"
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
								</div>

								{/* Screenshot */}
								<div className="flex flex-col gap-1.5">
									<label className="text-xs font-semibold">
										Screenshot{" "}
										<span className="text-muted-foreground font-normal">
											(optional, max 3 MB)
										</span>
									</label>
									<input
										ref={fileInputRef}
										type="file"
										accept="image/jpeg,image/png,image/webp"
										className="hidden"
										onChange={handleFileChange}
										disabled={isSubmitting}
									/>
									{screenshotPreview ? (
										<div className="relative rounded-lg overflow-hidden border border-border/50">
											<img
												src={screenshotPreview}
												alt="Preview"
												className="w-full h-40 object-cover"
											/>
											<button
												onClick={() => {
													setScreenshot(null);
													setScreenshotPreview(null);
													if (fileInputRef.current)
														fileInputRef.current.value =
															"";
												}}
												className="absolute top-2 right-2 text-[10px] bg-background/80 text-foreground px-2 py-0.5 rounded border border-border/50 hover:bg-background transition"
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
											className="flex flex-col items-center gap-2 py-6 rounded-lg border border-dashed border-border/60 text-muted-foreground hover:border-primary/40 hover:text-primary transition-colors"
										>
											<HugeiconsIcon
												icon={ImageUpload01Icon}
												className="size-6"
											/>
											<span className="text-[11px]">
												Click to upload screenshot
											</span>
										</button>
									)}
								</div>

								<Button
									className="w-full h-10 text-sm font-semibold mt-2"
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
										<Spinner className="size-4 mr-2" />
									) : (
										<HugeiconsIcon
											icon={ArrowRight01Icon}
											className="size-4 mr-2"
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

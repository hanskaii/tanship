import { createFileRoute } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { EASE_OUT_EXPO } from "../-lib/motion";
import { HugeiconsIcon } from "@hugeicons/react";
import {
	FlashIcon,
	Copy01Icon,
	CheckmarkCircle01Icon
} from "@hugeicons/core-free-icons";
import { useState } from "react";
import { toast } from "@workspace/ui";
import { FooterSection } from "../-components/footer-section";

export const Route = createFileRoute("/(app)/_home/badge/")({
	component: BadgePage
});

const BADGE_URL = "https://tanship.dev/badge.svg";
const SITE_URL = "https://tanship.dev";

const snippets = [
	{
		label: "Markdown",
		lang: "markdown",
		code: `[![Built with Tanship](${BADGE_URL})](${SITE_URL})`
	},
	{
		label: "HTML",
		lang: "html",
		code: `<a href="${SITE_URL}" target="_blank" rel="noreferrer">\n  <img src="${BADGE_URL}" alt="Built with Tanship" />\n</a>`
	},
	{
		label: "JSX",
		lang: "jsx",
		code: `<a href="${SITE_URL}" target="_blank" rel="noreferrer">\n  <img src="${BADGE_URL}" alt="Built with Tanship" />\n</a>`
	}
];

function CopyButton({ text }: { text: string }) {
	const [copied, setCopied] = useState(false);

	const handleCopy = async () => {
		await navigator.clipboard.writeText(text);
		setCopied(true);
		toast.success("Copied to clipboard");
		setTimeout(() => setCopied(false), 2000);
	};

	return (
		<button
			onClick={handleCopy}
			className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
		>
			<span className="relative size-3.5 shrink-0">
				<AnimatePresence mode="wait" initial={false}>
					{copied ? (
						<motion.span
							key="check"
							className="absolute inset-0 flex items-center justify-center"
							initial={{ scale: 0.4, opacity: 0 }}
							animate={{ scale: 1, opacity: 1 }}
							exit={{ scale: 0.4, opacity: 0 }}
							transition={{ duration: 0.15, ease: EASE_OUT_EXPO }}
						>
							<HugeiconsIcon
								icon={CheckmarkCircle01Icon}
								className="size-3.5 text-emerald-500"
							/>
						</motion.span>
					) : (
						<motion.span
							key="copy"
							className="absolute inset-0 flex items-center justify-center"
							initial={{ scale: 0.4, opacity: 0 }}
							animate={{ scale: 1, opacity: 1 }}
							exit={{ scale: 0.4, opacity: 0 }}
							transition={{ duration: 0.15, ease: EASE_OUT_EXPO }}
						>
							<HugeiconsIcon
								icon={Copy01Icon}
								className="size-3.5"
							/>
						</motion.span>
					)}
				</AnimatePresence>
			</span>
			{copied ? "Copied!" : "Copy"}
		</button>
	);
}

function BadgePage() {
	return (
		<>
			<main className="px-4 sm:px-6 pb-32 pt-24">
				<div className="mx-auto w-full max-w-2xl">
					<div className="flex flex-col gap-12">
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.5, ease: EASE_OUT_EXPO }}
							className="flex flex-col items-center text-center gap-6 border-b border-border/40 pb-12"
						>
							<div className="flex size-14 items-center justify-center rounded-xl bg-secondary">
								<HugeiconsIcon
									icon={FlashIcon}
									className="size-6 text-foreground"
								/>
							</div>
							<div className="flex flex-col gap-3">
								<div className="flex items-center gap-2 mx-auto">
									<div className="h-1.5 w-1.5 rounded-full bg-primary" />
									<span className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
										Badge
									</span>
								</div>
								<h1
									className="font-heading font-medium text-foreground"
									style={{
										fontSize: "clamp(1.8rem, 4vw, 2.4rem)",
										letterSpacing: "-0.04em",
										lineHeight: "1.05"
									}}
								>
									Built with Tanship
								</h1>
								<p
									className="text-sm text-muted-foreground max-w-sm leading-relaxed"
									style={{ letterSpacing: "-0.01em" }}
								>
									Embed this badge in your README or website
									to show that your project is powered by
									Tanship.
								</p>
							</div>
						</motion.div>

						<motion.div
							initial={{ opacity: 0, y: 12 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{
								duration: 0.45,
								delay: 0.1,
								ease: EASE_OUT_EXPO
							}}
						>
							<div className="rounded-2xl bg-secondary p-2">
								<div className="rounded-xl bg-card p-8 flex flex-col items-center gap-6">
									<p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
										Preview
									</p>
									<div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
										<div className="flex items-center justify-center bg-white rounded-xl p-6 border border-border/20">
											<img
												src="/badge.svg"
												alt="Built with Tanship"
												className="h-5"
											/>
										</div>
										<div className="flex items-center justify-center bg-zinc-900 rounded-xl p-6 border border-border/20">
											<img
												src="/badge.svg"
												alt="Built with Tanship"
												className="h-5"
											/>
										</div>
									</div>
								</div>
							</div>
						</motion.div>

						<div className="flex flex-col gap-6">
							{snippets.map((snippet, i) => (
								<motion.div
									key={snippet.label}
									initial={{ opacity: 0, y: 10 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{
										duration: 0.4,
										delay: 0.1 + i * 0.05,
										ease: EASE_OUT_EXPO
									}}
									className="flex flex-col gap-3"
								>
									<div className="flex items-center justify-between border-b border-border/30 pb-2">
										<span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
											{snippet.label}
										</span>
										<CopyButton text={snippet.code} />
									</div>
									<pre className="rounded-xl bg-secondary px-5 py-4 text-xs font-mono text-foreground/80 overflow-x-auto whitespace-pre-wrap break-all leading-relaxed">
										{snippet.code}
									</pre>
								</motion.div>
							))}
						</div>

						<div className="flex flex-col gap-3 pt-4">
							<p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
								Badge URL
							</p>
							<div className="flex items-center gap-2 rounded-xl bg-secondary px-4 py-3">
								<code className="flex-1 text-xs font-mono text-foreground truncate">
									{BADGE_URL}
								</code>
								<CopyButton text={BADGE_URL} />
							</div>
						</div>
					</div>
				</div>
			</main>
			<FooterSection />
		</>
	);
}

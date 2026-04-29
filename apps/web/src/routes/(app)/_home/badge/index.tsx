import { createFileRoute } from "@tanstack/react-router";
import { Badge } from "@workspace/ui";
import { motion } from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import { FlashIcon, Copy01Icon, CheckmarkCircle01Icon } from "@hugeicons/core-free-icons";
import { useState } from "react";
import { toast } from "@workspace/ui";

export const Route = createFileRoute("/(app)/_home/badge/")({
	component: BadgePage
});

const BADGE_URL = "https://tanflare.com/badge.svg";
const SITE_URL = "https://tanflare.com";

const snippets = [
	{
		label: "Markdown",
		lang: "markdown",
		code: `[![Built with Tanflare](${BADGE_URL})](${SITE_URL})`
	},
	{
		label: "HTML",
		lang: "html",
		code: `<a href="${SITE_URL}" target="_blank" rel="noreferrer">\n  <img src="${BADGE_URL}" alt="Built with Tanflare" />\n</a>`
	},
	{
		label: "JSX",
		lang: "jsx",
		code: `<a href="${SITE_URL}" target="_blank" rel="noreferrer">\n  <img src="${BADGE_URL}" alt="Built with Tanflare" />\n</a>`
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
			<HugeiconsIcon
				icon={copied ? CheckmarkCircle01Icon : Copy01Icon}
				className={`size-3.5 ${copied ? "text-emerald-500" : ""}`}
			/>
			{copied ? "Copied!" : "Copy"}
		</button>
	);
}

function BadgePage() {
	return (
		<div className="relative flex min-h-screen flex-col items-center bg-background overflow-hidden">
			{/* Background */}
			<div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
				<div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-30" />
				<div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-30" />
				<div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
			</div>

			<main className="relative z-10 mt-28 mb-32 w-full max-w-xl px-6 flex flex-col gap-12">
				{/* Header */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					className="flex flex-col items-center text-center gap-4"
				>
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
							Badge
						</Badge>
						<h1 className="text-3xl font-extrabold tracking-tight">
							Built with Tanflare
						</h1>
						<p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
							Embed this badge in your README or website to show that
							your project is powered by Tanflare.
						</p>
					</div>
				</motion.div>

				{/* Preview */}
				<motion.div
					initial={{ opacity: 0, y: 12 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.1 }}
					className="flex flex-col gap-4"
				>
					<div className="rounded-2xl border border-border/50 bg-muted/10 p-8 flex flex-col items-center gap-6 backdrop-blur-sm">
						<div className="flex flex-col items-center gap-3">
							<p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
								Preview
							</p>
							<div className="flex flex-col items-center gap-3">
								{/* Light background preview */}
								<div className="flex items-center justify-center bg-white rounded-lg px-6 py-4 shadow-sm border border-border/20">
									<img
										src="/badge.svg"
										alt="Built with Tanflare"
										className="h-5"
									/>
								</div>
								{/* Dark background preview */}
								<div className="flex items-center justify-center bg-zinc-900 rounded-lg px-6 py-4 border border-border/20">
									<img
										src="/badge.svg"
										alt="Built with Tanflare"
										className="h-5"
									/>
								</div>
							</div>
						</div>
					</div>
				</motion.div>

				{/* Snippets */}
				<div className="flex flex-col gap-4">
					{snippets.map((snippet, i) => (
						<motion.div
							key={snippet.label}
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.1 + i * 0.05 }}
							className="flex flex-col gap-2"
						>
							<div className="flex items-center justify-between">
								<span className="text-xs font-semibold">
									{snippet.label}
								</span>
								<CopyButton text={snippet.code} />
							</div>
							<pre className="rounded-xl border border-border/50 bg-muted/20 p-4 text-[11px] font-mono text-foreground/80 overflow-x-auto whitespace-pre-wrap break-all leading-relaxed">
								{snippet.code}
							</pre>
						</motion.div>
					))}
				</div>

				{/* Direct URL */}
				<div className="flex flex-col gap-2">
					<p className="text-xs font-semibold">Badge URL</p>
					<div className="flex items-center gap-2 rounded-xl border border-border/50 bg-muted/20 p-3">
						<code className="flex-1 text-[11px] font-mono text-muted-foreground truncate">
							{BADGE_URL}
						</code>
						<CopyButton text={BADGE_URL} />
					</div>
				</div>
			</main>
		</div>
	);
}

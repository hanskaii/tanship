import { createFileRoute } from "@tanstack/react-router";
import { Badge } from "@workspace/ui";
import { motion } from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import {
	FlashIcon,
	Copy01Icon,
	CheckmarkCircle01Icon
} from "@hugeicons/core-free-icons";
import { useState } from "react";
import { toast } from "@workspace/ui";

export const Route = createFileRoute("/(app)/_home/badge/")({
	component: BadgePage
});

const BADGE_URL = "https://tanship.com/badge.svg";
const SITE_URL = "https://tanship.com";

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
		<div className="relative flex min-h-screen flex-col items-center bg-background overflow-hidden pt-24 pb-32 px-4 sm:px-6">
			{/* Background */}
			<div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
				<div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
			</div>

			<main className="relative z-10 flex w-full max-w-2xl flex-col gap-12 mx-auto">
				{/* Header */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					className="flex flex-col items-center text-center gap-6 border-b border-border/40 pb-12"
				>
					<div className="flex items-center justify-center size-14 rounded-none bg-muted/10 border border-border/50">
						<HugeiconsIcon
							icon={FlashIcon}
							className="size-6 text-foreground"
						/>
					</div>
					<div className="flex flex-col gap-3">
						<Badge
							variant="secondary"
							className="w-fit px-3 py-1 bg-muted/30 text-foreground border border-border/50 text-[10px] uppercase tracking-widest font-bold mx-auto rounded-full"
						>
							Badge
						</Badge>
						<h1 className="text-3xl font-semibold tracking-tight">
							Built with Tanship
						</h1>
						<p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
							Embed this badge in your README or website to show
							that your project is powered by Tanship.
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
					<div className="rounded-none border border-border/50 bg-background shadow-sm p-8 flex flex-col items-center gap-6">
						<div className="flex flex-col items-center gap-4 w-full">
							<p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
								Preview
							</p>
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
								{/* Light background preview */}
								<div className="flex items-center justify-center bg-white rounded-none p-6 shadow-sm border border-border/20">
									<img
										src="/badge.svg"
										alt="Built with Tanship"
										className="h-5"
									/>
								</div>
								{/* Dark background preview */}
								<div className="flex items-center justify-center bg-zinc-900 rounded-none p-6 border border-border/20">
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

				{/* Snippets */}
				<div className="flex flex-col gap-6">
					{snippets.map((snippet, i) => (
						<motion.div
							key={snippet.label}
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.1 + i * 0.05 }}
							className="flex flex-col gap-3"
						>
							<div className="flex items-center justify-between border-b border-border/30 pb-2">
								<span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
									{snippet.label}
								</span>
								<CopyButton text={snippet.code} />
							</div>
							<pre className="rounded-none border border-border/50 bg-muted/10 p-5 text-xs font-mono text-foreground/80 overflow-x-auto whitespace-pre-wrap break-all leading-relaxed">
								{snippet.code}
							</pre>
						</motion.div>
					))}
				</div>

				{/* Direct URL */}
				<div className="flex flex-col gap-3 pt-4">
					<p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
						Badge URL
					</p>
					<div className="flex items-center gap-2 rounded-none border border-border/50 bg-muted/10 p-4">
						<code className="flex-1 text-xs font-mono text-foreground truncate">
							{BADGE_URL}
						</code>
						<CopyButton text={BADGE_URL} />
					</div>
				</div>
			</main>
		</div>
	);
}

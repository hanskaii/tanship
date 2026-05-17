import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowUpRight01Icon } from "@hugeicons/core-free-icons";
import { ContraIcon } from "@/routes/-components/icons";

export function HireSection() {
	return (
		<section>
			<div className="rounded-2xl bg-secondary p-2">
				<div className="rounded-xl bg-card px-8 py-7 flex flex-col gap-10">
					{/* Top row */}
					<div className="flex items-start justify-between gap-4">
						<div className="flex size-14 items-center justify-center rounded-xl bg-secondary">
							<ContraIcon className="size-7 text-foreground" />
						</div>
						<div className="flex items-center gap-1.5 rounded-full border border-border/60 bg-secondary px-3 py-1.5">
							<ContraIcon className="size-3 text-foreground" />
							<span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-foreground">
								Contra
							</span>
						</div>
					</div>

					{/* Bottom row */}
					<div className="flex items-end justify-between gap-6">
						<div className="flex flex-col gap-2">
							<h2
								className="font-heading font-medium text-foreground"
								style={{
									fontSize: "clamp(1.5rem, 3vw, 2rem)",
									letterSpacing: "-0.04em",
									lineHeight: "1.05"
								}}
							>
								Skip the setup.
								<br />
								Let me ship it for you.
							</h2>
							<p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
								Don't want to deal with auth, billing, and
								infra? I'll build your SaaS end-to-end on the
								Tanship stack — ready to launch.
							</p>
						</div>
						<a
							href="https://contra.com/inurhuda00"
							target="_blank"
							rel="noreferrer"
							className="shrink-0 flex items-center gap-2 rounded-xl bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-opacity hover:opacity-85"
						>
							Hire on Contra
							<HugeiconsIcon
								icon={ArrowUpRight01Icon}
								className="size-4"
							/>
						</a>
					</div>
				</div>
			</div>
		</section>
	);
}

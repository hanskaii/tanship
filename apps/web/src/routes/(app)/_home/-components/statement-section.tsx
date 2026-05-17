export function StatementSection() {
	return (
		<section className="border-b border-border/40 py-20">
			<p
				className="font-heading font-medium uppercase text-foreground"
				style={{
					fontSize: "clamp(2.4rem, 8vw, 5rem)",
					letterSpacing: "-0.04em",
					lineHeight: "0.95"
				}}
			>
				Stop building
				<br />
				infrastructure.{" "}
				<span className="bg-primary text-primary-foreground px-2">
					Start
					<br />
					shipping.
				</span>
			</p>

			<div className="mt-10 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
				<p
					className="max-w-xs text-muted-foreground"
					style={{
						fontSize: "15px",
						lineHeight: "1.6",
						letterSpacing: "-0.02em"
					}}
				>
					Every SaaS needs the same foundation. We built it once, so
					you never have to.
				</p>
				<div className="flex items-center gap-2">
					<span className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground/50">
						avg. time to first deploy
					</span>
					<span
						className="font-heading font-medium text-foreground"
						style={{ fontSize: "1.1rem", letterSpacing: "-0.03em" }}
					>
						&lt; 1 day
					</span>
				</div>
			</div>
		</section>
	);
}

import { motion, useReducedMotion } from "framer-motion";
import { EASE_OUT_EXPO } from "../-lib/motion";

export function StatementSection() {
	const reduced = useReducedMotion();

	const containerVariants = {
		hidden: {},
		show: {
			transition: { staggerChildren: reduced ? 0 : 0.15 }
		}
	};

	const lineVariants = {
		hidden: { opacity: 0, y: reduced ? 0 : 20 },
		show: {
			opacity: 1,
			y: 0,
			transition: { duration: reduced ? 0 : 0.55, ease: EASE_OUT_EXPO }
		}
	};

	const limeBgVariants = {
		hidden: { clipPath: "inset(0 100% 0 0)" },
		show: {
			clipPath: "inset(0 0% 0 0)",
			transition: {
				duration: reduced ? 0 : 0.42,
				ease: EASE_OUT_EXPO,
				delay: reduced ? 0 : 0.08
			}
		}
	};

	const subtextVariants = {
		hidden: { opacity: 0, y: reduced ? 0 : 10 },
		show: {
			opacity: 1,
			y: 0,
			transition: { duration: reduced ? 0 : 0.5, ease: EASE_OUT_EXPO }
		}
	};

	return (
		<section className="border-b border-border/40 py-20">
			<motion.p
				className="font-heading font-medium uppercase text-foreground"
				style={{
					fontSize: "clamp(2.4rem, 8vw, 5rem)",
					letterSpacing: "-0.04em",
					lineHeight: "0.95"
				}}
				variants={containerVariants}
				initial="hidden"
				whileInView="show"
				viewport={{ once: true, margin: "-12%" }}
			>
				{/* Line 1 */}
				<motion.span variants={lineVariants}>
					Stop building
					<br />
					infrastructure.{" "}
				</motion.span>

				{/* Line 2 — lime block stamps in */}
				<motion.span variants={lineVariants}>
					<span className="relative inline-block">
						{/* Lime background wipes in from left */}
						<motion.span
							aria-hidden="true"
							className="absolute inset-0 block bg-primary"
							variants={limeBgVariants}
						/>
						<span className="relative px-2 text-primary-foreground">
							Start
							<br />
							shipping.
						</span>
					</span>
				</motion.span>
			</motion.p>

			{/* Sub-row fades in after headline settles */}
			<motion.div
				className="mt-10 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between"
				variants={subtextVariants}
				initial="hidden"
				whileInView="show"
				viewport={{ once: true, margin: "-12%" }}
				transition={{ delay: reduced ? 0 : 0.35 }}
			>
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
						style={{
							fontSize: "1.1rem",
							letterSpacing: "-0.03em"
						}}
					>
						&lt; 1 day
					</span>
				</div>
			</motion.div>
		</section>
	);
}

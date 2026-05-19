"use client";

import { motion } from "framer-motion";
import { useRevealVariants } from "../-lib/motion";
import type { ReactNode } from "react";

interface ScrollRevealProps {
	children: ReactNode;
	className?: string;
	/** Override the default y-translate amount (px) */
	delay?: number;
}

export function ScrollReveal({ children, className, delay }: ScrollRevealProps) {
	const variants = useRevealVariants();

	const finalVariants = delay
		? {
				...variants,
				show: {
					...variants.show,
					transition: {
						...(variants.show.transition as object),
						delay
					}
				}
			}
		: variants;

	return (
		<motion.div
			className={className}
			variants={finalVariants}
			initial="hidden"
			whileInView="show"
			viewport={{ once: true, margin: "-8%" }}
		>
			{children}
		</motion.div>
	);
}

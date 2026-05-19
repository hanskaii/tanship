import { useReducedMotion } from "framer-motion";

/** ease-out-expo: confident, decisive deceleration */
export const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

/** Staggered fade-up for hero children */
export function useHeroVariants() {
	const reduced = useReducedMotion();
	return {
		container: {
			hidden: {},
			show: {
				transition: {
					staggerChildren: reduced ? 0 : 0.1,
					delayChildren: reduced ? 0 : 0.05
				}
			}
		},
		item: {
			hidden: { opacity: 0, y: reduced ? 0 : 16 },
			show: {
				opacity: 1,
				y: 0,
				transition: {
					duration: reduced ? 0 : 0.5,
					ease: EASE_OUT_EXPO
				}
			}
		}
	};
}

/** Scroll-triggered fade-up for section content */
export function useRevealVariants() {
	const reduced = useReducedMotion();
	return {
		hidden: { opacity: 0, y: reduced ? 0 : 24 },
		show: {
			opacity: 1,
			y: 0,
			transition: {
				duration: reduced ? 0 : 0.6,
				ease: EASE_OUT_EXPO
			}
		}
	};
}

/** Staggered children for lists/rows */
export function useStaggerVariants(staggerSecs = 0.06) {
	const reduced = useReducedMotion();
	return {
		container: {
			hidden: {},
			show: {
				transition: {
					staggerChildren: reduced ? 0 : staggerSecs
				}
			}
		},
		item: {
			hidden: { opacity: 0, y: reduced ? 0 : 8 },
			show: {
				opacity: 1,
				y: 0,
				transition: {
					duration: reduced ? 0 : 0.4,
					ease: EASE_OUT_EXPO
				}
			}
		}
	};
}

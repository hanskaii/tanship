interface LogoProps {
	className?: string;
}

export function Logo({ className = "h-6 w-6" }: LogoProps) {
	return (
		<img
			src="/logo.avif"
			alt="Tanship"
			className={`object-contain ${className}`}
		/>
	);
}

import { HugeiconsIcon } from "@hugeicons/react";
import { FlashIcon } from "@hugeicons/core-free-icons";

export function FooterSection() {
	return (
		<footer className="py-12">
			<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
				<div className="flex items-center gap-3">
					<div className="w-8 h-8 bg-foreground flex items-center justify-center rounded-none">
						<HugeiconsIcon
							icon={FlashIcon}
							className="text-background size-4"
						/>
					</div>
					<span className="font-semibold text-foreground tracking-tight">
						Tanship
					</span>
				</div>
				<div className="flex gap-6 text-sm">
					<a
						href="#"
						className="text-muted-foreground hover:text-foreground transition-colors font-medium"
					>
						Documentation
					</a>
					<a
						href="#"
						className="text-muted-foreground hover:text-foreground transition-colors font-medium"
					>
						Twitter
					</a>
					<a
						href="#"
						className="text-muted-foreground hover:text-foreground transition-colors font-medium"
					>
						GitHub
					</a>
				</div>
			</div>
		</footer>
	);
}

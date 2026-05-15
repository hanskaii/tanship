import type { ErrorComponentProps } from "@tanstack/react-router";

export function DefaultErrorComponent({ error }: ErrorComponentProps) {
	return (
		<div className="flex h-svh w-full items-center justify-center bg-background text-foreground">
			<div className="flex flex-col items-center gap-5 text-center max-w-sm px-4">
				<div className="flex items-center justify-center size-12 rounded-none bg-destructive/10 text-destructive border border-destructive/20">
					<svg
						width="20"
						height="20"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
					>
						<title>Error</title>
						<circle cx="12" cy="12" r="10" />
						<line x1="12" y1="8" x2="12" y2="12" />
						<line x1="12" y1="16" x2="12.01" y2="16" />
					</svg>
				</div>
				<div className="flex flex-col gap-1.5">
					<h1 className="text-sm font-semibold tracking-tight text-foreground">
						Something went wrong
					</h1>
					<p className="text-xs text-muted-foreground leading-relaxed">
						{error.message || "An unexpected error occurred."}
					</p>
				</div>
				<div className="flex items-center gap-2">
					<button
						type="button"
						onClick={() => window.location.reload()}
						className="inline-flex h-8 items-center gap-1.5 rounded-none border border-border bg-background px-3 text-xs font-medium text-foreground transition-colors hover:bg-muted"
					>
						↻ Try Again
					</button>
					<a
						href="/"
						className="inline-flex h-8 items-center gap-1.5 rounded-none bg-foreground px-3 text-xs font-medium text-background transition-colors hover:bg-foreground/90"
					>
						← Home
					</a>
				</div>
			</div>
		</div>
	);
}

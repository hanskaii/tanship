export function DefaultNotFoundComponent() {
	return (
		<div className="flex h-svh w-full items-center justify-center bg-background text-foreground">
			<div className="flex flex-col items-center gap-4 text-center px-4">
				<h1 className="text-8xl font-black leading-none tracking-tight text-foreground/10 select-none">
					404
				</h1>
				<p className="text-sm text-muted-foreground">
					The page you're looking for doesn't exist.
				</p>
				<a
					href="/"
					className="inline-flex h-8 items-center gap-1.5 rounded-none border border-border bg-background px-3 text-xs font-medium text-foreground transition-colors hover:bg-muted"
				>
					← Back to Home
				</a>
			</div>
		</div>
	);
}

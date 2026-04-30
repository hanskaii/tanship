import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(app)/_home/legals/terms")({
	component: RouteComponent
});

function RouteComponent() {
	return (
		<div className="flex min-h-screen flex-col items-center bg-background px-4 sm:px-6 pt-24 pb-32">
			<div className="w-full max-w-3xl mx-auto flex flex-col gap-6">
				<h1 className="text-4xl font-semibold tracking-tight text-foreground border-b border-border/40 pb-6">
					Terms of Service
				</h1>
				<p className="text-muted-foreground text-sm leading-relaxed">
					Placeholder for terms of service.
				</p>
			</div>
		</div>
	);
}

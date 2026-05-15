import { Spinner } from "@workspace/ui";

export function DefaultPendingComponent() {
	return (
		<div className="flex h-svh w-full items-center justify-center bg-background">
			<Spinner className="size-6 text-muted-foreground" />
		</div>
	);
}

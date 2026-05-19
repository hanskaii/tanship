import { createFileRoute, redirect } from "@tanstack/react-router";
import { HireSection } from "@/routes/(app)/_home/-components/hire-section";
import { Button } from "@workspace/ui";
import { motion } from "framer-motion";
import { EASE_OUT_EXPO } from "@/routes/(app)/_home/-lib/motion";
import { Plans } from "@/routes/(app)/_home/-components/pricing-section";
import { sessionsOptions, useLogoutMutation } from "@/routes/-fn/auth";
import { Gate } from "@workspace/core";

export const Route = createFileRoute("/(app)/_home/upgrade/")({
	beforeLoad: async ({ context }) => {
		const session = await context.queryClient.fetchQuery(sessionsOptions());

		if (!session?.user) {
			throw redirect({ to: "/login" });
		}

		const result = await Gate.can("app.use", { actor: session.user });

		if (result.allowed) {
			throw redirect({ to: "/overview" });
		}

		return { session };
	},
	component: UpgradePage
});

function UpgradePage() {
	const {
		session: { user }
	} = Route.useRouteContext();
	const { logout, isPending: isLogoutPending } = useLogoutMutation();

	return (
		<main className="grid gap-6 px-4 sm:px-6 pb-32 pt-24">
			<motion.div
				className="mb-14"
				initial={{ opacity: 0, y: 16 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5, ease: EASE_OUT_EXPO }}
			>
				<h2
					className="mb-3 font-heading font-medium text-foreground"
					style={{
						fontSize: "clamp(2rem, 5vw, 3rem)",
						letterSpacing: "-0.04em",
						lineHeight: "1.05"
					}}
				>
					Upgrade to get access
				</h2>
				<p
					className="max-w-md text-muted-foreground"
					style={{
						fontSize: "15px",
						lineHeight: "1.6",
						letterSpacing: "-0.02em"
					}}
				>
					Get lifetime access to the boilerplate. Save hundreds of
					hours of development time.
				</p>
			</motion.div>

			<Plans />

			<HireSection />

			<div className="flex flex-col items-center gap-2">
				<p className="text-sm text-muted-foreground">
					Signed in as{" "}
					<span className="font-semibold text-foreground">
						{user?.email}
					</span>
				</p>
				<Button
					variant="ghost"
					size="sm"
					onClick={logout}
					disabled={isLogoutPending}
					className="text-[13px] text-muted-foreground hover:text-foreground"
				>
					{isLogoutPending ? "Logging out…" : "Log out"}
				</Button>
			</div>
		</main>
	);
}

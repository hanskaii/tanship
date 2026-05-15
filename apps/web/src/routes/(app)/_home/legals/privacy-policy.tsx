import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(app)/_home/legals/privacy-policy")({
	component: RouteComponent
});

function RouteComponent() {
	return (
		<div className="flex min-h-screen flex-col items-center bg-background px-4 pb-32 pt-24 sm:px-6">
			<article className="mx-auto w-full max-w-2xl">
				<header className="mb-10 border-b border-border/40 pb-8">
					<h1 className="text-4xl font-semibold tracking-tight text-foreground">
						Privacy Policy
					</h1>
					<p className="mt-3 text-sm text-muted-foreground">
						Last updated: January 1, 2025
					</p>
				</header>

				<div className="flex flex-col gap-8 text-sm leading-7 text-muted-foreground [&_h2]:mb-3 [&_h2]:mt-8 [&_h2]:text-base [&_h2]:font-semibold [&_h2]:text-foreground [&_p]:text-muted-foreground">
					<p>
						This Privacy Policy describes how Tanship ("we", "us",
						or "our") collects, uses, and shares information about
						you when you use our products and services.
					</p>

					<h2>Information We Collect</h2>
					<p>
						We collect information you provide directly to us, such
						as your name and email address when you create an
						account or make a purchase. We also collect technical
						information like your IP address and browser type
						through standard server logs.
					</p>

					<h2>How We Use Information</h2>
					<p>
						We use the information we collect to provide, maintain,
						and improve our services, process transactions, send
						transactional and promotional communications, and comply
						with legal obligations.
					</p>

					<h2>Information Sharing</h2>
					<p>
						We do not sell your personal information. We may share
						your information with third-party vendors who perform
						services on our behalf, such as payment processing and
						email delivery.
					</p>

					<h2>Data Retention</h2>
					<p>
						We retain your information for as long as your account
						is active or as needed to provide you with services. You
						may request deletion of your account data at any time by
						contacting us.
					</p>

					<h2>Contact Us</h2>
					<p>
						If you have any questions about this Privacy Policy,
						please contact us at{" "}
						<a
							href="mailto:support@tanship.com"
							className="font-medium text-foreground underline-offset-2 hover:underline"
						>
							support@tanship.com
						</a>
						.
					</p>
				</div>
			</article>
		</div>
	);
}

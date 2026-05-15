import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(app)/_home/legals/terms")({
	component: RouteComponent
});

function RouteComponent() {
	return (
		<div className="flex min-h-screen flex-col items-center bg-background px-4 pb-32 pt-24 sm:px-6">
			<article className="mx-auto w-full max-w-2xl">
				<header className="mb-10 border-b border-border/40 pb-8">
					<h1 className="text-4xl font-semibold tracking-tight text-foreground">
						Terms of Service
					</h1>
					<p className="mt-3 text-sm text-muted-foreground">
						Last updated: January 1, 2025
					</p>
				</header>

				<div className="flex flex-col gap-8 text-sm leading-7 text-muted-foreground [&_h2]:mb-3 [&_h2]:mt-8 [&_h2]:text-base [&_h2]:font-semibold [&_h2]:text-foreground [&_p]:text-muted-foreground">
					<p>
						By purchasing or using Tanship you agree to these Terms
						of Service. Please read them carefully.
					</p>

					<h2>License Grant</h2>
					<p>
						Upon purchase, you are granted a non-exclusive,
						non-transferable, perpetual license to use the Tanship
						source code for personal and commercial projects. You
						may not resell, redistribute, or sublicense the source
						code itself.
					</p>

					<h2>Permitted Uses</h2>
					<p>
						You may use Tanship to build unlimited personal and
						client projects, including SaaS applications, internal
						tools, and client deliverables. You retain full
						ownership of any application you build on top of
						Tanship.
					</p>

					<h2>Prohibited Uses</h2>
					<p>
						You may not resell, share, or distribute the Tanship
						source code or any substantially similar derivative as a
						competing boilerplate or starter kit product. Sharing
						your license key with others is also prohibited.
					</p>

					<h2>Refund Policy</h2>
					<p>
						Due to the nature of digital source code products, we
						generally do not offer refunds once access has been
						redeemed. If you have questions before purchasing,
						please reach out to us first.
					</p>

					<h2>Disclaimer of Warranties</h2>
					<p>
						Tanship is provided "as is" without warranty of any
						kind. We make no guarantees that the software will be
						error-free or uninterrupted.
					</p>

					<h2>Contact</h2>
					<p>
						Questions about these terms? Contact us at{" "}
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

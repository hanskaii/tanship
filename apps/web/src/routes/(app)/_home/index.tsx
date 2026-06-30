import { createFileRoute } from "@tanstack/react-router";
import { seo, SITE_NAME, SITE_URL, ogImageUrl } from "@/lib/seo";
import { HeroSection } from "./-components/hero-section";
import { TechStackSection } from "./-components/tech-stack-section";
import { StatementSection } from "./-components/statement-section";
import { ShowcaseSection } from "./-components/showcase-section";
import { BuildVsBuySection } from "./-components/build-vs-buy-section";
import { AiAgentsSection } from "./-components/ai-agents-section";
import { PricingSection } from "./-components/pricing-section";
import { HireSection } from "./-components/hire-section";
import { TemplatesSection } from "./-components/templates-section";
import { FaqSection } from "./-components/faq-section";
import { FooterSection } from "./-components/footer-section";
import { FeaturesSection } from "./-components/features-section";
import { DemoVideoSection } from "./-components/demo-video-section";
import { ScrollReveal } from "./-components/scroll-reveal";
import { ConsoleEgg } from "./-components/console-egg";
import { Fragment } from "react/jsx-runtime";

export const Route = createFileRoute("/(app)/_home/")({
	head: () =>
		seo({
			path: "/",
			ogEyebrow: "Tanship"
		}),
	component: HomePage
});

// Structured data helps Google render rich results for the product/site.
const JSON_LD = {
	"@context": "https://schema.org",
	"@graph": [
		{
			"@type": "Organization",
			"@id": `${SITE_URL}/#organization`,
			name: SITE_NAME,
			url: SITE_URL,
			logo: `${SITE_URL}/logo512.png`,
			sameAs: ["https://twitter.com/tanship"]
		},
		{
			"@type": "WebSite",
			"@id": `${SITE_URL}/#website`,
			url: SITE_URL,
			name: SITE_NAME,
			publisher: { "@id": `${SITE_URL}/#organization` }
		},
		{
			"@type": "SoftwareApplication",
			name: "Tanship",
			applicationCategory: "DeveloperApplication",
			operatingSystem: "Web",
			description:
				"Edge-native SaaS boilerplate built on TanStack Start, Cloudflare Workers, Hono, Drizzle, and Better Auth.",
			image: ogImageUrl({ title: "Tanship" }),
			offers: [
				{
					"@type": "Offer",
					name: "Tanship Standard",
					price: "99",
					priceCurrency: "USD"
				},
				{
					"@type": "Offer",
					name: "Tanship Pro",
					price: "299",
					priceCurrency: "USD"
				}
			]
		}
	]
};

function HomePage() {
	return (
		<Fragment>
			<script
				type="application/ld+json"
				// eslint-disable-next-line react/no-danger
				dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
			/>
			<ConsoleEgg />
			<main className="px-4 sm:px-6">
				{/* Hero animates itself on mount */}
				<HeroSection />

				<ScrollReveal>
					<DemoVideoSection />
				</ScrollReveal>

				<ScrollReveal>
					<TechStackSection />
				</ScrollReveal>

				<ScrollReveal>
					<StatementSection />
				</ScrollReveal>

				<ScrollReveal>
					<ShowcaseSection />
				</ScrollReveal>

				<ScrollReveal>
					<FeaturesSection />
				</ScrollReveal>

				{/* BuildVsBuySection has its own internal stagger on the rows */}
				<ScrollReveal>
					<BuildVsBuySection />
				</ScrollReveal>

				<ScrollReveal>
					<AiAgentsSection />
				</ScrollReveal>

				<ScrollReveal>
					<PricingSection />
				</ScrollReveal>

				<ScrollReveal>
					<HireSection />
				</ScrollReveal>

				<ScrollReveal>
					<TemplatesSection />
				</ScrollReveal>

				<ScrollReveal>
					<FaqSection />
				</ScrollReveal>
			</main>

			<ScrollReveal>
				<FooterSection />
			</ScrollReveal>
		</Fragment>
	);
}

import { createFileRoute } from "@tanstack/react-router";
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
import { Fragment } from "react/jsx-runtime";

export const Route = createFileRoute("/(app)/_home/")({
	component: HomePage
});

function HomePage() {
	return (
		<Fragment>
			<main className="px-4 sm:px-6">
				<HeroSection />
				<DemoVideoSection />
				<TechStackSection />
				<StatementSection />
				<ShowcaseSection />
				<FeaturesSection />
				<BuildVsBuySection />
				<AiAgentsSection />
				<PricingSection />
				<HireSection />
				<TemplatesSection />
				<FaqSection />
			</main>

			<FooterSection />
		</Fragment>
	);
}

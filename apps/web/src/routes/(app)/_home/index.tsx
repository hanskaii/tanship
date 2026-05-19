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
import { ScrollReveal } from "./-components/scroll-reveal";
import { ConsoleEgg } from "./-components/console-egg";
import { Fragment } from "react/jsx-runtime";

export const Route = createFileRoute("/(app)/_home/")({
	component: HomePage
});

function HomePage() {
	return (
		<Fragment>
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

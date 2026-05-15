import { createFileRoute } from "@tanstack/react-router";
import { HeroSection } from "./-components/hero-section";
import { ShowcaseSection } from "./-components/showcase-section";
import { TechStackSection } from "./-components/tech-stack-section";
import { FeaturesSection } from "./-components/features-section";
import { CostComparisonSection } from "./-components/cost-comparison-section";
import { ComparisonSection } from "./-components/comparison-section";
import { BuildVsBuySection } from "./-components/build-vs-buy-section";
import { AiAgentsSection } from "./-components/ai-agents-section";
import { TestimonialsSection } from "./-components/testimonials-section";
import { TemplatesSection } from "./-components/templates-section";
import { PricingSection } from "./-components/pricing-section";
import { FaqSection } from "./-components/faq-section";
import { FooterSection } from "./-components/footer-section";

export const Route = createFileRoute("/(app)/_home/")({
	component: HomePage
});

function HomePage() {
	return (
		<div className="bg-background text-foreground antialiased min-h-screen flex flex-col font-sans selection:bg-primary selection:text-primary-foreground mx-auto w-full max-w-3xl px-4 sm:px-6 pt-14">
			<main className="flex-grow">
				<HeroSection />
				<ShowcaseSection />
				<TechStackSection />
				<FeaturesSection />
				<CostComparisonSection />
				<ComparisonSection />
				<BuildVsBuySection />
				<AiAgentsSection />
				<TestimonialsSection />
				<TemplatesSection />
				<PricingSection />
				<FaqSection />
			</main>

			<FooterSection />
		</div>
	);
}

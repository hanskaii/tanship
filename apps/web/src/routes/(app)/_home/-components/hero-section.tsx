import { Link } from "@tanstack/react-router";
import { Button } from "@workspace/ui";

export function HeroSection() {
	return (
		<section className="pt-24 pb-16 border-b border-border/40">
			<div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/30 border border-border/50 text-xs font-medium mb-8">
				<span className="flex h-1.5 w-1.5 rounded-full bg-primary"></span>
				Tanship v1.0 is now live
			</div>
			<h1 className="text-5xl sm:text-6xl font-semibold tracking-tight text-foreground mb-6 leading-[1.1] text-balance">
				Build your next idea <br /> even faster.
			</h1>
			<p className="text-lg text-muted-foreground mb-10 leading-relaxed max-w-2xl font-normal text-balance">
				Stop wasting weeks wiring up databases, auth providers, and
				payment gateways. Get a production-ready foundation deployed on
				the edge in seconds.
			</p>
			<div className="flex flex-wrap gap-4">
				<Button
					size="lg"
					className="rounded-none bg-foreground text-background hover:bg-foreground/90 font-medium px-8 h-14"
					asChild
				>
					<Link to="/login">Start Building</Link>
				</Button>
				<Button
					variant="ghost"
					size="lg"
					className="rounded-none text-foreground hover:bg-muted font-medium px-8 h-14 border border-border/50"
					asChild
				>
					<Link to="/docs">Explore Docs</Link>
				</Button>
			</div>
		</section>
	);
}

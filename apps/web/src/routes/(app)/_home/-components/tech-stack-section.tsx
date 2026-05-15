import {
	TanstackIcon,
	CloudflareIcon,
	OXCIcon,
	DodoPaymentIcon,
	HonoIcon,
	DrizzleIcon,
	TailwindIcon,
	BetterAuthIcon
} from "../../../-components/icons";

const STACK = [
	{
		name: "TanStack Start",
		desc: "The most popular type-safe full-stack React framework.",
		Icon: TanstackIcon
	},
	{
		name: "Cloudflare",
		desc: "Complete edge infrastructure: Workers, D1, R2, and more.",
		Icon: CloudflareIcon
	},
	{
		name: "OXC",
		desc: "The Oxidation Compiler — high-performance JS/TS toolchain.",
		Icon: OXCIcon
	},
	{
		name: "Better Auth",
		desc: "The most comprehensive open-source auth library.",
		Icon: BetterAuthIcon
	},
	{
		name: "Drizzle ORM",
		desc: "Lightweight, performant, headless TypeScript ORM.",
		Icon: DrizzleIcon
	},
	{
		name: "Dodo Payments",
		desc: "Global payment processing and billing infrastructure.",
		Icon: DodoPaymentIcon
	},
	{
		name: "Hono",
		desc: "Ultrafast, lightweight, edge-native web framework.",
		Icon: HonoIcon
	},
	{
		name: "Tailwind CSS v4",
		desc: "The utility-first CSS framework for rapid UI development.",
		Icon: TailwindIcon
	}
];

export function TechStackSection() {
	return (
		<section className="border-b border-border/40 py-20">
			<div className="mb-14 text-center">
				<h2 className="mb-3 text-3xl font-semibold tracking-tight text-foreground">
					Built on the best stack
				</h2>
				<p className="mx-auto max-w-xl text-base text-muted-foreground">
					Industry-standard tools, chosen for performance, developer
					experience, and zero lock-in.
				</p>
			</div>

			<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
				{STACK.map(({ name, desc, Icon }) => (
					<div
						key={name}
						className="group flex flex-col gap-3 border border-border/50 bg-background p-5 transition-colors hover:border-border dark:bg-muted/5"
					>
						<div className="flex items-center gap-3">
							<div className="flex h-8 w-8 items-center justify-center border border-border/50 bg-muted/20 transition-colors group-hover:border-foreground/20">
								<Icon className="size-4 text-foreground" />
							</div>
							<span className="text-sm font-semibold text-foreground">
								{name}
							</span>
						</div>
						<p className="text-xs leading-relaxed text-muted-foreground">
							{desc}
						</p>
					</div>
				))}
			</div>
		</section>
	);
}

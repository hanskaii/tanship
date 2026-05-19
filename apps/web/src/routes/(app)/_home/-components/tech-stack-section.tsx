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
		desc: "Complete cloud infrastructure: Workers, D1, R2, and more.",
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
		desc: "Ultrafast, lightweight web framework built for speed.",
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
			<div className="mb-14">
				<h2
					className="mb-3 font-heading font-medium text-foreground"
					style={{
						fontSize: "clamp(2rem, 5vw, 3rem)",
						letterSpacing: "-0.04em",
						lineHeight: "1.05"
					}}
				>
					Built on the best stack
				</h2>
				<p
					className="max-w-xl text-muted-foreground"
					style={{
						fontSize: "15px",
						lineHeight: "1.6",
						letterSpacing: "-0.02em"
					}}
				>
					Industry-standard tools, chosen for performance, developer
					experience, and zero lock-in.
				</p>
			</div>

			<div className="rounded-2xl bg-secondary p-2">
				<div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
					{STACK.map(({ name, desc, Icon }) => (
						<div
							key={name}
							className="group flex flex-col gap-8 rounded-xl bg-card p-6"
						>
							<Icon className="size-7 text-foreground transition-transform duration-200 ease-out group-hover:scale-110" />
							<div className="flex flex-col gap-1">
								<span
									className="font-medium text-foreground"
									style={{
										fontSize: "14px",
										letterSpacing: "-0.01em"
									}}
								>
									{name}
								</span>
								<p
									className="leading-relaxed text-muted-foreground"
									style={{
										fontSize: "12px",
										letterSpacing: "-0.01em"
									}}
								>
									{desc}
								</p>
							</div>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}

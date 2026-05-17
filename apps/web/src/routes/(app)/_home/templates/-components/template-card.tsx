import { Button, Spinner } from "@workspace/ui";
import { HugeiconsIcon } from "@hugeicons/react";
import {
	ArrowRight01Icon,
	GithubIcon,
	CheckmarkCircle01Icon,
	ArrowUpRight01Icon
} from "@hugeicons/core-free-icons";
import { Link } from "@tanstack/react-router";

export interface TemplateItem {
	id: string;
	slug: string;
	name: string;
	description: string;
	tags: string[];
	previewBg?: string;
	previewUrl?: string;
}

interface TemplateCardProps {
	template: TemplateItem;
	isProUser: boolean;
	hasPurchased: boolean;
	isLoggedIn: boolean;
	onUpgrade: () => void;
	onBuyTemplate: () => void;
	isCheckoutLoading?: boolean;
	index: number;
}

export function TemplateCard({
	template,
	isProUser,
	hasPurchased,
	isLoggedIn,
	onUpgrade,
	onBuyTemplate,
	isCheckoutLoading,
	index: _index
}: TemplateCardProps) {
	const hasAccess = isProUser || hasPurchased;
	const img1 = `https://picsum.photos/seed/${template.id}-a/700/440`;
	const img2 = `https://picsum.photos/seed/${template.id}-b/700/440`;

	return (
		<div className="rounded-2xl bg-secondary p-2">
			<div className="group flex flex-col gap-6 rounded-xl bg-card px-5 py-6 sm:grid sm:grid-cols-3 sm:gap-6 sm:px-6 sm:py-8">
				{/* Text column */}
				<div className="flex flex-col gap-4 justify-between">
					<div className="flex flex-col gap-2">
						<div className="flex items-start justify-between gap-2">
							<h3
								className="text-base font-semibold leading-tight text-foreground"
								style={{ letterSpacing: "-0.02em" }}
							>
								{template.name}
							</h3>
							{template.previewUrl && (
								<a
									href={template.previewUrl}
									target="_blank"
									rel="noreferrer"
									className="shrink-0 text-muted-foreground transition-colors hover:text-foreground"
									title="Live preview"
								>
									<HugeiconsIcon
										icon={ArrowUpRight01Icon}
										className="size-4"
									/>
								</a>
							)}
						</div>
						<p className="text-xs text-muted-foreground">
							{template.tags.join(" · ")}
						</p>
						<p className="text-sm leading-relaxed text-muted-foreground mt-1">
							{template.description}
						</p>
					</div>

					<div className="flex flex-col gap-2">
						{hasAccess ? (
							<>
								{hasPurchased && !isProUser && (
									<span className="flex items-center gap-1 text-[11px] font-medium text-emerald-600">
										<HugeiconsIcon
											icon={CheckmarkCircle01Icon}
											className="size-3.5"
										/>
										Owned
									</span>
								)}
								{isProUser && (
									<span className="text-[11px] font-medium text-muted-foreground">
										Included with Pro
									</span>
								)}
								<Button
									size="sm"
									className="w-fit h-7 px-3 text-xs bg-foreground text-background hover:bg-foreground/90"
									asChild
								>
									<a
										href={`/api/templates/${template.id}/download`}
										download
									>
										<HugeiconsIcon
											icon={GithubIcon}
											className="mr-1.5 size-3"
										/>
										Download
									</a>
								</Button>
							</>
						) : (
							<>
								<p className="text-sm font-semibold text-foreground">
									$99{" "}
									<span className="font-normal text-muted-foreground text-xs">
										or{" "}
										<button
											onClick={onUpgrade}
											className="text-foreground hover:underline underline-offset-2 font-medium"
										>
											included with Pro
										</button>
									</span>
								</p>
								{isLoggedIn ? (
									<Button
										size="sm"
										className="w-fit h-7 px-3 text-xs bg-foreground text-background hover:bg-foreground/90"
										onClick={onBuyTemplate}
										disabled={isCheckoutLoading}
									>
										{isCheckoutLoading ? (
											<Spinner className="size-3 mr-1" />
										) : (
											<HugeiconsIcon
												icon={ArrowRight01Icon}
												className="mr-1 size-3"
											/>
										)}
										Buy — $99
									</Button>
								) : (
									<Button
										size="sm"
										className="w-fit h-7 px-3 text-xs bg-foreground text-background hover:bg-foreground/90"
										asChild
									>
										<Link to="/login">Buy — $99</Link>
									</Button>
								)}
							</>
						)}
					</div>
				</div>

				{/* Preview slider */}
				<div
					className="col-span-2 flex gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
					style={{ scrollSnapType: "x mandatory" }}
				>
					{[img1, img2].map((src, i) => (
						<div
							key={i}
							className="aspect-[14/9] w-[80%] shrink-0 overflow-hidden rounded-xl bg-card"
							style={{ scrollSnapAlign: "start" }}
						>
							<img
								src={src}
								alt={`${template.name} preview ${i + 1}`}
								className="h-full w-full object-cover"
								loading="lazy"
							/>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}

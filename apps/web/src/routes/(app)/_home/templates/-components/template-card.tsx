import { Badge, Button, Card, Spinner } from "@workspace/ui";
import { HugeiconsIcon } from "@hugeicons/react";
import {
	FlashIcon,
	ArrowRight01Icon,
	GithubIcon,
	CheckmarkCircle01Icon,
	EyeIcon
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
}

export function TemplateCard({
	template,
	isProUser,
	hasPurchased,
	isLoggedIn,
	onUpgrade,
	onBuyTemplate,
	isCheckoutLoading
}: TemplateCardProps) {
	const hasAccess = isProUser || hasPurchased;

	return (
		<Card className="group relative flex flex-col overflow-hidden border border-border/50 bg-background p-0 text-left ring-0 transition-all hover:border-border hover:shadow-sm dark:bg-muted/5">
			{/* Preview area */}
			<div
				className={`relative h-36 overflow-hidden border-b border-border/40 bg-gradient-to-br ${template.previewBg ?? "from-primary/5 via-primary/10 to-primary/5"} flex items-center justify-center`}
			>
				<div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border)/0.2)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.2)_1px,transparent_1px)] bg-[size:16px_16px]" />
				<div className="relative z-10 flex h-11 w-11 items-center justify-center border border-border/50 bg-background/80 shadow-sm backdrop-blur-sm transition-transform duration-300 group-hover:scale-105">
					<HugeiconsIcon
						icon={FlashIcon}
						className="size-5 text-foreground"
					/>
				</div>

				{/* Owned badge */}
				{hasPurchased && !isProUser && (
					<div className="absolute right-2.5 top-2.5 z-10 flex items-center gap-1 border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-600">
						<HugeiconsIcon
							icon={CheckmarkCircle01Icon}
							className="size-3"
						/>
						Owned
					</div>
				)}
				{isProUser && (
					<div className="absolute right-2.5 top-2.5 z-10 flex items-center gap-1 border border-foreground/20 bg-foreground/10 px-2 py-0.5 text-[10px] font-semibold text-foreground">
						Pro
					</div>
				)}
			</div>

			{/* Info */}
			<div className="flex flex-col gap-3 p-5 flex-1">
				<div className="flex flex-col gap-1.5 flex-1">
					<h3 className="text-sm font-semibold leading-tight text-foreground">
						{template.name}
					</h3>
					<p className="text-xs leading-relaxed text-muted-foreground">
						{template.description}
					</p>
				</div>

				{/* Tags */}
				<div className="flex flex-wrap gap-1.5">
					{template.tags.map((tag) => (
						<Badge
							key={tag}
							variant="secondary"
							className="h-5 rounded-none px-2 py-0 text-[10px] font-medium bg-muted/40"
						>
							{tag}
						</Badge>
					))}
				</div>

				{/* Actions */}
				<div className="flex flex-col gap-2 border-t border-border/40 pt-3">
					{template.previewUrl && (
						<Button
							size="sm"
							variant="outline"
							className="h-8 w-full rounded-none text-xs"
							asChild
						>
							<a
								href={template.previewUrl}
								target="_blank"
								rel="noreferrer"
							>
								<HugeiconsIcon
									icon={EyeIcon}
									className="mr-1.5 size-3.5"
								/>
								Live Preview
							</a>
						</Button>
					)}

					<div className="flex items-center gap-2">
						{hasAccess ? (
							<Button
								size="sm"
								className="h-8 flex-1 rounded-none text-xs"
								asChild
							>
								<a
									href={`/api/templates/${template.id}/download`}
									download
								>
									<HugeiconsIcon
										icon={GithubIcon}
										className="mr-1.5 size-3.5"
									/>
									Download
								</a>
							</Button>
						) : isLoggedIn ? (
							<>
								<Button
									size="sm"
									variant="outline"
									className="h-8 flex-1 rounded-none text-xs"
									onClick={onUpgrade}
									disabled={isCheckoutLoading}
								>
									<HugeiconsIcon
										icon={FlashIcon}
										className="mr-1.5 size-3.5"
									/>
									All — $299
								</Button>
								<Button
									size="sm"
									className="h-8 flex-1 rounded-none text-xs"
									onClick={onBuyTemplate}
									disabled={isCheckoutLoading}
								>
									{isCheckoutLoading ? (
										<Spinner className="mr-1.5 size-3.5" />
									) : (
										<HugeiconsIcon
											icon={ArrowRight01Icon}
											className="mr-1.5 size-3.5"
										/>
									)}
									Buy — $99
								</Button>
							</>
						) : (
							<>
								<Button
									size="sm"
									variant="outline"
									className="h-8 flex-1 rounded-none text-xs"
									onClick={onUpgrade}
								>
									<HugeiconsIcon
										icon={FlashIcon}
										className="mr-1.5 size-3.5"
									/>
									All — $299
								</Button>
								<Button
									size="sm"
									className="h-8 flex-1 rounded-none text-xs"
									asChild
								>
									<Link to="/login">
										<HugeiconsIcon
											icon={ArrowRight01Icon}
											className="mr-1.5 size-3.5"
										/>
										Buy — $99
									</Link>
								</Button>
							</>
						)}
					</div>
				</div>
			</div>
		</Card>
	);
}

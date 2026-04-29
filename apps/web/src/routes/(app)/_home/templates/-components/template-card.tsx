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
	/** Matches the payment slug, e.g. "template-saas-dashboard" */
	slug: string;
	name: string;
	description: string;
	tags: string[];
	previewBg?: string;
	/** Live preview URL shown to all users before purchasing */
	previewUrl?: string;
}

interface TemplateCardProps {
	template: TemplateItem;
	isProUser: boolean;
	/** User has purchased this specific template individually */
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
		<Card className="group relative flex flex-col border-none bg-muted/20 ring-1 ring-border/50 transition-all hover:ring-primary/30 backdrop-blur-sm overflow-hidden text-left p-0">
			{/* Preview area */}
			<div
				className={`h-36 bg-gradient-to-br ${template.previewBg ?? "from-primary/5 via-primary/10 to-primary/5"} flex items-center justify-center border-b border-border/30 relative overflow-hidden`}
			>
				<div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]" />
				<div className="flex items-center justify-center size-12 rounded-2xl bg-background/80 border border-border/50 backdrop-blur-sm shadow-lg relative z-10">
					<HugeiconsIcon
						icon={FlashIcon}
						className="size-5 text-primary"
					/>
				</div>
				{/* "Owned" badge for individually purchased templates */}
				{hasPurchased && !isProUser && (
					<div className="absolute top-2.5 right-2.5 z-10 flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-semibold text-emerald-600">
						<HugeiconsIcon
							icon={CheckmarkCircle01Icon}
							className="size-3"
						/>
						Owned
					</div>
				)}
			</div>

			<div className="flex flex-col gap-3 p-4 flex-1">
				<div className="flex flex-col gap-1.5 flex-1">
					<h3 className="font-bold text-sm leading-tight">
						{template.name}
					</h3>
					<p className="text-[11px] text-muted-foreground leading-relaxed">
						{template.description}
					</p>
				</div>

				{/* Tags */}
				<div className="flex flex-wrap gap-1.5">
					{template.tags.map((tag) => (
						<Badge
							key={tag}
							variant="secondary"
							className="text-[9px] px-1.5 py-0 h-4 bg-muted/40 font-medium"
						>
							{tag}
						</Badge>
					))}
				</div>

				{/* Actions */}
				<div className="flex flex-col gap-2 pt-1 border-t border-border/40">
					{/* Preview — always visible */}
					{template.previewUrl && (
						<Button
							size="sm"
							variant="outline"
							className="w-full h-7 text-[11px]"
							asChild
						>
							<a
								href={template.previewUrl}
								target="_blank"
								rel="noreferrer"
							>
								<HugeiconsIcon
									icon={EyeIcon}
									className="size-3 mr-1.5"
								/>
								Live Preview
							</a>
						</Button>
					)}

					<div className="flex items-center gap-2">
						{hasAccess ? (
							/* Pro or individually purchased → direct R2 download */
							<Button
								size="sm"
								className="flex-1 h-7 text-[11px]"
								asChild
							>
								<a
									href={`/api/templates/${template.id}/download`}
									download
								>
									<HugeiconsIcon
										icon={GithubIcon}
										className="size-3 mr-1.5"
									/>
									Download
								</a>
							</Button>
						) : isLoggedIn ? (
							/* Logged in, no access — show both options */
							<>
								<Button
									size="sm"
									variant="outline"
									className="flex-1 h-7 text-[11px]"
									onClick={onUpgrade}
									disabled={isCheckoutLoading}
								>
									<HugeiconsIcon
										icon={FlashIcon}
										className="size-3 mr-1.5"
									/>
									All — $299
								</Button>
								<Button
									size="sm"
									className="flex-1 h-7 text-[11px]"
									onClick={onBuyTemplate}
									disabled={isCheckoutLoading}
								>
									{isCheckoutLoading ? (
										<Spinner className="size-3 mr-1.5" />
									) : (
										<HugeiconsIcon
											icon={ArrowRight01Icon}
											className="size-3 mr-1.5"
										/>
									)}
									Buy — $99
								</Button>
							</>
						) : (
							/* Not logged in */
							<>
								<Button
									size="sm"
									variant="outline"
									className="flex-1 h-7 text-[11px]"
									onClick={onUpgrade}
								>
									<HugeiconsIcon
										icon={FlashIcon}
										className="size-3 mr-1.5"
									/>
									All — $299
								</Button>
								<Button
									size="sm"
									className="flex-1 h-7 text-[11px]"
									asChild
								>
									<Link to="/login">
										<HugeiconsIcon
											icon={ArrowRight01Icon}
											className="size-3 mr-1.5"
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

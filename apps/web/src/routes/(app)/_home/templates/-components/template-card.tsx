import { Badge, Button, Card } from "@workspace/ui";
import { HugeiconsIcon } from "@hugeicons/react";
import { FlashIcon, ArrowRight01Icon, GithubIcon } from "@hugeicons/core-free-icons";
import { Link } from "@tanstack/react-router";
import { toast } from "@workspace/ui";

export interface TemplateItem {
	id: string;
	name: string;
	description: string;
	tags: string[];
	previewBg?: string;
}

interface TemplateCardProps {
	template: TemplateItem;
	isProUser: boolean;
	isLoggedIn: boolean;
	onUpgrade: () => void;
}

export function TemplateCard({
	template,
	isProUser,
	isLoggedIn,
	onUpgrade
}: TemplateCardProps) {
	const handleIndividualBuy = () => {
		toast.info("Individual templates coming soon!");
	};

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
				<div className="flex items-center gap-2 pt-1 border-t border-border/40">
					{isProUser ? (
						<Button
							size="sm"
							className="flex-1 h-7 text-[11px]"
							asChild
						>
							<a
								href={`https://github.com`}
								target="_blank"
								rel="noreferrer"
							>
								<HugeiconsIcon
									icon={GithubIcon}
									className="size-3 mr-1.5"
								/>
								Download
							</a>
						</Button>
					) : isLoggedIn ? (
						<Button
							size="sm"
							className="flex-1 h-7 text-[11px]"
							onClick={onUpgrade}
						>
							<HugeiconsIcon
								icon={ArrowRight01Icon}
								className="size-3 mr-1.5"
							/>
							Upgrade to Pro
						</Button>
					) : (
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
								Sign in to buy
							</Link>
						</Button>
					)}
					<Button
						size="sm"
						variant="ghost"
						className="h-7 text-[11px] text-muted-foreground shrink-0"
						onClick={handleIndividualBuy}
					>
						$99
					</Button>
				</div>
			</div>
		</Card>
	);
}

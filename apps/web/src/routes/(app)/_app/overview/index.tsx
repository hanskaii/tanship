import { createFileRoute, Link } from "@tanstack/react-router";
import { Suspense, useContext, useMemo } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { AppModalContext } from "@/routes/-components/providers/app-modal-provider";
import {
	Button,
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
	Skeleton,
	Separator
} from "@workspace/ui";
import { HugeiconsIcon } from "@hugeicons/react";
import {
	UserCircleIcon,
	CreditCardIcon,
	Activity01Icon,
	Shield01Icon,
	ArrowRight01Icon,
	ArrowUpRight01Icon,
	Invoice01Icon,
	SparklesIcon
} from "@hugeicons/core-free-icons";
import {
	subscriptionsQueryOptions,
	paymentsQueryOptions,
	listApiKeysQueryOptions,
	type DodoSubscription,
	type DodoPayment,
	type ApiKey
} from "@/routes/-fn/auth";
import { purchasesQueryOptions, type Purchase } from "@/routes/-fn/purchases";
import {
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
	type ChartConfig
} from "@workspace/ui";
import { Area, AreaChart, XAxis, YAxis, CartesianGrid } from "recharts";

export const Route = createFileRoute("/(app)/_app/overview/")({
	component: DashboardPage
});

function DashboardPage() {
	const { session } = Route.useRouteContext();
	const user = session?.user;

	return (
		<div className="flex flex-col gap-6 w-full mt-2 pb-16">
			{/* Page Header */}
			<div className="flex flex-col gap-1 px-1">
				<h1 className="text-xl font-heading font-semibold text-foreground tracking-tight">
					Welcome back, {user?.name || user?.email || "User"}
				</h1>
				<p className="text-xs text-muted-foreground">
					Here's what's happening with your account and projects.
				</p>
			</div>

			<Suspense fallback={<DashboardSkeleton />}>
				<DashboardContent />
			</Suspense>
		</div>
	);
}

function DashboardContent() {
	const { openCreateApiKeyModal, openShowApiKeyModal } =
		useContext(AppModalContext);

	// Load all dashboard query dependencies in parallel
	const { data: subscriptionsData } = useSuspenseQuery(
		subscriptionsQueryOptions(10, 1)
	);
	const { data: paymentsData } = useSuspenseQuery(paymentsQueryOptions(5, 1));
	const { data: apiKeys } = useSuspenseQuery(listApiKeysQueryOptions());
	const { data: purchases } = useSuspenseQuery(purchasesQueryOptions());

	const subscriptions =
		(subscriptionsData as { items: DodoSubscription[] })?.items ?? [];
	const payments = (paymentsData as { items: DodoPayment[] })?.items ?? [];
	const activeSubscription = subscriptions.find((s) => s.status === "active");

	const handleCreateKey = () => {
		openCreateApiKeyModal((key) => {
			openShowApiKeyModal(key);
		});
	};

	// Generate some stylized mock analytics chart data representing usage/requests
	const chartData = useMemo(() => {
		return [
			{ date: "Jul 15", requests: 1200, users: 40 },
			{ date: "Jul 16", requests: 2100, users: 65 },
			{ date: "Jul 17", requests: 1800, users: 58 },
			{ date: "Jul 18", requests: 2400, users: 80 },
			{ date: "Jul 19", requests: 3100, users: 95 },
			{ date: "Jul 20", requests: 2800, users: 90 },
			{ date: "Jul 21", requests: 3500, users: 110 }
		];
	}, []);

	const chartConfig = {
		requests: {
			label: "API Requests",
			color: "var(--primary)"
		}
	} satisfies ChartConfig;

	return (
		<div className="flex flex-col gap-6">
			{/* Stats Cards Grid */}
			<div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
				{/* Plan Card */}
				<Card className="rounded-xl bg-card border border-border/40 ring-1 ring-foreground/5 shadow-none">
					<CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
						<CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
							Active Plan
						</CardTitle>
						<HugeiconsIcon
							icon={CreditCardIcon}
							className="size-4 text-primary"
						/>
					</CardHeader>
					<CardContent className="flex flex-col gap-1">
						<div className="text-lg font-bold text-foreground truncate">
							{activeSubscription
								? (activeSubscription.productName ?? "Pro Plan")
								: purchases.length > 0
									? "Lifetime Pro"
									: "Free Tier"}
						</div>
						<p className="text-[10px] text-muted-foreground truncate">
							{activeSubscription
								? "Renews periodically"
								: purchases.length > 0
									? "Unlimited repository access"
									: "Upgrade for premium features"}
						</p>
					</CardContent>
				</Card>

				{/* Purchases Card */}
				<Card className="rounded-xl bg-card border border-border/40 ring-1 ring-foreground/5 shadow-none">
					<CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
						<CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
							Licenses / Claims
						</CardTitle>
						<HugeiconsIcon
							icon={SparklesIcon}
							className="size-4 text-primary"
						/>
					</CardHeader>
					<CardContent className="flex flex-col gap-1">
						<div className="text-lg font-bold text-foreground">
							{purchases.length} Active
						</div>
						<p className="text-[10px] text-muted-foreground truncate">
							{purchases.length > 0
								? "GitHub access configured"
								: "No claimed templates"}
						</p>
					</CardContent>
				</Card>

				{/* API Keys Card */}
				<Card className="rounded-xl bg-card border border-border/40 ring-1 ring-foreground/5 shadow-none">
					<CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
						<CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
							API Keys
						</CardTitle>
						<HugeiconsIcon
							icon={Shield01Icon}
							className="size-4 text-primary"
						/>
					</CardHeader>
					<CardContent className="flex flex-col gap-1">
						<div className="text-lg font-bold text-foreground">
							{apiKeys.length} Active
						</div>
						<p className="text-[10px] text-muted-foreground truncate">
							{apiKeys.length > 0
								? "Keys configured for API usage"
								: "No generated API keys"}
						</p>
					</CardContent>
				</Card>

				{/* Transactions Card */}
				<Card className="rounded-xl bg-card border border-border/40 ring-1 ring-foreground/5 shadow-none">
					<CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
						<CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
							Transactions
						</CardTitle>
						<HugeiconsIcon
							icon={Invoice01Icon}
							className="size-4 text-primary"
						/>
					</CardHeader>
					<CardContent className="flex flex-col gap-1">
						<div className="text-lg font-bold text-foreground">
							{payments.length} Payments
						</div>
						<p className="text-[10px] text-muted-foreground truncate">
							{payments.length > 0
								? "Latest payment processed"
								: "No payment transactions"}
						</p>
					</CardContent>
				</Card>
			</div>

			{/* Main Grid: Analytics & Actions */}
			<div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
				{/* Chart Container */}
				<Card className="rounded-xl bg-card border border-border/40 ring-1 ring-foreground/5 shadow-none lg:col-span-2">
					<CardHeader className="pb-4">
						<div className="flex items-center justify-between">
							<div className="space-y-1">
								<CardTitle className="text-sm font-semibold text-foreground">
									Application Traffic
								</CardTitle>
								<CardDescription className="text-[11px] text-muted-foreground">
									Daily API request load and developer
									signups.
								</CardDescription>
							</div>
							<HugeiconsIcon
								icon={Activity01Icon}
								className="size-4 text-muted-foreground"
							/>
						</div>
					</CardHeader>
					<CardContent className="pt-2">
						<ChartContainer
							config={chartConfig}
							className="h-64 w-full"
						>
							<AreaChart
								data={chartData}
								margin={{
									left: -10,
									right: 10,
									top: 10,
									bottom: 0
								}}
							>
								<defs>
									<linearGradient
										id="requestsGradient"
										x1="0"
										y1="0"
										x2="0"
										y2="1"
									>
										<stop
											offset="5%"
											stopColor="var(--color-requests)"
											stopOpacity={0.2}
										/>
										<stop
											offset="95%"
											stopColor="var(--color-requests)"
											stopOpacity={0}
										/>
									</linearGradient>
								</defs>
								<CartesianGrid
									vertical={false}
									strokeDasharray="3 3"
									className="stroke-muted-foreground/10"
								/>
								<XAxis
									dataKey="date"
									tickLine={false}
									tickMargin={10}
									axisLine={false}
									className="text-[10px] fill-muted-foreground"
								/>
								<YAxis
									tickLine={false}
									axisLine={false}
									tickMargin={10}
									className="text-[10px] fill-muted-foreground"
								/>
								<ChartTooltip
									cursor={false}
									content={<ChartTooltipContent hideLabel />}
								/>
								<Area
									type="monotone"
									dataKey="requests"
									stroke="var(--color-requests)"
									strokeWidth={2}
									fillOpacity={1}
									fill="url(#requestsGradient)"
								/>
							</AreaChart>
						</ChartContainer>
					</CardContent>
				</Card>

				{/* Quick Actions Panel */}
				<Card className="rounded-xl bg-card border border-border/40 ring-1 ring-foreground/5 shadow-none flex flex-col justify-between">
					<CardHeader className="pb-4">
						<CardTitle className="text-sm font-semibold text-foreground">
							Quick Actions
						</CardTitle>
						<CardDescription className="text-[11px] text-muted-foreground">
							Common developer workspace tasks.
						</CardDescription>
					</CardHeader>
					<CardContent className="flex-1 flex flex-col gap-3">
						<Button
							onClick={handleCreateKey}
							className="w-full h-9 justify-start text-xs"
						>
							<HugeiconsIcon
								icon={Shield01Icon}
								className="size-3.5 mr-2"
							/>
							Create API Key
						</Button>

						<Button
							variant="outline"
							className="w-full h-9 justify-start text-xs"
							asChild
						>
							<Link to="/account/billing">
								<HugeiconsIcon
									icon={CreditCardIcon}
									className="size-3.5 mr-2"
								/>
								Manage Billing & Subscriptions
							</Link>
						</Button>

						<Button
							variant="outline"
							className="w-full h-9 justify-start text-xs"
							asChild
						>
							<Link to="/account/profile">
								<HugeiconsIcon
									icon={UserCircleIcon}
									className="size-3.5 mr-2"
								/>
								Update Profile Appearance
							</Link>
						</Button>
					</CardContent>

					<Separator className="bg-border/40" />

					<div className="p-4 bg-muted/5 flex items-center justify-between text-[11px] text-muted-foreground">
						<span>Need help integration?</span>
						<a
							href="/docs"
							className="inline-flex items-center gap-1 text-primary hover:underline"
						>
							View Docs
							<HugeiconsIcon
								icon={ArrowUpRight01Icon}
								className="size-3"
							/>
						</a>
					</div>
				</Card>
			</div>
		</div>
	);
}

function DashboardSkeleton() {
	return (
		<div className="flex flex-col gap-6 w-full">
			{/* Stats Cards Skeleton */}
			<div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
				{Array.from({ length: 4 }).map((_, i) => (
					<Card
						key={i}
						className="rounded-xl bg-card border border-border/40 ring-1 ring-foreground/5 shadow-none p-5 flex flex-col gap-2"
					>
						<div className="flex justify-between items-center">
							<Skeleton className="h-3 w-20" />
							<Skeleton className="size-4 rounded-full" />
						</div>
						<Skeleton className="h-6 w-28 mt-2" />
						<Skeleton className="h-2.5 w-36" />
					</Card>
				))}
			</div>

			{/* Main Grid: Chart & Actions Skeleton */}
			<div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
				{/* Chart Skeleton */}
				<Card className="rounded-xl bg-card border border-border/40 ring-1 ring-foreground/5 shadow-none p-5 lg:col-span-2 flex flex-col gap-4">
					<div className="flex justify-between items-center">
						<div className="flex flex-col gap-2">
							<Skeleton className="h-4 w-32" />
							<Skeleton className="h-3 w-48" />
						</div>
						<Skeleton className="size-4" />
					</div>
					<Skeleton className="h-60 w-full rounded-lg" />
				</Card>

				{/* Actions Skeleton */}
				<Card className="rounded-xl bg-card border border-border/40 ring-1 ring-foreground/5 shadow-none p-5 flex flex-col gap-4 justify-between h-full">
					<div className="flex flex-col gap-2">
						<Skeleton className="h-4 w-28" />
						<Skeleton className="h-3 w-40" />
					</div>
					<div className="flex flex-col gap-3 flex-1 justify-center py-6">
						<Skeleton className="h-9 w-full rounded-lg" />
						<Skeleton className="h-9 w-full rounded-lg" />
						<Skeleton className="h-9 w-full rounded-lg" />
					</div>
					<div className="flex justify-between items-center pt-2">
						<Skeleton className="h-3 w-24" />
						<Skeleton className="h-3 w-16" />
					</div>
				</Card>
			</div>
		</div>
	);
}

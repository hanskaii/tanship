import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import DodoPayments from "dodopayments";
import { ApiError } from "../helpers/errors.helper";
import { ApiResponse } from "../helpers/response.helper";
import type { HonoEnv } from "../types/hono.types";
import { purchases, eq, and, isNull } from "@workspace/database";
import { Gate } from "@workspace/core";
import { appConfig as rawAppConfig } from "@workspace/config";
import type { PaymentPlan } from "@workspace/core";

const appConfig = rawAppConfig as unknown as {
	name: string;
	version: string;
	supportEmail?: string;
	authDefaultRedirect: string;
	payments: PaymentPlan[];
};

const GithubUsernameSchema = z
	.string()
	.min(1, "GitHub username is required")
	.max(39, "GitHub username too long")
	.regex(
		/^[a-zA-Z0-9]([a-zA-Z0-9-]{0,37}[a-zA-Z0-9])?$/,
		"Invalid GitHub username format"
	);

const ClaimSchema = z.object({
	githubUsername: GithubUsernameSchema
});

const ActivateSchema = z.object({
	licenseKey: z.string().min(1, "License key is required"),
	githubUsername: GithubUsernameSchema
});

const githubHandler = new Hono<HonoEnv>()
	.get("/status", async (c) => {
		const user = c.get("user");
		const db = c.get("db");

		const userPurchases = await db.query.purchases.findMany({
			where: eq(purchases.userId, user.id)
		});

		return ApiResponse.ok(
			c,
			"Purchase status",
			userPurchases.map((p) => ({
				id: p.id,
				planSlug: p.planSlug,
				licenseKey: p.licenseKey,
				githubUsername: p.githubUsername,
				githubInvitedAt: p.githubInvitedAt,
				createdAt: p.createdAt
			}))
		);
	})
	.post("/claim", zValidator("json", ClaimSchema), async (c) => {
		const user = c.get("user");
		const db = c.get("db");
		const { githubUsername } = c.req.valid("json");

		const env = c.env as any;
		const githubToken: string | undefined = env.GITHUB_TOKEN;
		const repoOwner: string | undefined = env.GITHUB_REPO_OWNER;
		const boilerplateRepo: string | undefined = env.GITHUB_REPO_BOILERPLATE;

		if (!githubToken || !repoOwner || !boilerplateRepo) {
			throw ApiError.server("GitHub integration not configured");
		}

		// Find most recent unclaimed purchase
		const purchase = await db.query.purchases.findFirst({
			where: and(
				eq(purchases.userId, user.id),
				isNull(purchases.githubInvitedAt)
			)
		});

		if (!purchase) {
			throw ApiError.badRequest(
				"No unclaimed purchase found for your account"
			);
		}

		if (purchase.planSlug === "tanship-pro") {
			// Invite to Organization
			const res = await fetch(
				`https://api.github.com/orgs/${repoOwner}/memberships/${githubUsername}`,
				{
					method: "PUT",
					headers: {
						Authorization: `Bearer ${githubToken}`,
						Accept: "application/vnd.github+json",
						"X-GitHub-Api-Version": "2022-11-28",
						"User-Agent": "Tanship-App",
						"Content-Type": "application/json"
					},
					body: JSON.stringify({ role: "member" })
				}
			);

			if (res.status !== 200 && res.status !== 201) {
				const body = (await res.json().catch(() => ({}))) as any;
				const msg = body?.message ?? `GitHub API error (${res.status})`;
				console.error(
					`[GitHub] Failed to invite ${githubUsername} to organization ${repoOwner}: ${msg}`
				);
				throw ApiError.badRequest(
					`Failed to invite @${githubUsername} to organization: ${msg}`
				);
			}

			console.log(
				`[GitHub] Invited ${githubUsername} to organization ${repoOwner} (status: ${res.status})`
			);
		} else {
			// Tanship Standard or Individual Template -> Invite to specific repo
			const payments = appConfig.payments as readonly PaymentPlan[];
			const plan = payments.find((p) => p.slug === purchase.planSlug);
			const repo =
				purchase.planSlug === "tanship"
					? boilerplateRepo
					: (plan?.repository ?? purchase.planSlug);

			const res = await fetch(
				`https://api.github.com/repos/${repoOwner}/${repo}/collaborators/${githubUsername}`,
				{
					method: "PUT",
					headers: {
						Authorization: `Bearer ${githubToken}`,
						Accept: "application/vnd.github+json",
						"X-GitHub-Api-Version": "2022-11-28",
						"User-Agent": "Tanship-App",
						"Content-Type": "application/json"
					},
					body: JSON.stringify({ permission: "pull" })
				}
			);

			if (res.status !== 201 && res.status !== 204) {
				const body = (await res.json().catch(() => ({}))) as any;
				const msg = body?.message ?? `GitHub API error (${res.status})`;
				console.error(
					`[GitHub] Failed to invite ${githubUsername} to ${repo}: ${msg}`
				);
				throw ApiError.badRequest(
					`Failed to invite @${githubUsername}: ${msg}`
				);
			}

			console.log(
				`[GitHub] Invited ${githubUsername} to ${repoOwner}/${repo} (status: ${res.status})`
			);
		}

		// Record the claim
		await db
			.update(purchases)
			.set({
				githubUsername,
				githubInvitedAt: new Date()
			})
			.where(eq(purchases.id, purchase.id));

		return ApiResponse.ok(c, "GitHub invitation sent", {
			githubUsername,
			type:
				purchase.planSlug === "tanship-pro"
					? "organization"
					: "repository",
			target:
				purchase.planSlug === "tanship-pro"
					? repoOwner
					: purchase.planSlug === "tanship"
						? boilerplateRepo
						: ((appConfig.payments as readonly PaymentPlan[]).find(
								(p) => p.slug === purchase.planSlug
							)?.repository ?? purchase.planSlug)
		});
	})
	.post("/activate", zValidator("json", ActivateSchema), async (c) => {
		const user = c.get("user");
		const db = c.get("db");
		const { licenseKey, githubUsername } = c.req.valid("json");

		const env = c.env as any;
		const githubToken: string | undefined = env.GITHUB_TOKEN;
		const repoOwner: string | undefined = env.GITHUB_REPO_OWNER;
		const boilerplateRepo: string | undefined = env.GITHUB_REPO_BOILERPLATE;
		const dodoApiKey: string | undefined = env.DODO_PAYMENTS_API_KEY;
		const appEnv: string | undefined = env.APP_ENV;

		if (!githubToken || !repoOwner || !boilerplateRepo) {
			throw ApiError.server("GitHub integration not configured");
		}

		// Verify the license key belongs to this user and is unclaimed
		const purchase = await db.query.purchases.findFirst({
			where: and(
				eq(purchases.userId, user.id),
				eq(purchases.licenseKey, licenseKey),
				isNull(purchases.githubInvitedAt)
			)
		});

		if (!purchase) {
			throw ApiError.badRequest(
				"License key not found or already activated"
			);
		}

		const gateResult = await Gate.can("license.activate", {
			actor: user,
			resource: { userId: purchase.userId ?? "" }
		});
		if (!gateResult.allowed) {
			throw ApiError.forbidden(gateResult.message ?? "Not your license.");
		}

		// Activate the license key with Dodo Payments
		if (dodoApiKey) {
			const dodo = new DodoPayments({
				bearerToken: dodoApiKey,
				environment: appEnv === "production" ? "live_mode" : "test_mode"
			});
			await dodo.licenses.activate({
				license_key: licenseKey,
				name: githubUsername
			});
		}

		if (purchase.planSlug === "tanship-pro") {
			// Invite to Organization
			const res = await fetch(
				`https://api.github.com/orgs/${repoOwner}/memberships/${githubUsername}`,
				{
					method: "PUT",
					headers: {
						Authorization: `Bearer ${githubToken}`,
						Accept: "application/vnd.github+json",
						"X-GitHub-Api-Version": "2022-11-28",
						"User-Agent": "Tanship-App",
						"Content-Type": "application/json"
					},
					body: JSON.stringify({ role: "member" })
				}
			);

			if (res.status !== 200 && res.status !== 201) {
				const body = (await res.json().catch(() => ({}))) as any;
				const msg = body?.message ?? `GitHub API error (${res.status})`;
				throw ApiError.badRequest(
					`Failed to invite @${githubUsername} to organization: ${msg}`
				);
			}

			console.log(
				`[GitHub] Invited ${githubUsername} to organization ${repoOwner} (status: ${res.status})`
			);
		} else {
			// Tanship Standard or Individual Template -> Invite to specific repo
			const payments = appConfig.payments as readonly PaymentPlan[];
			const plan = payments.find((p) => p.slug === purchase.planSlug);
			const repo =
				purchase.planSlug === "tanship"
					? boilerplateRepo
					: (plan?.repository ?? purchase.planSlug);

			const res = await fetch(
				`https://api.github.com/repos/${repoOwner}/${repo}/collaborators/${githubUsername}`,
				{
					method: "PUT",
					headers: {
						Authorization: `Bearer ${githubToken}`,
						Accept: "application/vnd.github+json",
						"X-GitHub-Api-Version": "2022-11-28",
						"User-Agent": "Tanship-App",
						"Content-Type": "application/json"
					},
					body: JSON.stringify({ permission: "pull" })
				}
			);

			if (res.status !== 201 && res.status !== 204) {
				const body = (await res.json().catch(() => ({}))) as any;
				const msg = body?.message ?? `GitHub API error (${res.status})`;
				throw ApiError.badRequest(
					`Failed to invite @${githubUsername}: ${msg}`
				);
			}

			console.log(
				`[GitHub] Invited ${githubUsername} to ${repoOwner}/${repo} (status: ${res.status})`
			);
		}

		// Record the activation
		await db
			.update(purchases)
			.set({ githubUsername, githubInvitedAt: new Date() })
			.where(eq(purchases.id, purchase.id));

		return ApiResponse.ok(
			c,
			"License activated and GitHub invitation sent",
			{
				githubUsername,
				type:
					purchase.planSlug === "tanship-pro"
						? "organization"
						: "repository",
				target:
					purchase.planSlug === "tanship-pro"
						? repoOwner
						: purchase.planSlug === "tanship"
							? boilerplateRepo
							: ((
									appConfig.payments as readonly PaymentPlan[]
								).find((p) => p.slug === purchase.planSlug)
									?.repository ?? purchase.planSlug),
				planSlug: purchase.planSlug
			}
		);
	});

export default githubHandler;

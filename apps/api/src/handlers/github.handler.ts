import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import DodoPayments from "dodopayments";
import { ApiError } from "../helpers/errors.helper";
import { ApiResponse } from "../helpers/response.helper";
import type { HonoEnv } from "../types/hono.types";
import { purchases, eq, and, isNull } from "@workspace/database";

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
		const templatesRepo: string | undefined = env.GITHUB_REPO_TEMPLATES;

		if (!githubToken || !repoOwner || !boilerplateRepo) {
			throw ApiError.server("GitHub integration not configured");
		}

		// Find most recent unclaimed boilerplate purchase
		// (template-* purchases don't need GitHub — they use the download endpoint)
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

		if (purchase.planSlug.startsWith("template-")) {
			throw ApiError.badRequest(
				"Template purchases don't require GitHub activation. Use the download button on the Templates page."
			);
		}

		// "tanflare" → boilerplate repo only
		// "tanflare-pro" → boilerplate + templates repos
		const repos: string[] = [];
		if (purchase.planSlug === "tanflare-pro") {
			repos.push(boilerplateRepo);
			if (templatesRepo) repos.push(templatesRepo);
		} else {
			repos.push(boilerplateRepo);
		}

		// Invite to each repo via GitHub API
		for (const repo of repos) {
			const res = await fetch(
				`https://api.github.com/repos/${repoOwner}/${repo}/collaborators/${githubUsername}`,
				{
					method: "PUT",
					headers: {
						Authorization: `Bearer ${githubToken}`,
						Accept: "application/vnd.github+json",
						"X-GitHub-Api-Version": "2022-11-28",
						"User-Agent": "Tanflare-App",
						"Content-Type": "application/json"
					},
					body: JSON.stringify({ permission: "pull" })
				}
			);

			// 201 = invitation created, 204 = already a collaborator
			if (res.status !== 201 && res.status !== 204) {
				const body = (await res.json().catch(() => ({}))) as any;
				const msg =
					body?.message ?? `GitHub API error (${res.status})`;
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
			repos
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
		const templatesRepo: string | undefined = env.GITHUB_REPO_TEMPLATES;
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

		// Template purchases don't use GitHub — they download directly
		if (purchase.planSlug.startsWith("template-")) {
			throw ApiError.badRequest(
				"Template purchases don't require GitHub activation. Use the download button on the Templates page."
			);
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

		// "tanflare" → boilerplate repo only
		// "tanflare-pro" → boilerplate + templates repos
		const repos: string[] = [];
		if (purchase.planSlug === "tanflare-pro") {
			repos.push(boilerplateRepo);
			if (templatesRepo) repos.push(templatesRepo);
		} else {
			repos.push(boilerplateRepo);
		}

		for (const repo of repos) {
			const res = await fetch(
				`https://api.github.com/repos/${repoOwner}/${repo}/collaborators/${githubUsername}`,
				{
					method: "PUT",
					headers: {
						Authorization: `Bearer ${githubToken}`,
						Accept: "application/vnd.github+json",
						"X-GitHub-Api-Version": "2022-11-28",
						"User-Agent": "Tanflare-App",
						"Content-Type": "application/json"
					},
					body: JSON.stringify({ permission: "pull" })
				}
			);

			if (res.status !== 201 && res.status !== 204) {
				const body = (await res.json().catch(() => ({}))) as any;
				const msg = body?.message ?? `GitHub API error (${res.status})`;
				throw ApiError.badRequest(`Failed to invite @${githubUsername}: ${msg}`);
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

		return ApiResponse.ok(c, "License activated and GitHub invitation sent", {
			githubUsername,
			repos,
			planSlug: purchase.planSlug
		});
	});

export default githubHandler;

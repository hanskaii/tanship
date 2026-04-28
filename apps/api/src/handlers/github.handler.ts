import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { ApiError } from "../helpers/errors.helper";
import { ApiResponse } from "../helpers/response.helper";
import type { HonoEnv } from "../types/hono.types";
import { purchases, eq, and, isNull } from "@workspace/database";

const ClaimSchema = z.object({
	githubUsername: z
		.string()
		.min(1, "GitHub username is required")
		.max(39, "GitHub username too long")
		.regex(
			/^[a-zA-Z0-9]([a-zA-Z0-9-]{0,37}[a-zA-Z0-9])?$/,
			"Invalid GitHub username format"
		)
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

		const repos = [boilerplateRepo];
		if (purchase.planSlug === "tanflare-pro" && templatesRepo) {
			repos.push(templatesRepo);
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
	});

export default githubHandler;

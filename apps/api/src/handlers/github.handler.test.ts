import { describe, it, expect, vi, beforeEach } from "vitest";
import { Hono } from "hono";
import githubHandler from "./github.handler";

import type { HonoEnv } from "../types/hono.types";

// Mock global fetch for GitHub API calls
const mockFetch = vi.fn();
globalThis.fetch = mockFetch;

// Mock Hono request environment
const mockEnv = {
	GITHUB_TOKEN: "mock-token",
	GITHUB_REPO_OWNER: "tanshipkit",
	GITHUB_REPO_BOILERPLATE: "tanship-boilerplate",
	GITHUB_REPO_TEMPLATES: "tanship-templates",
	DODO_PAYMENTS_API_KEY: "mock-dodo-key",
	APP_ENV: "development"
};

// Mock Database interface
const mockUpdate = vi.fn().mockImplementation(() => {
	const mockWhere = vi.fn().mockResolvedValue(true);
	const mockSet = vi.fn().mockReturnValue({ where: mockWhere });
	return { set: mockSet };
});

const createMockDb = (purchase: any) => ({
	query: {
		purchases: {
			findFirst: vi.fn().mockResolvedValue(purchase),
			findMany: vi.fn().mockResolvedValue([purchase])
		}
	},
	update: () => mockUpdate()
});

// Mock Gate policy engine
vi.mock("@workspace/core", async (importOriginal) => {
	const actual = await importOriginal<typeof import("@workspace/core")>();
	actual.Gate.can = vi.fn().mockResolvedValue({ allowed: true }) as any;
	return actual;
});

// Mock Better-Auth API standard
const mockUser = { id: "user_123", email: "test@example.com" };

describe("githubHandler", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockFetch.mockResolvedValue({
			status: 201,
			json: async () => ({})
		});
	});

	it("should invite user to organization for tanship-pro plan", async () => {
		const db = createMockDb({
			id: "purchase_pro",
			userId: "user_123",
			planSlug: "tanship-pro",
			licenseKey: "PRO-LICENSE",
			githubUsername: null,
			githubInvitedAt: null
		});

		const app = new Hono<HonoEnv>();
		app.use("*", async (c, next) => {
			c.set("user", mockUser as any);
			c.set("db", db as any);
			(c as any).env = mockEnv;
			await next();
		});
		app.route("/github", githubHandler);

		const response = await app.request("/github/claim", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ githubUsername: "testuser" })
		});

		expect(response.status).toBe(200);
		const json = await response.json();
		expect(json).toEqual({
			success: true,
			statusCode: 200,
			message: "GitHub invitation sent",
			data: {
				githubUsername: "testuser",
				type: "organization",
				target: "tanshipkit"
			}
		});

		// Check GitHub API URL called for Organization membership
		expect(mockFetch).toHaveBeenCalledWith(
			"https://api.github.com/orgs/tanshipkit/memberships/testuser",
			expect.objectContaining({
				method: "PUT",
				body: JSON.stringify({ role: "member" })
			})
		);
	});

	it("should invite user to repository for tanship standard plan", async () => {
		const db = createMockDb({
			id: "purchase_standard",
			userId: "user_123",
			planSlug: "tanship",
			licenseKey: "STANDARD-LICENSE",
			githubUsername: null,
			githubInvitedAt: null
		});

		const app = new Hono<HonoEnv>();
		app.use("*", async (c, next) => {
			c.set("user", mockUser as any);
			c.set("db", db as any);
			(c as any).env = mockEnv;
			await next();
		});
		app.route("/github", githubHandler);

		const response = await app.request("/github/claim", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ githubUsername: "testuser" })
		});

		expect(response.status).toBe(200);
		const json = await response.json();
		expect(json).toEqual({
			success: true,
			statusCode: 200,
			message: "GitHub invitation sent",
			data: {
				githubUsername: "testuser",
				type: "repository",
				target: "tanship-boilerplate"
			}
		});

		// Check GitHub API URL called for Repository collaborator
		expect(mockFetch).toHaveBeenCalledWith(
			"https://api.github.com/repos/tanshipkit/tanship-boilerplate/collaborators/testuser",
			expect.objectContaining({
				method: "PUT",
				body: JSON.stringify({ permission: "pull" })
			})
		);
	});

	it("should invite user to repository for individual template plan", async () => {
		const db = createMockDb({
			id: "purchase_template",
			userId: "user_123",
			planSlug: "template-saas-dashboard",
			licenseKey: "TEMPLATE-LICENSE",
			githubUsername: null,
			githubInvitedAt: null
		});

		const app = new Hono<HonoEnv>();
		app.use("*", async (c, next) => {
			c.set("user", mockUser as any);
			c.set("db", db as any);
			(c as any).env = mockEnv;
			await next();
		});
		app.route("/github", githubHandler);

		const response = await app.request("/github/claim", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ githubUsername: "testuser" })
		});

		expect(response.status).toBe(200);
		const json = await response.json();
		expect(json).toEqual({
			success: true,
			statusCode: 200,
			message: "GitHub invitation sent",
			data: {
				githubUsername: "testuser",
				type: "repository",
				target: "template-saas-dashboard"
			}
		});

		// Check GitHub API URL called for specific Template Repository collaborator
		expect(mockFetch).toHaveBeenCalledWith(
			"https://api.github.com/repos/tanshipkit/template-saas-dashboard/collaborators/testuser",
			expect.objectContaining({
				method: "PUT",
				body: JSON.stringify({ permission: "pull" })
			})
		);
	});

	it("should invite user to repository with custom repository property if configured", async () => {
		const { appConfig } = await import("@workspace/config");
		const targetPlan = appConfig.payments.find(
			(p) => p.slug === "template-saas-dashboard"
		);
		const originalRepo = targetPlan
			? (targetPlan as any).repository
			: undefined;

		if (targetPlan) {
			(targetPlan as any).repository = "custom-dashboard-repo";
		}

		try {
			const db = createMockDb({
				id: "purchase_template_custom",
				userId: "user_123",
				planSlug: "template-saas-dashboard",
				licenseKey: "TEMPLATE-LICENSE-CUSTOM",
				githubUsername: null,
				githubInvitedAt: null
			});

			const app = new Hono<HonoEnv>();
			app.use("*", async (c, next) => {
				c.set("user", mockUser as any);
				c.set("db", db as any);
				(c as any).env = mockEnv;
				await next();
			});
			app.route("/github", githubHandler);

			const response = await app.request("/github/claim", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ githubUsername: "testuser" })
			});

			expect(response.status).toBe(200);
			const json = (await response.json()) as any;
			expect(json.data.target).toBe("custom-dashboard-repo");

			expect(mockFetch).toHaveBeenCalledWith(
				"https://api.github.com/repos/tanshipkit/custom-dashboard-repo/collaborators/testuser",
				expect.objectContaining({
					method: "PUT",
					body: JSON.stringify({ permission: "pull" })
				})
			);
		} finally {
			if (targetPlan && originalRepo) {
				(targetPlan as any).repository = originalRepo;
			}
		}
	});
});

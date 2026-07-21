import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock agents module before importing index to avoid cloudflare: scheme issues
vi.mock("agents", () => ({
	routeAgentRequest: vi.fn()
}));

import { app } from "./index";

// Mock boot and env validated
vi.mock("./boot", () => ({
	boot: vi.fn()
}));

// Mock env
const mockEnv = {
	CORS_ORIGIN: "https://tanship.dev",
	BETTER_AUTH_SECRET: "mock-secret-at-least-32-chars-long",
	BETTER_AUTH_URL: "https://tanship.dev",
	GOOGLE_CLIENT_ID: "mock-client-id",
	GOOGLE_CLIENT_SECRET: "mock-client-secret",
	FROM_EMAIL: "noreply@tanship.dev",
	DODO_PAYMENTS_API_KEY: "mock-dodo-key",
	DODO_PAYMENTS_WEBHOOK_SECRET: "mock-webhook-secret",
	GITHUB_TOKEN: "mock-github-token",
	GITHUB_REPO_OWNER: "mock-owner",
	GITHUB_REPO_BOILERPLATE: "mock-repo",
	APP_NAME: "Tanship",
	APP_ENV: "development"
};

describe("CORS Policy", () => {
	it("should allow requests from the configured CORS_ORIGIN", async () => {
		const req = new Request("http://localhost/api/showcase", {
			method: "OPTIONS",
			headers: {
				Origin: "https://tanship.dev",
				"Access-Control-Request-Method": "GET",
				"Access-Control-Request-Headers": "Content-Type"
			}
		});

		const res = await app.fetch(req, mockEnv);
		expect(res.headers.get("Access-Control-Allow-Origin")).toBe(
			"https://tanship.dev"
		);
		expect(res.headers.get("Access-Control-Allow-Credentials")).toBe(
			"true"
		);
	});

	it("should not reflect evil.com origin and should fallback to CORS_ORIGIN", async () => {
		const req = new Request("http://localhost/api/showcase", {
			method: "OPTIONS",
			headers: {
				Origin: "https://evil.com",
				"Access-Control-Request-Method": "GET",
				"Access-Control-Request-Headers": "Content-Type"
			}
		});

		const res = await app.fetch(req, mockEnv);
		expect(res.headers.get("Access-Control-Allow-Origin")).toBe(
			"https://tanship.dev"
		);
		expect(res.headers.get("Access-Control-Allow-Credentials")).toBe(
			"true"
		);
	});

	it("should fallback to CORS_ORIGIN if origin header is missing", async () => {
		const req = new Request("http://localhost/api/showcase", {
			method: "OPTIONS",
			headers: {
				"Access-Control-Request-Method": "GET",
				"Access-Control-Request-Headers": "Content-Type"
			}
		});

		const res = await app.fetch(req, mockEnv);
		expect(res.headers.get("Access-Control-Allow-Origin")).toBe(
			"https://tanship.dev"
		);
	});
});

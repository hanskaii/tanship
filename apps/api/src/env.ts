import { z } from "zod";

export const EnvSchema = z.object({
	// Auth
	BETTER_AUTH_SECRET: z
		.string()
		.min(32, "BETTER_AUTH_SECRET must be at least 32 chars"),
	BETTER_AUTH_URL: z.string().url("BETTER_AUTH_URL must be a valid URL"),
	GOOGLE_CLIENT_ID: z.string().min(1, "GOOGLE_CLIENT_ID is required"),
	GOOGLE_CLIENT_SECRET: z.string().min(1, "GOOGLE_CLIENT_SECRET is required"),

	// Email (Cloudflare Email Workers — SEND_EMAIL is a binding, not an env var)
	FROM_EMAIL: z.string().email("FROM_EMAIL must be a valid email"),

	// Payments
	DODO_PAYMENTS_API_KEY: z
		.string()
		.min(1, "DODO_PAYMENTS_API_KEY is required"),
	DODO_PAYMENTS_WEBHOOK_SECRET: z
		.string()
		.min(1, "DODO_PAYMENTS_WEBHOOK_SECRET is required"),

	// GitHub
	GITHUB_TOKEN: z.string().min(1, "GITHUB_TOKEN is required"),
	GITHUB_REPO_OWNER: z.string().min(1, "GITHUB_REPO_OWNER is required"),
	GITHUB_REPO_BOILERPLATE: z
		.string()
		.min(1, "GITHUB_REPO_BOILERPLATE is required"),
	GITHUB_REPO_TEMPLATES: z.string().optional(),

	// App
	APP_NAME: z.string().min(1, "APP_NAME is required"),
	APP_ENV: z.enum(["development", "staging", "production"]),
	ADMIN_EMAIL: z
		.string()
		.email("ADMIN_EMAIL must be a valid email")
		.optional()
});

export type ValidatedEnv = z.infer<typeof EnvSchema>;

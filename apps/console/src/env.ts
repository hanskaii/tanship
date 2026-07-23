import { z } from "zod";

export const EnvSchema = z.object({
	// App
	APP_ENV: z.enum(["development", "staging", "production"]),

	// x402
	PAY_TO_ADDRESS: z
		.string()
		.regex(/^0x[a-fA-F0-9]{40}$/, "PAY_TO_ADDRESS must be an EVM address"),
	SVM_PAY_TO_ADDRESS: z
		.string()
		.regex(
			/^[1-9A-HJ-NP-Za-km-z]{32,44}$/,
			"SVM_PAY_TO_ADDRESS must be a Solana address"
		)
		.optional(),
	X402_NETWORKS: z
		.string()
		.min(1, "X402_NETWORKS must be a comma-separated list of networks"),
	FACILITATOR_URL: z.url("FACILITATOR_URL must be a valid URL"),

	// Cloudflare Browser Rendering REST API
	CLOUDFLARE_ACCOUNT_ID: z
		.string()
		.min(1, "CLOUDFLARE_ACCOUNT_ID is required"),
	CLOUDFLARE_API_TOKEN: z.string().min(1, "CLOUDFLARE_API_TOKEN is required"),

	// Modal Sandbox relay
	MODAL_API_URL: z.url("MODAL_API_URL must be a valid URL"),
	MODAL_API_TOKEN: z.string().min(1, "MODAL_API_TOKEN is required")
});

export type ValidatedEnv = z.infer<typeof EnvSchema>;

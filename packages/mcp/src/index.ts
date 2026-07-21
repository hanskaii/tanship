#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
	CallToolRequestSchema,
	ListToolsRequestSchema,
	ErrorCode,
	McpError
} from "@modelcontextprotocol/sdk/types.js";
import {
	createWalletClient,
	createPublicClient,
	http,
	parseAbi,
	type Address
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { base, baseSepolia } from "viem/chains";

const TANSHIP_BASE = "https://x402.tanship.dev";

// Load wallet
const walletKey = process.env.TANSHIP_WALLET_KEY;
if (!walletKey) {
	console.error(
		"Error: TANSHIP_WALLET_KEY environment variable is required."
	);
	process.exit(1);
}

const normalizedKey = walletKey.startsWith("0x") ? walletKey : `0x${walletKey}`;
let account: ReturnType<typeof privateKeyToAccount>;
try {
	account = privateKeyToAccount(normalizedKey as `0x${string}`);
} catch (err: any) {
	console.error(`Error: Invalid TANSHIP_WALLET_KEY: ${err.message}`);
	process.exit(1);
}

const networkPref = process.env.TANSHIP_NETWORK || "base"; // "base" or "base-sepolia"

// Setup server
const server = new Server(
	{
		name: "tanship-mcp",
		version: "1.0.0"
	},
	{
		capabilities: {
			tools: {}
		}
	}
);

interface Service {
	id: string;
	method: "GET" | "POST";
	path: string;
	price: string;
	description: string;
	mimeType: string;
	input: Record<string, string>;
	example: Record<string, unknown>;
}

// Cache services list
let servicesCache: Service[] = [];
let lastFetched = 0;

async function getServices(): Promise<Service[]> {
	if (servicesCache.length > 0 && Date.now() - lastFetched < 300_000) {
		return servicesCache;
	}

	try {
		const res = await fetch(`${TANSHIP_BASE}/v1/services`);
		if (!res.ok) {
			throw new Error(`Failed to fetch services: ${res.statusText}`);
		}
		const json = (await res.json()) as { data: { services: Service[] } };
		servicesCache = json.data.services;
		lastFetched = Date.now();
		return servicesCache;
	} catch (err) {
		if (servicesCache.length > 0) return servicesCache;
		throw err;
	}
}

// 1. Expose tools list
server.setRequestHandler(ListToolsRequestSchema, async () => {
	try {
		const services = await getServices();
		const tools = services.map((svc) => {
			const name = svc.id.replace(/\./g, "_"); // e.g., ai.chat -> ai_chat

			// Map human-readable input descriptions to simple string properties
			const properties: Record<
				string,
				{ type: string; description: string }
			> = {};
			const required: string[] = [];

			for (const [key, desc] of Object.entries(svc.input)) {
				const isOptional = desc.toLowerCase().includes("optional");
				if (key === "messages") {
					properties[key] = {
						type: "array",
						description: desc,
						items: {
							type: "object",
							properties: {
								role: {
									type: "string",
									enum: ["system", "user", "assistant"]
								},
								content: { type: "string" }
							},
							required: ["role", "content"]
						}
					} as any;
				} else if (key === "selectors" || key === "documents") {
					properties[key] = {
						type: "array",
						description: desc,
						items: { type: "string" }
					} as any;
				} else {
					properties[key] = {
						type: "string",
						description: desc
					};
				}
				if (!isOptional) {
					required.push(key);
				}
			}

			return {
				name,
				description: `${svc.description} (Price: ${svc.price})`,
				inputSchema: {
					type: "object",
					properties,
					required
				}
			};
		});

		return { tools };
	} catch (err: any) {
		throw new McpError(
			ErrorCode.InternalError,
			`Failed to list tools: ${err.message}`
		);
	}
});

// Helper: executes the ERC20 USDC payment on Base or Base Sepolia
async function executePayment(paymentRequired: any): Promise<string> {
	const chainIdToUse = networkPref === "base-sepolia" ? 84532 : 8453;
	const chain = networkPref === "base-sepolia" ? baseSepolia : base;
	const caipNetwork = `eip155:${chainIdToUse}`;

	const accepts = paymentRequired.accepts.find(
		(a: any) => a.network === caipNetwork
	);
	if (!accepts) {
		throw new Error(
			`Server does not accept payments on configured network: ${networkPref}`
		);
	}

	const targetPayTo = accepts.payTo as Address;
	const targetAmount = BigInt(accepts.amount);
	const targetAsset = accepts.asset as Address;

	// Setup clients
	const publicClient = createPublicClient({
		chain,
		transport: http()
	});

	const walletClient = createWalletClient({
		account,
		chain,
		transport: http()
	});

	// Build & sign ERC-20 transfer
	const abi = parseAbi([
		"function transfer(address to, uint256 amount) returns (bool)"
	]);
	const hash = await walletClient.writeContract({
		address: targetAsset,
		abi,
		functionName: "transfer",
		args: [targetPayTo, targetAmount]
	});

	// Wait for receipt
	await publicClient.waitForTransactionReceipt({ hash });
	return hash;
}

// 2. Execute tool call
server.setRequestHandler(CallToolRequestSchema, async (request) => {
	const toolId = request.params.name.replace(/_/g, "."); // e.g., ai_chat -> ai.chat
	const args = request.params.arguments || {};

	try {
		const services = await getServices();
		const svc = services.find((s) => s.id === toolId);
		if (!svc) {
			throw new McpError(
				ErrorCode.InvalidParams,
				`Unknown tool: ${request.params.name}`
			);
		}

		const url = `${TANSHIP_BASE}${svc.path}`;
		const headers: Record<string, string> = {
			"Content-Type": "application/json",
			"User-Agent": "TanshipMCP/1.0.0"
		};

		let response = await fetch(url, {
			method: svc.method,
			headers,
			body: JSON.stringify(args)
		});

		if (response.status === 402) {
			const prHeader = response.headers.get("payment-required");
			if (!prHeader) {
				throw new Error(
					"Received 402 challenge but no payment-required header was found"
				);
			}

			const decodedPr = JSON.parse(
				Buffer.from(prHeader, "base64").toString("utf-8")
			);

			// Execute USDC transfer
			const txHash = await executePayment(decodedPr);

			// Select accepts param
			const chainIdToUse = networkPref === "base-sepolia" ? 84532 : 8453;
			const caipNetwork = `eip155:${chainIdToUse}`;
			const accepts = decodedPr.accepts.find(
				(a: any) => a.network === caipNetwork
			);

			// Construct PaymentPayload
			const paymentPayload = {
				x402Version: 2,
				resource: decodedPr.resource,
				accepted: accepts,
				payload: {
					transaction: txHash,
					payer: account.address,
					network: caipNetwork,
					amount: accepts.amount
				},
				extensions: {}
			};

			const paymentSignature = Buffer.from(
				JSON.stringify(paymentPayload)
			).toString("base64");

			// Retry request
			headers["PAYMENT-SIGNATURE"] = paymentSignature;
			response = await fetch(url, {
				method: svc.method,
				headers,
				body: JSON.stringify(args)
			});
		}

		if (!response.ok) {
			const text = await response.text();
			return {
				content: [
					{
						type: "text",
						text: `Error calling ${toolId}: ${response.statusText} (${response.status}) - ${text}`
					}
				],
				isError: true
			};
		}

		// Handle binary image outputs
		if (svc.mimeType.startsWith("image/")) {
			const buffer = await response.arrayBuffer();
			const base64 = Buffer.from(buffer).toString("base64");
			return {
				content: [
					{
						type: "image",
						data: base64,
						mimeType: svc.mimeType
					}
				]
			};
		}

		const json = await response.json();
		return {
			content: [
				{
					type: "text",
					text: JSON.stringify(json, null, 2)
				}
			]
		};
	} catch (err: any) {
		return {
			content: [
				{
					type: "text",
					text: `Error executing tool: ${err.message}`
				}
			],
			isError: true
		};
	}
});

// Run server
async function main() {
	const transport = new StdioServerTransport();
	await server.connect(transport);
	console.error("Tanship MCP Server running.");
}

main().catch((err) => {
	console.error("Fatal error in main:", err);
	process.exit(1);
});

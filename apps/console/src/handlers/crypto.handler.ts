import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

import { ApiError } from "@/helpers/errors.helper";
import { ApiResponse } from "@/helpers/response.helper";
import type { HonoEnv } from "@/types/hono.types";

const EvmAddressSchema = z
	.string()
	.regex(/^0x[a-fA-F0-9]{40}$/, "Invalid EVM address format");

const GasPriceSchema = z.object({
	chain: z.enum(["base", "ethereum", "arbitrum", "polygon"]).default("base")
});

const ContractAbiSchema = z.object({
	address: EvmAddressSchema,
	chain: z.enum(["base", "ethereum", "arbitrum", "polygon"]).default("base")
});

const EnsResolveSchema = z.object({
	input: z.string().min(1).max(254)
});

const Erc20MetaSchema = z.object({
	address: EvmAddressSchema,
	chain: z.enum(["base", "ethereum", "arbitrum", "polygon"]).default("base")
});

const EvmCallSchema = z.object({
	chain: z.enum(["base", "ethereum", "arbitrum", "polygon"]).default("base"),
	to: EvmAddressSchema,
	data: z
		.string()
		.regex(/^0x[0-9a-fA-F]*$/, "data must be 0x-prefixed hex calldata")
		.max(20_000),
	from: EvmAddressSchema.optional(),
	block: z
		.enum(["latest", "pending", "earliest", "safe", "finalized"])
		.default("latest")
});

const EXPLORER_APIS: Record<string, string> = {
	base: "https://api.basescan.org/api",
	ethereum: "https://api.etherscan.io/api",
	arbitrum: "https://api.arbiscan.io/api",
	polygon: "https://api.polygonscan.com/api"
};

const BalanceSchema = z.object({
	address: EvmAddressSchema,
	chain: z.enum(["base", "ethereum", "arbitrum", "polygon"]).default("base"),
	tokens: z.array(EvmAddressSchema).max(10).optional()
});

const RPC_URLS: Record<string, string> = {
	base: "https://mainnet.base.org",
	ethereum: "https://cloudflare-eth.com",
	arbitrum: "https://arb1.arbitrum.io/rpc",
	polygon: "https://polygon-rpc.com"
};

const NATIVE_SYMBOLS: Record<string, string> = {
	base: "ETH",
	ethereum: "ETH",
	arbitrum: "ETH",
	polygon: "POL"
};

async function rpcCall(
	url: string,
	method: string,
	params: unknown[]
): Promise<any> {
	const res = await fetch(url, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			jsonrpc: "2.0",
			id: 1,
			method,
			params
		})
	});

	if (!res.ok) {
		throw new Error(`RPC request failed: ${res.statusText}`);
	}

	const data = (await res.json()) as any;
	if (data.error) {
		throw new Error(data.error.message || "RPC returned error");
	}

	return data.result;
}

/** Format big hex string to decimal string considering decimals */
function formatUnits(hex: string, decimals: number): string {
	const cleanHex = hex.startsWith("0x") ? hex.slice(2) : hex;
	if (!cleanHex || cleanHex === "0") return "0";

	const val = BigInt("0x" + cleanHex);
	const divisor = BigInt(10 ** decimals);
	const integerPart = val / divisor;
	const fractionalPart = val % divisor;

	if (fractionalPart === 0n) {
		return integerPart.toString();
	}

	let fracStr = fractionalPart.toString().padStart(decimals, "0");
	// Trim trailing zeros from fractional part
	fracStr = fracStr.replace(/0+$/, "");
	if (!fracStr) return integerPart.toString();

	return `${integerPart}.${fracStr}`;
}

const cryptoHandler = new Hono<HonoEnv>()
	.post("/balance", zValidator("json", BalanceSchema), async (c) => {
		const { address, chain, tokens } = c.req.valid("json");
		const rpcUrl = RPC_URLS[chain];
		if (!rpcUrl) {
			throw ApiError.badRequest(`Unsupported chain: ${chain}`);
		}

		try {
			// 1. Fetch native balance
			const nativeHex = await rpcCall(rpcUrl, "eth_getBalance", [
				address,
				"latest"
			]);
			const nativeBalance = formatUnits(nativeHex, 18);

			const results: Array<{
				type: "native" | "erc20";
				asset: string;
				balance: string;
				symbol: string;
			}> = [
				{
					type: "native",
					asset: "0x0000000000000000000000000000000000000000",
					balance: nativeBalance,
					symbol: NATIVE_SYMBOLS[chain] || "ETH"
				}
			];

			// 2. Fetch ERC-20 token balances if requested
			if (tokens && tokens.length > 0) {
				const calls = tokens.map(async (token) => {
					try {
						// balanceOf selector is 70a08231.
						// Pad the address to 32 bytes (64 hex characters)
						const cleanAddr = address.slice(2).toLowerCase();
						const data = `0x70a08231000000000000000000000000${cleanAddr}`;

						// Query token balance
						const tokenBalanceHex = await rpcCall(
							rpcUrl,
							"eth_call",
							[{ to: token, data }, "latest"]
						);

						// Query decimals & symbol via multi call or single falls
						let decimals = 18;
						let symbol = "TOKEN";

						try {
							const decHex = await rpcCall(rpcUrl, "eth_call", [
								{ to: token, data: "0x313ce567" }, // decimals() selector
								"latest"
							]);
							decimals = parseInt(decHex, 16);
						} catch {}

						try {
							const symHex = await rpcCall(rpcUrl, "eth_call", [
								{ to: token, data: "0x95d89b41" }, // symbol() selector
								"latest"
							]);
							// Parse hex string (bytes / string type)
							const cleanSym = symHex.startsWith("0x")
								? symHex.slice(2)
								: symHex;
							// Simplistic parsing of ERC20 symbol returned in hex
							if (cleanSym.length > 64) {
								const len = parseInt(
									cleanSym.slice(64, 128),
									16
								);
								const strHex = cleanSym.slice(
									128,
									128 + len * 2
								);
								const bytes = Uint8Array.from(
									strHex
										.match(/.{1,2}/g)
										?.map((byte: string) =>
											parseInt(byte, 16)
										) || []
								);
								symbol = new TextDecoder().decode(bytes).trim();
							} else {
								const bytes = Uint8Array.from(
									cleanSym
										.match(/.{1,2}/g)
										?.map((byte: string) =>
											parseInt(byte, 16)
										) || []
								);
								symbol = new TextDecoder().decode(bytes).trim();
							}
						} catch {}

						results.push({
							type: "erc20",
							asset: token,
							balance: formatUnits(tokenBalanceHex, decimals),
							symbol: symbol || "TOKEN"
						});
					} catch {
						// Skip failed token queries gracefully
						results.push({
							type: "erc20",
							asset: token,
							balance: "0",
							symbol: "ERR"
						});
					}
				});

				await Promise.all(calls);
			}

			return ApiResponse.ok(c, "Balances retrieved successfully", {
				address,
				chain,
				balances: results
			});
		} catch (err: any) {
			throw ApiError.badGateway(`RPC Query failed: ${err.message}`);
		}
	})
	.post("/nonce", zValidator("json", GasPriceSchema), async (c) => {
		const { chain } = c.req.valid("json");
		const rpcUrl = RPC_URLS[chain];
		if (!rpcUrl) {
			throw ApiError.badRequest(`Unsupported chain: ${chain}`);
		}

		try {
			const hex = await rpcCall(rpcUrl, "eth_blockNumber", []);
			const blockNumber = parseInt(hex, 16);

			return ApiResponse.ok(c, "Current block number retrieved", {
				chain,
				blockNumber,
				blockNumberHex: hex,
				timestamp: new Date().toISOString()
			});
		} catch (err: any) {
			throw ApiError.badGateway(
				`Block number query failed: ${err.message}`
			);
		}
	})
	.post("/gas-price", zValidator("json", GasPriceSchema), async (c) => {
		const { chain } = c.req.valid("json");
		const rpcUrl = RPC_URLS[chain];
		if (!rpcUrl) {
			throw ApiError.badRequest(`Unsupported chain: ${chain}`);
		}

		try {
			const gasPriceHex = await rpcCall(rpcUrl, "eth_gasPrice", []);
			const baseFeeGwei = parseFloat(formatUnits(gasPriceHex, 9));

			let maxPriorityFeeGwei = 0;
			try {
				const prioHex = await rpcCall(
					rpcUrl,
					"eth_maxPriorityFeePerGas",
					[]
				);
				maxPriorityFeeGwei = parseFloat(formatUnits(prioHex, 9));
			} catch {}

			const standard = baseFeeGwei + maxPriorityFeeGwei;
			const slow = standard * 0.8;
			const fast = standard * 1.2 + 1.5;

			return ApiResponse.ok(c, "Gas prices retrieved in Gwei", {
				chain,
				unit: "Gwei",
				gasPriceHex,
				baseFee: parseFloat(baseFeeGwei.toFixed(6)),
				priorityFee: parseFloat(maxPriorityFeeGwei.toFixed(6)),
				tiers: {
					slow: parseFloat(slow.toFixed(4)),
					standard: parseFloat(standard.toFixed(4)),
					fast: parseFloat(fast.toFixed(4))
				}
			});
		} catch (err: any) {
			throw ApiError.badGateway(`Gas price query failed: ${err.message}`);
		}
	})
	.post("/contract-abi", zValidator("json", ContractAbiSchema), async (c) => {
		const { address, chain } = c.req.valid("json");
		const explorerUrl = EXPLORER_APIS[chain];
		const apiKey =
			(c.env as unknown as Record<string, string | undefined>)[
				`${chain.toUpperCase()}_EXPLORER_API_KEY`
			] || "";

		try {
			const params = new URLSearchParams({
				module: "contract",
				action: "getabi",
				address,
				format: "raw"
			});
			if (apiKey) params.set("apikey", apiKey);

			const res = await fetch(`${explorerUrl}?${params}`, {
				signal: AbortSignal.timeout(8_000)
			});
			if (!res.ok) {
				throw new Error(`Explorer API returned ${res.status}`);
			}

			const data = (await res.json()) as {
				status: string;
				result: string;
				message?: string;
			};

			if (data.status !== "1") {
				// Contract not verified, or address isn't a contract
				return ApiResponse.ok(c, "Contract ABI not available", {
					address,
					chain,
					verified: false,
					abi: null,
					message:
						data.message ||
						"Contract source not verified on explorer"
				});
			}

			let abi: unknown;
			try {
				abi = JSON.parse(data.result);
			} catch {
				throw new Error("Explorer returned malformed ABI");
			}

			const functions = Array.isArray(abi)
				? (abi as any[])
						.filter(
							(x) =>
								x?.type === "function" &&
								(x?.stateMutability === "nonpayable" ||
									x?.stateMutability === "view" ||
									x?.stateMutability === "pure" ||
									x?.stateMutability === "payable")
						)
						.map((x) => ({
							name: x.name,
							inputs: x.inputs ?? [],
							outputs: x.outputs ?? [],
							stateMutability: x.stateMutability
						}))
				: [];

			return ApiResponse.ok(c, "Contract ABI retrieved", {
				address,
				chain,
				verified: true,
				abi,
				functionCount: functions.length,
				functions
			});
		} catch (err: any) {
			throw ApiError.badGateway(`ABI lookup failed: ${err.message}`);
		}
	})
	.post("/ens-resolve", zValidator("json", EnsResolveSchema), async (c) => {
		const { input } = c.req.valid("json");
		const trimmed = input.trim();
		const isAddress = /^0x[a-fA-F0-9]{40}$/.test(trimmed);
		// ENS lookups always go to mainnet (ENS registry lives there)
		const rpc =
			(c.env as unknown as Record<string, string | undefined>)
				.ETHEREUM_RPC_URL || "https://cloudflare-eth.com";

		try {
			if (isAddress) {
				// Reverse resolve: address → primary ENS name
				const result = (await rpcCall(rpc, "eth_reverseResolve", [
					trimmed,
					"latest"
				])) as string | null;
				return ApiResponse.ok(c, "ENS reverse lookup complete", {
					input: trimmed,
					resolved: result ?? null,
					resolvedAddress: trimmed
				});
			}
			// Forward resolve: name → address. Normalise first (UTS-46, lowercased).
			const name = trimmed.toLowerCase();
			if (!/^[a-z0-9-]+\.eth$/.test(name)) {
				throw ApiError.badRequest(
					"Input must be an EVM address or a *.eth ENS name"
				);
			}
			const addr = (await rpcCall(rpc, "eth_resolveName", [
				name,
				"latest"
			])) as string | null;
			if (!addr) {
				return ApiResponse.ok(c, "ENS name has no resolver record", {
					input: name,
					resolved: null,
					resolvedAddress: null
				});
			}
			return ApiResponse.ok(c, "ENS forward lookup complete", {
				input: name,
				resolved: name,
				resolvedAddress: addr
			});
		} catch (err: any) {
			if (err instanceof ApiError) throw err;
			throw ApiError.badGateway(`ENS resolution failed: ${err.message}`);
		}
	})
	.post("/erc20-meta", zValidator("json", Erc20MetaSchema), async (c) => {
		const { address, chain } = c.req.valid("json");
		const explorerUrl = EXPLORER_APIS[chain];
		const apiKey =
			(c.env as unknown as Record<string, string | undefined>)[
				`${chain.toUpperCase()}_EXPLORER_API_KEY`
			] || "";

		try {
			const params = new URLSearchParams({
				module: "token",
				action: "tokeninfo",
				contractaddress: address
			});
			if (apiKey) params.set("apikey", apiKey);

			const res = await fetch(`${explorerUrl}?${params}`, {
				signal: AbortSignal.timeout(8_000)
			});
			if (!res.ok) {
				throw new Error(`Explorer API returned ${res.status}`);
			}
			const data = (await res.json()) as {
				status: string;
				result: Array<{
					contractAddress: string;
					tokenName: string;
					symbol: string;
					divisor: string;
					decimals?: string;
					tokenType?: string;
					totalSupply?: string;
					logoUrl?: string | null;
				}>;
				message?: string;
			};

			if (
				data.status !== "1" ||
				!Array.isArray(data.result) ||
				data.result.length === 0
			) {
				return ApiResponse.ok(c, "Token metadata not available", {
					address,
					chain,
					found: false,
					message: data.message || "Token not found in explorer index"
				});
			}
			const t = data.result[0];
			const decimals = t.decimals
				? parseInt(t.decimals, 10)
				: parseInt(t.divisor, 10) || 18;
			return ApiResponse.ok(c, "Token metadata retrieved", {
				address,
				chain,
				found: true,
				name: t.tokenName,
				symbol: t.symbol,
				decimals,
				type: t.tokenType || "ERC-20",
				totalSupply: t.totalSupply || null,
				logoUrl: t.logoUrl || null
			});
		} catch (err: any) {
			throw ApiError.badGateway(
				`Token metadata lookup failed: ${err.message}`
			);
		}
	})
	.post("/evm-call", zValidator("json", EvmCallSchema), async (c) => {
		const { chain, to, data, from, block } = c.req.valid("json");
		const rpcUrl = RPC_URLS[chain];
		if (!rpcUrl) {
			throw ApiError.badRequest(`Unsupported chain: ${chain}`);
		}
		const callObj: Record<string, string> = { to, data };
		if (from) callObj.from = from;
		try {
			const result = await rpcCall(rpcUrl, "eth_call", [callObj, block]);
			if (typeof result !== "string") {
				throw ApiError.badGateway("RPC returned non-hex result");
			}
			return ApiResponse.ok(c, "eth_call succeeded", {
				chain,
				to,
				from: from ?? null,
				block,
				result
			});
		} catch (err: any) {
			throw ApiError.badGateway(`eth_call failed: ${err.message}`);
		}
	});

// ── Token Price ────────────────────────────────────────────────────────────────
const TokenPriceSchema = z.object({
	token: z.string().min(1).max(128), // symbol or address
	chain: z.enum(["base", "ethereum"]).default("base")
});

/** Map common tokens to CoinGecko coin ids. */
const KNOWN_IDS: Record<string, Record<string, string>> = {
	base: {
		ETH: "ethereum",
		WETH: "weth",
		USDC: "usd-coin",
		"0x833589fcd6edb6e08f4c7c32d4f71b54bda02913": "usd-coin"
	},
	ethereum: {
		ETH: "ethereum",
		WETH: "weth",
		USDC: "usd-coin",
		WBTC: "wrapped-bitcoin"
	}
};

cryptoHandler.post(
	"/token-price",
	zValidator("json", TokenPriceSchema),
	async (c) => {
		const { token, chain } = c.req.valid("json");

		// Resolve to CoinGecko id
		const ids = KNOWN_IDS[chain];
		const coinId =
			ids?.[token.toUpperCase()] || ids?.[token.toLowerCase()] || token;

		try {
			const url = `https://api.coingecko.com/api/v3/simple/price?ids=${encodeURIComponent(coinId)}&vs_currencies=usd&include_24hr_change=true&include_last_updated_at=true`;
			const res = await fetch(url, {
				headers: { Accept: "application/json" }
			});
			if (!res.ok) {
				if (res.status === 404)
					throw ApiError.notFound(
						`Token '${token}' not found on CoinGecko`
					);
				throw ApiError.badGateway(`CoinGecko API error: ${res.status}`);
			}
			const data = (await res.json()) as Record<
				string,
				{
					usd: number;
					usd_24h_change?: number;
					last_updated_at?: number;
				}
			>;
			const price = data[coinId];
			if (!price) throw ApiError.notFound(`Token '${token}' not found`);

			return ApiResponse.ok(c, "Token price retrieved", {
				token,
				chain,
				priceUsd: price.usd,
				change24h: price.usd_24h_change ?? null,
				lastUpdated: price.last_updated_at
					? new Date(price.last_updated_at * 1000).toISOString()
					: null
			});
		} catch (err: any) {
			if (err instanceof ApiError) throw err;
			throw ApiError.badGateway(
				`Token price lookup failed: ${err.message}`
			);
		}
	}
);

export default cryptoHandler;

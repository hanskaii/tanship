import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

import { ApiError } from "@/helpers/errors.helper";
import { ApiResponse } from "@/helpers/response.helper";
import type { HonoEnv } from "@/types/hono.types";

const GasPriceSchema = z.object({
	chain: z.enum(["base", "ethereum", "arbitrum", "polygon"]).default("base")
});

const EvmAddressSchema = z
	.string()
	.regex(/^0x[a-fA-F0-9]{40}$/, "Invalid EVM address format");

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
								symbol = new TextDecoder()
									.decode(bytes)
									.replace(/\x00/g, "")
									.trim();
							}
						} catch {}

						results.push({
							type: "erc20",
							asset: token,
							balance: formatUnits(tokenBalanceHex, decimals),
							symbol: symbol || "TOKEN"
						});
					} catch (e) {
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
	});

export default cryptoHandler;

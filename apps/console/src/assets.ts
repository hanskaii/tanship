import { DEFAULT_STABLECOINS } from "@x402/evm";

import type { NetworkDef } from "@/networks";

export interface AssetInfo {
	address: string;
	name: string;
	version: string;
	decimals: number;
}

/**
 * USDC config for PayAI networks that @x402/evm has no built-in default for.
 * Every entry was verified on-chain (eth_call name() / version() / decimals())
 * against the network's public RPC on 2026-07-09.
 */
export const CUSTOM_STABLECOINS: Record<string, AssetInfo> = {
	// Avalanche C-Chain — native Circle USDC
	"eip155:43114": {
		address: "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E",
		name: "USD Coin",
		version: "2",
		decimals: 6
	},
	// Avalanche Fuji — Circle testnet USDC
	"eip155:43113": {
		address: "0x5425890298aed601595a70AB815c96711a31Bc65",
		name: "USD Coin",
		version: "2",
		decimals: 6
	},
	// Polygon Amoy — Circle testnet USDC
	"eip155:80002": {
		address: "0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582",
		name: "USDC",
		version: "2",
		decimals: 6
	},
	// Sei EVM — native Circle USDC
	"eip155:1329": {
		address: "0xe15fc38f6d8c56af07bbcbe3baf5708a2bf42392",
		name: "USDC",
		version: "2",
		decimals: 6
	},
	// SKALE Base — Bridged USDC (SKALE Bridge)
	"eip155:1187947933": {
		address: "0x85889c8c714505E0c94b30fcfcF64fE3Ac8FCb20",
		name: "Bridged USDC (SKALE Bridge)",
		version: "2",
		decimals: 6
	},
	// SKALE Base Sepolia — Bridged USDC (SKALE Bridge)
	"eip155:324705682": {
		address: "0x2e08028E3C4c2356572E096d8EF835cD5C6030bD",
		name: "Bridged USDC (SKALE Bridge)",
		version: "2",
		decimals: 6
	},
	// X Layer — USDC (Bridged USDC Standard)
	"eip155:196": {
		address: "0x74b7F16337b8972027F6196A17a631aC6dE26d22",
		name: "USD Coin",
		version: "2",
		decimals: 6
	}
	// No canonical USDC found for sei-testnet (eip155:713715) and
	// xlayer-testnet (eip155:1952) — those networks are skipped until an
	// entry is added here.
};

/** True when a "$x.xx" price can be converted to a token amount on `network`. */
export function hasAssetFor(network: NetworkDef): boolean {
	if (network.namespace === "solana") return true; // @x402/svm has USDC built in
	return (
		network.caip2 in DEFAULT_STABLECOINS ||
		network.caip2 in CUSTOM_STABLECOINS
	);
}

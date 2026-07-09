export interface NetworkDef {
	name: string;
	slug: string;
	caip2: string;
	namespace: "eip155" | "solana";
	testnet: boolean;
}

/** Every network supported by the PayAI facilitator (v2 `exact` scheme). */
export const NETWORKS: NetworkDef[] = [
	{
		name: "Arbitrum One",
		slug: "arbitrum",
		caip2: "eip155:42161",
		namespace: "eip155",
		testnet: false
	},
	{
		name: "Arbitrum Sepolia",
		slug: "arbitrum-sepolia",
		caip2: "eip155:421614",
		namespace: "eip155",
		testnet: true
	},
	{
		name: "Avalanche",
		slug: "avalanche",
		caip2: "eip155:43114",
		namespace: "eip155",
		testnet: false
	},
	{
		name: "Avalanche Fuji",
		slug: "avalanche-fuji",
		caip2: "eip155:43113",
		namespace: "eip155",
		testnet: true
	},
	{
		name: "Base",
		slug: "base",
		caip2: "eip155:8453",
		namespace: "eip155",
		testnet: false
	},
	{
		name: "Base Sepolia",
		slug: "base-sepolia",
		caip2: "eip155:84532",
		namespace: "eip155",
		testnet: true
	},
	{
		name: "Polygon",
		slug: "polygon",
		caip2: "eip155:137",
		namespace: "eip155",
		testnet: false
	},
	{
		name: "Polygon Amoy",
		slug: "polygon-amoy",
		caip2: "eip155:80002",
		namespace: "eip155",
		testnet: true
	},
	{
		name: "Sei",
		slug: "sei",
		caip2: "eip155:1329",
		namespace: "eip155",
		testnet: false
	},
	{
		name: "Sei Testnet",
		slug: "sei-testnet",
		caip2: "eip155:713715",
		namespace: "eip155",
		testnet: true
	},
	{
		name: "SKALE Base",
		slug: "skale-base",
		caip2: "eip155:1187947933",
		namespace: "eip155",
		testnet: false
	},
	{
		name: "SKALE Base Sepolia",
		slug: "skale-base-sepolia",
		caip2: "eip155:324705682",
		namespace: "eip155",
		testnet: true
	},
	{
		name: "Solana",
		slug: "solana",
		caip2: "solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp",
		namespace: "solana",
		testnet: false
	},
	{
		name: "Solana Devnet",
		slug: "solana-devnet",
		caip2: "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1",
		namespace: "solana",
		testnet: true
	},
	{
		name: "X Layer",
		slug: "xlayer",
		caip2: "eip155:196",
		namespace: "eip155",
		testnet: false
	},
	{
		name: "X Layer Testnet",
		slug: "xlayer-testnet",
		caip2: "eip155:1952",
		namespace: "eip155",
		testnet: true
	}
];

const BY_KEY = new Map<string, NetworkDef>(
	NETWORKS.flatMap((n) => [
		[n.caip2, n],
		[n.slug, n]
	])
);

/**
 * Parse a comma-separated list of network slugs or CAIP-2 ids into
 * NetworkDefs. Solana networks are dropped when no SVM payout address is
 * configured. Unknown entries throw so misconfiguration fails loudly.
 */
export function parseNetworks(
	list: string,
	hasSvmAddress: boolean
): NetworkDef[] {
	const parsed = list
		.split(",")
		.map((entry) => entry.trim())
		.filter(Boolean)
		.map((entry) => {
			const network = BY_KEY.get(entry);
			if (!network) throw new Error(`Unknown x402 network: ${entry}`);
			return network;
		});

	return parsed.filter((n) => n.namespace !== "solana" || hasSvmAddress);
}

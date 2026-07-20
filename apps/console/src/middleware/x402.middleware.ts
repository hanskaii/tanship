import { createMiddleware } from "hono/factory";
import type { MiddlewareHandler } from "hono";
import {
	paymentMiddleware,
	x402ResourceServer,
	type Network
} from "@x402/hono";
import { HTTPFacilitatorClient } from "@x402/core/server";
import { convertToTokenAmount, numberToDecimalString } from "@x402/core/utils";
import { ExactEvmScheme } from "@x402/evm/exact/server";
import { ExactSvmScheme } from "@x402/svm/exact/server";
import { bazaarResourceServerExtension } from "@x402/extensions/bazaar";

import { buildRoutesConfig } from "@/catalog";
import { CUSTOM_STABLECOINS, hasAssetFor } from "@/assets";
import { parseNetworks } from "@/networks";
import type { HonoEnv } from "@/types/hono.types";

// Bindings are only available per-request on Workers, so the payment
// middleware is built lazily and memoized for the isolate lifetime.
let cached: { key: string; mw: MiddlewareHandler } | null = null;

export const x402 = createMiddleware<HonoEnv>(async (c, next) => {
	const {
		PAY_TO_ADDRESS,
		SVM_PAY_TO_ADDRESS,
		X402_NETWORKS,
		FACILITATOR_URL
	} = c.env;
	const key = `${PAY_TO_ADDRESS}|${SVM_PAY_TO_ADDRESS}|${X402_NETWORKS}|${FACILITATOR_URL}`;

	if (!cached || cached.key !== key) {
		const networks = parseNetworks(
			X402_NETWORKS,
			!!SVM_PAY_TO_ADDRESS
		).filter((network) => {
			if (hasAssetFor(network)) return true;
			console.warn(
				`[x402] Skipping ${network.caip2} (${network.slug}) — no stablecoin configured`
			);
			return false;
		});

		const facilitator = new HTTPFacilitatorClient({ url: FACILITATOR_URL });
		// Override to skip slow network fetch on Cloudflare Workers startup
		facilitator.getSupported = async () => {
			return {
				schemes: ["exact"],
				networks: ["eip155:8453", "eip155:84532"] as Network[],
				kinds: [
					{
						x402Version: 2,
						scheme: "exact",
						network: "eip155:8453" as Network
					},
					{
						x402Version: 2,
						scheme: "exact",
						network: "eip155:84532" as Network
					}
				],
				extensions: ["bazaar"],
				signers: {}
			};
		};

		// Fills the gaps in @x402/evm's built-in USDC registry (see assets.ts)
		const evmScheme = new ExactEvmScheme().registerMoneyParser(
			async (amount, network) => {
				const asset = CUSTOM_STABLECOINS[network];
				if (!asset) return null; // fall through to library defaults
				return {
					amount: convertToTokenAmount(
						numberToDecimalString(amount),
						asset.decimals
					),
					asset: asset.address,
					extra: { name: asset.name, version: asset.version }
				};
			}
		);
		const svmScheme = new ExactSvmScheme();

		const resourceServer = new x402ResourceServer(facilitator);
		// Enables Bazaar discovery metadata declared per-route in catalog.ts
		resourceServer.registerExtension(bazaarResourceServerExtension);
		for (const network of networks) {
			resourceServer.register(
				network.caip2 as Network,
				network.namespace === "solana" ? svmScheme : evmScheme
			);
		}

		cached = {
			key,
			mw: paymentMiddleware(
				buildRoutesConfig(networks, PAY_TO_ADDRESS, SVM_PAY_TO_ADDRESS),
				resourceServer
			)
		};
	}

	return cached.mw(c, next);
});

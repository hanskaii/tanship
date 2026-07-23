import { decodePaymentSignatureHeader } from "@x402/core/http";

import { ApiError } from "@/helpers/errors.helper";

export interface PayerIdentity {
	/** Lowercased payer wallet address — the tenant key for scoping storage. */
	wallet: string;
	/** Per-payment nonce — a natural idempotency key, unique per authorization. */
	nonce: string;
}

/**
 * Decode the X-PAYMENT header to identify the paying wallet.
 *
 * The x402 middleware only lets a request reach a handler after the payment
 * verifies, so by the time this runs the header is present and trustworthy.
 * We derive a per-wallet tenant key (so one wallet can never read/overwrite
 * another's data) and a per-payment nonce (a free idempotency key).
 *
 * Supports both EVM (`authorization.from`) and Solana (`payload.from` /
 * `account`) exact-scheme payload shapes.
 */
export function resolvePayer(header: string | undefined | null): PayerIdentity {
	if (!header) {
		// Should be unreachable behind the paid middleware, but never trust that.
		throw ApiError.badRequest("Missing X-PAYMENT header");
	}

	let decoded: any;
	try {
		decoded = decodePaymentSignatureHeader(header);
	} catch {
		throw ApiError.badRequest("Malformed X-PAYMENT header");
	}

	const payload = decoded?.payload ?? {};
	const auth = payload.authorization ?? {};

	// EVM exact scheme → authorization.from; SVM variants → payload.from / account
	const wallet: unknown =
		auth.from ?? payload.from ?? payload.account ?? decoded?.payer;
	const nonce: unknown =
		auth.nonce ?? payload.nonce ?? decoded?.signature ?? "";

	if (typeof wallet !== "string" || wallet.length === 0) {
		throw ApiError.badRequest(
			"Could not identify payer wallet from payment"
		);
	}

	return {
		wallet: wallet.toLowerCase(),
		nonce: typeof nonce === "string" ? nonce : String(nonce)
	};
}

/**
 * Namespace a user-supplied key under the payer's wallet so tenants are
 * isolated. `wallet:0xabc…` + `user-key` → `0xabc…/user-key`.
 */
export function scopeKey(wallet: string, key: string): string {
	return `${wallet}/${key}`;
}

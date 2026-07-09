# Tanflare Console — x402 API

Payment-gated API on `console.tanflare.com`. Wraps Cloudflare services (Workers AI + Browser Rendering) as pay-per-call endpoints using the [x402 payment protocol](https://x402.org) — no accounts, no API keys: clients (usually AI agents) pay per request with stablecoins.

## How it works

1. Client calls a paid endpoint without payment → server responds `402 Payment Required` with payment instructions (one `accepts` entry per supported network).
2. Client signs a payment authorization on any supported chain and retries with the `X-PAYMENT` header.
3. `@x402/hono` middleware verifies + settles via the PayAI facilitator, then the wrapped Cloudflare service runs and the response is returned.

## Endpoints

| Endpoint                      | Price  | What it does                                         |
| ----------------------------- | ------ | ---------------------------------------------------- |
| `POST /v1/ai/chat`            | $0.005 | LLM chat completion (Workers AI, Llama 3.3 70B)      |
| `POST /v1/ai/image`           | $0.02  | Text-to-image, FLUX.1 schnell (JPEG)                 |
| `POST /v1/ai/embeddings`      | $0.002 | BGE-M3 text embeddings                               |
| `POST /v1/browser/screenshot` | $0.01  | Screenshot any webpage (PNG)                         |
| `POST /v1/browser/pdf`        | $0.01  | Render any URL to PDF                                |
| `POST /v1/browser/markdown`   | $0.005 | Turn a page into Markdown — no ads, no chrome        |
| `POST /v1/browser/snapshot`   | $0.012 | Rendered HTML + screenshot in a single call          |
| `POST /v1/browser/scrape`     | $0.006 | Pull specific elements off a page with CSS selectors |
| `POST /v1/browser/json`       | $0.015 | Describe what you want, get clean JSON back via AI   |
| `POST /v1/browser/links`      | $0.003 | Get every link on a page                             |
| `POST /v1/browser/rss`        | $0.015 | Turn any blog/news page into a subscribable RSS feed |

Free: `GET /` (health) and `GET /v1/services` (machine-readable catalog with prices + networks).

## Supported networks

All PayAI facilitator networks (v2 `exact` scheme), configured via `X402_NETWORKS`:

Arbitrum One, Arbitrum Sepolia, Avalanche, Avalanche Fuji, Base, Base Sepolia, Polygon, Polygon Amoy, Sei, SKALE Base, SKALE Base Sepolia, Solana, Solana Devnet, X Layer — plus Sei Testnet and X Layer Testnet as soon as a USDC contract is added for them in `src/assets.ts` (no canonical deployment exists today, so they are skipped with a warning).

EVM payments go to `PAY_TO_ADDRESS`; Solana payments go to `SVM_PAY_TO_ADDRESS` (Solana networks are only offered when it is set). The network registry lives in [src/networks.ts](apps/console/src/networks.ts); USDC contracts that `@x402/evm` doesn't ship defaults for (Avalanche, Sei, SKALE, X Layer, Polygon Amoy — all verified on-chain) live in [src/assets.ts](apps/console/src/assets.ts).

## Setup

```bash
cp .dev.vars.example .dev.vars   # fill in values
pnpm install
pnpm dev                         # http://localhost:8788
```

Secrets for production (`wrangler secret put <NAME>`):

- `PAY_TO_ADDRESS` — EVM wallet that receives payments
- `SVM_PAY_TO_ADDRESS` — optional Solana wallet
- `CLOUDFLARE_ACCOUNT_ID` / `CLOUDFLARE_API_TOKEN` — token with **Browser Rendering: Edit** permission (Workers AI uses the `AI` binding, no token needed)

Vars in `wrangler.jsonc`:

- `X402_NETWORKS` — comma-separated network slugs or CAIP-2 ids.
- `FACILITATOR_URL` — default `https://facilitator.payai.network`. For production credentials see [merchant.payai.network](https://merchant.payai.network).

## Testing with an x402 client

Get test USDC on Base Sepolia from the [Circle faucet](https://faucet.circle.com/), then:

```ts
import { wrapFetchWithPayment } from "@x402/fetch";
import { privateKeyToAccount } from "viem/accounts";

const account = privateKeyToAccount(process.env.PRIVATE_KEY);
const fetchWithPay = wrapFetchWithPayment(fetch, account);

const res = await fetchWithPay(
	"https://console.tanflare.com/v1/browser/markdown",
	{
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ url: "https://example.com" })
	}
);
console.log(await res.json());
```

Without payment you get the 402 challenge:

```bash
curl -s -X POST https://console.tanflare.com/v1/ai/chat \
	-H "Content-Type: application/json" \
	-d '{"messages":[{"role":"user","content":"hi"}]}'
# → 402 with accepts[] payment requirements (one entry per network)
```

## Adding a new paid endpoint

1. Add the service to `src/catalog.ts` (price, path, description) — middleware pricing and `/v1/services` both derive from it.
2. Add the handler under `src/handlers/` (method chaining + `zValidator` + `ApiResponse`).
3. Mount it under `/v1/...` in `src/index.ts`.

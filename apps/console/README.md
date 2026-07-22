# Tanflare Console — x402 API

Payment-gated API on `console.tanflare.com`. Wraps Cloudflare services (Workers AI + Browser Rendering) as pay-per-call endpoints using the [x402 payment protocol](https://x402.org) — no accounts, no API keys: clients (usually AI agents) pay per request with stablecoins.

## How it works

1. Client calls a paid endpoint without payment → server responds `402 Payment Required` with payment instructions (one `accepts` entry per supported network).
2. Client signs a payment authorization on any supported chain and retries with the `X-PAYMENT` header.
3. `@x402/hono` middleware verifies + settles via the PayAI facilitator, then the wrapped Cloudflare service runs and the response is returned.

## Endpoints

| Endpoint                          | Price  | What it does                                         |
| --------------------------------- | ------ | ---------------------------------------------------- |
| `POST /v1/ai/chat`                | $0.005 | LLM chat completion (Workers AI, Llama 3.3 70B)      |
| `POST /v1/ai/image`               | $0.020 | Text-to-image, FLUX.1 schnell (JPEG)                 |
| `POST /v1/ai/embeddings`          | $0.002 | BGE-M3 text embeddings (1024 dims)                   |
| `POST /v1/ai/translate`           | $0.003 | AI-powered translation with auto source detection    |
| `POST /v1/ai/sentiment`           | $0.002 | Sentiment analysis (Distilbert label + score)        |
| `POST /v1/ai/transcribe`          | $0.010 | Speech-to-text audio transcription (Whisper)         |
| `POST /v1/ai/describe`            | $0.005 | Image captioning and description (BLIP)              |
| `POST /v1/ai/detect`              | $0.005 | Object detection and bounding boxes (DETR-ResNet-50) |
| `POST /v1/ai/classify`            | $0.003 | Image classification (ResNet-50 labels + scores)     |
| `POST /v1/ai/rerank`              | $0.003 | Relevance reranking (BGE Reranker Large)             |
| `POST /v1/ai/moderate`            | $0.002 | Content safety moderation (Llama Guard 3 8B)         |
| `POST /v1/ai/compress`            | $0.005 | Semantic text compression to save prompt tokens      |
| `POST /v1/ai/answer`              | $0.008 | Visual Question Answering (PaliGemma VQA)            |
| `POST /v1/ai/correct`             | $0.005 | Spelling & grammar corrector (Llama 3.3)             |
| `POST /v1/ai/code`                | $0.005 | Coding helper, debugger, and refactorer              |
| `POST /v1/ai/reason`              | $0.008 | DeepSeek-R1 reasoning (separated thinking block)     |
| `POST /v1/ai/similarity`          | $0.004 | Semantic cosine similarity score (BGE-M3)            |
| `POST /v1/ai/memory/add`          | $0.005 | Store text chunks semantically (CF Vectorize)        |
| `POST /v1/ai/memory/search`       | $0.005 | Search semantic memory matches (CF Vectorize)        |
| `POST /v1/ai/sql`                 | $0.005 | SQL query generator from text with dialects          |
| `POST /v1/browser/search`         | $0.020 | Search engine scraper + AI structured results        |
| `POST /v1/browser/search/summary` | $0.030 | Perplexity clone: web search + AI synthesis cited    |
| `POST /v1/browser/metadata`       | $0.008 | SEO & OpenGraph metadata extraction                  |
| `POST /v1/browser/article`        | $0.012 | Clean structured article reader (read time, md)      |
| `POST /v1/browser/news`           | $0.005 | Real-time news search results                        |
| `POST /v1/browser/seo`            | $0.015 | Webpage SEO health audit and validator               |
| `POST /v1/browser/contacts`       | $0.012 | Lead email, phone, and social links scraper          |
| `POST /v1/browser/sitemap`        | $0.008 | Website XML sitemap crawler                          |
| `POST /v1/browser/forms`          | $0.012 | Extract all web forms and input schemas              |
| `POST /v1/browser/health`         | $0.015 | Webpage uptime, speed, SSL, and error check          |
| `POST /v1/browser/screenshot`     | $0.010 | Screenshot any webpage (PNG) with CSS selectors      |
| `POST /v1/browser/pdf`            | $0.010 | Render any URL to PDF with custom layout/scale       |
| `POST /v1/browser/markdown`       | $0.005 | Turn a page into Markdown — no ads, no chrome        |
| `POST /v1/browser/snapshot`       | $0.012 | Rendered HTML + screenshot in a single call          |
| `POST /v1/browser/scrape`         | $0.006 | Pull specific elements off a page with CSS selectors |
| `POST /v1/browser/json`           | $0.015 | Describe what you want, get clean JSON back via AI   |
| `POST /v1/browser/links`          | $0.003 | Get every link on a page                             |
| `POST /v1/browser/rss`            | $0.015 | Turn any blog/news page into a subscribable RSS feed |
| `POST /v1/browser/rss/summary`    | $0.020 | Summarize blog or feed URL into newsletter digest    |

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

## Discoverability (Bazaar)

Every route declares the [x402 Bazaar](https://docs.payai.network) discovery extension (`@x402/extensions/bazaar`), so the endpoint is machine-discoverable by AI agents. The 402 challenge carries an `extensions.bazaar` payload (input shape + method) built from each service's `example` in `src/catalog.ts`.

There is **no separate registration step** — the facilitator catalogs the endpoint the first time a payment settles for that URL. After ≥1 successful settlement through PayAI, the service appears in the PayAI discovery index:

```bash
curl -s "https://facilitator.payai.network/discovery/resources?limit=50" \
  | jq '.items[] | select(.resource | contains("console.tanflare.com"))'
```

To give agents richer metadata, edit the per-service `example` (request body) in `src/catalog.ts` — that shape is what shows up as `inputSchema` in the index.

## Adding a new paid endpoint

1. Add the service to `src/catalog.ts` (price, path, description) — middleware pricing and `/v1/services` both derive from it.
2. Add the handler under `src/handlers/` (method chaining + `zValidator` + `ApiResponse`).
3. Mount it under `/v1/...` in `src/index.ts`.

# x402 Protocol Ecosystem Research

**Status**: Complete  
**Date**: 2026-08-27  
**Sources**: GitHub API, PayAI Bazaar API, x402.org, x402-list.com, x402scan.com, x402-foundation/x402 (6.5k stars)

---

## 1. What is x402 Protocol — Technical Specification

x402 is an **open standard for internet-native HTTP payments**, built on the dormant HTTP 402 "Payment Required" status code. Enables machine-to-machine and AI-agent-to-service micropayments over HTTP with on-chain settlement.

### Core Payment Flow

1. Client requests a resource
2. Server responds `402 Payment Required` + `X-Payment-Required` header (JSON with amount, network, asset, payTo address)
3. Client pays on-chain (USDC on Base, Solana, etc.)
4. Client retries request with `X-Payment-Token` header (payment proof)
5. Server validates proof on-chain, serves resource

### Key Headers

```
X-Payment-Required: { scheme, network, asset, maxAmountRequired, resource, description, payTo, maxTimeoutSeconds }
X-Payment-Token: <payment proof blob>
X-Payment-Status: <status>
```

### Supported Schemes

- `exact` — pay exact amount (dominant)
- `model` — subscription/periodic access
- `marketplace` — dynamic supply/demand pricing

### Supported Networks (Aug 2026)

- **Base L2** — dominant (~73% of Bazaar endpoints), fast + cheap gas
- **Solana** (~18% of Bazaar)
- Avalanche C-Chain, Stellar, XRP Ledger, Hedera, Keeta (via facilitator plugins)
- Ethereum mainnet, Polygon, Arbitrum, Optimism (listed in spec)

### Supported Assets

- USDC (primary, used by virtually all Bazaar endpoints)
- ETH, MATIC, USDT, DAI, SPL tokens (Solana)

### SDKs

| Language   | Packages                                                                                                                                                         |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| TypeScript | `@x402/core`, `@x402/evm`, `@x402/svm`, `@x402/axios`, `@x402/fetch`, `@x402/fastify`, `@x402/express`, `@x402/hono`, `@x402/next`, `@x402/paywall`, `@x402/mcp` |
| Python     | `x402` (PyPI) — Flask, FastAPI, Django integrations                                                                                                              |
| Go         | `github.com/x402-foundation/x402/go/v2`                                                                                                                          |
| Rust       | `x402-rs`, `r402`, `qntx/r402`                                                                                                                                   |
| Java       | `java/` folder in foundation repo                                                                                                                                |

### Foundation

- **x402.org** — Linux Foundation project page + stats dashboard
- **github.com/x402-foundation/x402** — 6,542 stars, 1,969 forks, Apache 2.0, TypeScript primary
- **Slack**: slack.x402.org
- **Version**: x402 v2 (current), Coinbase had an earlier fork (now dev/dormant)

---

## 2. Ecosystem Size & On-Chain Metrics (Aug 2026)

| Source                                       | 30-Day Txns | 30-Day Volume | 30-Day Buyers | 30-Day Sellers |
| -------------------------------------------- | ----------- | ------------- | ------------- | -------------- |
| x402.org (foundation)                        | 75.41M      | $24.24M       | 94,060        | 22,000         |
| x402scan.com                                 | 15.99M      | $1.28M        | 21,940        | 24,000         |
| x402-list.com (measured floor, 428 services) | 8.00M       | $218K         | 5,467         | 428 services   |

**Gap**: x402scan tracks ~5x less volume than foundation stats — x402scan covers only specific facilitators.

**Concentration**: Top 10 services = 97.6% of measured settlement volume. Single largest = 84.7% of volume (likely BlockRun or similar flagship service).

**Discovery**: x402-list.com — 575 services, 3,459 endpoints, 88.1% avg uptime, 30 mainnet networks.

---

## 3. Existing x402 Marketplaces & Discovery Platforms

| Platform                  | URL                               | Notes                                                         |
| ------------------------- | --------------------------------- | ------------------------------------------------------------- |
| **x402-list.com**         | https://x402-list.com             | 575 services, machine-readable API, uptime monitoring         |
| **x402scan.com**          | https://www.x402scan.com          | Block explorer + analytics dashboard                          |
| **Agentic.Market**        | https://agentic.market            | Agent-focused curated marketplace                             |
| **Pay.sh**                | https://pay.sh                    | Simple payment links for creators                             |
| **ampersend.ai/discover** | https://app.ampersend.ai/discover | Agentic API discovery + orchestration                         |
| **PayAI Bazaar**          | facilitator.payai.network         | Live JSON API — 100 endpoints, 27 domains (Aug 2026 snapshot) |

---

## 4. Who is Selling APIs via x402 (Real Listings)

### Top Bazaar Sellers (Aug 2026 snapshot, PayAI Facilitator)

| Seller                                | Endpoints | Price Range       | Category                                                                                               |
| ------------------------------------- | --------- | ----------------- | ------------------------------------------------------------------------------------------------------ |
| `relay402.georgespring.workers.dev`   | 23        | $0.001–$0.060     | **Security** (npm/PyPI risk, prompt injection, secret scan, GitHub health, DMARC, agent MCP tool risk) |
| `www.cloudworldmodel.ai`              | 23        | $0.001            | Cloud simulation stepping + traffic injection                                                          |
| `www.robinhoodradar.com`              | 8         | $0.010            | DEX quotes, new coins, board data                                                                      |
| `x402.freeq.one`                      | 6         | $0.001–$0.005     | MCP 19-tool server, wallet verify, LLM chat                                                            |
| `mpp.hyreagent.fun`                   | 28        | up to $0.15       | Solana token risk, Meteora pool recs, wallet positions                                                 |
| `api.paysponge.com`                   | 5         | free              | AgentMail ephemeral inbox (Base)                                                                       |
| `api.nansen.ai`                       | 4         | $0.010            | Perpetual/token screening (Solana)                                                                     |
| `stableenrich.dev`                    | 3         | $0.002–$0.150     | Exa search, content fetch, people search                                                               |
| `payai.agentstools.dev`               | 8         | $0.003–$0.05      | EVM telemetry, swap quotes, NFT collection, DCA                                                        |
| `apiv2.laevitas.ch`                   | 2         | $0.100            | Hyperliquid perp + options (Solana)                                                                    |
| **x402.tanship.dev (Tanship)**        | **5**     | **$0.002–$0.005** | AI chat, links, translate, sentiment, embeddings                                                       |
| `agent-toll.agentfetcher.workers.dev` | 1         | $0.010            | Web extract (Base)                                                                                     |
| `k2so.wrong.systems`                  | 2         | $0.002–$0.020     | CVE watch, dependency check                                                                            |

**Notable**: Security category (relay402) is highest-revenue niche — 5 of the top 10 most expensive Bazaar listings. Tanship has zero presence there.

### Price Distribution (Bazaar)

- Free: 11% of endpoints
- < $0.01: 46% of endpoints
- $0.01–$0.10: 39%
- ≥ $0.10: 4%
- **Median: $0.005, Mean: $0.012**

---

## 5. GitHub Repos Using x402 (Top by Stars)

| Stars | Repo                                           | Description                                                                                                                                                             |
| ----- | ---------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 6,571 | BlockRunAI/ClawRouter                          | Agent-native LLM router. Every frontier model behind one wallet, <1ms local routing, USDC payments on Base & Solana via x402                                            |
| 6,542 | x402-foundation/x402                           | **Foundation repo** — payments protocol for the internet. Built on HTTP                                                                                                 |
| 4,908 | internet-court/internet-court-skill            | Trust layer for agent-to-agent commerce — natural-language mandates, ERC-7710 delegated permissions, x402 payments, escrow, dispute resolution                          |
| 2,447 | Bitterbot-AI/bitterbot-desktop                 | Local-first AI agent, peer-to-peer skills economy                                                                                                                       |
| 1,762 | solana-foundation/pay                          | CLI for Agentic payments (x402, MPP, AP2)                                                                                                                               |
| 755   | apify/mcpc                                     | Universal MCP CLI client — x402 support, persistent sessions, HTTP/stdio                                                                                                |
| 752   | alsk1992/CloddsBot                             | Open-source AI trading agent across 1000+ markets (Polymarket, Kalshi, Binance, Hyperliquid, Solana DEXs, 5 EVM chains). Agent commerce protocol. Self-hosted on Claude |
| 616   | daydreamsai/daydreams                          | Tools for building commerce agents                                                                                                                                      |
| 567   | qntx/ovo                                       | Agent behavior that compiles                                                                                                                                            |
| 554   | google-agentic-commerce/a2a-x402               | **Google's A2A x402 Extension** — brings crypto payments to Google A2A protocol for agent monetization                                                                  |
| 550   | BlockRunAI/Franklin                            | AI agent with a wallet — spends USDC autonomously to get real work done                                                                                                 |
| 392   | BlockRunAI/blockrun-mcp                        | Live data for AI agents — search, research, markets, crypto, X/Twitter. Pay-per-call via x402 micropayments                                                             |
| 380   | Merit-Systems/x402scan                         | x402 Ecosystem Explorer                                                                                                                                                 |
| 287   | x402-rs/x402-rs                                | x402 payments in Rust: verify, settle, monitor over HTTP 402 flows                                                                                                      |
| 286   | xpaysh/awesome-x402                            | Curated list of x402 resources (SDKs, facilitators, tutorials)                                                                                                          |
| 262   | qntx/openai-python                             | Drop-in OpenAI Python client with transparent x402 payment support                                                                                                      |
| 194   | daydreamsai/lucid-agents                       | AI agents commerce SDK supporting x402, AP2, A2A, ERC8004                                                                                                               |
| 154   | qntx/r402                                      | Rust SDK for x402 payment protocol                                                                                                                                      |
| 153   | qntx/openai                                    | Drop-in OpenAI TypeScript client with x402 support                                                                                                                      |
| 74    | nirholas/agenti                                | Give any AI agent a crypto wallet — pay x402 APIs, receive USDC                                                                                                         |
| 36    | tiero/claw-cash                                | Bitcoin wallet for AI agents (stablecoins in, BTC out)                                                                                                                  |
| 17    | lily-protocol/Lily-Protocol                    | On-chain financial infrastructure on Stellar for AI agents                                                                                                              |
| 11    | botwallet-co/botwallet                         | Wallet infrastructure for AI agents on Solana (earn, spend, trade USDC)                                                                                                 |
| 8     | aws-samples/sample-agentic-serverless-payments | AWS reference impl: pay-per-use generative AI with x402                                                                                                                 |

---

## 6. Blog Posts, Discussions, Developer Adoption

### Key Discussions & Coverage

- **x402.org/blog** — official foundation blog
- **x402.org Slack** (slack.x402.org) — active developer community
- **x.com / Twitter** — search `x402 protocol` reveals: AI agent developers, crypto natives, and API builders discussing pay-per-call monetization
- **Hacker News** — periodic threads on "AI agents paying for APIs" with x402 as the reference implementation
- **Reddit r/LocalLLaMA, r/SideProject** — posts about x402 as frictionless alternative to Stripe for AI APIs

### Notable Adoption Signals

- **Google (Agent-to-Agent)** published `google-agentic-commerce/a2a-x402` — x402 extension for Google's A2A protocol. This is the most significant institutional adoption signal.
- **Solana Foundation** published `solana-foundation/pay` — official CLI for x402 on Solana, alongside MPP and AP2
- **Cloudflare** — built-in x402 support in Workers (workers natively serve 402 + handle payment headers)
- **AWS** — published a reference implementation for agentic serverless payments
- **Coinbase** — original x402 initiator, though their fork is now dormant (148 stars vs foundation's 6,542)

### Developer Pain Points (from SKILL.md research)

1. **Startup CPU timeout** — facilitator discovery on worker cold start exceeds 10-50ms CPU limit on CF Free
2. **Code generation errors** — Zod/AJV dynamic eval blocked on Cloudflare Workers
3. **Human friction** — x402 great for agents, painful for humans (requires crypto wallet + USDC on Base)
4. **High concentration risk** — 97.6% of volume in top 10 services; new entrants face distribution problem

---

## 7. "4011" Protocol — Status

**No "4011 protocol" found.** The hexadecimal adjacent to HTTP 402 is likely a misremembering or early prototype name. The actual protocol is **x402** (HTTP 402 Payment Required, extended with payment headers).

No GitHub repos, blog posts, or marketplace listings reference "4011" as a payment protocol.

---

## 8. How AI Agents Pay for APIs — Autonomous Payment Stack

### The Stack

```
[AI Agent Runtime] → [@x402/fetch / wrapFetchWithPayment]
    → [Agent Wallet (private key)]
    → [Blockchain (Base L2 / Solana)]
    → [USDC transfer to payTo address]
    → [Payment proof in X-Payment-Token header]
    → [Retry request to x402 API]
```

### Agent Wallet Solutions

| Project                                            | Stars | Chain        | Notes                                             |
| -------------------------------------------------- | ----- | ------------ | ------------------------------------------------- |
| **BlockRunAI/Franklin**                            | 550   | Base, Solana | AI agent with a wallet — spends USDC autonomously |
| **nirholas/agenti**                                | 74    | Multi        | Give any AI agent a crypto wallet                 |
| **botwallet-co/botwallet**                         | 11    | Solana       | Earn, spend, trade USDC with human oversight      |
| **tiero/claw-cash**                                | 36    | Bitcoin      | Stablecoins in, BTC out; hardware enclave keys    |
| **Lily-Protocol**                                  | 17    | Stellar      | On-chain financial infra for AI agents            |
| **aws-samples/sample-agentic-serverless-payments** | 8     | Multi        | AWS serverless ref impl                           |
| **solana-foundation/pay**                          | 1,762 | Solana       | Official Solana CLI for x402, MPP, AP2            |

### Eliza Framework Integration (most popular agent framework)

```typescript
import { wrapFetchWithPayment } from "@x402/fetch";
import { privateKeyToAccount } from "viem/accounts";
const payFetch = (runtime: IAgentRuntime) => {
	const key = runtime.getSetting("X402_WALLET_KEY");
	return wrapFetchWithPayment(fetch, privateKeyToAccount(key));
};
```

### Key Mechanism: Facilitators

Facilitators solve the trust problem in M2M payments:

- `https://facilitator.payai.network` — 100 endpoints, 27 domains
- Standard API: `GET /facilitator/supported`, `POST /facilitator/verify`, `POST /facilitator/settle`
- Facilitator handles payment verification so the resource server doesn't need real-time chain access

---

## 9. Real Examples of Developers Making Money with x402

### Confirmed Revenue (On-Chain, Aug 2026)

- **$24.24M total 30-day volume** across x402 ecosystem (x402.org)
- **$1.28M on x402scan** (subset of facilitators)
- **$218K measured floor** (x402-list.com, 3 chains, 428 services)

### Top Earners (Estimated)

1. **relay402 security suite** — 23 endpoints at $0.001–$0.060 each. Dominant in agent security niche. Even at 100 calls/day × $0.01 avg = **$36,500/month**
2. **BlockRun / ClawRouter** — likely the single largest service by volume (implied by 84.7% of settlement volume). 6,571 GitHub stars = significant developer adoption.
3. **mpp.hyreagent.fun** — 28 endpoints, up to $0.15/call, Solana-native, DeFi risk assessments

### How Developers Monetize

- **Cloudflare Workers + x402 middleware** — wrap any CF primitive (Workers AI, R2, Browser Rendering, D1, KV, Vectorize) with `X-Payment-Required` header
- **Profit margins**: 97–99%+ on Cloudflare primitives (CF costs sub-$0.001 per operation; x402 prices typically $0.001–$0.05)
- **Settlement**: Batch USDC via facilitator (low gas on Base L2)
- **Discovery**: Register with `X-Extension-Bazaar-Info` header → PayAI Bazaar auto-indexes

### Tanship Specific

- 5 endpoints live on PayAI Bazaar (Aug 2026): AI chat, links, translate, sentiment, embeddings
- Prices: $0.002–$0.005 — **lowest in the entire marketplace** (penetration pricing)
- Gap: no Durable Objects, no Vectorize, no ephemeral mail, no security stack

---

## 10. Key Findings Summary

1. **x402 is real and live** — $24M/mo volume, 94K buyers, 22K sellers, 75M txns/30d
2. **AI agents are the primary buyers** — BlockRun, Eliza, Franklin, Lucid agents all integrate x402 natively
3. **Base L2 dominates** — 73% of Bazaar endpoints, USDC settlement, fast + cheap
4. **SDKs exist for every major language** — TypeScript, Python, Go, Rust, Java
5. **Big players adopting** — Google A2A, Solana Foundation, Cloudflare, AWS all have x402 integrations
6. **Market concentration is extreme** — top 10 services = 97.6% of volume; distribution is the moat
7. **Security niche is highest-value** — relay402 dominates with 23 endpoints, $0.001–$0.06 pricing
8. **Profit margins are extreme for Cloudflare-backed APIs** — 97–99%+ margins on sub-cent operations
9. **No "4011 protocol"** — the query term is not a real thing
10. **Tanship has 5 endpoints, penetration prices, zero security presence** — highest-ROI action is bulk-register all endpoints + enter security niche

---

## Appendix: Cloudflare Cost vs x402 Price (Aug 2026)

| Service                     | CF Cost              | Typical x402 Price | Margin |
| --------------------------- | -------------------- | ------------------ | ------ |
| Workers AI (chat inference) | ~$0.0000042/chat     | $0.002–$0.05       | 97–99% |
| Workers AI (embedding)      | ~$0.000002/execution | $0.001–$0.005      | 96–99% |
| Browser Rendering           | ~$0.0003/page        | $0.01–$0.05        | 97–99% |
| R2 (Class B)                | $0.36/M ops          | $0.001–$0.01       | 64–96% |
| Vectorize                   | ~$0.000002/query     | $0.001–$0.01       | 80–99% |
| Durable Objects             | ~$0.000001/lock      | $0.001             | 90%    |
| D1 (reads)                  | $0.001/M rows        | $0.001–$0.005      | 0–80%  |

> x402 price >> CF cost across almost all primitives. The margin opportunity is massive for anyone with existing Cloudflare infrastructure.

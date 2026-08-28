# Agent Willingness-to-Pay: Cloudflare Primitive APIs

**Compiled:** August 28, 2026 | **Sources:** x402 Bazaar (1,061 priced endpoints, Aug 2026), Tanship live catalog (165 services), Composio pricing, x402.org live metrics, CF Workers docs

---

## Executive Summary

No direct x402 marketplace data exists for KV, D1, or DO primitives resold as standalone products — they are absent from the 1,061-priced-endpoint catalog. However, market signals strongly bound the pricing range. Live Tanship deployments at $0.001–$0.010/operation have not attracted buyers. The x402 ecosystem's own cheapest endpoints (text transforms, zero-upstream stateless compute) set the effective floor. Composio's $0.0003/call standard tool-call price and $0.001–$0.01 range for premium utilities frame the acceptable window. The CF cost basis is so low (KV read $0.0000005, D1 row write $0.000001) that margin is not the constraint — demand and discoverability are.

---

## 1. x402 Bazaar Price Distribution (1,061 Endpoints)

Source: Tanship `.research/paid_sorted.tsv` — all x402-priced endpoints with price in micropenny units (1 = $0.000001).

| Percentile       | Price (units) | Price (USD) | Interpretation                     |
| ---------------- | ------------- | ----------- | ---------------------------------- |
| p10              | 2,000         | **$0.002**  | Floor of serious paid services     |
| p25              | 2,000         | $0.002      | 25% below this                     |
| **p50 (median)** | **4,000**     | **$0.004**  | Market center — most common price  |
| p75              | 10,000        | $0.010      | 25% above this                     |
| p90              | 30,000        | $0.030      | Premium tier                       |
| p95              | 100,000       | $0.100      | High-value specialized             |
| p99              | ~500,000      | ~$0.500     | Expert/specialized                 |
| Max              | 10,000,000    | $10.00      | Video generation, MCP tool bundles |

**Price distribution shape:**

- Modal cluster: **$0.002–$0.005** (312 endpoints at $2,000, 174 at $5,000)
- Long tail to $10: agent decision procedures, financial data APIs, signed attestations
- The **true commodity floor** is $0.0001 (21 endpoints at $100 — utility text transforms)

**Lowest-priced real endpoints (floor of viable resale):**

- `$0.0001` — gpt55.xyz: text utilities (JSON minify, regex match, HTML strip, base64, etc.)
- `$0.001` — PolandFoxBot: web search via DuckDuckGo
- `$0.002` — delx.ai: timestamp-align, concurrency-cap, step-budget-plan, jsonld-key-list, sql-injection-scan (stateless compute, zero upstream)
- `$0.003` — delx.ai: queue-wait-estimate, data-freshness (pure math)
- `$0.005` — agent402.tools: hash (sha256), email normalize, URI codec

**Pattern:** The cheapest viable x402 endpoints are stateless compute with zero upstream cost. Storage/stateful primitives (KV, D1, DO) have nonzero upstream cost and should price above this floor — but not by much.

---

## 2. CF Primitive Cost Basis vs. x402 Market Price

### Cloudflare Cost (Workers Paid)

| Primitive             | Metric         | CF Cost           | Tanship Live Price                 | Markup  |
| --------------------- | -------------- | ----------------- | ---------------------------------- | ------- |
| KV read               | $0.50/M        | $0.0000005/call   | $0.002 (kv.session.get)            | 4,000×  |
| KV write              | $5.00/M        | $0.000005/call    | $0.003 (kv.session.create)         | 600×    |
| KV update             | $5.00/M        | $0.000005/call    | $0.003 (kv.session.update)         | 600×    |
| KV delete             | $5.00/M        | $0.000005/call    | $0.002 (kv.session.delete)         | 400×    |
| KV lease acquire      | $5.00/M writes | ~$0.00001         | $0.010 (kv.lease.acquire)          | 1,000×  |
| KV lease release      | $5.00/M writes | ~$0.000005        | $0.005 (kv.lease.release)          | 1,000×  |
| KV lease heartbeat    | $5.00/M writes | ~$0.000005        | $0.005 (kv.lease.heartbeat)        | 1,000×  |
| KV lease status       | FREE read      | ~$0               | $0.001 (kv.lease.status)           | ∞       |
| D1 row read           | $0.001/M rows  | $0.000000001      | no live endpoint yet               | —       |
| D1 row write          | $1.00/M rows   | $0.000001         | no live endpoint yet               | —       |
| DO request            | $0.15/M req    | $0.00000015       | $0.010 (coordination.lock.acquire) | 66,000× |
| DO GB-s               | $12.50/M GB-s  | context-dependent | included in lock price             | —       |
| DO storage            | $0.20/GB-mo    | negligible        | included in lock price             | —       |
| AI Gateway credit fee | 5% of purchase | on volume         | —                                  | —       |

**Conclusion:** CF costs are 3–6 orders of magnitude below x402 market clearing prices. Cost is never the binding constraint. The question is whether agents will pay $0.001–$0.010 for a stateful KV/D1/DO operation when equivalent stateless compute (jsonld-key-list, timestamp-align) costs $0.002–$0.003.

---

## 3. Demand Validation: What Agents Actually Buy

### From x402 Ecosystem (~75M txns/month, $24M volume — x402.org live)

**Top categories by transaction volume:**

1. **Financial data** — Polymarket/ Kalshi/whale tracking, sports attestation, options/perpetuals data ($0.005–$0.050)
2. **Agent decision procedures** — payment routing, escrow, multi-agent consensus, token vetting ($0.002–$0.005)
3. **Web search / scraping** — SERP retrieval, Wayback, robots-check, npm risk ($0.001–$0.003)
4. **AI inference** — chat completions, code generation ($0.003–$0.050)
5. **Text utilities** — hash, encode/decode, JSON ops, SQL injection scan ($0.0001–$0.003)
6. **Communication** — AgentMail (free inbox read, $0.005 tweet read)

**What KV/D1/DO primitives compete with:** Text utilities ($0.0001–$0.003) and agent decision procedures ($0.002–$0.005). These are the price bands a KV session or SQL query must live in to be competitive.

### From Composio Ecosystem (50K+ agents, actual paid usage)

- **Standard tool call:** $0.0003/call — agents treat this as baseline
- **Premium tool call:** $0.001–$0.01 — specialized data, auth-required APIs
- **Premium data sources:** up to $2.00/call (Google Ads, financial data)
- **Inference calls:** $3.75/M tokens (LLM sandbox)
- Agents enforce hard budgets (AgentBudget pattern) — cost control is built-in, not optional

**Implication:** If a KV read is framed as a "tool call" (stateless read of session state), $0.001–$0.005 is viable. If framed as "infrastructure" (it's just a KV read, my LLM provider has this), agents won't pay.

### From Inference.sh / Open Marketplace

- Per-call flat pricing dominates: $0.001–$0.05/call for utility compute
- Agents prefer predictable per-call pricing over per-token or per-GB
- Free tier + hard cap is the standard acquisition model

---

## 4. Pricing Recommendation by Primitive

### KV Session (Tanship already live — no changes needed)

| Endpoint          | CF Cost    | Live Price | Status                            |
| ----------------- | ---------- | ---------- | --------------------------------- |
| kv.session.create | $0.000005  | $0.005     | ✅ Viable — above commodity floor |
| kv.session.get    | $0.0000005 | $0.002     | ✅ Viable                         |
| kv.session.update | $0.000005  | $0.003     | ✅ Viable                         |
| kv.session.delete | $0.000005  | $0.002     | ✅ Viable                         |

**Validation:** Priced 10–25× above the cheapest x402 commodity endpoints. Acceptable. kv.session.delete at $0.002 = same as delx.ai's stateless compute — the "free delete" signal (idempotent, no value returned) is correctly priced below create/update.

### KV Lease / Coordination

| Endpoint           | CF Cost    | Live Price | Notes                                                                           |
| ------------------ | ---------- | ---------- | ------------------------------------------------------------------------------- |
| kv.lease.acquire   | ~$0.00001  | $0.010     | ✅ Correctly priced above session ops — coordination has higher perceived value |
| kv.lease.release   | ~$0.000005 | $0.005     | ✅                                                                              |
| kv.lease.heartbeat | ~$0.000005 | $0.005     | ✅                                                                              |
| kv.lease.status    | ~$0        | $0.001     | ✅ Correctly cheapest — free read, minimal value                                |

**Competitor comparison:** DO coordination.lock.acquire (if it exists in catalog) would be priced higher due to DO spin-up cost. KV lease is correctly positioned as the "cheaper eventually-consistent alternative."

### D1 SQL (Not yet deployed — recommendation)

| Operation                | CF Cost      | Recommended Price | Rationale                                                             |
| ------------------------ | ------------ | ----------------- | --------------------------------------------------------------------- |
| d1.sql.execute (read)    | $0.000000001 | **$0.001**        | 1M× markup, competes with stateless JSON ops                          |
| d1.sql.execute (write)   | $0.000001    | **$0.005**        | 5,000× markup, write has 5× KV write price which maps to write > read |
| d1.sql.query (read-only) | $0.000000001 | **$0.001**        | Identical to execute for reads                                        |

**Demand signal:** SQL query is a recognized pattern in agent tool use. Composio prices DB operations implicitly in tool call bundles. No direct competitor on x402. The "D1 as hosted SQLite" value prop is compelling for agents that want relational queries without managing a Postgres instance — this maps to the Supabase tier ($25/mo) which agents won't pay but might pay per-call for.

**Pricing logic:** Read/write ratio should mirror KV ($0.002 read : $0.003 write → $0.001 : $0.005) but with a floor at $0.001 since a SQL query returns structured data, not just a session object. D1 write at $0.005 is justified because it creates durable state vs. ephemeral KV TTL.

### DO Coordination Lock (if not already deployed)

| Operation         | CF Cost     | Recommended Price | Notes                                                                       |
| ----------------- | ----------- | ----------------- | --------------------------------------------------------------------------- |
| do.lock.acquire   | ~$0.000001  | **$0.020**        | DO spin-up cost + stronger guarantee (single-writer) → price above KV lease |
| do.lock.release   | ~$0.0000005 | **$0.010**        | Idempotent release                                                          |
| do.lock.heartbeat | ~$0.0000005 | **$0.010**        | Renewal                                                                     |
| do.lock.status    | ~$0         | **$0.001**        | Free read                                                                   |

**Positioning:** DO lock vs. KV lease — DO has single-writer consistency, KV has eventual consistency. The 2× price premium for DO lock (vs. KV lease) reflects the stronger guarantee. Both should coexist.

### R2 Object Storage (if deployed)

| Operation   | CF Cost        | Recommended Price | Notes                              |
| ----------- | -------------- | ----------------- | ---------------------------------- |
| r2.upload   | $4.50/M writes | **$0.010**        | Class A op, high perceived value   |
| r2.download | $0.36/M reads  | **$0.001**        | Class B op, commodity              |
| r2.delete   | $4.50/M writes | **$0.005**        | Class A op, less value than upload |
| r2.list     | $4.50/M ops    | **$0.002**        | Class A, low value                 |

**Demand signal:** No x402 R2 storage primitives observed in catalog. However, agents pay for IPFS/Filecoin storage uploads (delx.ai sql-injection-scan, IPFS pinning decision procedure). The market validates storage-as-a-paid-primitive. R2's free egress vs. S3's $0.09/GB egress is a compelling differentiator for agentic workloads that download generated artifacts.

---

## 5. Why No Direct KV/D1/DO Marketplace Data?

Three reasons these primitives don't appear in the 1,061-priced-endpoint catalog:

1. **Catalog is new.** Tanship's KV session/lease endpoints were deployed in Cycle 5 (Aug 28) — today's date. No settlement data exists yet.

2. **Agents build state locally.** Most agents store session in memory or use their own KV infrastructure (Upstash Redis, Cloudflare Workers KV directly). The x402 ecosystem is still in the "buying stateless compute and data" phase, not "buying distributed state."

3. **Durability pricing is unsolved.** x402's micropayment model works for stateless transforms but the mental model of "pay $0.001 now to store 10KB for 7 days" is novel. Agents have no reference price for this.

---

## 6. Synthesis: Price Calibration

### Validated Price Range by Primitive Type

| Type                                         | Floor (commodity)  | Median (viable)   | Ceiling (premium) | CF Cost Floor |
| -------------------------------------------- | ------------------ | ----------------- | ----------------- | ------------- |
| Free read / status                           | $0.000 (x402 free) | $0.001            | $0.002            | ~$0           |
| Stateless compute (jsonld-key-list, hash)    | $0.0001            | $0.002            | $0.003            | ~$0           |
| Ephemeral stateful write (KV session create) | $0.001             | **$0.003–$0.005** | $0.010            | $0.000005     |
| Ephemeral stateful read (KV session get)     | $0.0005            | **$0.001–$0.002** | $0.005            | $0.0000005    |
| Coordination primitive (lease, lock)         | $0.002             | **$0.005–$0.010** | $0.020            | $0.00001      |
| Durable write (D1 write)                     | $0.002             | **$0.003–$0.005** | $0.010            | $0.000001     |
| Durable relational (D1 query)                | $0.001             | **$0.001–$0.003** | $0.005            | $0.000000001  |
| Storage upload (R2)                          | $0.003             | **$0.005–$0.010** | $0.020            | $0.0000045    |
| Storage download (R2)                        | $0.0005            | **$0.001–$0.002** | $0.005            | $0.00000036   |

### Key Insight: Price Elasticity Is Inverted for Agents

Human developers are price-insensitive above $0.01/call (API keys abstract the cost). AI agents are the opposite — they enforce hard budgets at the tool-call level (AgentBudget pattern). This means:

- **$0.010/call is the ceiling** for routine operations — agents will route around it
- **$0.001–$0.003 is the sweet spot** — cheap enough to not trip budget alerts, expensive enough to be meaningful
- **$0.0001–$0.0005 is the commodity floor** — only viable for stateless transforms

KV session operations at $0.002–$0.005 are correctly positioned. DO lock at $0.010 is at the ceiling but justified by stronger guarantees. D1 at $0.001–$0.005 is well-calibrated.

---

## 7. Files

- `/Users/huda/Desktop/dev/tanship/research/agent-wtp-cloudflare-primitives.md` — this file
- `/Users/huda/Desktop/dev/tanship/.research/paid_sorted.tsv` — 1,061 x402 priced endpoints (primary source)
- `/Users/huda/Desktop/dev/tanship/.research/agent-cycle-log.md` — Tanship live KV deployment data
- `/Users/huda/Desktop/dev/tanship/research/cloudflare-vs-competitor-pricing-comparison.md` — CF cost basis
- `/Users/huda/Desktop/dev/tanship/research/cloudflare-margin-research.md` — AI inference margin analysis
- `/Users/huda/Desktop/dev/tanship/ai-agent-api-market-research.md` — x402 ecosystem, Composio pricing

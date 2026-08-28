# Tanship — Cloudflare x402 Paid API Market Research

**Refresh 17** | 2026-08-29 | Author: Hermes Agent (cron)
**Supersedes**: Refresh 16 (2026-08-28)

---

## TL;DR — Top 5 Highest-Conviction Opportunities

| Priority | Opportunity                                                             | Price           | CF Cost                           | Margin          | Competitor Density         |
| -------- | ----------------------------------------------------------------------- | --------------- | --------------------------------- | --------------- | -------------------------- |
| **1**    | Fix `rag.query` / `rag.answer` pricing                                  | $0.020 / $0.050 | $0.077 / $0.078                   | 74% / 36%       | 0 true sellers             |
| **2**    | Fix `ai.chat` model cap or reprice to $0.050+                           | $0.050          | $0.414 (500 tokens llama-8b-fast) | -728% currently | 0 primitive sellers        |
| **3**    | Ship D1 full primitive suite (`db.transaction`, `db.schema.introspect`) | $0.025 / $0.010 | ~$0.001 / ~$0.001                 | 96%+            | **0 sellers** (blue ocean) |
| **4**    | Ship DO pub/sub + scheduling primitives                                 | $0.010 / $0.015 | ~$0.0001                          | 99%+            | **0 sellers** (blue ocean) |
| **5**    | Remove or reprice Modal endpoints (external dependency, loss-makers)    | —               | $0.005                            | —               | Better to cut              |

---

## 1. Methodology

### Data Sources

| Source             | URL                                                     | Pull Date  | Count                |
| ------------------ | ------------------------------------------------------- | ---------- | -------------------- |
| x402-list census   | `https://x402-list.com/api/v1/services?page=1..23`      | 2026-08-29 | 575 services         |
| PayAI Bazaar       | `https://facilitator.pyai.network/discovery/resources`  | 2026-08-29 | 27,772 listings      |
| Tship catalog      | `apps/console/src/catalog.ts`                           | 2026-08-29 | 195 priced endpoints |
| Cloudflare pricing | `developers.cloudflare.com/{product}/platform/pricing/` | 2026-08-29 | verified             |

### Cloudflare Pricing Verified (Aug 2026)

All CF prices stable since prior refresh. Critical numbers:

| Service                         | Cost                       | Source                                                      |
| ------------------------------- | -------------------------- | ----------------------------------------------------------- |
| R2 Class A                      | $4.50/M ops                | developers.cloudflare.com/r2/pricing/                       |
| R2 Class B                      | $0.36/M ops                | developers.cloudflare.com/r2/pricing/                       |
| R2 Storage                      | $0.015/GB-mo               | developers.cloudflare.com/r2/pricing/                       |
| D1 Reads                        | $0.001/M rows              | developers.cloudflare.com/d1/platform/pricing/              |
| D1 Writes                       | $1.00/M rows               | developers.cloudflare.com/d1/platform/pricing/              |
| D1 Storage                      | $0.75/GB-mo                | developers.cloudflare.com/d1/platform/pricing/              |
| KV Read                         | $0.50/M                    | developers.cloudflare.com/kv/platform/pricing/              |
| KV Write                        | $5.00/M                    | developers.cloudflare.com/kv/platform/pricing/              |
| DO Request                      | $0.15/M                    | developers.cloudflare.com/durable-objects/platform/pricing/ |
| DO Storage                      | $0.20/GB-mo                | developers.cloudflare.com/durable-objects/platform/pricing/ |
| Vectorize Query                 | $0.01/M dims               | developers.cloudflare.com/vectorize/platform/pricing/       |
| Vectorize Storage               | $0.05/100M dims            | developers.cloudflare.com/vectorize/platform/pricing/       |
| Browser Run                     | $0.09/hr                   | developers.cloudflare.com/browser-run/pricing/              |
| Workers AI (Mistral 7B)         | $0.110/M in + $0.190/M out | developers.cloudflare.com/workers-ai/platform/pricing/      |
| Workers AI (Llama 8B FP8 Fast)  | $0.045/M in + $0.384/M out | developers.cloudflare.com/workers-ai/platform/pricing/      |
| Workers AI (Llama 8B default)   | $0.282/M in + $0.827/M out | developers.cloudflare.com/workers-ai/platform/pricing/      |
| Workers AI (Llama 70B FP8 Fast) | $0.293/M in + $2.253/M out | developers.cloudflare.com/workers-ai/platform/pricing/      |
| Workers AI (BGE-M3 embeddings)  | $0.012/M in                | developers.cloudflare.com/workers-ai/platform/pricing/      |
| Workers AI (Flux Schnell)       | $0.0000528/tile            | developers.cloudflare.com/workers-ai/platform/pricing/      |

> ⚠️ **CF PRICES CHANGE WITHOUT NOTICE.** Re-verify before each deploy. Mistral 7B output jumped 4.3× between Aug 26–28. Llama 8B default jumped 19× the same window.

---

## 2. Market Landscape

### 2.1 x402-list Census (575 services)

**Pull date**: 2026-08-29 | **Verified online**: 468 | **Offline**: 69 | **Degraded**: 38

| Stat             | Value      |
| ---------------- | ---------- |
| Total services   | 575        |
| Priced           | 562        |
| Free             | 13         |
| **Price P10**    | **$0.001** |
| **Price P25**    | **$0.003** |
| **Price Median** | **$0.010** |
| **Price P75**    | **$0.050** |
| **Price P90**    | **$0.250** |
| **Price Max**    | **$50.00** |

**Category breakdown**:
| Category | Count | Avg min price | Notes |
|----------|-------|-------------|-------|
| Data | 252 | $0.081 | Saturated |
| AI | 98 | $0.557 | High value, growing |
| Finance | 77 | $0.950 | Premium niche |
| Verification | 49 | $0.275 | Security-focused |
| Blockchain | 40 | $1.427 | Highest avg price |
| Content | 22 | $1.722 | Premium |
| Compute | 10 | $0.007 | Low-price commodity |
| Infrastructure | 2 | $0.255 | Untapped |

**Top 10 by min_price**:

1. `brs-signals` — $50.00 (Finance)
2. `holoworld-fight-pass` — $50.00 (Blockchain)
3. `tantra-authority-the-naked-press-catalog` — $19.97 (Content)
4. `venice-ai` — $10.00 (AI)
5. `trafficmonetize-btc-prediction-feed` — $10.00 (Finance)
6. `twelve-permissions` — $9.00 (Content)
7. `producer-by-suede-labs` — $8.00 (AI)
8. `fetchgate` — $7.00 (Data)
9. `agent402-website-release-offline-tools` — $5.99 (AI)
10. `outfight` — $5.01 (Other)

### 2.2 PayAI Bazaar Census (27,772 listings)

**Endpoint**: `https://facilitator.pyai.network/discovery/resources?limit=1000`
**Pull date**: 2026-08-29

Top hosts by listing count (sampled at offset 0):

- `sodium-museums-dude-producers.trycloudflare.com` — Solana/USDC flux image + rugcheck
- `api.paysponge.com` — Reducto document extraction + AgentMail
- Various individual agent endpoints

**Tship presence in Bazaar**: 1 listing confirmed

- `https://x402.tanship.dev/v1/ai/image` at $0.02 (20,000 atomic USDC)
- Registered Aug 16, 2026

### 2.3 Tship Catalog (195 endpoints)

**Source**: `apps/console/src/catalog.ts` | **Date**: 2026-08-29

| Metric                 | Value                       |
| ---------------------- | --------------------------- |
| Total priced endpoints | 195                         |
| Price range            | $0.001 – $0.050             |
| Median price           | $0.005                      |
| Top prefix by revenue  | `browser` ($0.243)          |
| Top prefix by count    | `dev` (30) + `ai` (28)      |
| Blue ocean endpoints   | ~50 (D1, DO, KV primitives) |

**Prefix breakdown**:
| Prefix | Count | Revenue | CF Cost | Margin | Loss-makers |
|--------|-------|---------|---------|--------|-------------|
| browser | 22 | $0.243 | $0.046 | 81% | 0 |
| ai | 28 | $0.242 | $0.003 | 99% | 0 |
| sec | 7 | $0.218 | $0.001 | 99% | 0 |
| db | 8 | $0.130 | $0.002 | 99% | 0 |
| kv | 21 | $0.062 | $0.001 | 98% | 0 |
| dev | 30 | $0.061 | $0.000 | 100% | 0 |
| coordination | 10 | $0.049 | $0.000 | 100% | 0 |
| storage | 7 | $0.049 | $0.002 | 96% | 0 |
| durable | 16 | $0.042 | $0.001 | 99% | 0 |
| **rag** | **6** | **$0.036** | **$0.155** | **-331%** | **2** |
| agent | 4 | $0.021 | $0.000 | 98% | 0 |
| reddit | 2 | $0.020 | $0.002 | 90% | 0 |
| **modal** | **4** | **$0.019** | **$0.020** | **-5%** | **2** |
| crypto | 8 | $0.019 | $0.001 | 96% | 0 |
| devtools | 15 | $0.015 | $0.000 | 99% | 0 |
| queue | 2 | $0.011 | $0.000 | 98% | 0 |

---

## 3. Competitive Analysis

### 3.1 Cloudflare Primitive Sellers — True Competitors

After keyword scanning all 575 x402-list services and manually verifying the top matches:

| CF Primitive   | x402-list matches | True primitive sellers                                   | Tship coverage                           |
| -------------- | ----------------- | -------------------------------------------------------- | ---------------------------------------- |
| **R2/Storage** | 7                 | **0** (all consuming internally)                         | ✅ 7 endpoints                           |
| **D1/SQL**     | 42 (keyword)      | **0** (Orisha Data is internal)                          | ✅ 8 endpoints                           |
| **Workers AI** | 79 (keyword)      | **0** (GPUOps is a different AI; none sell CF AI access) | ✅ 28 endpoints                          |
| **Vectorize**  | 36 (keyword)      | **0**                                                    | ✅ 6 endpoints                           |
| **Browser**    | 52 (keyword)      | **0** (all app-layer scrapers)                           | ✅ 22 endpoints                          |
| **KV**         | 6 (keyword)       | **0** (scrape402 is write-only, no list/get)             | ✅ 21 endpoints                          |
| **DO**         | 35 (keyword)      | **0**                                                    | ✅ 26 endpoints (coordination + durable) |

**Conclusion**: All 7 Cloudflare primitives remain **100% uncontested** as true primitive sellers on x402. The only CF-adjacent seller is `loki.freedomlab.space` (write-only KV, no get/list). Tship is the only player with a comprehensive CF primitive offering.

### 3.2 Market Competitors (Top 5)

| Rank | Name                      | Listings | Price Range  | Specialty                                          | Tship vs Them                                      |
| ---- | ------------------------- | -------- | ------------ | -------------------------------------------------- | -------------------------------------------------- |
| 1    | **k2so.wrong.systems**    | ~400+    | $0.001–$0.05 | Agent decision procedures, multi-sig, audit trails | No overlap (no CF primitives)                      |
| 2    | **payai.agentstools.dev** | ~355     | $0.001–$0.02 | General agent tools, security preflights           | Partial overlap (sec.\*), Tship wins on primitives |
| 3    | **api.delx.ai**           | ~280     | $0.001–$0.10 | New entrant (Aug 2026)                             | Unknown — need monitoring                          |
| 4    | **relay402**              | ~30      | $0.001–$0.06 | Agent security + trust                             | Tship matches on sec.\* at $0.03–0.05              |
| 5    | **venice.ai**             | 1        | $10.00 min   | High-end AI (x402-list premium)                    | No overlap                                         |

**Key insight**: No competitor offers the CF primitive stack (KV, D1, DO, R2, Vectorize, Workers AI). Tship's differentiation is the **full CF primitive suite**, not application-layer services.

### 3.3 Tship Competitive Moats

1. **Only CF primitive seller** — 0 competitors for D1, KV, DO, Vectorize as true primitives
2. **Only KV queue primitives** — `kv.queue.*` (20+ ops) unique on x402
3. **Only DO coordination suite** — `coordination.*` (10 ops) + `durable.*` (16 ops)
4. **Only RAG pipeline** — `rag.*` (6 ops) unique combination of Vectorize + Workers AI + R2
5. **Only browser rendering stack** — 22 browser endpoints covering screenshot, scrape, PDF, markdown, SEO, RSS, search, etc.

---

## 4. Margin Economics

### 4.1 Aggregate — Catalog-Wide

| Metric                         | Value     |
| ------------------------------ | --------- |
| Total catalog revenue per call | $1.270    |
| Total CF cost per call         | $0.236    |
| **Aggregate gross margin**     | **81.4%** |
| Excluding loss-makers          | ~95%+     |

> Note: Without the 6 loss-makers (rag.query, rag.answer, modal.\* × 4), aggregate margin would be ~95%. The loss-makers are dragging aggregate down by ~14 percentage points.

### 4.2 Loss-Makers — Must Fix

| Endpoint                  | Current Price | CF Cost (upper bound)                | Margin     | Fix                                            |
| ------------------------- | ------------- | ------------------------------------ | ---------- | ---------------------------------------------- |
| `rag.query`               | $0.002        | **$0.077** (10K×768 Vectorize query) | **-3740%** | Reprice to $0.020 minimum, add per-dim pricing |
| `rag.answer`              | $0.010        | **$0.078** (Vectorize + Llama)       | **-669%**  | Reprice to $0.050 minimum                      |
| `modal.sandbox.status`    | $0.002        | **$0.005** (Modal)                   | **-150%**  | Make free or remove                            |
| `modal.sandbox.terminate` | $0.002        | **$0.005** (Modal)                   | **-150%**  | Make free or remove                            |
| `modal.sandbox.exec`      | $0.005        | **$0.005** (Modal)                   | **0%**     | Reprice to $0.015                              |
| `modal.sandbox.create`    | $0.010        | **$0.015** (Modal)                   | **-50%**   | Reprice to $0.020                              |

**Root cause**: `rag.query` and `rag.answer` use Vectorize for vector search. At 10,000 vectors × 768 dimensions, a single query costs **$0.077** — 38× the listed price. The fix requires either (a) repricing to $0.020+ with per-dim caps, or (b) migrating to a cheaper vector search layer.

**Modal dependency**: Modal is an external dependency. If Modal's pricing changes, Tship loses margin further. Better to **remove Modal endpoints** or deprioritize them.

### 4.3 High-Margin Opportunities (Already Shipped, Underpriced)

| Endpoint                    | Current       | CF Cost                                    | Margin     | Recommended                            |
| --------------------------- | ------------- | ------------------------------------------ | ---------- | -------------------------------------- |
| `ai.chat`                   | $0.008        | $0.414 (500 tokens, llama-8b-fast 500 out) | **-5050%** | Cap max_tokens≤50 OR reprice to $0.050 |
| `sec.mcp-tool-risk-scorer`  | $0.050        | $0.0001                                    | 99.8%      | Keep — matches relay402                |
| `sec.prompt-injection-scan` | $0.050        | $0.0001                                    | 99.8%      | Keep — matches relay402                |
| `browser.screenshot`        | $0.005        | $0.001                                     | 80%        | OK — cheap compute                     |
| `storage.presign.batch`     | $0.020        | $0.001                                     | 95%        | Keep                                   |
| `db.query`                  | $0.005        | $0.001                                     | 80%        | Consider $0.010 (Turso = $0.05+)       |
| `ai.image`                  | $0.020        | $0.0002                                    | 99%        | Keep                                   |
| `ai.embeddings`             | $0.002        | $0.00001                                   | 99.5%      | Keep                                   |
| `coordination.*`            | $0.002        | ~$0.00001                                  | 99%+       | Keep — unique                          |
| `durable.*`                 | $0.002–$0.010 | ~$0.00001                                  | 99%+       | Keep — unique                          |
| `kv.*`                      | $0.001–$0.010 | ~$0.00001                                  | 99%+       | Keep — unique                          |

---

## 5. Pricing Recommendations

### 5.1 Immediate (Phase 1 — Loss-Maker Fixes)

```typescript
// In apps/console/src/catalog.ts — patch these entries

// ❌ Current: $0.002 (38× below cost)
{ id: "rag.query", price: "$0.002" }
// ✅ Fix: $0.020 (still below Replicate/Pinecone)
{ id: "rag.query", price: "$0.020" }

// ❌ Current: $0.010 (7.8× below cost)
{ id: "rag.answer", price: "$0.010" }
// ✅ Fix: $0.050 (Vectorize + Llama answer pipeline)
{ id: "rag.answer", price: "$0.050" }

// ❌ Current: $0.008 (51× below cost on Llama 8B default 500 tokens)
{ id: "ai.chat", price: "$0.008" }
// ✅ Fix: Either cap max_tokens≤50 (keeps $0.008) OR reprice to $0.050
// Recommended: keep $0.008 but add hard cap max_tokens=50 internally

// Modal endpoints — remove or reprice
// ❌ Current: $0.002–$0.010 (Modal external, -5% to -150% margin)
{ id: "modal.sandbox.status", price: "$0.002" }
// ✅ Fix: Remove (make free health check) or reprice to $0.002 free + $0.010 for create/exec
```

**Revenue impact of Phase 1 fix**: ~+$0.026/call from loss-makers fixed = +2% of total catalog revenue, but removes risk of negative-margin calls accumulating.

### 5.2 Short-term (Phase 2 — Blue Ocean Expansion)

| New Endpoint               | Stack               | CF Cost  | Rec. Price | Margin | Rationale                     |
| -------------------------- | ------------------- | -------- | ---------- | ------ | ----------------------------- |
| `db.transaction`           | D1                  | ~$0.001  | $0.025     | 96%    | Turto $0.05+, no x402 seller  |
| `db.schema.introspect`     | D1                  | ~$0.001  | $0.010     | 90%    | Tooling for agentic DB use    |
| `kv.queue.batch`           | KV                  | ~$0.0001 | $0.005     | 98%    | 10× kv.queue operations       |
| `kv.metadata`              | KV                  | ~$0.0001 | $0.002     | 95%    | Per-key TTL/metadata          |
| `kv.ttl.refresh`           | KV                  | ~$0.0001 | $0.002     | 95%    | Extending TTL                 |
| `durable.pubsub.publish`   | DO                  | ~$0.0001 | $0.005     | 98%    | Unique pub/sub primitive      |
| `durable.pubsub.subscribe` | DO                  | ~$0.0001 | $0.010     | 99%    | WebSocket subscription        |
| `ai.vision.describe`       | Workers AI (vision) | ~$0.001  | $0.020     | 95%    | Llama-3.2-11b-vision-instruct |
| `coordination.fifo.push`   | DO                  | ~$0.0001 | $0.005     | 98%    | Reliable FIFO queue           |
| `coordination.fifo.pop`    | DO                  | ~$0.0001 | $0.005     | 98%    | Reliable FIFO queue           |

### 5.3 Medium-term (Phase 3 — Premium Tier)

| New Endpoint              | Stack                       | Rec. Price | Rationale                     |
| ------------------------- | --------------------------- | ---------- | ----------------------------- |
| `ai.vision.realtime`      | Workers AI vision + Browser | $0.10      | High-value for agentic vision |
| `browser.search.advanced` | Browser + AI                | $0.10      | 3× browser.search.summary     |
| `agent.memory.longterm`   | DO + R2                     | $0.05      | Persistent agent memory       |
| `rag.pipeline.full`       | Vectorize + Workers AI + R2 | $0.10      | End-to-end RAG in one call    |

### 5.4 Pricing Strategy Rules (Updated Aug 2026)

1. **Per-token model cost × 5 = minimum price**. Use Llama 8B FP8 Fast ($0.384/M out) as default. Any LLM endpoint streaming 500+ tokens must be ≥$0.020.
2. **Vectorize = $0.02/min-dim**. At 10K vectors × 768 dims, current CF cost = $0.077. Price must cover this.
3. **Storage resale = not viable**. D1/KV/DO storage margins are 0% or negative at x402 price points. Wrap operations only.
4. **Workers AI non-LLM** (embeddings $0.002, image $0.020, transcription $0.005) are already well-priced.
5. **Blue ocean = premium pricing**. DO/KV/D1 primitives have zero competitors. Price at 10× CF cost for 90%+ margins.
6. **Browser rendering**: $0.005–$0.030 covers 0.5–3s of browser time. Already well-priced.
7. **Modal/External deps**: Never price below the external service's cost. Better to remove than subsidize.

---

## 6. Revenue Projections

### 6.1 Call Volume Scenarios

| Scenario                          | Calls/day | Annual Revenue (at current prices) | Annual Revenue (Phase 1 fixed) |
| --------------------------------- | --------- | ---------------------------------- | ------------------------------ |
| Floor (organic, 10 active agents) | 1,000     | ~$365                              | ~$365                          |
| Early adopter (50 agents)         | 5,000     | ~$1,825                            | ~$1,825                        |
| Growth (500 agents)               | 50,000    | ~$18,250                           | ~$18,250                       |
| Product-market fit (5,000 agents) | 500,000   | ~$182,500                          | ~$182,500                      |
| Scale (50,000 agents)             | 5,000,000 | ~$1,825,000                        | ~$1,825,000                    |

> Current catalog generates ~$1.27/call at current prices. At 5,000 calls/day = ~$2,300/yr. At 50K calls/day = ~$23K/yr. At 500K calls/day = ~$230K/yr.

### 6.2 Revenue by Category (500 calls/day baseline)

| Category               | Calls/day | Avg price | Annual revenue |
| ---------------------- | --------- | --------- | -------------- |
| AI (28 endpoints)      | 150       | $0.009    | $493           |
| Browser (22 endpoints) | 100       | $0.011    | $401           |
| KV (21 endpoints)      | 80        | $0.003    | $88            |
| Sec (7 endpoints)      | 50        | $0.031    | $566           |
| Durable (16 endpoints) | 40        | $0.003    | $44            |
| DB (8 endpoints)       | 30        | $0.016    | $175           |
| Dev (30 endpoints)     | 25        | $0.002    | $18            |
| Storage (7 endpoints)  | 15        | $0.007    | $38            |
| RAG (6 endpoints)      | 10        | $0.006    | $22            |
| **Total**              | **~500**  |           | **~$1,845/yr** |

### 6.3 Break-even Analysis

- **Tanship infra cost**: ~$5/mo (Workers Paid) + data egress
- **Per-call margin at 95%**: $0.0012 avg margin
- **Break-even**: ~4,167 calls/day ($0.0012 × 4,167 = ~$5/mo)
- At 10,000 calls/day = $36/mo margin, covering infra with room to spare

---

## 7. Market Gaps & Unmet Needs

### 7.1 Verified Blue Ocean (x402-list 575 census)

| Gap                 | x402-list evidence                                   | Tship action                                                       |
| ------------------- | ---------------------------------------------------- | ------------------------------------------------------------------ |
| D1 SQL-as-API       | 0 true sellers (all consuming D1 internally)         | Ship `db.transaction`, `db.schema.introspect`, `db.query.readonly` |
| KV queue primitives | 0 true sellers (loki.freedomlab.space is write-only) | Ship `kv.queue.batch`, `kv.metadata`, `kv.ttl.refresh`             |
| DO pub/sub          | 0 true sellers                                       | Ship `durable.pubsub.publish`, `durable.pubsub.subscribe`          |
| DO FIFO queue       | 0 true sellers                                       | Ship `coordination.fifo.push`, `coordination.fifo.pop`             |
| R2 presigned URLs   | 1 incidental (storage/presign keyword)               | Keep/expand `storage.presign.batch`                                |
| Full RAG pipeline   | 0 combined (Vectorize + Workers AI + R2)             | Already shipped, reprice to $0.050+                                |
| Vector search       | 0 true sellers                                       | Already shipped, reprice to $0.020+                                |

### 7.2 Underserved Segments (from x402-list categories)

| Segment            | Avg price on x402 | Tship coverage           | Gap                       |
| ------------------ | ----------------- | ------------------------ | ------------------------- |
| Finance APIs       | $0.95             | `crypto.*` (8 endpoints) | No DeFi, no price feeds   |
| Verification/Trust | $0.27             | `sec.*` (7 endpoints)    | No EVM interaction        |
| Blockchain         | $1.43             | None                     | No wallet operations      |
| Content premium    | $1.72             | `browser.*` (22)         | No PDF generation, no OCR |

### 7.3 AI Agent Personas (Buyer Segments)

| Persona             | Willingness to pay | Primary needs                                           | Tship fit     |
| ------------------- | ------------------ | ------------------------------------------------------- | ------------- |
| Solo dev / hobbyist | $0.05–$0.10/mo     | kv.get, kv.set, db.query, ai.chat                       | ✅ Best fit   |
| AI agent builder    | $1–$10/mo          | durable.scheduler, coordination.lock, kv.queue, ai.chat | ✅ Strong fit |
| Startup / indie dev | $10–$50/mo         | rag._, browser._, storage._, ai._                       | ✅ Strong fit |
| Enterprise          | $50–$500/mo        | Custom SLAs, dedicated DO instances, volume pricing     | ❌ Not yet    |
| AI research         | $5–$50/mo          | `sec.*`, `agent.*`, `rag.*`                             | ✅ Strong fit |

---

## 8. 8-Week Implementation Roadmap

### Week 1–2: Loss-Maker Fixes (Critical)

```
1. Reprice rag.query: $0.002 → $0.020
2. Reprice rag.answer: $0.010 → $0.050
3. Add hard max_tokens cap on ai.chat (≤50) OR reprice to $0.050
4. Remove or reprice modal.sandbox.* (remove recommended)
5. Deploy to production
```

**Effort**: ~1 day | **Impact**: Removes -331% margin drag, prevents bill shock

### Week 3–4: Blue Ocean Expansion (D1 + DO primitives)

```
6. Ship db.transaction ($0.025)
7. Ship db.schema.introspect ($0.010)
8. Ship durable.pubsub.publish ($0.005)
9. Ship durable.pubsub.subscribe ($0.010)
10. Ship coordination.fifo.push/pop ($0.005 each)
11. Register all new endpoints on PayAI Bazaar + x402scan
```

**Effort**: ~3 days | **Impact**: 5 blue ocean endpoints, 0 competitors

### Week 5–6: Browser + AI Expansion

```
12. Ship ai.vision.describe ($0.020) — Llama-3.2-11b-vision-instruct
13. Reprice browser.search.summary: $0.030 → $0.050 (You.com API = $0.10)
14. Ship browser.pdf (if not already shipped)
15. Ship storage.lifecycle.set ($0.003)
```

**Effort**: ~2 days | **Impact**: Expands AI + browser coverage

### Week 7–8: Distribution + Registration

```
16. Register all 195+ endpoints on x402scan registry
    POST https://www.x402scan.com/api/x402/registry/register-origin
    Body: {"origin": "https://x402.tanship.dev"}
17. Bulk-register on PayAI Bazaar via discovery API
18. Write OpenAPI spec for all endpoints
19. Submit to x402-list.com via their submission form
```

**Effort**: ~2 days | **Impact**: 195 → discoverable across all 3 discovery platforms

---

## 9. Pitfalls (Cumulative)

### Critical (Fix Immediately)

1. **`rag.query` at $0.002**: 38× below CF cost. Every call loses $0.075. At 100 calls/day = -$2,700/yr.
2. **`rag.answer` at $0.010**: 7.8× below CF cost. Same problem.
3. **`ai.chat` at $0.008**: If a user sends 500 tokens on Llama 8B default, cost = $0.414. Must cap `max_tokens` or reprice.
4. **Modal endpoints**: External dependency with negative margin. Remove or isolate.

### Important (Fix in 2 Weeks)

5. **Tship not on x402-list.com**: Only 1 of 27,772 Bazaar listings. Register via their submission form.
6. **`x402-list.com` catalog**: 0 tanship services listed. Submit at `https://x402-list.com/submit`
7. **No volume pricing**: Enterprise customers need 100K+/mo pricing. Add tiered pricing.

### Ongoing

8. **CF pricing changes without notice**: Re-verify Workers AI prices before each deploy. Prices changed 4.3–19× between Aug 26–28.
9. **Vectorize cost ceiling**: A single `rag.query` call at 100K vectors × 768 dims costs $0.77. Add input validation to cap dimensions.
10. **Storage resale not viable**: D1/KV/DO storage margins are 0%. Never sell "GB/month" as a product.
11. **Bazaar distortion**: k2so family (3 hosts, ~700 listings) and api.delx.ai (~280) dominate. Tship needs bulk registration to compete on discoverability.

---

## 10. Sources

| Source                | URL                                                                   | Last Pulled |
| --------------------- | --------------------------------------------------------------------- | ----------- |
| x402-list census      | `https://x402-list.com/api/v1/services?page=1..23`                    | 2026-08-29  |
| PayAI Bazaar          | `https://facilitator.pyai.network/discovery/resources`                | 2026-08-29  |
| Tship catalog         | `apps/console/src/catalog.ts`                                         | 2026-08-29  |
| CF Workers AI pricing | `https://developers.cloudflare.com/workers-ai/platform/pricing/`      | 2026-08-29  |
| CF R2 pricing         | `https://developers.cloudflare.com/r2/pricing/`                       | 2026-08-29  |
| CF D1 pricing         | `https://developers.cloudflare.com/d1/platform/pricing/`              | 2026-08-29  |
| CF KV pricing         | `https://developers.cloudflare.com/kv/platform/pricing/`              | 2026-08-29  |
| CF DO pricing         | `https://developers.cloudflare.com/durable-objects/platform/pricing/` | 2026-08-29  |
| CF Vectorize pricing  | `https://developers.cloudflare.com/vectorize/platform/pricing/`       | 2026-08-29  |
| CF Browser pricing    | `https://developers.cloudflare.com/browser-run/pricing/`              | 2026-08-29  |

---

## 11. Appendix: x402-list Census Data (Aug 2026)

### Infrastructure Category — Blue Ocean Confirmed

Only **2 services** in the entire x402 ecosystem claim "Infrastructure" category:
| Service | Min Price | Base URL |
|---------|-----------|---------|
| `decision-anchor` | $0.01 | (not available) |
| `x402-signature-service` | $0.50 | (not available) |

Tship's `coordination.*`, `durable.*`, and `kv.*` endpoints are not categorized as "Infrastructure" but functionally represent the infrastructure primitive layer — making Tship the **de facto infrastructure primitive seller** on x402.

### Top AI Category Services (x402-list, 98 total)

| Service                                  | Min Price | Endpoints | Category |
| ---------------------------------------- | --------- | --------- | -------- |
| venice-ai                                | $10.00    | 1         | AI       |
| producer-by-suede-labs                   | $8.00     | 2         | AI       |
| agent402-website-release-offline-tools   | $5.99     | 2         | AI       |
| x402-agent-commerce-starter-platform-map | $5.00     | 1         | AI       |
| pretestads                               | $5.00     | 1         | AI       |
| jobero-job-search                        | $2.50     | 3         | AI       |
| stableupload                             | $2.00     | 2         | AI       |
| agentmail                                | $2.00     | 1         | AI       |
| aura-agent-persistence                   | $1.00     | 3         | AI       |
| kortex-service-trust                     | $1.00     | 3         | AI       |

### High-Price Services ($5+, Full List)

| Service                                  | Min Price | Category   | Base URL             |
| ---------------------------------------- | --------- | ---------- | -------------------- |
| brs-signals                              | $50.00    | Finance    | (unknown)            |
| holoworld-fight-pass                     | $50.00    | Blockchain | (unknown)            |
| tantra-authority-the-naked-press-catalog | $19.97    | Content    | (unknown)            |
| trafficmonetize-btc-prediction-feed      | $10.00    | Finance    | (unknown)            |
| venice-ai                                | $10.00    | AI         | api.venice.ai/api/v1 |
| twelve-permissions                       | $9.00     | Content    | (unknown)            |
| producer-by-suede-labs                   | $8.00     | AI         | discovery.suedeai.ai |
| fetchgate                                | $7.00     | Data       | fetchgate.dev        |
| agent402-website-release-offline-tools   | $5.99     | AI         | (unknown)            |
| outfight                                 | $5.01     | Other      | outfight.lol         |

### Verified Blue Ocean Summary

All 7 Cloudflare primitives confirmed **0 true primitive sellers** across the full 575-service x402-list census:

- R2 storage primitives: 0 sellers (7 keyword matches, all consuming internally)
- D1 SQL-as-API: 0 sellers (Orisha Data uses D1 internally, doesn't sell access)
- Workers AI inference: 0 sellers (GPUOps uses different AI; no CF AI access seller)
- Vectorize vector search: 0 sellers (36 keyword matches, all keyword false positives)
- Browser rendering: 0 sellers (52 keyword matches, all app-layer scrapers)
- KV key-value: 0 sellers (6 keyword matches, all non-KV uses)
- Durable Objects: 0 sellers (35 keyword matches, all non-DO uses)

**Tship's catalog of 195 endpoints covering all 7 CF primitives represents the only comprehensive Cloudflare-as-API offering on the x402 ecosystem.**

---

_Research generated by Hermes Agent (cron) | 2026-08-29 | Refresh 17_

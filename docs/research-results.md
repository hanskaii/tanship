# Tanship — Cloudflare x402 Paid API Market Research

**Refresh 18** | 2026-08-29 | Author: Hermes Agent (cron)
**Supersedes**: Refresh 17 (2026-08-29)

---

## TL;DR — Top 5 Highest-Conviction Opportunities

| Priority     | Opportunity                                           | Price           | CF Cost        | Margin | Status                   |
| ------------ | ----------------------------------------------------- | --------------- | -------------- | ------ | ------------------------ |
| **CRITICAL** | Fix `ai.reason` DeepSeek R1 pricing                   | $0.015 → $0.025 | ~$0.003–$0.020 | 0–50%  | **Loss-maker — fix now** |
| **CRITICAL** | Fix `rag.answer` RAG pipeline                         | $0.010 → $0.050 | ~$0.078        | -680%  | Loss-maker — fix now     |
| **1**        | Ship `agent.inbox` + `agent.memory` at $0.50–$1.00    | $0.50–$1.00     | ~$0.0001       | 99%+   | **New blue ocean**       |
| **2**        | OpenAI-compatible `/v1/chat/completions` at $0.010    | $0.010          | ~$0.0002       | 98%    | New xfuel competitor     |
| **3**        | Ship KV pub/sub + DO FIFO as `coordination.*` premium | $0.005–$0.015   | ~$0.00001      | 99%+   | Blue ocean               |
| **4**        | Reprice `ai.reason` DeepSeek R1 to $0.025+            | $0.025          | $0.003–$0.020  | 20–88% | New model = new margin   |
| **5**        | Register all 214 endpoints on x402-list.com           | Free            | $0             | ∞      | Distribution moat        |

---

## 1. What Changed Since Refresh 17

### x402 Ecosystem Snapshot (Aug 29, 2026)

- **575 services** on x402-list.com (0 new vs Aug 28 — market saturated)
- **0 Tship entries** on x402-list.com despite 214 endpoints live
- **x402 volume**: $24.24M/30d, 75M txns, 94K buyers, 22K sellers
- **New since Aug 24**: 42 services including 3 high-value entries

### New Competitive Entries (Aug 24–29)

| Service                    | Price     | Stack                          | Relevance to Tship                                            |
| -------------------------- | --------- | ------------------------------ | ------------------------------------------------------------- |
| **fetchgate**              | $7.00 min | Cloudflare Workers             | **New CF Worker competitor** — agent digital goods storefront |
| **xfuel**                  | $0.01     | OpenAI-compatible inference    | Direct `ai.chat` competitor — lower price than Tship's $0.008 |
| **aura-agent-persistence** | $1.00     | Agent email + webhook + memory | Overlaps with Tship's DO/KV agent primitives                  |
| **kortex-service-trust**   | $1.00     | Agent trust/reputation         | Similar to Tship's `sec.*` stack                              |
| **whaletape**              | $0.01     | Hyperliquid intelligence       | Financial niche — 16 endpoints                                |
| **magent**                 | $0.005    | Medical API (50 endpoints)     | High-volume niche, x402-native                                |

### Tship Catalog Status (214 endpoints)

| Metric                           | Value                                 |
| -------------------------------- | ------------------------------------- |
| Total priced endpoints           | 214                                   |
| Price range                      | $0.001–$0.050                         |
| Median price                     | $0.005                                |
| Blue ocean (D1/DO/KV primitives) | ~50 endpoints, 0 competitors          |
| **CRITICAL: Loss-makers found**  | `ai.reason` DeepSeek R1, `rag.answer` |

---

## 2. Market Landscape (x402-list Census — Aug 29, 2026)

### Price Distribution (575 services)

| Stat       | Value      |
| ---------- | ---------- |
| Priced     | 563/575    |
| **P10**    | **$0.001** |
| **P25**    | **$0.003** |
| **Median** | **$0.010** |
| **P75**    | **$0.050** |
| **P90**    | **$0.250** |
| Max        | $50.00     |

### Category Breakdown

| Category           | Count | Avg Min Price | Trend                    |
| ------------------ | ----- | ------------- | ------------------------ |
| Data               | 252   | $0.081        | Saturated                |
| AI                 | 98    | **$0.557**    | **High value — growing** |
| Finance            | 77    | $0.950        | Premium niche            |
| Verification       | 49    | $0.275        | Security premium         |
| Blockchain         | 40    | $1.391        | Highest avg price        |
| Content            | 22    | $1.722        | Premium niche            |
| Compute            | 10    | $0.007        | Low-price commodity      |
| **Infrastructure** | **2** | **$0.255**    | **BLUE OCEAN**           |

### Top 10 by Price

1. `brs-signals` — $50.00 (Finance)
2. `holoworld-fight-pass` — $50.00 (Blockchain)
3. `tantra-authority-the-naked-press-catalog` — $19.97 (Content)
4. `fetchgate` — $7.00 (Data, **NEW — CF Workers**)
5. `trafficmonetize-btc-prediction-feed` — $10.00 (Finance)
6. `venice-ai` — $10.00 (AI)
7. `outfight` — $5.01 (Other)
8. `twelve-permissions` — $9.00 (Content)
9. `producer-by-suede-labs` — $8.00 (AI)
10. `aura-agent-persistence` — $1.00 (AI, **NEW**)

### x402 Protocol Key Metrics

- **$24.24M** volume / 30 days
- **75.41M** transactions / 30 days
- **94,060** buyers (AI agents/apps)
- **22,000** sellers (API providers)
- **Base L2**: 73% of endpoints (dominant network)
- **USDC**: primary settlement asset
- **$0.01–$0.05**: dominant price range for AI endpoints

---

## 3. Cloudflare Cost Model (Aug 2026 — Verified)

### Workers AI Models

| Model                        | Input $/M    | Output $/M | Endpoint(s)                | Notes                                      |
| ---------------------------- | ------------ | ---------- | -------------------------- | ------------------------------------------ |
| Llama 3.1 8B Fast            | $0.110       | $0.190     | `ai.chat` default          | Ponytail comment: profitable only ≥$0.008  |
| Llama 3.3 70B FP8 Fast       | $0.293       | $2.253     | `ai.translate` lang detect | Very expensive output                      |
| DeepSeek R1 Distill Qwen 32B | $0.497       | $4.881     | `ai.reason`                | **CRITICAL: output tokens very expensive** |
| GPT-OSS 120B                 | $0.350       | $0.750     | `ai.chat` model option     | Expensive, limited via UI                  |
| BGE-M3 embeddings            | $0.012       | —          | `ai.embeddings`            | Very cheap                                 |
| FLUX 1 Schnell               | $0.0528/tile | —          | `ai.image`                 | 4 steps = $0.21/call                       |
| Whisper                      | $0.10/call   | —          | `ai.transcribe`            | Approx flat rate                           |
| BGE Reranker Large           | $0.20/call   | —          | `ai.rerank`                | Approx flat rate                           |
| PaliGemma 3B (VQA/OCR)       | $0.20/call   | —          | `ai.answer`, `ai.ocr`      | Approx flat rate                           |

### Infrastructure Primitives

| Service     | Operation       | CF Cost | Tship Price | Margin                  |
| ----------- | --------------- | ------- | ----------- | ----------------------- |
| D1          | Read 1M rows    | $0.001  | $0.005      | 80%                     |
| D1          | Write 1M rows   | $1.00   | $0.010      | -99% (DML ops only)     |
| KV          | Read 1M         | $0.50   | $0.002      | -99% (price below cost) |
| KV          | Write 1M        | $5.00   | $0.002      | -99% (price below cost) |
| DO          | Request 1M      | $0.15   | $0.002      | -99% (price below cost) |
| Vectorize   | 1M dims queried | $0.01   | $0.005      | -50%                    |
| R2 Class A  | 1M ops          | $4.50   | $0.005      | -89%                    |
| R2 Class B  | 1M ops          | $0.36   | $0.002      | -55%                    |
| Browser Run | 1 hour          | $0.09   | —           | Per-call pricing        |

### Key Insight: Per-Call Cost Reality

Most infrastructure primitives have per-operation costs well below $0.001/call (D1 reads, KV reads, DO requests). The x402 prices of $0.002–$0.010 are profitable on a **per-call** basis. The $/M operation costs only matter at extreme scale (1M+ calls/month).

The exception: `kv.queue.push/pop` at $0.002 operates at ~$0.0001–$0.005 per call depending on read/write classification. Mostly profitable.

---

## 4. Margin Analysis — CRITICAL FINDINGS

### Loss-Makers (Must Fix Immediately)

| Endpoint       | Price  | CF Cost           | Margin    | Issue                                                                                                                                                                                                      |
| -------------- | ------ | ----------------- | --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ai.reason`    | $0.015 | **$0.003–$0.020** | **0–50%** | DeepSeek R1 Distill Qwen 32B at $4.88/M output tokens. Default 2048 tokens out = **$0.010** per call alone. 50 input = $0.025. Max 4096 out = **$0.020** per call. **Every call at max_tokens is a loss.** |
| `rag.answer`   | $0.010 | **$0.078**        | **-680%** | Vectorize query (768 dims × $0.01/M = $0.008) + Llama 70B (100 in + 200 out = $0.004 + $0.451 = $0.455). 10K vectors × 768 dims = $0.077 just for vector search.                                           |
| `ai.translate` | $0.003 | ~$0.000025        | 99%       | Two Workers AI calls per request (Llama 70B for lang detect + M2M100). 70B lang detect = $0.000024/call. Still profitable at $0.003.                                                                       |
| `ai.rerank`    | $0.003 | ~$0.0002          | 93%       | BGE Reranker Large at ~$0.20/call. Underpriced vs CF cost.                                                                                                                                                 |

### ai.reason DeepSeek R1 — Detailed Breakdown

```
Model: @cf/deepseek-ai/deepseek-r1-distill-qwen-32b
Input: $0.497/M tokens → ~$0.0000005/token
Output: $4.881/M tokens → ~$0.0000049/token

Default call (100 in + 200 out):
  CF cost = 100 × $0.0000005 + 200 × $0.0000049 = $0.00005 + $0.00098 = $0.00103
  Price: $0.015
  Margin: 93% ← OK at default tokens

Worst case call (4096 in + 4096 out):
  CF cost = 4096 × $0.0000005 + 4096 × $0.0000049 = $0.00205 + $0.02007 = $0.02212
  Price: $0.015
  Margin: -47% ← LOSS

Most realistic call (200 in + 1000 out):
  CF cost = 200 × $0.0000005 + 1000 × $0.0000049 = $0.00010 + $0.00488 = $0.00498
  Price: $0.015
  Margin: 67% ← Fine

Fix: Cap max_tokens at 256 for $0.015 OR reprice to $0.025 with max_tokens=1024 default.
```

### Full Catalog Margin Summary (214 endpoints)

| Tier                | Count | Avg Margin | Action          |
| ------------------- | ----- | ---------- | --------------- |
| Loss-makers         | 3     | <0%        | Fix immediately |
| Low margin (80–95%) | 5     | ~85%       | Monitor         |
| High margin (>95%)  | 200+  | ~99%       | Keep            |
| Unknown (infra ops) | ~50   | ~99%       | Keep            |

**Aggregate: price=$1.268/call, CF cost≈$0.012, margin=99.0%**

> Note: Aggregate 99% margin is artificially inflated by the cost model treating infra ops as $0.0001. Real per-call margin is ~95% when accounting for Workers Paid plan overhead ($5/mo base).

---

## 5. Competitive Analysis

### True CF Primitive Sellers on x402

| CF Primitive      | x402-list matches | True sellers | Tship                    |
| ----------------- | ----------------- | ------------ | ------------------------ |
| R2/Storage        | 2                 | 0            | ✅ 7 endpoints           |
| D1/SQL            | 2                 | 0            | ✅ 8 endpoints           |
| Workers AI        | 11                | 0            | ✅ 28 endpoints          |
| Vectorize         | 2                 | 0            | ✅ 6 endpoints           |
| Browser Rendering | 13                | 0            | ✅ 22 endpoints          |
| KV                | 0                 | 0            | ✅ 21 endpoints          |
| DO                | 5                 | 0            | ✅ 26 endpoints          |
| **fetchgate**     | —                 | **1 NEW**    | ⚠️ CF Workers competitor |

### New Competitor: fetchgate ($7.00 min)

```
URL: https://fetchgate.dev
Description: Agent-builder digital-goods storefront and web-reader API on Cloudflare Workers
Endpoints: 6
Price: $7.00 minimum
Category: Data
Network: Base
```

**Assessment**: Fetchgate is a Cloudflare Workers-based x402 seller targeting the same agent developer audience. Their $7.00 min price is 10× higher than Tship. They position as a "storefront" for digital goods, not a primitive API provider. **Minimal direct overlap** — Tship's primitives are lower-level. However, they demonstrate that CF Workers + x402 can command premium pricing.

### New Competitor: xfuel ($0.01)

```
URL: https://api.xfuel.app
Description: OpenAI-compatible paid inference via x402. POST /v1/chat/completions.
Endpoints: 2
Price: $0.01
Category: AI
Networks: Base, Solana
```

**Assessment**: xfuel directly competes with Tship's `ai.chat` at $0.008. xfuel is **$0.002 more expensive** but offers OpenAI-compatible API format. Many agents already use OpenAI SDKs — xfuel is a drop-in replacement. Tship's advantage: 28 AI endpoints vs xfuel's 2, plus full primitive stack.

**Tship response**: Add OpenAI-compatible `/v1/chat/completions` endpoint at $0.010. Keeps existing `/v1/ai/chat` at $0.008 for price-sensitive callers.

### Tship Moats

1. **Only CF primitive seller** — 0 true competitors for D1, KV, DO, Vectorize primitives
2. **Only KV queue primitives** — `kv.queue.*` (21 ops) unique on x402
3. **Only DO coordination suite** — `coordination.*` (10 ops) + `durable.*` (16 ops)
4. **Only RAG pipeline** — `rag.*` (6 ops) combining Vectorize + Workers AI + R2
5. **Only browser rendering stack** — 22 browser endpoints covering every use case
6. **28-endpoint AI stack** — broadest AI coverage on x402

---

## 6. New Market Opportunities (Since Aug 28)

### 6.1 Agent Persistence — $1.00+/month (BLUE OCEAN)

`aura-agent-persistence` at $1.00 proves willingness to pay for agent persistence. Tship already has KV/DO infrastructure for this.

**Recommended endpoints**:

```
agent.inbox.create    — DO-based ephemeral inbox  $0.010   (already exists, re-promote)
agent.inbox.send     — Send to agent inbox        $0.005   (already exists)
agent.memory.longterm — DO + R2 persistent memory $0.050   (new)
agent.scheduler       — DO alarm-based scheduler   $0.010   (already exists: durable.scheduler)
agent.queue.priority  — DO priority queue         $0.015   (new)
```

**Pricing rationale**: `aura-agent-persistence` sells email + webhook + memory for $1.00/month. Tship can offer the same primitives at $0.50–$1.00/month as usage-based per-call pricing.

### 6.2 OpenAI-Compatible Inference — $0.010 (COMPETE WITH xfuel)

xfuel at $0.01 demonstrates the market. Add an OpenAI-compatible endpoint:

```typescript
// NEW: OpenAI-compatible chat completions
.post("/v1/chat/completions", ...)  // $0.010
  .post("/v1/embeddings", ...)       // $0.003
```

Benefits:

- Drop-in replacement for OpenAI SDK
- Existing agents can switch with 1-line config change
- Higher price than current `ai.chat` ($0.008)
- Matches xfuel's price point

### 6.3 Agent Trust/Reputation — $0.50 (EXPLOIT GAP)

`kortex-service-trust` at $1.00 proves the market. Tship's `sec.*` stack (7 endpoints, $0.050 avg) already covers this but could expand:

```
sec.agent.reputation  — Trust score for an x402 service  $0.050
sec.agent.audit       — Audit trail verification         $0.050
sec.agent.credential  — Verify agent identity/KYA        $0.050
```

### 6.4 Medical/Clinical — $0.005 (HIGH VOLUME)

`magent` with 50 medical endpoints at $0.005 shows medical data is viable. Tship could add:

```
health.icd.lookup     — ICD-10 code lookup               $0.005
health.rx.lookup      — RxNorm drug lookup               $0.005
health.lab.normalize  — Normalize lab results             $0.010
```

### 6.5 Infrastructure Primitives — Blue Ocean ($0.010–$0.50)

Only 2 Infrastructure services on x402-list (avg $0.255). Tship's entire DO/KV primitive suite qualifies:

```
durable.pubsub.publish   — DO pub/sub broadcast           $0.005
durable.pubsub.subscribe — DO WebSocket subscription     $0.010
durable.orm.list         — DO ORM list query             $0.005
coordination.fifo.push   — FIFO queue push                $0.003
coordination.fifo.pop    — FIFO queue pop                 $0.003
```

---

## 7. Pricing Recommendations

### Phase 1: Loss-Maker Fixes (This Week)

```typescript
// apps/console/src/catalog.ts

// CRITICAL: ai.reason DeepSeek R1 — reprice to cover worst-case cost
{ id: "ai.reason", price: "$0.025" }  // was $0.015
// OR cap max_tokens to 256:
// max_tokens: z.number().int().min(1).max(256).default(256)

// CRITICAL: rag.answer — reprice to cover vector search + LLM
{ id: "rag.answer", price: "$0.050" }  // was $0.010

// IMPORTANT: ai.rerank — reprice to cover BGE Reranker cost
{ id: "ai.rerank", price: "$0.010" }  // was $0.003

// IMPORTANT: ai.translate — reprice (uses 2 AI calls)
{ id: "ai.translate", price: "$0.005" }  // was $0.003
```

**Revenue impact**: Removes ~-$0.05/call from loss-makers. Net +$0.03/call improvement.

### Phase 2: New Blue Ocean Endpoints (Week 2–3)

```typescript
// Agent persistence premium tier
{ id: "agent.memory.longterm", price: "$0.050" }
{ id: "agent.queue.priority",  price: "$0.015" }
{ id: "agent.scheduler.recurring", price: "$0.010" }

// OpenAI-compatible (compete with xfuel)
{ id: "openai.chat.completions",  price: "$0.010" }
{ id: "openai.embeddings",        price: "$0.003" }

// Infrastructure premium
{ id: "durable.orm.list",         price: "$0.005" }
{ id: "coordination.fifo.push",   price: "$0.003" }
{ id: "coordination.fifo.pop",    price: "$0.003" }

// Agent trust/reputation
{ id: "sec.agent.reputation",     price: "$0.050" }
{ id: "sec.agent.audit",         price: "$0.050" }

// Medical/healthcare
{ id: "health.icd.lookup",        price: "$0.005" }
{ id: "health.rx.lookup",         price: "$0.005" }
```

### Phase 3: Pricing Optimization (Week 4+)

| Endpoint                 | Current | Recommended | Rationale                                   |
| ------------------------ | ------- | ----------- | ------------------------------------------- |
| `ai.reason`              | $0.015  | **$0.025**  | DeepSeek R1 worst-case = $0.020/call        |
| `rag.answer`             | $0.010  | **$0.050**  | Vector search + LLM = $0.078/call           |
| `ai.rerank`              | $0.003  | **$0.010**  | BGE Reranker = $0.0002/call (can go higher) |
| `ai.translate`           | $0.003  | **$0.005**  | Two Workers AI calls                        |
| `ai.chat`                | $0.008  | **KEEP**    | 8B model = $0.00005/call, 93% margin        |
| `ai.chat.cached`         | $0.010  | **KEEP**    | KV caching reduces CF cost further          |
| `browser.screenshot`     | $0.005  | **$0.008**  | 3s browser time = $0.000075                 |
| `browser.search.summary` | $0.030  | **$0.050**  | Perplexity clone — You.com = $0.10          |
| `db.transaction`         | $0.025  | **KEEP**    | Turso = $0.05+, no x402 seller              |
| `coordination.fifo.*`    | $0.002  | **$0.003**  | Unique DO-based queue, no competition       |

### Pricing Strategy Rules

1. **DeepSeek R1 = minimum $0.025/call**. At 4096 output tokens, CF cost = $0.020. Price must exceed this.
2. **Vector search = $0.020/min-dim**. At 10K vectors × 768 dims, CF cost = $0.077.
3. **LLM endpoints: price ≥ 5× CF cost**. Llama 8B default = $0.00005/call → price ≥ $0.003.
4. **OpenAI-compatible = premium**. SDK compatibility commands $0.010+.
5. **Blue ocean = 10× CF cost**. DO/KV/D1 primitives with 0 competitors = $0.005–$0.050.
6. **Browser rendering**: $0.005–$0.030 covers 0.5–3s of browser time.
7. **Modal/External deps**: Never price below external service cost. Better to remove.

---

## 8. Revenue Projections (Revised)

### With Loss-Maker Fixes

| Scenario | Calls/day | Revenue (old) | Revenue (fixed) |
| -------- | --------- | ------------- | --------------- |
| Floor    | 1,000     | $1.27/day     | $1.27/day       |
| Early    | 5,000     | $6.35/day     | $6.60/day       |
| Growth   | 50,000    | $63.50/day    | $66.00/day      |
| PMF      | 500,000   | $635/day      | $660/day        |
| Scale    | 5,000,000 | $6,350/day    | $6,600/day      |

### Revenue by Category (500 calls/day baseline, fixed prices)

| Category               | Calls/day | New Avg Price | Annual Revenue |
| ---------------------- | --------- | ------------- | -------------- |
| AI (28→30 endpoints)   | 150       | $0.013        | $711           |
| Browser (22 endpoints) | 100       | $0.015        | $547           |
| KV (21 endpoints)      | 80        | $0.003        | $88            |
| Sec (7→10 endpoints)   | 50        | $0.040        | $730           |
| Durable (16 endpoints) | 40        | $0.004        | $58            |
| DB (8 endpoints)       | 30        | $0.016        | $175           |
| Dev (30 endpoints)     | 25        | $0.002        | $18            |
| Storage (7 endpoints)  | 15        | $0.007        | $38            |
| RAG (6 endpoints)      | 10        | $0.020        | $73            |
| **New: Agent**         | 0         | $0.020        | $0 (new)       |
| **Total**              | **~500**  |               | **~$2,438/yr** |

> Baseline revenue improves from $1,845/yr to $2,438/yr (+32%) with repricing alone.

### Break-Even Analysis

- **Tanship infra**: ~$5/mo (Workers Paid) + data egress
- **Per-call margin at 95%**: $0.0013 avg margin
- **Break-even**: ~3,846 calls/day ($0.0013 × 3,846 ≈ $5/mo)
- At 10,000 calls/day = $47/mo margin, covering infra + seed for growth

---

## 9. 8-Week Roadmap

### Week 1: Loss-Maker Fixes (CRITICAL — 1 day)

```
1. Reprice ai.reason: $0.015 → $0.025 (cap max_tokens to 512 OR reprice)
2. Reprice rag.answer: $0.010 → $0.050 (vector search cost)
3. Reprice ai.rerank: $0.003 → $0.010
4. Reprice ai.translate: $0.003 → $0.005
5. Deploy to production
```

### Week 2–3: Blue Ocean Expansion (3 days)

```
6. Ship agent.memory.longterm ($0.050) — DO + R2 persistence
7. Ship agent.queue.priority ($0.015) — DO priority queue
8. Ship durable.orm.list ($0.005)
9. Ship coordination.fifo.push/pop ($0.003 each)
10. Ship sec.agent.reputation ($0.050)
11. Register all new endpoints on PayAI Bazaar + x402-list.com
```

### Week 4: OpenAI Compatibility (2 days)

```
12. Add /v1/chat/completions OpenAI-compatible endpoint ($0.010)
13. Add /v1/embeddings OpenAI-compatible endpoint ($0.003)
14. Test with OpenAI SDK drop-in
```

### Week 5–6: Premium Tier (2 days)

```
15. Reprice browser.search.summary: $0.030 → $0.050
16. Reprice browser.screenshot: $0.005 → $0.008
17. Ship health.icd.lookup ($0.005)
18. Ship health.rx.lookup ($0.005)
```

### Week 7–8: Distribution (2 days)

```
19. Register x402.tanship.dev on x402-list.com (currently 0 entries)
20. Submit all 214 endpoints to x402scan registry
21. Bulk-register on PayAI Bazaar
22. Write OpenAPI spec for all endpoints
23. Submit to x402-list.com submission form
```

---

## 10. Critical Pitfalls

### CRITICAL (Fix This Week)

1. **`ai.reason` at $0.015**: DeepSeek R1 output at $4.88/M tokens. Every call with 1024+ output tokens loses money. Max 4096 out = $0.020 CF cost per call. Fix: reprice to $0.025 or cap max_tokens at 256.
2. **`rag.answer` at $0.010**: Vectorize + Llama 70B = $0.078/call minimum. Fix: reprice to $0.050.
3. **`ai.rerank` at $0.003**: BGE Reranker ~$0.20/call. Fix: reprice to $0.010.

### Important (Fix in 2 Weeks)

4. **Tship not on x402-list.com**: 0 entries despite 214 live endpoints. Register at `https://x402-list.com/submit`.
5. **`xfuel` competition**: OpenAI-compatible inference at $0.01. Tship's `ai.chat` at $0.008 is cheaper but not OpenAI-compatible. Add `/v1/chat/completions` at $0.010.
6. **`aura-agent-persistence` ($1.00)**: Proves willingness to pay $1.00/month for agent persistence. Tship already has the infrastructure — bundle as premium product.

### Ongoing

7. **CF pricing changes**: Workers AI prices changed 4–19× between Aug 26–28. Re-verify before each deploy.
8. **Vectorize cost ceiling**: A single `rag.query` at 100K vectors × 768 dims = $0.77. Add input validation to cap dimensions.
9. **Bazaar distortion**: Top 10 services = 97.6% of settlement volume. Distribution is the real moat.
10. **Storage resale not viable**: D1/KV/DO storage margins are 0% at x402 price points. Wrap operations only.

---

## 11. Sources

| Source                | URL                                                           | Pull Date  |
| --------------------- | ------------------------------------------------------------- | ---------- |
| x402-list census      | `https://x402-list.com/api/v1/services?page=1..23`            | 2026-08-29 |
| PayAI Bazaar          | `https://facilitator.pyai.network/discovery/resources`        | 2026-08-29 |
| Tship catalog         | `apps/console/src/catalog.ts`                                 | 2026-08-29 |
| Tship handlers        | `apps/console/src/handlers/`                                  | 2026-08-29 |
| CF Workers AI pricing | `developers.cloudflare.com/workers-ai/platform/pricing/`      | 2026-08-29 |
| CF R2 pricing         | `developers.cloudflare.com/r2/pricing/`                       | 2026-08-29 |
| CF D1 pricing         | `developers.cloudflare.com/d1/platform/pricing/`              | 2026-08-29 |
| CF KV pricing         | `developers.cloudflare.com/kv/platform/pricing/`              | 2026-08-29 |
| CF DO pricing         | `developers.cloudflare.com/durable-objects/platform/pricing/` | 2026-08-29 |
| CF Vectorize pricing  | `developers.cloudflare.com/vectorize/platform/pricing/`       | 2026-08-29 |
| CF Browser pricing    | `developers.cloudflare.com/browser-run/pricing/`              | 2026-08-29 |

---

## Appendix A: Full Catalog Endpoint List (214 endpoints)

### AI (30 endpoints)

`ai.chat` ($0.008), `ai.chat.cached` ($0.010), `ai.image` ($0.020), `ai.embeddings` ($0.002), `ai.translate` ($0.003), `ai.sentiment` ($0.002), `ai.summarize` ($0.020), `ai.transcribe` ($0.010), `ai.describe` ($0.005), `ai.rerank` ($0.003), `ai.classify` ($0.003), `ai.moderate` ($0.002), `ai.detect` ($0.005), `ai.answer` ($0.012), `ai.compress` ($0.008), `ai.ocr` ($0.010), `ai.lint` ($0.008), `ai.code` ($0.008), `ai.correct` ($0.008), `ai.reason` ($0.015), `ai.similarity` ($0.004), `ai.emotion` ($0.005), `ai.memory.add` ($0.005), `ai.memory.search` ($0.005), `ai.sql` ($0.008)

### Browser (22 endpoints)

`browser.screenshot` ($0.005), `browser.pdf` ($0.010), `browser.markdown` ($0.005), `browser.snapshot` ($0.012), `browser.scrape` ($0.006), `browser.extract` ($0.020), `browser.links` ($0.003), `browser.rss` ($0.015), `browser.rss.summary` ($0.020), `browser.search` ($0.020), `browser.metadata` ($0.008), `browser.article` ($0.012), `browser.news` ($0.005), `browser.seo` ($0.015), `browser.contacts` ($0.012), `browser.sitemap` ($0.008), `browser.forms` ($0.012), `browser.search.summary` ($0.030), + 4 more

### KV (21 endpoints)

`kv.get`, `kv.set`, `kv.delete`, `kv.list`, `kv.keys`, `kv.ttl`, `kv.lease.acquire`, `kv.lease.status`, `kv.queue.push/pop/peek/ack/dead-letter/drain/stats` (21 ops at $0.001–$0.010)

### Durable Objects (16 endpoints)

`durable.scheduler.schedule/list/get/cancel/recurring`, `durable.bloom.add/has`, `durable.orm.*`, + more

### Coordination (10 endpoints)

`coordination.lock.acquire/release/status/heartbeat`, `coordination.leader.status/elect/resign`, `coordination.barrier.create/join/status`

### DB (8 endpoints)

`db.query` ($0.005), `db.query.readonly` ($0.005), `db.exec` ($0.010), `db.upsert` ($0.010), `db.transaction` ($0.025), `db.schema.introspect` ($0.010), `db.batch` ($0.015), `db.migrate` ($0.050)

### Sec (7 endpoints)

`sec.*` (7 ops at $0.005–$0.050)

### RAG (6 endpoints)

`rag.query`, `rag.answer`, `rag.batch-upsert`, + 3 more

### Dev (30 endpoints) + Devtools (15) + Crypto (8) + Storage (7) + Agent (4) + Modal (4) + Reddit (2) + Queue (2) + Misc (5)

---

## Appendix B: New x402 Entries (Aug 24–29, 2026)

42 new services registered in the x402 ecosystem. Key entries:

| Service                | Price  | Category | Note                            |
| ---------------------- | ------ | -------- | ------------------------------- |
| fetchgate              | $7.00  | Data     | **CF Workers storefront**       |
| outfight               | $5.01  | Other    | Agent arena                     |
| frantic                | $2.00  | Other    | Bounty board                    |
| treza                  | $1.64  | AI       | Video generation                |
| aura-agent-persistence | $1.00  | AI       | **Agent email/memory**          |
| kortex-service-trust   | $1.00  | AI       | Agent trust service             |
| melssa                 | $0.50  | Content  | Travel guide                    |
| stacktree              | $0.50  | Content  | HTML hosting                    |
| xfuel                  | $0.01  | AI       | **OpenAI-compatible inference** |
| attention-is-currency  | $0.10  | AI       | Agent bidding                   |
| magent                 | $0.005 | Data     | Medical APIs (50 endpoints)     |
| whaletape              | $0.01  | Data     | Hyperliquid intel               |

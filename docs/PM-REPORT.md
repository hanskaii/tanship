# PM Report — Tanship x402 Market Intelligence

**Refresh**: R31 — 2026-08-31
**Prepared by**: Hermes Agent (cron)
**Scope**: Cloudflare x402 paid API market, Tanship implementation status, deployment health

---

## TL;DR

| Item                     | Status                                                                                 |
| ------------------------ | -------------------------------------------------------------------------------------- |
| Git push to `main`       | ✅ Pushed — HEAD `3e663be` synced with `origin/main`                                   |
| Production deploy        | ✅ Live at `x402.tanship.dev` (version `98d31347`)                                     |
| New endpoints deployed   | ✅ 7 durable leader/barrier endpoints live                                             |
| Uncommitted working tree | ⚠️ `catalog.ts` + 3 new handlers (`agent.webhook`, `agent.workflow`, `video`) + 2 docs |
| Loss-maker fix           | ⚠️ Pending — **26 endpoints** below x402 settlement floor, burning ~$475/yr            |
| x402-list registration   | ⚠️ **Not done** — zero presence on 575-service marketplace                             |
| Blue-ocean opportunities | 🚨 4 CF primitives with **zero** x402 competition: AI Search, Workflows, Stream, D1    |

---

## 1. Market Landscape (R31 Live Data)

### Ecosystem size

- **575 services** on x402-list (stable 8+ days)
- **~27,855 listings** on PayAI Bazaar
- **x402.org 30-day volume**: $24.24M (~$291M annualized)
- **x402scan 30-day txns**: ~19.5M
- **Tship**: 239 priced endpoints (was 222 at R28 deploy → now 239 per R31 research)

### x402-list per-primitive competition

| Cloudflare Primitive | True Primitive Sellers | Competition          |
| -------------------- | ---------------------- | -------------------- |
| **D1 (SQLite)**      | **0**                  | 🔵 Pure blue ocean   |
| **AI Search**        | **0**                  | 🔵 Pure blue ocean   |
| **Workflows**        | **0**                  | 🔵 Pure blue ocean   |
| **Stream (video)**   | **0**                  | 🔵 Pure blue ocean   |
| Vectorize            | ~2                     | 🟢 Near-blue-ocean   |
| KV                   | ~3                     | 🟢 Near-blue-ocean   |
| Durable Objects      | ~5                     | 🟢 Near-blue-ocean   |
| R2 storage           | 3                      | 🟢 Lightly contested |
| Workers AI           | ~15                    | 🟡 Competitive       |
| Browser rendering    | ~8                     | 🟡 Competitive       |

### Tship vs key competitors

| Competitor             | Model                  | 30-day Volume  | Tship advantage                             |
| ---------------------- | ---------------------- | -------------- | ------------------------------------------- |
| **BlockRun**           | CF Workers AI reseller | **$297K**      | Tship: 30 ai.\* + full CF primitive catalog |
| Hugen Visual API       | Browser rendering      | 365 buyers     | Tship: 24 endpoints at 4× lower price       |
| Aura Agent Persistence | DO persistence         | $1.00/endpoint | Tship: same at $0.002–0.020 (50× cheaper)   |

**Tship is the only x402 service offering all 7 CF primitives in one catalog.** No competitor has this breadth.

---

## 2. Critical Issues

### 🔴 P0: Zero x402 Discovery — Highest Revenue Blocker

**Tship has 239 priced endpoints and ZERO entries in x402-list, x402scan, and PayAI Bazaar.**

Every day without registration = lost revenue. BlockRun (2 endpoints) does **$297K/30d** with registration. Tship has 239 endpoints but no buyers can find them.

**Fix:** 1 dev-day to register. Submit at `https://x402-list.com/submit` (SIWX signature + OpenAPI manifest URL). Category: Infrastructure (only 2 services there — first-mover moat).

**Expected impact:** 3–10× discovery rate. Revenue potential: $5–15K/yr at base case.

### 🔴 P1: 26 Loss-Makers Below Settlement Floor — $475/yr Burning

All 26 priced at $0.001. x402 single-tx settlement floor is ~$0.0015. Each call loses money on settlement alone.

| Namespace          | Endpoints                                      | Fix      |
| ------------------ | ---------------------------------------------- | -------- |
| `devtools.*`       | 15 (all)                                       | → $0.002 |
| `dev.*`            | 6 (slugify, hash, crc32, encoding, totp, hmac) | → $0.002 |
| `kv.lease.status`  | 1                                              | → $0.002 |
| `durable.pubsub.*` | 4 (subscribe, unsubscribe, list)               | → $0.002 |

**Fix:** `apps/console/src/catalog.ts` — 1-line price change each. Total effort: **30 minutes**. No new code required.

### 🟡 P2: RAG/Memory Endpoints — Potentially Underpriced

`rag.upsert` at $0.002 vs Vectorize cost $0.0078/call at 1K vectors. May be a real loss-maker at scale.

**Fix:** Add `max_vectors` parameter and dynamic pricing, or reprice upsert to $0.010 minimum.

### 🟡 P3: AI Search Beta Window Closing

CF AI Search is **free during beta**. No x402-list competitors (0 true sellers). Ship endpoints now to build buyer relationships before CF announces GA pricing (typically 30-day notice).

---

## 3. Blue Ocean Opportunities (4 CF Primitives — Zero Competition)

### AI Search (Cloudflare) — Pure Blue Ocean 🔵

- **Status:** Open beta, free unlimited queries
- **x402-list competitors:** 0
- **Endpoints to ship:** `ai.search.create` ($0.050), `ai.search.query` ($0.010), `ai.search.index-status` ($0.005)
- **Dev effort:** 2–3 days per endpoint
- **Timeline risk:** CF announces paid tier with ~30 days notice. **Ship before then.**

### Workflows (Cloudflare) — Pure Blue Ocean 🔵

- **Cost:** $0.30/M requests + $0.02/M CPU ms + $0.80/100K steps
- **x402-list competitors:** 0
- **Endpoint:** `workflow.execute` at $0.050/step
- **CF cost at 1 step:** ~$0.0008. **Margin: 98.4%**
- **Dev effort:** 3 days

### Stream (Cloudflare) — Pure Blue Ocean 🔵

- **Cost:** $5/1000 min-mo storage + $1/1000 min delivered
- **x402-list competitors:** 0
- **Endpoint:** `video.transcode` at $0.050/minute
- **Margin:** 98% (CF delivery ~$0.001/min)
- **Dev effort:** 2 days

### D1 (Cloudflare) — Pure Blue Ocean 🔵

- **Cost:** $0.001/M rows read, $1.00/M rows written
- **x402-list competitors:** 0 (all "database" keyword matches use D1 internally, none sell access)
- **Endpoints:** `db.query` ($0.005 read-only), `db.exec` ($0.010 write)
- **Margin:** 80–90%
- **Note:** Tship already has these — verify catalog pricing is correct

---

## 4. Engineering Status

### Deployed (R28, Aug 30)

✅ 7 new endpoints live at `x402.tanship.dev`:

| Endpoint                                                          | Price      | Margin | Annual potential                       |
| ----------------------------------------------------------------- | ---------- | ------ | -------------------------------------- |
| `durable.leader.elect`                                            | $0.020     | 99.6%  | $365                                   |
| `durable.barrier.create`                                          | $0.010     | 99%    | $182                                   |
| `durable.barrier.join`                                            | $0.010     | 99%    | $182                                   |
| `durable.leader.{status,renew,resign}` + `durable.barrier.status` | avg $0.002 | 92%    | $219                                   |
| **Total**                                                         |            |        | **$948/yr** (base case @ 50 calls/day) |

**Quality gates:** `pnpm run check` ✅ (0 errors, 14 pre-existing warnings), `pnpm run build` ✅, `wrangler deploy` ✅

### Working Tree (Uncommitted)

⚠️ 3 new handlers built, not registered:

| Handler                     | Status                              |
| --------------------------- | ----------------------------------- |
| `agent.webhook.handler.ts`  | Built, not registered in `index.ts` |
| `agent.workflow.handler.ts` | Built, not registered in `index.ts` |
| `video.handler.ts`          | Built, not registered in `index.ts` |

These need: (1) review, (2) register in `index.ts`, (3) add to catalog, (4) deploy.

---

## 5. Git & Deployment Status

| Item            | Value                                                                   |
| --------------- | ----------------------------------------------------------------------- |
| Current HEAD    | `3e663be` — `feat(console): durable.leader & durable.barrier endpoints` |
| Upstream sync   | ✅ Matches `origin/main`                                                |
| Live version ID | `98d31347-a2bb-43c0-b0ef-4b22515b3b16`                                  |
| Production URL  | `https://x402.tanship.dev/v1/services`                                  |
| DO bindings     | ✅ LEADER + BARRIER verified on deploy                                  |

### Docker Hub Issue (Note for Next Deploy)

`cloudflare/sandbox:0.7.0` image pull times out from cron host (outbound network unreliable).

**Workaround:** Use `--containers-rollout none` flag (skips docker build, ships Worker code + DO bindings).

**Fix:** Pre-pull the image or switch sandbox to a Cloudflare-hosted mirror before next deploy cycle.

---

## 6. Priority Stack (This Week)

| #      | Action                                                       | Effort     | Annual Impact                            | Owner         |
| ------ | ------------------------------------------------------------ | ---------- | ---------------------------------------- | ------------- |
| **P0** | Register on x402-list.com + x402scan + Bazaar                | 2 h        | 3–10× discovery, $5–15K/yr               | Huda / DevRel |
| **P0** | Fix 26 loss-makers (`$0.001` → `$0.002`)                     | 30 min     | +$475/yr + eliminate settlement failures | Engineer      |
| **P1** | Commit + deploy `agent.webhook` + `agent.workflow` + `video` | 1 h        | Blue-ocean pipeline                      | Engineer      |
| **P1** | Ship AI Search endpoints (free beta window)                  | 1 week     | $5K/yr, first-mover                      | Engineer      |
| **P2** | Ship Workflows endpoints                                     | 3 days     | $1.8K/yr                                 | Engineer      |
| **P2** | Ship Stream (video) endpoints                                | 2 days     | $1.8K/yr                                 | Engineer      |
| **P2** | Fix `rag.upsert` pricing (add dynamic `max_vectors`)         | 1 day      | Eliminate burn at scale                  | Engineer      |
| **P3** | Solana settlement integration                                | 2 dev-days | 17× tx reach                             | Engineer      |

---

## 7. Annual Revenue Scenarios

| Scenario                                   | Calls/day/endpoint | Avg Price  | Annual Revenue |
| ------------------------------------------ | ------------------ | ---------- | -------------- |
| Floor (loss-leader)                        | 1                  | $0.003     | $256           |
| Pre-discovery                              | 5                  | $0.005     | $1,284         |
| **Base (post-loss-fix + registered)**      | **50**             | **$0.010** | **$42,705**    |
| Stretch (premium mix + blue-ocean)         | 200                | $0.015     | $262,800       |
| BlockRun-class (same model, 239 endpoints) | 1,000              | $0.020     | $1,825,000     |

**Reference:** BlockRun does $297K/30d = $3.56M/yr from 2 CF Workers AI endpoints. Tship has 239 endpoints across 7 CF primitives — ceiling is much higher with registration and distribution.

---

## 8. Required Credentials / Env / Secrets

> ⚠️ **Cloudflare Product Credentials Needed:**
>
> **AI Search (CF product):** If CF AI Search transitions from free beta to paid, a new `AI_` binding may be required in `wrangler.jsonc`. Monitor [CF AI Search pricing page](https://developers.cloudflare.com/ai-search/platform/limits-pricing/) — CF typically gives 30 days notice before GA.
>
> **Stream (CF product):** Already covered by existing CF bindings in `wrangler.jsonc`. No new secrets needed.
>
> **Workflows (CF product):** Already covered by existing CF bindings in `wrangler.jsonc`. No new secrets needed.
>
> **x402-list Registration:** Requires SIWX signature for the domain (`x402.tanship.dev`). Ensure `TSHIP_PRIVATE_KEY` or equivalent SIWX signing key is available in the deployment environment.
>
> **All other blue-ocean endpoints (D1, KV, R2, Durable Objects, Vectorize, Workers AI, Browser):** Use existing bindings already declared in `wrangler.jsonc`. **No new secrets required.**

---

## 9. Key Numbers Summary

| Metric                   | Value                                                       |
| ------------------------ | ----------------------------------------------------------- |
| Total x402 ecosystem     | $24.24M/30d, 575 services, 19.5M txns                       |
| Tship catalog            | 239 priced endpoints, $0.001–$2.00                          |
| Tship x402-list presence | **0** (biggest revenue blocker)                             |
| BlockRun revenue         | $297K/30d (2 endpoints)                                     |
| Loss-makers              | 26 endpoints × $475/yr burn                                 |
| Blue-ocean primitives    | 4 (AI Search, Workflows, Stream, D1 — all zero competition) |
| Gross margin (blended)   | 94%                                                         |
| Deployment status        | ✅ Live at `x402.tanship.dev`                               |
| Git status               | ✅ Synced with `origin/main` (`3e663be`)                    |

---

_Report generated: 2026-08-31 | Sources: `docs/research-results.md` (R31), `docs/engineering-report.md` | Next refresh: TBD_

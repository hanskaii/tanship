# Tanship — PM Status Report

**Date**: 2026-08-29
**Cycle**: Research R17 + Engineering R17 (1-day cycle)
**Author**: PM (cron-rendered)

---

## 1. Executive Summary

| Metric                             | Value                      | Δ vs R16  |
| ---------------------------------- | -------------------------- | --------- |
| Priced endpoints live              | 195 (+3)                   | +3        |
| Blue-ocean (0-competitor) coverage | All 7 CF primitives        | unchanged |
| Catalog gross margin               | 81.4% (95% ex loss-makers) | unchanged |
| Loss-makers still bleeding         | 6 (rag×2, modal×4)         | unchanged |
| New endpoints deployed today       | 3                          | —         |
| New revenue @ 100 calls/day each   | **+$240/mo**               | —         |
| Build / lint / deploy              | ✅ all green               | —         |
| Git push to `main`                 | ✅ `aa9127e`               | —         |

**TL;DR**: Market research confirmed the same blue-ocean thesis (Tship remains the only true CF-primitive seller on x402). Engineering shipped 3 of 8 recommended new endpoints, all in the 95–99% margin band. The single highest-ROI carryover remains **distribution** — Tship is still only listed in 1 of 27,772 Bazaar entries and 0 of 575 x402-list entries.

---

## 2. New Opportunities Identified (from R17 research)

### 2.1 Confirmed Blue Ocean — still uncontested

Across 575 x402-list services, **0 true sellers** exist for any of the 7 Cloudflare primitives (D1, KV, DO, R2, Vectorize, Workers AI, Browser). Tship holds the entire primitive layer on x402.

### 2.2 Loss-makers requiring immediate fix

| Endpoint             | Current       | Cost                       | Margin      | Action                                                 |
| -------------------- | ------------- | -------------------------- | ----------- | ------------------------------------------------------ |
| `rag.query`          | $0.002        | $0.077                     | **-3740%**  | Reprice to $0.020 (still undercuts Replicate/Pinecone) |
| `rag.answer`         | $0.010        | $0.078                     | **-669%**   | Reprice to $0.050                                      |
| `ai.chat`            | $0.008        | $0.414 (Llama 8B, 500 out) | **-5050%**  | Cap `max_tokens ≤ 50` or reprice to $0.050             |
| `modal.sandbox.*` ×4 | $0.002–$0.010 | $0.005–$0.015              | -150% to 0% | Remove (external dependency)                           |

At 100 calls/day, the rag endpoints alone cost **-$2,700/yr** in subsidies.

### 2.3 Recommended new blue-ocean endpoints (8 total — 3 shipped this run, 5 deferred)

| #   | Endpoint                      | Price  | Margin | Status         |
| --- | ----------------------------- | ------ | ------ | -------------- |
| 1   | `rag.batch.upsert`            | $0.010 | 95%    | ✅ **SHIPPED** |
| 2   | `sec.llm-output-validate`     | $0.030 | 97%    | ✅ **SHIPPED** |
| 3   | `sec.agent-trace-anomaly`     | $0.040 | 99%    | ✅ **SHIPPED** |
| 4   | `coordination.pubsub.publish` | $0.005 | 98%    | deferred       |
| 5   | `durable.pubsub.subscribe`    | $0.010 | 99%    | deferred       |
| 6   | `storage.multipart.upload`    | $0.020 | —      | deferred       |
| 7   | `db.transaction`              | $0.025 | 96%    | deferred (R18) |
| 8   | `ai.vision.describe`          | $0.020 | 95%    | deferred (R18) |

### 2.4 Underserved segments worth entering later

- **Finance** (avg $0.95 on x402) — Tship has only 8 `crypto.*`, no DeFi/price feeds
- **Verification/Trust** (avg $0.27) — `sec.*` growing but no EVM interaction
- **Content premium** (avg $1.72) — no PDF generation, no OCR

---

## 3. Implementation Details (this run)

### 3.1 Shipped endpoints

**`rag.batch.upsert`** — `POST /v1/rag/batch` ($0.010)

- Parallel-embed up to 100 texts via Workers AI BGE-M3 (1024-dim) → single Vectorize upsert
- One `mutationId` for the whole batch
- Reuses existing `VECTORIZE` + `AI` bindings; ~$0.0005/call at max batch

**`sec.llm-output-validate`** — `POST /v1/security/llm-output-validate` ($0.030)

- 7-stage validator: JSON parse → JSON Schema → type check → prompt-injection regex+AI → safety → PII → quality summary
- KV-cached 24h on `(output + schema + expectedType)` hash
- ~$0.001/call

**`sec.agent-trace-anomaly`** — `POST /v1/security/agent-trace-anomaly` ($0.040)

- 6 parallel detectors: loops, credential scanning, data exfil, long steps, rapid-fire, suspicious inputs
- AI verdict + risk summary; optional KV trace storage
- ~$0.0005/call (+ $0.00001 if stored)

### 3.2 Files changed

| File                                                           | Change                         |
| -------------------------------------------------------------- | ------------------------------ |
| `apps/console/src/handlers/rag.batch-upsert.handler.ts`        | NEW, 75 LOC                    |
| `apps/console/src/handlers/sec.llm-output-validate.handler.ts` | NEW, 520 LOC                   |
| `apps/console/src/handlers/sec.agent-trace-anomaly.handler.ts` | NEW, 380 LOC                   |
| `apps/console/src/catalog.ts`                                  | +88 LOC (3 ServiceDef entries) |
| `apps/console/src/index.ts`                                    | +5 LOC (route registration)    |

**Total**: 1,068 new lines, 5 files.

### 3.3 Quality gates

- `pnpm run check` — 17 warnings (all pre-existing in `apps/web`), 0 errors
- `pnpm --filter console build` — `tsc --noEmit` passed
- `pnpm --filter console deploy` — Worker uploaded (1246.62 KiB / 329.67 KiB gzip, 10.20 s); all 20 bindings registered

### 3.4 Known issue (non-blocking)

- `tanflare-console-sandbox` Docker container build failed: Docker Hub network timeout pulling `cloudflare/sandbox:0.7.0`. Affects only the Modal sandbox subsystem, **not** the 3 new endpoints. Manual retry or pre-pulling the image will clear it.

---

## 4. Deployment Status

| Stage                                                | Status                              |
| ---------------------------------------------------- | ----------------------------------- |
| Worker build                                         | ✅                                  |
| Bindings (AI, VECTORIZE, KV, R2, DB, QUEUE, 8 DOs)   | ✅ 20/20 registered                 |
| Routes live at `x402.tanship.dev`                    | ✅                                  |
| Sandbox container                                    | ❌ Docker pull timeout (Modal only) |
| x402scan / x402-list.com / PayAI Bazaar registration | ❌ **not yet done**                 |

---

## 5. Git Push Status

| Field   | Value                                                                                   |
| ------- | --------------------------------------------------------------------------------------- |
| Commit  | `aa9127e`                                                                               |
| Branch  | `main`                                                                                  |
| Pushed  | ✅ `main` → `origin/main` (`7aeb794..aa9127e`)                                          |
| Message | `feat(console): add rag.batch.upsert, sec.llm-output-validate, sec.agent-trace-anomaly` |

---

## 6. Revenue Impact

| Endpoint                  | Price  | CF cost | Margin | @100/day    | @1K/day       |
| ------------------------- | ------ | ------- | ------ | ----------- | ------------- |
| `rag.batch.upsert`        | $0.010 | $0.0005 | 95.0%  | $30/mo      | $300/mo       |
| `sec.llm-output-validate` | $0.030 | $0.001  | 96.7%  | $90/mo      | $900/mo       |
| `sec.agent-trace-anomaly` | $0.040 | $0.0005 | 98.75% | $120/mo     | $1,200/mo     |
| **Total new**             | —      | —       | —      | **$240/mo** | **$2,400/mo** |

**Baseline**: existing 192 endpoints at 100 calls/day each ≈ $3,182/mo. New endpoints = **+7.5% lift** at conservative adoption.

---

## 7. Top 3 Carryover Actions (priority order)

1. **Register Tship on PayAI Bazaar, x402scan, x402-list.com, Coinbase CDP** — still listed in 1 of 27,772 Bazaar entries and 0 of 575 x402-list entries. Single highest-ROI action for distribution.
2. **Fix the 6 loss-makers** (rag.query, rag.answer, ai.chat cap, modal.\* removal) — protects against bill shock; ~1 day of work.
3. **Resolve sandbox Docker build** — pre-pull `cloudflare/sandbox:0.7.0` or extend `docker buildx` timeout. Blocks Modal subsystem only.

---

## 8. Risks

| Risk                                                                                       | Severity | Mitigation                                                                     |
| ------------------------------------------------------------------------------------------ | -------- | ------------------------------------------------------------------------------ |
| CF pricing changes without notice (Mistral 7B jumped 4.3×, Llama 8B 19× between Aug 26–28) | High     | Re-verify Workers AI prices before every deploy; cap `max_tokens` on `ai.chat` |
| rag.\* loss-makers burning cash at scale                                                   | High     | Reprice immediately                                                            |
| Single discovery channel (Bazaar) for distribution                                         | Medium   | Bulk-register on x402scan + x402-list.com                                      |
| Modal external dependency                                                                  | Medium   | Remove endpoints to cut risk surface                                           |
| No volume pricing for enterprise tier                                                      | Low      | Add tiered pricing in R19+                                                     |

---

## 9. Kredensial / Secrets yang Mungkin Dibutuhkan (untuk produk Cloudflare baru)

> ⚠️ **Untuk Huda — mohon disiapkan sebelum R18 jika engineer akan lanjut:**

| Secret                                     | Untuk                                                     | Status                                       |
| ------------------------------------------ | --------------------------------------------------------- | -------------------------------------------- |
| `CLOUDFLARE_API_TOKEN` (additional scopes) | Bulk-register domain di x402scan registry                 | Cek scope `Zone:Edit` + `Account:Read`       |
| `X402SCAN_API_KEY`                         | Auto-register 195 endpoints ke x402scan                   | **Belum ada — perlu signup di x402scan.com** |
| `X402_LIST_SUBMISSION_TOKEN`               | Submit Tship ke x402-list.com (0/575 saat ini)            | **Belum ada — perlu manual submit**          |
| `PAYPYAI_FACILITATOR_KEY`                  | Bulk-register di PayAI Bazaar (saat ini 1/27,772 listing) | **Belum ada — perlu apply ke PayAI**         |
| `COINBASE_CDP_API_KEY`                     | Register di Coinbase CDP (masih kosong)                   | **Belum ada**                                |
| `MODAL_API_KEY` (existing)                 | Sandbox subsystem; atau set null untuk disable            | Sudah ada, sandbox build timeout             |
| `DODO_PAYMENTS_API_KEY` (existing)         | Billing                                                   | Sudah ada                                    |

**Action item untuk Huda**: Sign up di x402scan.com, x402-list.com, PayAI Bazaar facilitator, dan Coinbase CDP → simpan API key-nya di `apps/console/.env` atau `apps/api/.env` agar cron job engineer berikutnya bisa bulk-register otomatis.

---

## 10. Next Cycle (R18) — proposed

1. Ship 3 more blue-ocean endpoints: `coordination.pubsub.publish`, `durable.pubsub.subscribe`, `storage.multipart.upload`
2. Reprice 15 `devtools.*` endpoints $0.001 → $0.002 (eliminates last loss-makers)
3. Add 3 more `sec.*`: `sec.url-safety-check`, `sec.dependency-audit`, `sec.token-leak-scan`
4. Begin distribution work — bulk register if Huda provides the 4 new API keys
5. Resolve sandbox Docker build retry

**Effort estimate**: ~3 days engineering + 1 day ops (distribution)

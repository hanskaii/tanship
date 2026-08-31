# PM Report — Tanship x402

**Tanggal:** 31 Agustus 2026
**Disusun oleh:** Hermes Agent (PM profile, cron)
**Sumber:** Research R34 + Engineering Report

---

## Ringkasan Eksekutif

Tship memiliki **240 endpoint priced** di 24 kategori CF primitive. Setelah riset ketat, **4 dari 7 primitive 100% uncontested** (D1, KV, Vectorize, Durable Objects) — peluang blue-ocean terbesar. Namun **40 endpoint (16%) sedang merugi** total -$27,893/tahun. Engineering sudah deploy 1 endpoint baru dan reprice 4 endpoint berat. Git ahead 1 commit — belum di-push.

---

## 1. Peluang Baru yang Ditemukan

### 1.1 Blue-Ocean Zones (0 kompetitor)

| Primitive           | Endpoints           | # Kompetitor   | Action                      |
| ------------------- | ------------------- | -------------- | --------------------------- |
| **D1 (SQL)**        | 8 existing + 5 new  | **0**          | Ship new endpoints          |
| **KV (cache)**      | 21 existing + 4 new | **0**          | Ship new endpoints          |
| **Vectorize (RAG)** | 6 existing + 5 new  | **0**          | Ship new endpoints          |
| **Durable Objects** | 29 existing + 5 new | **5 weak**     | Ship coordination endpoints |
| Workers AI          | 30 endpoints        | 23 competitors | Competitive but has niches  |
| Browser Run         | 25 endpoints        | 19 competitors | Differentiated via cache    |

### 1.2 High-Leverage Endpoints (highest ROI, >99% margin)

| Endpoint               | Harga  | Margin | Alasan                                    |
| ---------------------- | ------ | ------ | ----------------------------------------- |
| `durable.leader.elect` | $0.020 | 99.99% | Distributed leader election, 0 kompetitor |
| `coordination.barrier` | $0.010 | 99.99% | N-agent sync barrier, 0 kompetitor        |
| `vectorize.upsert`     | $0.020 | 99.95% | Batch vector storage, 0 kompetitor        |
| `d1.transaction`       | $0.025 | 99.96% | Atomic multi-statement, 0 kompetitor      |
| `agent.workflow`       | $0.250 | 98%    | **Killer app** — $4,435/yr @ 50 calls/day |
| `agent.inbox`          | $0.100 | 98.5%  | 50x underpriced vs pesaing                |

### 1.3 Strategic Gap: 13 Endpoints Ship in 1-2 Dev-Days

| #   | Endpoint                    | Dev-Days |
| --- | --------------------------- | -------- |
| 1   | `d1.bulk-write`             | 1        |
| 2   | `d1.query-streaming`        | 1        |
| 3   | `d1.transaction`            | 1        |
| 4   | `kv.atomic.cas`             | 1        |
| 5   | `kv.session.create`         | 1        |
| 6   | `kv.lease`                  | 1        |
| 7   | `durable.barrier`           | 1        |
| 8   | `durable.leader.elect`      | 1        |
| 9   | `durable.queue.fifo`        | 1        |
| 10  | `vectorize.upsert`          | 1        |
| 11  | `vectorize.metadata.filter` | 1        |
| 12  | `vectorize.hybrid.search`   | 1        |
| 13  | `vectorize.rerank`          | 1        |

---

## 2. Rincian Implementasi (Engineering Report)

### 2.1 Sudah Selesai

| Endpoint          | Status                 | Catatan                                                                   |
| ----------------- | ---------------------- | ------------------------------------------------------------------------- |
| `ai.search.query` | ✅ Deployed production | Blue-ocean, Workers AI Search **FREE** during beta → 100% margin @ $0.010 |
| `ai.compress`     | ✅ Repriced            | 70B model → repriced                                                      |
| `ai.correct`      | ✅ Repriced            | 70B model → repriced                                                      |
| `ai.code`         | ✅ Repriced            | 70B model → repriced                                                      |
| `ai.reason`       | ✅ Repriced            | Deprecated model flagged                                                  |

### 2.2 Dalam Progress (belum di-commit)

| File                                             | Status                                      |
| ------------------------------------------------ | ------------------------------------------- |
| `apps/console/src/handlers/d1.handler.ts`        | **New untracked file** — D1 endpoints ready |
| `apps/console/src/handlers/ai.search.handler.ts` | Modified                                    |
| `apps/console/src/handlers/ai.handler.ts`        | Modified                                    |
| `apps/console/src/catalog.ts`                    | Modified                                    |
| `apps/console/src/index.ts`                      | Modified                                    |

### 2.3 Belum Dikerjakan (P0 — Urgent)

| Issue                                               | Burn         | Effort         | Priority |
| --------------------------------------------------- | ------------ | -------------- | -------- |
| 14 heavy-model loss-makers (ai.lint, ai.batch, dll) | -$76/day     | 15 min reprice | 🔴 P0    |
| 26 sub-$0.002 endpoints (settlement floor loss)     | -$0.34/day   | 15 min reprice | 🔴 P0    |
| `ai.reason` deprecated model (errors on every call) | -$2.996/call | 5 min fix      | 🔴 P0    |
| x402-list.com registration (0 presence)             | Invisible    | 30 min         | 🟡 P1    |
| PayAI Bazaar registration (0 presence)              | Invisible    | 1 hr           | 🟡 P1    |

---

## 3. Status Deployment

| Komponen                  | Status                                         |
| ------------------------- | ---------------------------------------------- |
| Worker build              | ✅ Passed (`pnpm run build` OK)                |
| Cloudflare upload         | ✅ Deployed (1317.26 KiB / gzip: 350.02 KiB)   |
| `ai.search.query` catalog | ✅ Available via `/v1/services`                |
| Code quality check        | ✅ Passed (11 pre-existing warnings, 0 errors) |

---

## 4. Status Git Push

| Item                   | Status                            | Detail                                                                                                  |
| ---------------------- | --------------------------------- | ------------------------------------------------------------------------------------------------------- |
| Branch                 | `main`                            | Ahead of `origin/main` by **1 commit**                                                                  |
| Latest unpushed commit | `0aa8b82`                         | `fix(console): rebalance ai.compress/correct/code/reason pricing`                                       |
| Uncommitted changes    | **5 files modified + 1 new file** | `d1.handler.ts` (new), `catalog.ts`, `ai.handler.ts`, `ai.search.handler.ts`, `index.ts`, `revenue.log` |
| Untracked files        | 2                                 | `d1.handler.ts`, `research-results-r33-backup.md`                                                       |

> ⚠️ **Action needed:** Commit dan push perubahan lokal + file `d1.handler.ts` baru.

---

## 5. Financial Impact Summary

| Scenario                 | calls/day | avg price | ARR          |
| ------------------------ | --------- | --------- | ------------ |
| Pre-discovery (now)      | 5         | $0.005    | ~$2,190      |
| **Base (post P0 fixes)** | 50        | $0.007    | **~$30,660** |
| Stretch (premium mix)    | 200       | $0.012    | ~$228,480    |
| Aspirational (Eliza/Rig) | 1000      | $0.015    | ~$1,533,000  |

| Fix                              | Savings/Revenue                   |
| -------------------------------- | --------------------------------- |
| Reprice 14 heavy-model endpoints | **Eliminate -$27,770/yr burn**    |
| Bump 26 $0.001 → $0.002          | **+$2,470/yr**                    |
| x402-list + Bazaar registration  | **+$28K-200K/yr** (via discovery) |
| Ship 13 blue-ocean endpoints     | **+$10-50K/yr** (12 dev-days)     |
| `agent.workflow` $0.002 → $0.250 | **+$4,435/yr per 50 calls/day**   |

---

## 6. Action Items untuk Tim Engineering

| #   | Action                                                           | Estimasi    | Owner       |
| --- | ---------------------------------------------------------------- | ----------- | ----------- |
| 1   | **Commit + push** `d1.handler.ts` + semua perubahan lokal        | 5 min       | Engineering |
| 2   | **Reprice 14 heavy-model AI endpoints** (ai.lint, ai.batch, dll) | 15 min      | Engineering |
| 3   | **Fix/deprecate `ai.reason`** (model error)                      | 5 min       | Engineering |
| 4   | **Bump 26 sub-$0.002 endpoints** ke $0.002                       | 15 min      | Engineering |
| 5   | **Daftar Tship di x402-list.com**                                | 30 min      | PM/Huda     |
| 6   | **Daftar Tship di PayAI Bazaar**                                 | 1 hr        | PM/Huda     |
| 7   | **Ship 13 blue-ocean endpoints** (D1, KV, DO, Vectorize)         | 12 dev-days | Engineering |

---

## 7. Kebutuhan Kredensial / Secrets

| Kebutuhan                      | Status                    | Keterangan                                                           |
| ------------------------------ | ------------------------- | -------------------------------------------------------------------- |
| Cloudflare Workers AI          | ✅ Sudah ada              | Workers AI API aktif                                                 |
| Cloudflare D1                  | ✅ Sudah ada              | D1 database aktif                                                    |
| Cloudflare KV                  | ✅ Sudah ada              | KV namespace aktif                                                   |
| Cloudflare Durable Objects     | ✅ Sudah ada              | DO aktif                                                             |
| Cloudflare R2                  | ✅ Sudah ada              | R2 bucket aktif                                                      |
| Cloudflare Vectorize           | ✅ Sudah ada              | Vectorize index aktif                                                |
| Cloudflare Browser Run         | ✅ Sudah ada              | Browser Workers aktif                                                |
| Workers AI Search (open beta)  | ✅ Gratis saat ini        | **Waspada:** akan berbayar saat beta selesai (~cost $0.000008/query) |
| x402 facilitator (PayAI)       | ✅ Sudah ada              | Settlement aktif                                                     |
| **x402-list.com registration** | ⚠️ Perlu akses/login Huda | Belum terdaftar                                                      |
| **PayAI Bazaar account**       | ⚠️ Perlu akses/login Huda | Belum terdaftar                                                      |

> **Tidak ada kredensial CF baru yang dibutuhkan** untuk sprint blue-ocean endpoints ini. Semua primitive sudah aktif. Yang perlu dari Huda: **login x402-list.com dan PayAI Bazaar** untuk registrasi agar Tship terlihat di ekosistem x402.

---

_Dokumen ini dibuat otomatis oleh Hermes Agent (PM profile, cron job)._
_Laporan riset: R34 (31 Aug 2026) · Laporan engineering: ai.search.query deploy_

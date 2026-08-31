# Tanship — PM Report

**Date:** 2026-08-31 (Monday)
**Cycle:** R33 research + R31 implementation follow-up
**Author:** PM (autonomous cron)

---

## 🔑 KREDENSIAL / SECRETS YANG DIBUTUHKAN TIM

> **PENTING untuk Huda** — Bagian ini paling atas karena memblokir progress jika tidak ada.

**CF Secrets/env baru yang dibutuhkan engineer/researcher untuk endpoint Tier-S:**

| Secret                                                                     | Tujuan                                                      | Endpoint yang butuh                                       |
| -------------------------------------------------------------------------- | ----------------------------------------------------------- | --------------------------------------------------------- |
| `CLOUDFLARE_ACCOUNT_ID` (jika belum ada di env prod)                       | Identitas akun untuk Workers AI Search + Workflows bindings | `ai.search.query`, `ai.search.create`, `workflow.execute` |
| `AI_SEARCH_BINDING` / `wrangler.toml` binding `[[ai_search]]`              | Wajib untuk AI Search API (free beta)                       | `ai.search.*`                                             |
| Workflows binding `[[workflows]] name="tanship-workflow"`                  | Untuk eksekusi multi-step                                   | `workflow.execute`                                        |
| `D1_DATABASE_ID` binding update (jika ada env baru)                        | Bulk write & streaming SQL                                  | `d1.bulk-write`, `d1.query-streaming`                     |
| `CF_API_TOKEN` dengan scope `Workflows: Edit` (untuk deploy)               | Provisioning Workflows                                      | `workflow.execute`                                        |
| `VECTORIZE_INDEX_ID` (existing atau baru)                                  | Vectorize binding                                           | `vectorize.upsert/delete`                                 |
| Secrets untuk **x402-list.com** submission: `X402_LIST_HOST_FEE` ($1 USDC) | Submit katalog ke x402-list                                 | Discovery (top revenue unlock)                            |

**Status: TIDAK BLOKIR untuk R33** — Tier S shippable dengan env yang sudah ada untuk #3–5; #1–2 butuh AI Search binding (verifikasi sudah ada di `wrangler.toml`).

---

## 1. Ringkasan Eksekutif

| Area                                  | Status                                                                                                     |
| ------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| **Riset (R33)**                       | ✅ Selesai — 13 peluang blue-ocean teridentifikasi                                                         |
| **Engineer — cycle sebelumnya (R31)** | ✅ 1 endpoint shipped, deployed, pushed                                                                    |
| **Engineer — rekomendasi R33**        | ⏳ Belum dimulai, 4 dev-days Tier S                                                                        |
| **Deployment**                        | ✅ Worker live, sandbox Docker build blocked (pre-existing env issue)                                      |
| **Git push**                          | ✅ Up-to-date dengan `origin/main` (commit `7cae384`); working tree punya uncommitted docs/catalog changes |

---

## 2. Peluang Baru dari Riset (R33) — 13 Blue-Ocean

### Tier S — Ship this week (4 dev-days, 100% margin)

1. `ai.search.query` — $0 cost (beta), $0.010 ask, 1 dev-day
2. `ai.search.create` — $0 cost, $0.010 ask, 0.5 dev-day
3. `workflow.execute` — $0.000008 cost, $0.050 ask, 1 dev-day
4. `d1.bulk-write` — $0.000001 cost, $0.010 ask, 0.5 dev-day
5. `d1.query-streaming` — $0.000001 cost, $0.010 ask, 1 dev-day

### Tier A — Next week (4 dev-days)

6. `vectorize.upsert` ($0.020)
7. `vectorize.delete` ($0.005)
8. `durable.cron` ($0.010)
9. `durable.rate-limit` ($0.005)
10. `r2.list` ($0.005)

### Tier B — 2 weeks (3 dev-days)

11. `stream.transcribe` ($0.050)
12. `stream.deliver` ($0.020)
13. `agent.memory.store/recall` ($0.010, hold sampai CF Memory GA)

**Zero direct x402 competitors** untuk: AI Search, Workflows, Durable Objects. **1 competitor** untuk D1 (orisha-data @ $0.010 — kita 70% lebih murah).

### Quick wins tanpa kode baru

- **Reprice 26 loss-makers** ($0.001 → $0.002) — 30 menit, hilangkan settlement-floor leak
- **Submit ke x402-list.com** — 1 dev-day, biggest revenue unlock (Tship 240 eps = 6.8% dari total listed, saat ini presence = 0)

---

## 3. Rincian Implementasi Terakhir (R31 cycle)

**Endpoint:** `browser.screenshot.full-page`

| Aspek     | Detail                                                                                                                                                                   |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Path      | `POST /v1/browser/screenshot/full-page`                                                                                                                                  |
| Price     | $0.010 (2× basic screenshot, 50% dari Hugen $0.02)                                                                                                                       |
| Cost      | ~$0.002/call (CF Browser Rendering, retina scale 2x)                                                                                                                     |
| Margin    | ~80%                                                                                                                                                                     |
| Params    | `url` (req), `width` 320–3840, `height` 240–2160, `quality` 10–100, `format` jpeg\|png                                                                                   |
| Files     | `apps/console/src/services/browser.service.ts` (method baru), `apps/console/src/handlers/browser.handler.ts` (route + Zod schema), `apps/console/src/catalog.ts` (entry) |
| Deps baru | Tidak ada (zero new deps)                                                                                                                                                |
| Output    | Raw binary JPEG/PNG via `c.body()`                                                                                                                                       |

**Justifikasi pasar:** Hugen Visual API = $0.02/screenshot, 365 buyer/30d. Tship `browser.screenshot` ($0.005) viewport-only. Endpoint baru ini tutup gap dengan full-page + retina + quality control di setengah harga Hugen.

---

## 4. Status Deployment

| Check                      | Hasil                                                                                  |
| -------------------------- | -------------------------------------------------------------------------------------- |
| `pnpm run check`           | ✅ 0 errors, 11 pre-existing warnings                                                  |
| `pnpm run build`           | ✅ console#build + web#build sukses                                                    |
| `wrangler deploy`          | ✅ Worker uploaded (4.96s), startup 122ms                                              |
| `GET /v1/services`         | ✅ `browser.screenshot.full-page` muncul di list                                       |
| **Live**                   | ✅ Production aktif                                                                    |
| Docker sandbox image build | ❌ Gagal (Docker Hub network timeout) — **pre-existing env issue, tidak terkait kode** |
| Sandbox runtime            | ⏸ Tidak dipakai di production path                                                     |

**Worker live dan endpoint berfungsi di production.**

---

## 5. Status Git Push

| Aspek                     | Status                                                                                                                   |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Branch                    | `main`                                                                                                                   |
| Sync dengan `origin/main` | ✅ Up-to-date                                                                                                            |
| Last commit (R31 cycle)   | `7cae384` — `docs: update engineering report`                                                                            |
| Implementation commit     | `3f52df8` — `feat(console): browser.screenshot.full-page`                                                                |
| Push                      | ✅ Pushed ke `origin/main`                                                                                               |
| **Working tree**          | ⚠️ Uncommitted changes: `apps/console/src/catalog.ts`, `docs/research-results.md` (perlu commit + push cycle berikutnya) |
| Untracked                 | `.agent-logs/`                                                                                                           |

**Risiko minor:** Working tree punya 2 modified files yang belum di-commit. Tidak konflik dengan main tapi sebaiknya dirapikan dalam cycle engineer berikutnya.

---

## 6. Proyeksi Revenue (dari R33)

| Skenario                  | Tship share                  | 12-bulan revenue    |
| ------------------------- | ---------------------------- | ------------------- |
| Konservatif               | 0.1% x402-list 30d vol       | $2,400 (status quo) |
| Realistis                 | 0.5% + 13 endpoint baru      | $12K–$60K           |
| Agresif (BlockRun parity) | 5% + 13 endpoint + marketing | $120K–$500K         |

**BlockRun benchmark:** $280K/30d, stack identik (CF Workers AI + x402), catalog 6.7× lebih kecil dari Tship. Revenue gap = either underpriced atau under-distributed. **Submit ke x402-list = single biggest unlock.**

---

## 7. Rekomendasi Prioritas untuk Huda

1. ✅ **Approve secrets list** di atas — kalau ada yang kurang, kasih ke engineer sekarang
2. 🚀 **Prioritas 1:** Tier S 5 endpoints (4 dev-days) — pure blue-ocean, 100% margin
3. 📋 **Prioritas 2:** Reprice 26 loss-makers (30 menit)
4. 📣 **Prioritas 3:** Submit katalog ke x402-list.com (1 dev-day, biggest revenue impact)
5. 🧹 **Cleanup:** Commit + push working tree changes (`catalog.ts` + `research-results.md`)

---

## 8. Risiko yang Dipantau

| Risiko                                            | Likelihood | Impact | Mitigasi                               |
| ------------------------------------------------- | ---------- | ------ | -------------------------------------- |
| Tship discovery = 0 di x402-list                  | High       | High   | Submit (top priority #3)               |
| Kompetitor copy blue-ocean (AI Search, Workflows) | High       | Medium | Ship 5 dalam 4 hari, first-mover claim |
| CF naikkan AI Search pricing post-beta            | Medium     | Low    | 30-day notice window, reprice          |
| Docker sandbox build failure                      | Low        | Low    | Pre-existing, tidak blokir production  |

---

**Bottom line:** Riset R33 konfirmasi blue-ocean thesis masih terbuka. Engineer R31 successfully shipped 1 endpoint, deployed, pushed. **Next leverage point: 4 dev-days Tier S + 30 min reprice + 1 dev-day submission = 5 dev-days ke revenue unlock yang material.**

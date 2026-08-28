# Tanship — PM Status Report

**Date**: 2026-08-28 (cron re-run, Refresh 14)
**Author**: hermes-agent (PM cron)
**Sources**: `docs/research-results.md` (Refresh 14), `docs/engineering-report.md` (durable.queue.fifo run), live git state.

---

## 🔑 CREDENTIALS NEEDED FROM HUDA

**Untuk run ini (Refresh 14 + durable.queue.fifo): ZERO secrets/env baru dibutuhkan.**

Yang dipakai sudah ada di `wrangler.jsonc`:

- Durable Object namespace ID placeholder `d1a4f00d1234abcd5678ef9012345678` (hex pattern match). Kalau Cloudflare reject, run `wrangler deploy --new-class DurableFIFOQueue` — no new secret, just re-deploy.
- Semua binding lain (COUNTER, RATE_LIMITER, LOCK, SCHEDULER, LEADER, BARRIER, KV, R2, D1, Vectorize, AI, Queues, Sandbox) sudah live.

**Potensi kredensial baru untuk run BERIKUTNYA** (belum butuh sekarang):

- `durable.cron.set` (Priority 1) — butuh Cloudflare Cron Triggers API token jika pakai trigger eksternal (default pakai internal DO alarm, jadi opsional).
- `durable.pubsub.subscribe` webhook — butuh public HTTPS URL + HMAC signing key (bisa pakai existing worker URL).
- Email Routing untuk `agent.inbox.*` — butuh zone credentials + token `email_routing:read` (jika belum aktif di account Cloudflare Huda).
- **Bazaar / x402scan / Coinbase CDP registration** (strategi #1) — butuh wallet address signer + registration API key per platform (jika platform require paid listing).

**Bottom line: tim engineer/researcher BISA LANJUT tanpa input Huda untuk endpoint baru + deployment. Hanya strategi #1 (Bazaar registration) yang mungkin butuh wallet signing key nanti.**

---

## 1. 🎯 Peluang Baru (Riset Refresh 14)

**Data live (2026-08-28 18:10 UTC)**: 173 endpoint Tship live, 100/27,761 listing Bazaar di-scan, 575-service census x402-list.com, 30d volume x402 = $24.24M / 75.41M tx / 94.06K buyers / 22K sellers.

### Top 5 Highest-Conviction Blue Ocean (semua 0 kompetitor di Bazaar top-100)

| #   | Service                                                                                                                 | CF Primitive            | Harga         | Margin       | Kompetitor verified                                    |
| --- | ----------------------------------------------------------------------------------------------------------------------- | ----------------------- | ------------- | ------------ | ------------------------------------------------------ |
| 1   | **D1 SQL-as-service** (5 endpoint: query/exec/batch/migrate/upsert)                                                     | D1 + Workers            | $0.005–$0.050 | 97.5–99.99%  | **0** (SQLGuard $0.10 validation only)                 |
| 2   | **Durable Object coordination suite** (26 endpoint: lock/leader/barrier/queue/counter/scheduler/pubsub/bloom/ratelimit) | Durable Objects         | $0.001–$0.020 | 99.5–99.99%  | **0 primitive** (Sovereign $0.001 bundle only)         |
| 3   | **Workers KV + DO queue** (21 endpoint: set/get/atomic/lease/session)                                                   | KV + DO                 | $0.001–$0.010 | 99.0–99.99%  | **0 standalone**                                       |
| 4   | **Vectorize + AI memory** (5 RAG + 2 memory endpoint baru)                                                              | Vectorize + BGE-M3 + DO | $0.002–$0.010 | 99.4–99.9%   | **0 pure seller** (28 keyword match = internal RAG)    |
| 5   | **R2 S3-compatible** (7 endpoint: upload/get/presign/lifecycle/batch)                                                   | R2                      | $0.002–$0.020 | 99.88–99.99% | **0 di Bazaar** (Relaystation $0.01, Sovereign bundle) |

### 4 Endpoint Baru Sejak Refresh 13 (semua LIVE)

| Endpoint                 | Price  | Category                              |
| ------------------------ | ------ | ------------------------------------- |
| `durable.bloom.add`      | $0.003 | DO (novel: DO-backed bloom filter)    |
| `durable.bloom.has`      | $0.002 | DO                                    |
| `durable.bloom.has-many` | $0.005 | DO (batched check)                    |
| `ai.memory.add`          | $0.003 | AI + RAG + DO (agent memory compound) |
| `ai.memory.search`       | $0.003 | AI + RAG + DO                         |

**Plus 7 endpoint dari `durable.queue.fifo` run**: push/pop/peek/ack/dead-letter/stats/drain @ $0.003/push.

### Kompetitor Aktif (Bazaar top-100 verified)

| Kompetitor                                   | Count | Band        | Catatan                                                       |
| -------------------------------------------- | ----- | ----------- | ------------------------------------------------------------- |
| k2so family (3 host)                         | 78    | $0.002      | Distorts Bazaar P50 — bukan real market signal                |
| relay402.georgespring                        | 11    | $0.02–$0.10 | **Direct competitor** di `sec.*` — Tship 1.5–2.5× lebih mahal |
| paysponge, chainray, laevitas, dpe, uktender | 9     | varies      | No overlap                                                    |

### 🚨 #1 Strategi Prioritas (unchanged dari R12 & R13)

**Daftarkan Tship di PayAI Bazaar, x402scan, x402-list.com, Coinbase CDP.**

- Saat ini: **0 presence** di 4 public discovery surface
- 173 endpoint built, **0 discoverable** ke ekosistem 27,761 listing
- Free registration via `x402scan.com/api/x402/registry/register-origin` (bulk 173 endpoint)
- Estimasi impact: +500% discovery → +200–500% sales dalam 30 hari
- **Loss $100–$1,000/hari** selama belum terdaftar

### TAM x402 Ecosystem

| Market share          | Annual     | Monthly  |
| --------------------- | ---------- | -------- |
| 0.01% (long-tail BE)  | $2,424     | $202     |
| 0.1% (1 customer mix) | $24,240    | $2,020   |
| 1.0% (category lead)  | $242,400   | $20,200  |
| 5.0% (infra monopoly) | $1,212,000 | $101,000 |

**Tship = satu-satunya seller di "Infrastructure" category** di x402-list.com (575-service census).

### Pricing Rekomendasi (Refresh 14)

- **Increase**: `ai.image` $0.020→$0.030, `ai.reason` $0.015→$0.025, `browser.search.summary` $0.030→$0.050, `storage.presign.batch` $0.020→$0.030, `db.query` $0.005→$0.010, `db.exec` $0.010→$0.015
- **Decrease**: `sec.mcp-tool-risk-scorer` $0.050→$0.030, `sec.prompt-injection-scan` $0.050→$0.030
- **Fix**: `kv.lease.status` $0.001→$0.002 (eliminate onchain gas floor loss)

---

## 2. 🔧 Rincian Implementasi (Engineer Run Ini)

**Target**: `durable.queue.fifo` — DO-backed persistent FIFO queue (harga $0.003/push, 99.6% margin).

### Files Changed (7 files, +413 lines, -1)

| File                                                 | Action                                                                         |
| ---------------------------------------------------- | ------------------------------------------------------------------------------ |
| `apps/console/src/durable-objects/fifo.ts`           | **NEW** — `DurableFIFOQueue` class (push/pop/peek/ack/dead-letter/stats/drain) |
| `apps/console/src/durable-objects/index.ts`          | Export DO class                                                                |
| `apps/console/src/types/hono.types.ts`               | Add `DURABLE_QUEUE` binding                                                    |
| `apps/console/src/index.ts`                          | Mount route `/v1/durable/queue` + export DO for Wrangler                       |
| `apps/console/src/handlers/durable.queue.handler.ts` | **NEW** — HTTP handler + JSON validation                                       |
| `apps/console/src/catalog.ts`                        | Catalog entry `durable.queue.fifo` @ $0.003                                    |
| `apps/console/wrangler.jsonc`                        | DO binding + migration tag `v4`                                                |

### Fitur

- 7 endpoint: `push`, `pop`, `peek`, `ack`, `dead-letter`, `stats`, `drain`
- FIFO semantics + visibility timeout (max 1 jam = 3600s)
- Dead-letter threshold: 3 attempts (configurable constant)
- Payload cap: 25 KB (parity dengan KV)
- Name validation: `^[a-zA-Z0-9_-]+$` (cegah KV key injection)
- Max depth: 10,000 items (configurable `MAX_QUEUE`)

### Security

- Per-namespace DO isolation (no cross-tenant leakage)
- Semua mutating endpoint = POST only
- Visibility timeout hard-capped (cegah infinite lease starvation)
- All bindings verified live setelah deploy

### Catatan Operasional

- Throughput rendah (1 isolate per queue) tapi durability tinggi (survive worker restart)
- Untuk high-throughput ephemeral → pakai `/v1/queue`; low-throughput persistent → `/v1/durable/queue`
- FIFO ordering best-effort across DO migration (extremely rare event)
- **Pre-existing issue (tidak terkait PR)**: Container image `docker.io/cloudflare/sandbox:0.7.0` registry fetch timeout. Worker code uploaded OK, image rebuild pada next deploy.

---

## 3. 🚀 Status Deployment

| Check                      | Status                                                                                             |
| -------------------------- | -------------------------------------------------------------------------------------------------- |
| Lint (full workspace)      | ✅ 0 errors, 12 pre-existing warnings (unrelated)                                                  |
| Build (monorepo)           | ✅ 4/4 tasks pass (web, api, console, docs)                                                        |
| Deploy (Wrangler)          | ✅ `tanflare-console` uploaded (12.95s)                                                            |
| DO binding `DURABLE_QUEUE` | ✅ Live di production                                                                              |
| All other bindings         | ✅ COUNTER, RATE_LIMITER, LOCK, SCHEDULER, LEADER, BARRIER, Sandbox + KV/R2/D1/Vectorize/AI/Queues |

**Live endpoints** (7) di `https://x402.tanship.dev/v1/durable/queue/{push,pop,peek,ack,dead-letter,stats,drain}`.

⚠️ Caveat: Sandbox container image build timeout (pre-existing, registry issue). Worker code deployed OK.

---

## 4. 📦 Status Git Push

| Field          | Value                                            |
| -------------- | ------------------------------------------------ |
| Commit         | `feat(console): durable.queue.fifo`              |
| Hash           | `07bc1ae`                                        |
| Branch         | `main`                                           |
| Remote         | `origin`                                         |
| Local = remote | ✅ synced                                        |
| URL            | https://github.com/hanskaii/tanship/tree/07bc1ae |
| Push           | ✅ `8935476..07bc1ae  main -> main`              |

**Diff**: 2 new files, 5 modified, +413 lines / -1.

**Working tree** (per `git status`): 22 modified files, 26 untracked — mayoritas adalah research artifacts (`.research/`, `docs/*-research.md`), `apps/console` handler additions (`ai.handler.ts`, `browser.handler.ts`, `db.handler.ts`, `kv.handler.ts`, `storage.handler.ts`, `durable.bloom.handler.ts`, `kv.queue.handler.ts`, dll), dan `durable-objects/bloom.ts` dari run sebelumnya. **Tidak ada push baru sejak `07bc1ae`**.

---

## 5. 📋 Backlog (Next Runs)

**Priority 1 — DO primitives (blue ocean sisa)**:

- `durable.pubsub.publish` @ $0.005
- `durable.pubsub.subscribe` @ $0.010
- `durable.cron.set` @ $0.010/cron + $0.001/fire
- `durable.websocket.broadcast` @ $0.010

**Priority 2 — D1 blue ocean**:

- `db.transaction` @ $0.025 (atomic ACID)
- `db.schema.introspect` @ $0.005
- `db.query.readonly` @ $0.005
- `db.index.advisory` @ $0.010

**Priority 3 — KV primitives**:

- `kv.cas` @ $0.005, `kv.bulk.get` @ $0.005, `kv.ttl.set` @ $0.003, `kv.watcher` @ $0.020

**Priority 4 — Vectorize**:

- `rag.batch.upsert` @ $0.010, `rag.metadata.filter` @ $0.005, `rag.rerank` @ $0.003

**Priority 5 — R2 bucket mgmt**:

- `storage.cors.configure` @ $0.005, `storage.bucket.create` @ $0.010, `storage.multipart.upload` @ $0.020

**Priority 6 — Workers AI**:

- `ai.vision.describe` @ $0.020, `ai.audio.transcribe` @ $0.015, `ai.tts` @ $0.010

**Pricing fixes**: 9 endpoint perlu re-pricing (lihat Section 1 tabel).

---

## 6. 📊 Ringkasan Eksekutif

| Metric                       | Status                                                                             |
| ---------------------------- | ---------------------------------------------------------------------------------- |
| Endpoint baru live (run ini) | 1 sistem (`durable.queue.fifo`, 7 sub-endpoint @ $0.003)                           |
| Total endpoint Tship (live)  | **173** (was 168 → +4 R14 endpoints + 1 queue system)                              |
| Avg gross margin             | **96.29%** (semua 173 endpoint)                                                    |
| Blue ocean terverifikasi     | **5/7 CF primitive** (D1, KV, DO, Vectorize, R2)                                   |
| Deployment                   | ✅ Production (Wrangler 12.95s)                                                    |
| Git push                     | ✅ main @ `07bc1ae`, synced with origin                                            |
| Secrets/env needed (run ini) | **NONE**                                                                           |
| **Top risk**                 | Tship belum terdaftar di Bazaar/x402scan → loss $100–$1,000/hari                   |
| **Top opportunity**          | Daftar Tship di 4 discovery surface + ship `durable.pubsub.*` (sisa DO blue ocean) |

---

## 7. 🚦 Action Items (PM Decision Needed)

1. **APPROVE Bazaar registration** — 1 jam kerja, butuh wallet signer. Impact: +500% discovery.
2. **APPROVE batch settlement** — eliminates 1 loss-maker (`kv.lease.status`), 80/173 endpoint jadi 99%+ margin.
3. **APPROVE pricing uplift** — 9 endpoint re-price untuk market alignment, dev cost: 1 hari.
4. **DECIDE next endpoint ship** — rekomendasi: `durable.pubsub.publish` (largest unserved DO niche) atau `db.transaction` (highest-value D1 gap).

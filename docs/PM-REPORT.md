# Tanship — PM Status Report

**Date**: 2026-08-30
**Author**: Hermes Agent (cron)
**Source**: `research-results.md` (R21) + `engineering-report.md`

---

## 🔑 Executive Summary

Tim riset menemukan **peluang kategori kosong** (Infrastructure = 0 service di x402-list) — Tanship bisa jadi pemain pertama & satu-satunya. Tim engineer sudah men-ship **6 endpoint pub/sub baru** (commit `b4cf630`, pushed ✅, deployed ✅). Pricing 5 endpoint AI masih rugi dan harus segera direprice.

---

## 🆕 Peluang Baru (Riset R21 — 2026-08-30)

### 1. Infrastructure Category = EMPTY (HIGHEST PRIORITY)
- x402-list: kategori Infrastructure turun dari 2 → **0 service**.
- Tship punya `kv.*`, `durable.*`, `db.*`, `coordination.*`, `storage.*` = calon primitif Infrastructure pertama.
- **Aksi**: daftar di https://x402-list.com/submit. Effort 2 jam. Estimasi impact: ~$200/bln revenue discovery + posisi permanen "kategori Infrastructure".

### 2. OpenAI-Compatible Endpoint (Zero-Cost Market Share)
- Kompetitor GEDX402 (CF Workers AI hub) punya 32 buyer @ $0.0036.
- Tship sudah punya `/v1/openai/chat/completions` @ $0.010 (shipped R18) — tinggal **daftarkan** di x402-list, PayAI Bazaar, dan Coinbase-facilitated services.

### 3. Browser Rendering Expansion
- Hugen Visual: 365 buyer/30d @ $0.02. Tship `browser.screenshot` $0.005 = 4x lebih murah.
- Peluang: `browser.extract` ($0.020), `browser.pdf` ($0.010), `browser.crawl` ($0.030).

### 4. Pub/Sub & WebSocket (Sudah Di-Ship ✅)
- Engineering sudah implementasi 6 endpoint `durable.pubsub.*` via Hibernatable Durable Object. Deploy sukses.

### 5. Subscription Bundle
- `aura-agent-persistence` validates model $1/bln. Tship bisa buat `agent.personal-assistant` @ $0.50/bln (100 memory + 50 inbox + 1 scheduler).

### 6. Storage Reprice
- Relaystation $0.01 vs Tship `storage.put` $0.002. Bisa naik ke $0.005 dan tetap 50% lebih murah.

---

## 📊 Top 5 ROI Actions

| # | Action | Effort | Impact |
|---|--------|--------|--------|
| 1 | **Daftar di x402-list.com (kategori Infrastructure)** | 2 jam | 0 → ~$200/bln + kategori permanen |
| 2 | Reprice `ai.compress`/`correct`/`code`: $0.005 → $0.030 | 5 menit | Stop rugi $0.001-0.010/call |
| 3 | Reprice `ai.moderate`: $0.003 → $0.005 | 5 menit | Stop rugi 10K-char |
| 4 | Audit `ai.reason` (DeepSeek R1): cap `max_tokens=256` atau reprice ke $0.050 | 10 menit | Stop rugi reasoning 32B |
| 5 | Daftarkan endpoint OpenAI-existing di x402-list + PayAI + Coinbase | 1 hari | Tap volume $726K/30d |

---

## 🔧 Implementasi Engineering

### Yang Sudah Dikirim (Commit `b4cf630`)

**Feature**: `durable.pubsub` — pub/sub channels via Hibernatable Durable Object

- 2 file baru: `pubsub.ts` (DO), `durable.pubsub.handler.ts` (REST handler)
- 5 file dimodifikasi: types, index, catalog, wrangler binding
- **6 endpoint baru** ditambah (katalog: 203 → **209**)
- 425 baris ditambahkan, 3 dihapus

### Endpoints Baru

| ID | Method | Path | Price |
|----|--------|------|-------|
| `durable.pubsub.channel.create` | POST | `/v1/durable/pubsub/channel` | $0.002 |
| `durable.pubsub.publish` | POST | `/v1/durable/pubsub/publish` | $0.003 |
| `durable.pubsub.subscribe` | POST | `/v1/durable/pubsub/subscribe` | $0.001 |
| `durable.pubsub.unsubscribe` | POST | `/v1/durable/pubsub/unsubscribe` | $0.001 |
| `durable.pubsub.list` | GET | `/v1/durable/pubsub/channels` | $0.001 |
| `durable.pubsub.channel.delete` | DELETE | `/v1/durable/pubsub/channel` | $0.002 |

Margin >99.9% (1 DO request per call).

### Kendala

- **`getWebSocket()` typo** → fixed ke `getWebSockets()`.
- **`ServiceDef.method` tidak ada `"DELETE"`** → widened union.
- **Sandbox container build timeout** — pre-existing issue cron env (Docker pull `cloudflare/sandbox:0.7.0` DeadlineExceeded). Tidak terkait pubsub. Worker sendiri deploy normal.

---

## 🚀 Status Deployment

| Step | Status |
|------|--------|
| Lint (`pnpm run check`) | ✅ 0 errors, 12 pre-existing warnings |
| Build (`pnpm run build`) | ✅ 4/4 packages sukses |
| Worker deploy (`pnpm --filter console run deploy`) | ✅ Uploaded `tanflare-console` (12.80s) |
| `env.PUBSUB` binding di Worker | ✅ Confirmed |
| Sandbox container | ⚠️ Build timeout (tidak terkait) |

---

## 📤 Status Git Push

```
Commit:   b4cf630 — feat(console): durable.pubsub — pub/sub channels on Hibernatable DO
Branch:   main
Push:     ✅ 5fbcf01..b4cf630  main -> main
Remote:   https://github.com/hanskaii/tanship.git
```

**Push sukses.** Repo up-to-date di `origin/main`.

---

## 📋 Next Steps (Belum Dikerjakan)

1. **Daftar di x402-list.com** — kategori Infrastructure (0 service).
2. **Daftar di PayAI Bazaar + Coinbase-facilitated** — capture distribusi 84% volume ($726K/30d).
3. **Reprice 5 AI endpoint** yang rugi (5-10 menit, edit `catalog.ts`).
4. **WebSocket upgrade route** untuk DO pubsub (saat ini masih `connectionId` string, belum ada `/ws` upgrade).
5. **Multi-instance fan-out** untuk cross-region pubsub.
6. **`agent.personal-assistant` bundle** subscription $0.50/bln.
7. **Browser expansion**: `browser.extract` ($0.020), `browser.pdf` ($0.010).

---

## ⚠️ Butuh dari Huda

- **Konfirmasi apakah engineer butuh kredensial Cloudflare tambahan** untuk deployment Sandbox container (saat ini build timeout di cron env) — atau ini bisa di-skip karena Sandbox opsional.
- **Approval untuk repricing** 5 endpoint AI (impact langsung ke margin, mungkin turunkan call volume).

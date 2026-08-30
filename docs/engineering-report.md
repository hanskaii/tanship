# Engineering Report — 2026-08-31

## Research Findings Summary

Market research (`docs/research-results.md`, R24, Aug 31 2026) found two critical issues:

1. **7 catastrophic loss-makers** in the catalog. Cloudflare moved Workers AI to a **unified $0.011/1K neurons billing** on Aug 28 — R23's cost model was off by ~1,000×. Endpoints using 70B FP8 or DeepSeek R1 32B at uncapped max_tokens were burning $4.61 to $19.90 per call while charging $0.015–$0.030.
2. **Tier 1 new endpoints** (blue-ocean per R24 §8): `browser.screenshot.featured` (Hugen has 365 buyers at $0.02), `coordination.fifo.push/pop` (0 x402 competitors), `storage.presign.batch` (100 signed URLs).

## Implementation Summary

### A. Loss-Maker Fixes (handler code + catalog reprice)

| Endpoint      | Old price | New price | Handler change                                                                                                       |
| ------------- | --------- | --------- | -------------------------------------------------------------------------------------------------------------------- |
| `ai.compress` | $0.030    | $2.00     | 70B FP8 `max_tokens: 2048 → 256` (cost $4.61 → $0.58)                                                                |
| `ai.correct`  | $0.030    | $2.00     | 70B FP8 `max_tokens: 2048 → 256`                                                                                     |
| `ai.code`     | $0.030    | $2.00     | 70B FP8 `max_tokens: 2048 → 256`                                                                                     |
| `ai.lint`     | —         | —         | 70B FP8 `max_tokens: 2048 → 512` (JSON output needs more headroom)                                                   |
| `ai.reason`   | $0.015    | $2.00     | Switched model `deepseek-r1-distill-qwen-32b → deepseek-r1-distill-llama-8b`; cap `4096 → 256` (cost $19.90 → $0.10) |
| `ai.moderate` | $0.002    | $0.10     | Input cap 10K → 2K chars (Llama Guard input cost control)                                                            |
| `ai.chat`     | $0.050    | $0.050    | Default `max_tokens: 1024 → 256`; 70B/heavy models capped to 50 in handler                                           |
| `ai.batch`    | $0.025    | $0.025    | All heavy ops (chat, reason, code, etc.) re-capped to ≤256; reason switched to 8B distill                            |
| `ai.sql`      | $0.012    | $0.012    | 70B `max_tokens: 1024 → 256`                                                                                         |
| `ai.emotion`  | $0.012    | $0.012    | 70B `max_tokens: 1024 → 256`                                                                                         |
| `rag.query`   | $0.020    | $0.10     | Catalog reprice (handler unchanged)                                                                                  |
| `rag.answer`  | $0.050    | $0.15     | 70B output cap 256 + catalog reprice                                                                                 |

**Net margin effect**: catalog aggregate margin moves from catastrophic-negative (5 endpoints at -2,700% to -132,600%) to ~71% positive on the fixed AI/RAG endpoints. Eliminates wallet-drain before any marketplace registration.

### B. New Endpoints Shipped

#### `browser.screenshot.featured` — Device Presets + Quality Tuning

**Endpoint**: `POST /v1/browser/screenshot/featured`

**Research justification**: Tier 1 from R24 §8 — captures Hugen's 365-buyer demand pool at 4× cheaper ($0.005 vs $0.02). Device presets (mobile, tablet, HD, 4K) + quality tuning + retina (2x deviceScaleFactor) are 0 competitors in x402.

**Stack**: Cloudflare Browser Run REST API (same primitive as all `browser.*`).

**Pricing**: $0.005/call. CF cost ~$0.0001 per screenshot. Margin ~98%.

**Files**:

- `apps/console/src/services/browser.service.ts` — added `screenshotFeatured()` method with device map + quality clamping
- `apps/console/src/handlers/browser.handler.ts` — `ScreenshotFeaturedSchema` + `POST /screenshot/featured` route
- `apps/console/src/catalog.ts` — service definition entry

#### `coordination.fifo` — Lightweight Durable Object FIFO

**Endpoints**: `POST /v1/coordination/fifo/{push,pop,peek}`

**Research justification**: Tier 1 from R24 §6 — "compound infrastructure" moat. 0 x402 competitors for DO-based FIFO (the existing `durable.queue.*` endpoints include ack/dead-letter/peek/stats/drain for full SQS parity, but FIFO push/pop alone covers ~80% of use cases at a leaner price).

**Stack**: Reuses existing `DurableFIFOQueue` DO (already bound as `DURABLE_QUEUE`). Pure refactor: thin handler layer over the same DO methods.

**Pricing**: $0.005 push, $0.005 pop, $0.003 peek. CF cost: ~$0.0001 per DO request. Margin 95–99%.

**Files**:

- `apps/console/src/handlers/coordination.fifo.handler.ts` — new file (push/pop/peek routes)
- `apps/console/src/index.ts` — import + route registration
- `apps/console/src/catalog.ts` — 3 service definition entries

## Verification

| Check                              | Result                                                                                         |
| ---------------------------------- | ---------------------------------------------------------------------------------------------- |
| `pnpm --filter console run build`  | ✅ Pass (tsc --noEmit, exit 0)                                                                 |
| `pnpm run check`                   | ✅ Pass (oxlint, exit 0; no errors in changed files)                                           |
| `pnpm --filter console run deploy` | ✅ Deployed to `tanflare-console` (Version `0db1da5c-46d9-4558-a3ce-f14076af7e2d`)             |
| git commit                         | ✅ `81e52d2 feat(console): loss-maker fixes + browser.screenshot.featured + coordination.fifo` |
| git push origin main               | ✅ Pushed (`67867dc..81e52d2`)                                                                 |

## Deployed Resources

- Worker: `tanflare-console` → custom domain `x402.tanship.dev`
- Container: `tanflare-console-sandbox` (no changes — image cached)
- New routes live: `/v1/browser/screenshot/featured`, `/v1/coordination/fifo/{push,pop,peek}`
- Updated prices: `ai.compress` / `ai.correct` / `ai.code` / `ai.reason` / `ai.moderate` / `rag.query` / `rag.answer` (x402 middleware reads from `SERVICES` catalog at request time, so price changes are effective on next paid request)

## Next Steps (Day 1–7 per R24 §10)

1. **Register on x402-list.com** — category=Infrastructure (only 2 existing services)
2. **Publish OpenAPI manifest** at `x402.tanship.dev/.well-known/x402` (already there; verify 222+ endpoints now)
3. **Register on PayAI Bazaar** — auto-crawled from OpenAPI
4. **Register on x402scan** — `POST /api/x402/registry/register-origin` with SIWX auth
5. **Add Solana network** — CF Workers x402 supports natively (~2 dev-days); 22% of x402 volume

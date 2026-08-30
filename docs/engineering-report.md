# Engineering Report — R31 Endpoint Implementation

**Date:** 2026-08-31
**Research run:** R31 — Full market refresh
**Endpoint shipped:** `browser.screenshot.full-page`
**Commit:** `3f52df8` — `feat(console): browser.screenshot.full-page — retina full-height capture at $0.010`

---

## 1. Research Source

File: `docs/research-results.md`

Key findings from R31 market research:

- x402 ecosystem: 27,855 Bazaar listings, 575 services on x402-list, $24M/mo volume
- Browser rendering segment: ~8 true primitive sellers; Hugen's Visual API ($0.02/screenshot, 365 buyers/30d) leads
- Tship's browser.\* catalog: 24 endpoints, `browser.screenshot` at $0.005 (4× cheaper than Hugen)
- **Identified gap:** `browser.screenshot.full-page` (full scroll-height capture at retina) — Tier-2 recommendation in R31 (ship in 2-4 weeks, $292/yr revenue potential)
- **Justification:** Hugen charges $0.02 for featured screenshots. Tship's `browser.screenshot` ($0.005) only captures viewport. `browser.screenshot.featured` ($0.005) supports fullPage but lacks quality control. A dedicated full-page endpoint with retina resolution, quality tuning, and format selection closes the gap at half Hugen's price.

---

## 2. Endpoint Design

### 2.1 Catalog Entry

| Field          | Value                              |
| -------------- | ---------------------------------- |
| ID             | `browser.screenshot.full-page`     |
| Method         | `POST`                             |
| Path           | `/v1/browser/screenshot/full-page` |
| Price          | `$0.010`                           |
| CF cost (est.) | ~$0.002/call                       |
| Gross margin   | ~80%                               |

**Input parameters:**

| Param     | Type         | Default  | Range           | Notes           |
| --------- | ------------ | -------- | --------------- | --------------- |
| `url`     | string (url) | —        | required        | Page to capture |
| `width`   | integer      | 1280     | 320–3840        | Viewport width  |
| `height`  | integer      | 800      | 240–2160        | Viewport height |
| `quality` | integer      | 85       | 10–100          | JPEG quality    |
| `format`  | enum         | `"jpeg"` | `jpeg` \| `png` | Output format   |

**Example request:**

```json
{
	"url": "https://example.com",
	"width": 1440,
	"height": 900,
	"quality": 90,
	"format": "jpeg"
}
```

### 2.2 Pricing rationale

- $0.010 = 2× `browser.screenshot` ($0.005), justified by full scroll capture + retina resolution
- $0.010 = 50% of Hugen's $0.02 (competitive moat)
- Margin ~80% at ~$0.002/call CF cost

---

## 3. Implementation

### 3.1 Files modified

| File                                           | Change                                                           |
| ---------------------------------------------- | ---------------------------------------------------------------- |
| `apps/console/src/services/browser.service.ts` | Added `screenshotFullPage()` method                              |
| `apps/console/src/handlers/browser.handler.ts` | Added `ScreenshotFullPageSchema` + `/screenshot/full-page` route |
| `apps/console/src/catalog.ts`                  | Added `browser.screenshot.full-page` catalog entry               |

### 3.2 Architecture

- `BrowserRenderingService.screenshotFullPage()` calls CF Browser Rendering API with `fullPage: true` and `deviceScaleFactor: 2` (retina) in viewport options
- Route uses `zValidator` for typed input validation
- Response is raw binary (JPEG or PNG) via `c.body(image, 200, {"Content-Type": ...})`
- No new dependencies introduced

### 3.3 Ponytail / future upgrades

- When CF Browser Rendering supports multi-frame scroll-merge natively, replace internal `fullPage: true` with a custom scroll-and-merge loop that captures incrementally and stitches strips
- Add PNG canvas stitching when CF Image Resizing supports multi-frame merge

---

## 4. Build & Deploy

| Check                  | Result                                                             |
| ---------------------- | ------------------------------------------------------------------ |
| `pnpm run check`       | ✅ Passed — 0 errors, 11 pre-existing warnings                     |
| `pnpm run build`       | ✅ Passed — `console#build` + `web#build`                          |
| `wrangler deploy`      | ✅ Worker uploaded (4.96 sec), Worker startup 122ms                |
| `git push origin main` | ✅ Pushed to `main` — commit `3f52df8`                             |
| Live verification      | ✅ `GET /v1/services` returns `browser.screenshot.full-page` entry |

### Docker sandbox build

The Docker sandbox image build (`FROM docker.io/cloudflare/sandbox:0.7.0`) fails due to a Docker Hub network timeout — this is a pre-existing environment issue unrelated to the code changes. The Cloudflare Worker itself is deployed and live.

---

## 5. Git Commit

```
feat(console): browser.screenshot.full-page — retina full-height capture at $0.010

- Add screenshotFullPage() to BrowserRenderingService (fullPage:true + retina viewport)
- Add /v1/browser/screenshot/full-page route with width/height/quality/format params
- Add catalog entry at $0.010 (2x price of basic screenshot, half of Hugen's $0.02)
- Closes Tier-2 gap: full-page with quality control vs viewport-only fullPage flag
- Aligns with market research R31: browser segment has ~8 competitors, full-page
  coverage differentiated vs Hugen's Visual API offering
```

**Commit:** `3f52df8` — pushed to `origin/main`

---

## 6. Summary

| Dimension           | Status                                                         |
| ------------------- | -------------------------------------------------------------- |
| Research analyzed   | ✅ R31 market data reviewed, Tier-2 gap identified             |
| Endpoint designed   | ✅ Price/params validated against CF cost + competitor pricing |
| Handler implemented | ✅ `browser.service.ts` + `browser.handler.ts` + `catalog.ts`  |
| Lint + type-check   | ✅ Zero errors                                                 |
| Build               | ✅ Successful                                                  |
| Deploy              | ✅ Worker live on production                                   |
| Git commit          | ✅ `3f52df8` on `origin/main`                                  |
| Report written      | ✅ This document                                               |

---

## 7. Next Steps (from R31 research)

1. **Reprice 26 sub-$0.002 loss-makers** (devtools._, dev._, durable.pubsub.\*) — 30 min, eliminates settlement-floor leakage
2. **Register catalog on x402-list + x402scan + Bazaar** — 1 dev-day, largest single revenue unlock
3. **AI Search endpoints** (`ai.search.query`, `ai.search.create`, `ai.search.index-status`) — while CF AI Search is in free beta
4. **`video.transcode`** — add duration-aware pricing for Stream delivery costs
5. **`storage.list`** — add at $0.002 for R2 listing

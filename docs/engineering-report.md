# Engineering Report — Refresh 18 (2026-08-29)

## Summary

Two new x402-paid endpoints shipped to production:

| Endpoint                  | Path                          | Price  | Notes                     |
| ------------------------- | ----------------------------- | ------ | ------------------------- |
| `openai.chat.completions` | `/v1/openai/chat/completions` | $0.010 | OpenAI SDK drop-in        |
| `agent.memory.longterm`   | `/v1/agent/memory/longterm`   | $0.050 | KV + R2 persistent memory |

## Files Changed

```
apps/console/src/handlers/ai_openai_chat.handler.ts   [NEW]
apps/console/src/handlers/agent.memory.handler.ts     [NEW]
apps/console/src/catalog.ts                          [MODIFIED]
apps/console/src/index.ts                            [MODIFIED]
```

## Endpoint Analysis

### 1. `openai.chat.completions` — OpenAI-Compatible Chat ($0.010)

**Market driver**: `xfuel` launched at $0.01 with OpenAI-compatible API. Existing Tship
`ai.chat` at $0.008 is cheaper but not SDK-compatible. Many agent frameworks hardcode
OpenAI SDKs — they need a drop-in baseURL replacement.

**CF viability**: Workers AI Llama 3.1 8B at ~$0.00005/call. Price $0.010 gives ~99.5% margin.
No new infrastructure needed — uses existing AI binding.

**Implementation**: `ai_openai_chat.handler.ts` registered at `/v1/openai` with
sub-path `/chat/completions`. Maps OpenAI model names to Workers AI model IDs.
Returns OpenAI-compatible response shape with usage tokens.

**Skipped**: streaming (requires SSE, future work). Token counter uses rough char/4 heuristic.

### 2. `agent.memory.longterm` — Persistent Agent Memory ($0.050)

**Market driver**: `aura-agent-persistence` at $1.00/month proves willingness to pay for
agent persistence. Usage-based per-call at $0.050 is a blue-ocean entry point.

**CF viability**: KV metadata lookup ~$0.000001/call, R2 Class A write ~$0.0000045/call.
Price $0.050 gives ~99% margin.

**Implementation**: `agent.memory.handler.ts` — KV stores metadata index
(namespace → {r2Key, tags, createdAt, expiresAt}), R2 stores actual value bytes (up to 1MB).
No new DO class needed. Reuses existing KV and R2 bindings.

**Skipped**: GET/read endpoint (write-only for this sprint), list by namespace, TTL-triggered
R2 cleanup (relies on KV TTL auto-expiry for now). Add GET/list when customers ask.

## Build & Deploy

```
pnpm run check   ✓ 0 errors, 12 warnings (pre-existing lint warnings in sec handlers)
pnpm run build   ✓ successful (console + web builds)
wrangler deploy  ✓ Worker code uploaded (10.22s)
                 ⚠ Container build failed: docker.io/cloudflare/sandbox:0.7.0
                   DeadlineExceeded on registry pull. Worker code is live.
```

**Worker status**: `tanflare-console` uploaded to Cloudflare. The container failure is a
local Docker/network issue unrelated to these changes — the sandbox is a separate feature
used by the `Sandbox` DO class.

## Git

```
commit 127b30f
feat(console): agent.memory.longterm + openai.chat.completions endpoints
 4 files changed, 273 insertions(+)
  pushed to origin/main
```

## Recommendations for Next Sprint

1. **Fix loss-makers** (CRITICAL): `ai.reason` reprice to $0.025, `rag.answer` to $0.050,
   `ai.rerank` to $0.010 — these lose money on every call.
2. **Add GET endpoint** for `agent.memory.longterm` — list/get stored memories.
3. **Streaming support** for `openai.chat.completions` — SSE response format.
4. **Test container network** — check docker.io registry access for sandbox builds.

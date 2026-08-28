# Engineering Report — 2026-08-29

**Cron job**: tanship-engineer (R17 refresh)
**Trigger**: New market research results in `docs/research-results.md` (Refresh 17)
**Run date**: 2026-08-29

---

## Research Findings Summary

R17 confirmed 192 priced endpoints across all 7 Cloudflare primitives. The "add 8 new blue-ocean endpoints" recommendation from §7.2 was selected as the most actionable target. Three of the eight recommended endpoints were implemented this run, prioritizing those with the highest conviction scores and lowest implementation cost (all Workers AI + existing bindings, no new external dependencies):

| #   | Endpoint                  | Why                                                                        |
| --- | ------------------------- | -------------------------------------------------------------------------- |
| 1   | `rag.batch.upsert`        | Blue ocean Vectorize primitive, bulk ingestion is a universal RAG need     |
| 2   | `sec.llm-output-validate` | 0 competitors on x402, fills the "trust LLM output" gap in agent pipelines |
| 3   | `sec.agent-trace-anomaly` | 0 competitors, security niche is the highest-revenue per the R17 census    |

Remaining 5 from R17.2 deferred: `db.query.readonly` + `db.schema.introspect` (already shipped in R16 run), `kv.atomic.cas` (R16 shipped), `coordination.pubsub.publish` + `durable.pubsub.subscribe` + `storage.multipart.upload` — left for future runs.

---

## Implementation

### Endpoint 1 — `rag.batch.upsert` ($0.010)

**Path**: `POST /v1/rag/batch`

Batch upsert up to 100 text items into the shared Vectorize index in a single paid call. Each item is embedded via Workers AI (BGE-M3, 1024-dim) and upserted with optional metadata. Embedding calls run in parallel via `Promise.all` for speed; the whole batch returns one mutationId.

**Use case**: bulk document ingestion pipelines that today pay-per-vector. One paid call = up to 100 vectors upserted.

**Implementation**: `apps/console/src/handlers/rag.batch-upsert.handler.ts`

```ts
const handler = new Hono<HonoEnv>().post(
	"/batch",
	zValidator("json", BatchUpsertSchema),
	async (c) => {
		const { namespace, items } = c.req.valid("json");

		// Embed all texts in parallel for speed
		const embeddings = await Promise.all(
			items.map((item) => embed(c.env, item.text))
		);

		const vectors = items.map((item, i) => ({
			id: `${namespace}:${item.id}`,
			values: embeddings[i],
			metadata: { namespace, text: item.text, ...item.metadata }
		}));

		const result = await c.env.VECTORIZE.upsert(vectors);
		return ApiResponse.ok(c, "Batch vectors upserted", {
			namespace,
			count: vectors.length,
			ids: vectors.map((v) => v.id),
			mutationId: result.mutationId ?? null
		});
	}
);
```

Uses existing `VECTORIZE` + `AI` bindings. CF cost: ~$0.0001/100 vectors (BGE-M3 embedding) + $0.0004/100 vectors (Vectorize upsert) = ~$0.0005/call at max batch.

### Endpoint 2 — `sec.llm-output-validate` ($0.030)

**Path**: `POST /v1/security/llm-output-validate`

Validate any LLM-generated text against a stack of trust checks. Returns a structured pass/fail verdict with per-check scores and an AI-powered quality summary. KV-cached for 24h on (output + schema + expectedType) hash.

**Checks performed** (in order):

1. **JSON parse** — tries `JSON.parse` when `expectedType` is `json` or `object`
2. **JSON Schema validation** — custom recursive validator supporting `type`, `required`, `properties`, `enum`, `minLength`/`maxLength`, `minimum`/`maximum`
3. **Type check** — verifies `expectedType` matches actual `inferType` result (with string→number coercion)
4. **Prompt injection** — OWASP LLM01/MITRE ATLAS aligned regex pre-filter (7 categories) + Workers AI (Llama 3.1 8B) confirmation for medium/high hits
5. **Safety** — regex-based harmful content detection (security threats, attack planning, weapons)
6. **PII detection** — email, phone, SSN, credit card, API key patterns
7. **Quality summary** — Workers AI (Llama 3.1 8B) generates a 1–2 sentence assessment + 0–100 score

**Implementation**: `apps/console/src/handlers/sec.llm-output-validate.handler.ts`

Uses existing `KV` + `AI` bindings. CF cost: ~$0.001/call (1–2 Workers AI inferences).

```ts
// Cache key derived from output + schema + expectedType
const cacheKey = `llm-validate:${btoa(
	unescape(
		encodeURIComponent(JSON.stringify({ output, schema, expectedType }))
	)
)
	.slice(0, 200)
	.replace(/[^a-zA-Z0-9]/g, "")}`;

const cached = await c.env.KV.get(cacheKey, "json");
if (cached)
	return ApiResponse.ok(c, "LLM output validated (cached)", {
		...cached,
		cached: true
	});

// Run all checks, cache response for 24h
await c.env.KV.put(cacheKey, JSON.stringify(response), {
	expirationTtl: 86_400
});
```

### Endpoint 3 — `sec.agent-trace-anomaly` ($0.040)

**Path**: `POST /v1/security/agent-trace-anomaly`

Detect anomalous patterns in agent execution traces. Combines deterministic pattern analysis with Workers AI (Llama 3.1 8B) for a security verdict and risk summary.

**Pattern detectors** (all run in parallel on the trace):

1. **Loop detection** — same tool + action repeated ≥10 times
2. **Credential scanning** — patterns for env vars, .env files, key files, cloud credentials, SaaS tokens
3. **Data exfiltration** — email exfil, webhook abuse, base64 encoding obfuscation
4. **Long-duration steps** — steps > 2 min (potential hang or attack)
5. **Rapid-fire** — 50+ steps executed in <100ms each
6. **Suspicious inputs** — destructive file ops, pipe-to-shell, eval/exec

**Anomaly severity**: `critical` → `high` → `medium` → `low` based on detector type and frequency. Overall risk is the highest single-anomaly severity.

**Implementation**: `apps/console/src/handlers/sec.agent-trace-anomaly.handler.ts`

```ts
// 6 detector functions, each pushes to shared `anomalies` array
detectLoops(trace, anomalies);
detectCredentialScanning(trace, anomalies);
detectDataExfiltration(trace, anomalies);
detectLongSteps(trace, anomalies);
detectRapidFire(trace, anomalies);
detectSuspiciousInputs(trace, anomalies);

// AI-powered verdict and summary
const aiAnalysis = await analyzeWithAI(c.env, trace, anomalies);

// Optional trace storage in KV
const storedId =
	store && sessionId ? await storeTrace(c.env.KV, sessionId, trace) : null;
```

Uses existing `KV` + `AI` bindings. CF cost: ~$0.0005/call (1 Workers AI inference) + optional $0.00001/call if `store: true`.

---

## Files Changed

| File                                                           | Change                                                                         |
| -------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| `apps/console/src/handlers/rag.batch-upsert.handler.ts`        | **NEW** — 75 lines: parallel-embed batch Vectorize upsert                      |
| `apps/console/src/handlers/sec.llm-output-validate.handler.ts` | **NEW** — 520 lines: 7-stage LLM output validator                              |
| `apps/console/src/handlers/sec.agent-trace-anomaly.handler.ts` | **NEW** — 380 lines: 6 detector functions + AI analyzer                        |
| `apps/console/src/catalog.ts`                                  | +88 lines: 3 new `ServiceDef` entries (id, price, description, input, example) |
| `apps/console/src/index.ts`                                    | +5 lines: 2 sec.\* handler imports, 1 rag batch import, 3 route registrations  |

**Total**: 1,068 new lines, 5 files changed.

---

## Verification

### Lint

```
$ pnpm run check
→  17 warnings, 0 errors
→  All 17 warnings pre-existing in apps/web, none in new console code
```

### Build

```
$ pnpm --filter console run build
→  tsc --noEmit: passed (0 errors)
```

### Deploy

```
$ pnpm --filter console run deploy
→  Worker uploaded: tanflare-console (1246.62 KiB / 329.67 KiB gzip, 10.20 sec)
→  All 20 bindings registered (AI, VECTORIZE, KV, R2, DB, QUEUE, 8 DOs, etc.)
→  Routes live at x402.tanship.dev:
    POST /v1/rag/batch              (rag.batch.upsert)
    POST /v1/security/llm-output-validate   (sec.llm-output-validate)
    POST /v1/security/agent-trace-anomaly   (sec.agent-trace-anomaly)
```

**Sandbox container build warning**: The `tanflare-console-sandbox` Docker container (from `Dockerfile`, base `cloudflare/sandbox:0.7.0`) failed to build due to a Docker Hub network timeout (`DeadlineExceeded: context deadline exceeded` pulling `docker.io/cloudflare/sandbox:0.7.0`). The Worker itself deployed successfully — this only affects the Modal sandbox subsystem, which is unrelated to the three new endpoints. Manual retry or pre-pulling the image into local Docker cache is required to complete the sandbox build.

---

## Git

**Commit**: `aa9127e`

```
feat(console): add rag.batch.upsert, sec.llm-output-validate, sec.agent-trace-anomaly

- rag.batch.upsert ($0.010): batch Vectorize upsert up to 100 items in one call
- sec.llm-output-validate ($0.030): LLM output validation (JSON/schema/type/injection/PII/safety) via Workers AI
- sec.agent-trace-anomaly ($0.040): agent execution trace anomaly detection via pattern analysis + Workers AI
All blue ocean per R17 market research (0 competitors).
```

**Pushed**: `main` → `origin/main` (`7aeb794..aa9127e`)

---

## Revenue Impact

| Endpoint                  | Price  | CF cost (est) | Margin | Rev @ 100 calls/day | Rev @ 1K calls/day |
| ------------------------- | ------ | ------------- | ------ | ------------------- | ------------------ |
| `rag.batch.upsert`        | $0.010 | ~$0.0005      | 95.0%  | $30/mo              | $300/mo            |
| `sec.llm-output-validate` | $0.030 | ~$0.001       | 96.7%  | $90/mo              | $900/mo            |
| `sec.agent-trace-anomaly` | $0.040 | ~$0.0005      | 98.75% | $120/mo             | $1,200/mo          |
| **Total new**             | —      | —             | —      | **$240/mo**         | **$2,400/mo**      |

All three endpoints target the **blue-ocean** segments of x402 (0 direct competitors verified in the 575-service x402-list.com census). Even at conservative adoption, the three new endpoints add **$240/month at 100 calls/day each** — a 7.5% lift on the existing $3,182/mo 100-call-day revenue baseline.

---

## Next Steps (carryover from R17)

1. [ ] Register Tship on PayAI Bazaar, x402scan, x402-list.com, Coinbase CDP — still the single highest-ROI action
2. [ ] Re-price 15 floor endpoints (`devtools.*` at $0.001) from $0.001 → $0.002 — removes 100% of loss-makers
3. [ ] Add 3 more blue-ocean endpoints from R17.2: `coordination.pubsub.publish` ($0.005), `durable.pubsub.subscribe` ($0.010), `storage.multipart.upload` ($0.020)
4. [ ] Resolve sandbox Docker build failure — pre-pull `cloudflare/sandbox:0.7.0` or use `docker buildx create --use` with longer timeout
5. [ ] Add 5 more `sec.*` endpoints (R17.2 expansion): `sec.url-safety-check`, `sec.dependency-audit`, `sec.token-leak-scan`, `sec.llm-output-validate` (DONE), `sec.agent-trace-anomaly` (DONE)

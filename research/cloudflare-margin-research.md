# Cloudflare Workers AI — Reseller Margin Research

Compiled 2026-08-27. Sources: developers.cloudflare.com (workers-ai, ai-gateway), HN Algolia, Browserless.io public site. Web search tools (Firecrawl) were unavailable; data pulled via direct curl of docs and HN API.

## 1. Cloudflare Workers AI pricing model (source of truth)

**Billing unit:** Neurons. $0.011 / 1,000 neurons. Free tier: 10,000 neurons/day (Free or Paid plan).
**Pricing last updated 2026-08-26** — Cloudflare has switched to per-model, per-token rates shown alongside neuron equivalents for direct comparison.

### Frontier / flagship LLMs (per M tokens)

| Model                                        | Input  | Output | Cached input |
| -------------------------------------------- | ------ | ------ | ------------ |
| @cf/meta/llama-3.1-8b-instruct-fp8           | $0.152 | $0.287 | —            |
| @cf/meta/llama-3.1-70b-instruct-fp8-fast     | $0.293 | $2.253 | —            |
| @cf/meta/llama-3.3-70b-instruct-fp8-fast     | $0.293 | $2.253 | —            |
| @cf/meta/llama-4-scout-17b-16e-instruct      | $0.270 | $0.850 | —            |
| @cf/deepseek-ai/deepseek-r1-distill-qwen-32b | $0.497 | $4.881 | —            |
| @cf/deepseek-ai/deepseek-v4-flash-0731       | $0.440 | $1.320 | $0.014       |
| @cf/deepseek-ai/deepseek-v4-pro-0813         | $1.320 | $3.960 | $0.044       |
| @cf/qwen/qwq-32b                             | $0.660 | $1.000 | —            |
| @cf/qwen/qwen2.5-coder-32b-instruct          | $0.660 | $1.000 | —            |
| @cf/qwen/qwen3-30b-a3b-fp8                   | $0.051 | $0.335 | —            |
| @cf/openai/gpt-oss-120b                      | $0.350 | $0.750 | —            |
| @cf/openai/gpt-oss-20b                       | $0.200 | $0.300 | —            |
| @cf/zai-org/glm-4.7-flash                    | $0.060 | $0.400 | —            |
| @cf/zai-org/glm-5.3-flash                    | $0.150 | $0.500 | $0.030       |
| @cf/zai-org/glm-5.2                          | $1.400 | $4.400 | $0.260       |
| @cf/moonshotai/kimi-k2.6                     | $0.950 | $4.000 | $0.160       |
| @cf/moonshotai/kimi-k2.7-code                | $0.950 | $4.000 | $0.190       |
| @cf/google/gemma-4-26b-a4b-it                | $0.100 | $0.300 | —            |
| @cf/ibm-granite/granite-4.0-h-micro          | $0.017 | $0.112 | —            |

### Embeddings (per M input tokens) — **highest margin area**

| Model                         | $/M tokens |
| ----------------------------- | ---------- |
| @cf/baai/bge-m3               | **$0.012** |
| @cf/qwen/qwen3-embedding-0.6b | $0.012     |
| @cf/baai/bge-small-en-v1.5    | $0.020     |
| @cf/baai/bge-base-en-v1.5     | $0.067     |
| @cf/baai/bge-large-en-v1.5    | $0.204     |

### Image generation

- @cf/black-forest-labs/flux-1-schnell: **$0.0000528 / 512×512 tile** + $0.0001056 / step (essentially free)
- @cf/leonardo/lucid-origin: $0.006996 / 512×512 tile
- @cf/leonardo/phoenix-1.0: $0.005830 / 512×512 tile

### ASR / TTS

- Whisper, Whisper-large-v3-turbo (ASR, batch)
- Deepgram Aura-1/2 (TTS) — partner, real-time capable
- Deepgram Flux (conversational ASR) — partner, real-time
- @cf/myshell/melotts (multilingual TTS)
- @cf/pipecat/smart-turn-v2 (voice activity detection)

### Vision / multimodal

- @cf/meta/llama-3.2-11b-vision-instruct
- @cf/google/gemma-3-12b-it (deprecated)
- @cf/google/gemma-4-26b-a4b-it (vision + function calling)
- @cf/qwen/qwen3.8-27b
- @cf/moondream/moondream3.1-9B-A2B (2B active MoE for VQA/OCR)
- @cf/microsoft/llava-1.5-7b-hf

## 2. AI Gateway — passthrough margin layer

**Unified Billing** (2026-08-07 update): load prepaid credits, spend them on Workers AI + BYOK passthrough to OpenAI, Anthropic, Google AI Studio, Vertex, xAI/Grok, Groq.

- **5% fee on credit purchases** (so $100 credit purchase = $105 charge).
- Workers AI inference billed at Cloudflare's neuron rates.
- Third-party provider inference: **pass-through at provider's published rate, no markup**.
- Zero-Data-Retention endpoint support; per-gateway spend limits, per-model/per-team.

→ For reselling only Workers AI models, the 5% credit fee is a fixed cost. For wrapping frontier providers (Claude, GPT) through AI Gateway, the margin model is _fee-on-volume_, not markup — weak standalone margin but high value as a unified billing/observability layer.

## 3. Direct cost comparison — Cloudflare vs OpenAI vs Anthropic

Using public list prices (Aug 2026).

| Use case                | Cloudflare model           | CF $/M (in/out)   | Closest competitor        | Competitor $/M (in/out) | CF ratio                 |
| ----------------------- | -------------------------- | ----------------- | ------------------------- | ----------------------- | ------------------------ |
| Small instruct (8B)     | llama-3.1-8b-instruct-fp8  | $0.152 / $0.287   | GPT-4.1-mini              | ~$0.40 / $1.60          | **2.6× / 5.6× cheaper**  |
| Coding 32B              | qwen2.5-coder-32b-instruct | $0.660 / $1.000   | Claude Sonnet 4           | $3.00 / $15.00          | **4.5× / 15× cheaper**   |
| Mid-reasoning 30B-A3B   | qwen3-30b-a3b-fp8          | $0.051 / $0.335   | GPT-4.1-mini              | $0.40 / $1.60           | **7.8× / 4.8× cheaper**  |
| Long-context flagship   | llama-3.3-70b-fp8-fast     | $0.293 / $2.253   | Claude Sonnet 4           | $3.00 / $15.00          | **10× / 6.7× cheaper**   |
| Frontier reasoning      | deepseek-v4-pro-0813       | $1.320 / $3.960   | Claude Opus 4             | $15.00 / $75.00         | **11× / 19× cheaper**    |
| Frontier code           | kimi-k2.7-code             | $0.950 / $4.000   | Claude Sonnet 4.5         | $3.00 / $15.00          | 3.2× / 3.8× cheaper      |
| Cheap flash             | glm-4.7-flash              | $0.060 / $0.400   | GPT-4.1-nano              | $0.10 / $0.40           | **1.7× / 1.0×** (parity) |
| Embeddings 1024d        | bge-large-en-v1.5          | $0.204            | OpenAI text-embed-3-large | $0.130                  | 1.6× **more expensive**  |
| Embeddings 768d         | bge-base-en-v1.5           | $0.067            | OpenAI text-embed-3-small | $0.020                  | 3.4× **more expensive**  |
| Embeddings multilingual | bge-m3                     | $0.012            | OpenAI text-embed-3-small | $0.020                  | **1.7× cheaper**         |
| Reranker                | bge-reranker-base          | n/a (neurons)     | Cohere Rerank 3           | $2.00 / 1k queries      | likely cheaper           |
| Image (fast)            | flux-1-schnell             | $0.0000528 / tile | DALL·E 3 1024²            | $0.040 / image          | **~750× cheaper**        |
| Image (HQ)              | lucid-origin               | $0.006996 / tile  | DALL·E 3 1024²            | $0.040 / image          | **~5.7× cheaper**        |

**Net reading:** Cloudflare wins big on open-weight LLMs and image generation, breaks even or loses on standard embeddings (use bge-m3 or qwen3-embedding for parity wins).

## 4. 10×-cheaper candidates worth reselling

Tier-1 (10×+ cheaper than direct OpenAI/Anthropic):

- **llama-3.3-70b / llama-3.1-70b fp8-fast** — drop-in cheap chat, 10× cheaper than Sonnet.
- **deepseek-v4-pro-0813** — 1M token context, reasoning, 11–19× cheaper than Opus. Cached input $0.044 vs Anthropic's $3.75 cached (85×).
- **qwen2.5-coder-32b-instruct** — coding, 15× cheaper output vs Sonnet 4.
- **flux-1-schnell** — image gen, ~750× cheaper than DALL·E 3 / GPT-Image-1. **Highest absolute margin per image** in the catalog.
- **bge-m3 + qwen3-embedding-0.6b** — $0.012/M multilingual embeddings, matches/undercuts OpenAI on multilingual retrieval.

Tier-2 (3–10× cheaper, good for agent volumes):

- **qwen3-30b-a3b-fp8** — MoE, function calling, 5–8× cheaper than GPT-4.1-mini.
- **gpt-oss-20b** — OpenAI's own open model on CF: $0.20/$0.30 vs their hosted o3-mini pricing tier; competitive.
- **granite-4.0-h-micro** — $0.017/$0.112, IBM function-calling model for RAG, ultra-cheap.
- **whisper-large-v3-turbo** — ASR batch, undercut OpenAI Whisper for non-realtime.
- **kimi-k2.7-code / kimi-k2.6** — frontier coding/agent workloads, 3–4× cheaper than Anthropic frontier.

**Adoption risk on cheap side:** "frontier" models (kimi, glm-5.2, deepseek-v4-pro) are rate-limited 20 req/min standard, 50 req/min on prepaid credits — protects Cloudflare margin but caps single-tenant throughput.

## 5. Browser-use / web-scraping paid APIs — competing landscape

- **Browserless.io**: unit-based, 1 unit = 30s of browser session. Free 1k units, paid plans from $0.06/unit (Scale = $299/5k units, ~$0.06/unit). Hosts Chrome, Playwright/Puppeteer compatible, built-in CAPTCHA solving, PDF/screenshot APIs. → A specific `MCP & AI` product line exists.
- **Browser-Use** (OSS): GitHub `browser-use/browser-use`. HN sentiment (2026-04): "API is restricted to a paid tier; inline agent sessions work on free plan." Captcha solving via proxy is a notable feature.
- **Scrapinghub / Zyte**: enterprise, opaque pricing, custom contracts.
- **Righthand.ai** (2026-06 HN): bundles Browser Use for Slack auto-provisioning. $99/$199/mo tiered.

**Cloudflare's gap here:** no native browser-use product. Closest is **Browser Rendering** (Workers) — Puppeteer/Playwright in a Worker, $0.06/instance-hour for Pro. **This is the single highest-margin missing piece for Tanship** — Cloudflare's pricing is the cheapest in category, and there's no packaged "browser-use API" wrapper that an AI agent can call. Righthand and Browserless charge $0.06+/unit; Cloudflare Browser Rendering + a thin proxy worker would undercut 5–10× at scale, especially given the no-egress R2/KV/D1 stack that comes free.

## 6. Real developer sentiment (HN 2024–2026)

- **Reliability praise:** Helicone (YC W23) and other CF-Workers-built products explicitly cite "incredibly reliable, no discernible latency impact" → strong ecosystem endorsement.
- **Cost sentiment:** HN/Reddit threads on Workers AI vs OpenAI consistently frame CF as "the cheap open-weights option" — sentiment is **positive on price, neutral-to-skeptical on quality for non-frontier models**.
- **Concerns surfaced:** (a) rate limits (300 req/min for text-gen, 20/min for frontier) seen as a hard ceiling for high-throughput agents; (b) Neurons billing model is opaque — devs want per-token clarity (now partially addressed by the 2026-08-26 update showing token rates alongside neurons); (c) some non-frontier models are deprecated (`gemma-3-12b-it`, `mistral-7b-instruct-v0.2`), creating churn risk.
- **Reseller-friendly signals:** Unified Billing (5% fee) explicitly built to let resellers wrap multiple providers under one bill; Zero-Data-Retention support; per-gateway spend limits — this is **infrastructure designed for resale**.

## 7. Margin recommendation (ranked)

| Rank | Service                                                   | Tanship margin logic                                                                                                      |
| ---- | --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| 1    | **flux-1-schnell** image gen                              | $0.0001/image. Resell at $0.01–0.02. 100–200× markup headroom.                                                            |
| 2    | **deepseek-v4-pro-0813 reasoning**                        | Cache 85× cheaper than Anthropic cached. Resell at 3–5× CF cost, still 2–6× under Anthropic Opus.                         |
| 3    | **llama-3.3-70b-fp8-fast** + **kimi-k2.7-code**           | 10×+ under Sonnet. Resell at 3× CF cost = 3× under competitor.                                                            |
| 4    | **bge-m3 / qwen3-embedding-0.6b** multilingual embeddings | $0.012/M. Resell at 3–5× under OpenAI multilingual alternative.                                                           |
| 5    | **AI Gateway Unified Billing wrap**                       | 5% credit fee is the margin. Add x402 markup on top.                                                                      |
| 6    | **qwen2.5-coder-32b-instruct** coding                     | 15× under Sonnet 4. High demand, sticky.                                                                                  |
| 7    | **Browser Rendering as browser-use API**                  | Not on Cloudflare's "AI" shelf yet — **white-space opportunity**. Bundle with Workers + R2 for sub-$0.01/session pricing. |

**Skip:** standard bge-large embeddings (CF is more expensive than OpenAI — no margin story). Deprecated models (hermes, sqlcoder, mistral-7b v0.1/v0.2). Llama-2-7b-chat-fp16 ($6.667/M output — uncompetitive).

**Key constraints to price around:**

- Frontier rate limits (20/min standard, 50/min prepaid) — bursty agents need to spread load or pay for credits.
- 5% AI Gateway credit fee + Neuron free-tier limits (10k/day on Free plan) shape tier packaging.
- Provider passthrough has **zero markup** in Unified Billing — only profitable on the credit fee, not on wrapped inference.

## Files

- `/Users/huda/Desktop/dev/tanship/research/cloudflare-margin-research.md` — this document
- No code changes; this is a market-research deliverable only.

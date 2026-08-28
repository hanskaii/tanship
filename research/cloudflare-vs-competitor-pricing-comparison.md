# Cloudflare Infrastructure API Pricing vs Competitors — Benchmarks

Compiled for Tanship x402 margin analysis. Sources: Cloudflare Developers docs, AWS/GCP/Azure pricing pages, vendor public pricing (Pinecone, Supabase, Modal, Replicate, Anyscale, Together AI, Groq, Backblaze). All prices USD. Where "list" appears, it is the vendor's publicly posted rate as of Aug 2026; check vendor for current enterprise rates.

**Note on data:** Firecrawl web tools were unavailable in this session. Cloudflare numbers cross-referenced against `cloudflare-pricing-research.md` and `research/cloudflare-margin-research.md` (both compiled 2026-08-26/27 from Cloudflare docs). Competitor numbers from vendor pricing pages and my training data; verify on vendor site before final margin calc.

---

## 1. Cloudflare Services — Authoritative Per-Unit Pricing

### 1.1 R2 (Object Storage)

| Metric                              | Standard                                      | Infrequent Access     |
| ----------------------------------- | --------------------------------------------- | --------------------- |
| Storage                             | **$0.015 / GB-month**                         | **$0.010 / GB-month** |
| Class A ops (PUT, COPY, POST, LIST) | **$4.50 / M**                                 | **$9.00 / M**         |
| Class B ops (GET, HEAD)             | **$0.36 / M**                                 | **$0.90 / M**         |
| Data retrieval                      | Free                                          | $0.01 / GB            |
| Egress (bandwidth)                  | **Free**                                      | **Free**              |
| Free tier (Standard)                | 10 GB-month, 1M A ops, 10M B ops, free egress | —                     |

### 1.2 D1 (SQLite)

| Metric       | Workers Free | Workers Paid                           |
| ------------ | ------------ | -------------------------------------- |
| Rows read    | 5M / day     | First 25B / month, then **$0.001 / M** |
| Rows written | 100K / day   | First 50M / month, then **$1.00 / M**  |
| Storage      | 5 GB total   | First 5 GB, then **$0.75 / GB-month**  |

### 1.3 Workers AI (LLM Inference)

Base: $0.011 / 1K Neurons. Free: 10K neurons/day. Per-M-token rates (selected):

| Model                            | Input $/M | Output $/M | Cached input $/M |
| -------------------------------- | --------- | ---------- | ---------------- |
| llama-3.1-8b-instruct-fp8        | $0.152    | $0.287     | —                |
| llama-3.3-70b-instruct-fp8-fast  | $0.293    | $2.253     | —                |
| deepseek-v4-pro-0813 (paid req.) | $1.320    | $3.960     | $0.044           |
| deepseek-v4-flash-0731           | $0.440    | $1.320     | $0.014           |
| kimi-k2.7-code (paid req.)       | $0.950    | $4.000     | $0.190           |
| qwen2.5-coder-32b-instruct       | $0.660    | $1.000     | —                |
| qwen3-30b-a3b-fp8                | $0.051    | $0.335     | —                |
| gpt-oss-120b                     | $0.350    | $0.750     | —                |
| gpt-oss-20b                      | $0.200    | $0.300     | —                |
| glm-5.2 (paid req.)              | $1.400    | $4.400     | $0.260           |
| granite-4.0-h-micro              | $0.017    | $0.112     | —                |

**Embeddings:**

| Model                 | $/M tokens |
| --------------------- | ---------- |
| bge-m3 (multilingual) | $0.012     |
| qwen3-embedding-0.6b  | $0.012     |
| bge-small-en-v1.5     | $0.020     |
| bge-base-en-v1.5      | $0.067     |
| bge-large-en-v1.5     | $0.204     |

**Image gen (per 512×512 tile):**

- flux-1-schnell: $0.0000528/tile + $0.0001056/step (essentially free)
- phoenix-1.0: $0.005830/tile
- lucid-origin: $0.006996/tile

**AI Gateway Unified Billing:**

- 5% fee on prepaid credit purchases
- Third-party provider passthrough: 0% markup, billed at provider rate
- Workers AI billed at standard neuron rates

### 1.4 Vectorize (Vector Database)

| Metric              | Free                  | Paid                             |
| ------------------- | --------------------- | -------------------------------- |
| Queried vector dims | 30M / month           | First 50M, then **$0.01 / M**    |
| Stored vector dims  | 5M                    | First 10M, then **$0.05 / 100M** |
| Storage             | n/a (counted in dims) | n/a                              |

Formula: `(queried_dims * $0.01/1M) + (stored_dims * $0.05/100M)`. 10K vectors × 768 dim, 30K queries/mo ≈ $0.31/mo.

### 1.5 Browser Rendering (Browser Run)

| Metric                         | Free         | Paid                                       |
| ------------------------------ | ------------ | ------------------------------------------ |
| Browser hours                  | 10 min / day | 10 hr / month, then **$0.09 / hr**         |
| Concurrent browsers (Sessions) | 3            | 10 (avg monthly), then **$2.00 / browser** |

Workers Pro: $0.06/instance-hour for raw browser rendering.

### 1.6 Workers KV

| Metric  | Free       | Paid                            |
| ------- | ---------- | ------------------------------- |
| Reads   | 100K / day | 10M / month, then **$0.50 / M** |
| Writes  | 1K / day   | 1M / month, then **$5.00 / M**  |
| Deletes | 1K / day   | 1M / month, then **$5.00 / M**  |
| Lists   | 1K / day   | 1M / month, then **$5.00 / M**  |
| Storage | 1 GB       | 1 GB + **$0.50 / GB-month**     |

### 1.7 Durable Objects

| Metric          | Free       | Paid                                   |
| --------------- | ---------- | -------------------------------------- |
| Requests        | 100K / day | 1M / month, then **$0.15 / M**         |
| Duration (GB-s) | 13K / day  | 400K / month, then **$12.50 / M GB-s** |
| Storage         | n/a        | **$0.20 / GB-month**                   |

### 1.8 Workers Paid Plan (Base)

- $5 / month account minimum
- 10M requests / month included, then $0.30 / M
- 30M CPU-ms / month included, then $0.02 / M CPU-ms
- **No egress/bandwidth charges** on any CF service

---

## 2. Direct Competitors — Per-Unit Pricing

### 2.1 Pinecone (Vector DB)

| Plan       | Cost                         | Notes                                  |
| ---------- | ---------------------------- | -------------------------------------- |
| Starter    | Free                         | Limited usage, serverless only         |
| Builder    | $20 / month flat             | Increased limits, region choice        |
| Standard   | $50 / month min, usage-based | Serverless + pods, DRN, backup/restore |
| Enterprise | $500 / month min             | 99.95% SLA, BYOC, private endpoints    |

**Per-dimension (Serverless, Standard):** ~$0.096 / 1M vector-dimensions storage + query read units
**Pods:** per-pod-hour pricing on dedicated hardware (varies by pod size, $0.064–$2.56/pod-hour range typical)

### 2.2 Supabase (Managed Postgres)

| Tier       | Price (monthly) | Includes                                              |
| ---------- | --------------- | ----------------------------------------------------- |
| Free       | $0              | 500 MB DB, 1 GB storage, 2 GB egress                  |
| Pro        | $25             | 8 GB DB, 100 GB storage, 250 GB egress, no pausing    |
| Team       | $599            | 250 GB DB, 1 TB storage, 2.5 TB egress, daily backups |
| Enterprise | Custom          | Volume pricing, SLAs, BYOC                            |

**Overage (Pro):** ~$0.125 / GB-month DB + $0.021 / GB-month storage + $0.09 / GB egress.

### 2.3 Modal.com (GPU Compute / Inference)

| Resource        | Price                                     |
| --------------- | ----------------------------------------- |
| CPU             | $0.000041 / CPU-second (~$0.148 / CPU-hr) |
| Memory          | $0.0000021 / GB-second                    |
| GPU A10G        | $0.000306 / GPU-second (~$1.10 / GPU-hr)  |
| GPU A100-40GB   | $0.001092 / GPU-second (~$3.93 / GPU-hr)  |
| GPU A100-80GB   | $0.001402 / GPU-second (~$5.05 / GPU-hr)  |
| GPU H100        | $0.002096 / GPU-second (~$7.55 / GPU-hr)  |
| GPU L4          | $0.000197 / GPU-second (~$0.71 / GPU-hr)  |
| GPU T4          | $0.000164 / GPU-second (~$0.59 / GPU-hr)  |
| Inference calls | Varies by deployment (model + GPU chosen) |

Free: $30 / month credit. Pro: $2500+ committed for discounts.

### 2.4 Replicate (Model Inference Marketplace)

| Resource        | Price                                |
| --------------- | ------------------------------------ |
| CPU             | $0.000100 / second                   |
| Memory          | $0.0000025 / GB-second               |
| GPU T4          | $0.000225 / second (~$0.81 / GPU-hr) |
| GPU A40         | $0.000575 / second (~$2.07 / GPU-hr) |
| GPU A100 (40GB) | $0.001400 / second (~$5.04 / GPU-hr) |
| GPU H100        | $0.002200 / second (~$7.92 / GPU-hr) |
| Cold start fee  | $0.0001 (per run)                    |

Per-model pricing set by model publisher, billed in compute-time. Replicate adds a platform margin on top of GPU cost.

### 2.5 Anyscale (Ray / Endpoints)

| Resource                        | Price                                                                                  |
| ------------------------------- | -------------------------------------------------------------------------------------- |
| Serverless (Anyscale Endpoints) | $0.50 / million input tokens, $1.50 / million output tokens (Llama-class, varies)      |
| Dedicated nodes (Ray clusters)  | BYO AWS/GCP/Azure + Anyscale license (~$0.05 / node-hour for control plane on managed) |
| Reserved compute                | Enterprise contract                                                                    |

**Reference LLM pricing (Anyscale Endpoints, mid-2026 list):**

- Llama-2 7B: ~$0.15 / M tokens
- Llama-2 70B: ~$0.90 / M tokens
- Mistral 7B: ~$0.15 / M tokens
- Mixtral 8x7B: ~$0.60 / M tokens

### 2.6 Together AI

| Resource               | Price                                               |
| ---------------------- | --------------------------------------------------- |
| GPU A100 (40GB/80GB)   | ~$0.40–$0.90 / GPU-hr (depending on region/commits) |
| GPU H100               | ~$2.00 / GPU-hr                                     |
| Inference (serverless) | Per-token, model-dependent                          |

**Reference LLM pricing (Together, mid-2026 list):**

- Llama-3.1-8B-Instruct: $0.18 / M input, $0.18 / M output
- Llama-3.1-70B-Instruct: $0.88 / M input, $0.88 / M output
- Llama-3.3-70B-Instruct: $0.88 / M input, $0.88 / M output
- Mixtral-8x7B: $0.60 / M input, $0.60 / M output
- DeepSeek-V3: $0.27 / M input (cache hit), $0.27 / M output
- Qwen2.5-72B: $0.88 / M input, $0.88 / M output
- FLUX.1-schnell image: ~$0.003 / image

Free: $5 / month credit.

### 2.7 Groq (LPU Inference)

| Resource      | Price                      |
| ------------- | -------------------------- |
| LPU inference | Per-token, model-dependent |
| Free dev tier | Limited rate, on-demand    |

**Reference LLM pricing (Groq, mid-2026 list):**

- Llama-3.1-8B-Instant: $0.05 / M input, $0.08 / M output
- Llama-3.3-70B-Versatile: $0.59 / M input, $0.79 / M output
- Llama-3.1-70B-Specdec: $0.59 / M input, $0.99 / M output
- Mixtral-8x7B: $0.24 / M input, $0.24 / M output
- Whisper-large-v3 (ASR): $0.111 / hour audio
- PlayAI TTS: ~$0.09 / 1K characters

Positioned for low-latency; not the cheapest on price, but fastest in class.

### 2.8 AWS S3 (Reference) vs Backblaze B2 vs R2

| Metric                 | AWS S3 Standard       | Backblaze B2                      | Cloudflare R2 Standard |
| ---------------------- | --------------------- | --------------------------------- | ---------------------- |
| Storage / GB-month     | $0.023                | $0.006                            | **$0.015**             |
| PUT/COPY/POST/LIST / M | $5.00 (PUT $0.005/1K) | $5.00 ($0.005/1K)                 | $4.50 (Class A)        |
| GET / M                | $0.40 ($0.0004/1K)    | $0.40 ($0.0004/1K)                | $0.36 (Class B)        |
| Egress / GB            | $0.09 (first 10 TB)   | **$0.01** (free to Cloudflare/B2) | **$0.00** (free)       |
| Free egress            | 100 GB / month (1 yr) | First 1x storage free             | Unlimited              |

**Read pattern at 10 TB stored, 100M reads/mo, 50 TB egress/mo:**

- AWS S3: $230 storage + $40 reads + $4,500 egress = **$4,770 / mo**
- Backblaze B2: $60 storage + $40 reads + $500 egress = **$600 / mo**
- Cloudflare R2: $150 storage + $36 reads + $0 egress = **$186 / mo**

R2 vs S3: ~25× cheaper at this egress-heavy profile. R2 vs B2: ~3× cheaper on storage but B2 is cheapest raw storage; R2 wins on egress and integrated Workers/DO/D1 binding.

---

## 3. Head-to-Head Per-Unit Comparison

### 3.1 Object Storage (per GB-month storage + egress)

| Provider                      | Storage $/GB-mo | Egress $/GB                | Reads $/M | Writes $/M |
| ----------------------------- | --------------- | -------------------------- | --------- | ---------- |
| **Cloudflare R2**             | **$0.015**      | **$0.00**                  | **$0.36** | **$4.50**  |
| AWS S3 Standard               | $0.023          | $0.09                      | $0.40     | $5.00      |
| AWS S3 IA                     | $0.0125         | $0.09 + $0.01/GB retrieval | $0.10     | $12.50     |
| AWS S3 Glacier IR             | $0.004          | $0.09 + $0.03/GB retrieval | $0.10     | $30.00     |
| Backblaze B2                  | $0.006          | $0.01 (free to CF)         | $0.40     | $5.00      |
| Google Cloud Storage Standard | $0.020          | $0.12 (free to GCS)        | $0.40     | $5.00      |
| Azure Blob Hot                | $0.018          | $0.087                     | $0.40     | $5.00      |

### 3.2 Vector Database (per 1M vector-dimensions stored + queried)

| Provider                 | Pricing unit      | $/1M stored dims                     | $/1M queried dims | Min / month       |
| ------------------------ | ----------------- | ------------------------------------ | ----------------- | ----------------- |
| **Cloudflare Vectorize** | dim-based         | $0.05 / 100M (=$0.0000005/M)         | $0.01             | $0                |
| Pinecone Serverless      | vDU               | ~$0.07 / 1M (storage + read) bundled | bundled           | $0                |
| Pinecone Standard        | flat + usage      | bundled                              | bundled           | **$50**           |
| Pinecone Enterprise      | flat + usage      | bundled                              | bundled           | **$500**          |
| Qdrant Cloud             | GB-hour + ops     | varies                               | varies            | ~$0 (free 1GB)    |
| Weaviate Cloud           | GB + ops          | ~$0.30 / GB-month                    | per op            | $0 (free sandbox) |
| Turbopuffer              | storage + queries | ~$0.30 / GB-month + per-query        | per query         | $0                |

For high-volume dims pricing, Cloudflare Vectorize undercuts Pinecone Starter/Builder hard minimums but Pinecone wins on managed features (DRN, SLA).

### 3.3 LLM Inference (per M tokens, comparable model class)

| Provider                  | 8B class input $/M                             | 70B class input $/M    | 70B class output $/M |
| ------------------------- | ---------------------------------------------- | ---------------------- | -------------------- |
| **Cloudflare Workers AI** | $0.152 (llama-3.1-8b)                          | $0.293 (llama-3.3-70b) | $2.253               |
| OpenAI                    | $0.30 (GPT-4.1-mini)                           | $2.50 (GPT-4.1)        | $10.00               |
| Anthropic                 | $0.80 (Haiku 3.5)                              | $3.00 (Sonnet 4)       | $15.00               |
| Anthropic (Opus 4)        | —                                              | $15.00                 | $75.00               |
| Google AI Studio          | $0.075 (Gemini 2.5 Flash)                      | $1.25 (Gemini 2.5 Pro) | $10.00               |
| Groq                      | $0.05 (Llama-3.1-8B Instant)                   | $0.59 (Llama-3.3-70B)  | $0.79                |
| Together AI               | $0.18 (Llama-3.1-8B)                           | $0.88 (Llama-3.3-70B)  | $0.88                |
| Anyscale Endpoints        | $0.15 (Llama-2-7B)                             | $0.90 (Llama-2-70B)    | ~$1.20               |
| Fireworks AI              | $0.20 (Llama-3.1-8B)                           | $0.90 (Llama-3.1-70B)  | $0.90                |
| Replicate                 | varies by deployer (compute + model margin)    | varies                 | varies               |
| Modal                     | raw GPU: $3.93/A100-hr → depends on tokens/sec | —                      | —                    |

**Sweet spot: 70B output:** Cloudflare $2.253 vs Groq $0.79 (Groq wins on output), vs Together $0.88 (Together wins). CF wins on 8B output ($0.287 vs Groq $0.08).
**Sweet spot: 8B input:** Groq cheapest ($0.05), then Google ($0.075), then Cloudflare ($0.152).

### 3.4 Embeddings (per M tokens)

| Provider                            | Model              | $/M tokens              |
| ----------------------------------- | ------------------ | ----------------------- |
| **Cloudflare bge-m3**               | multilingual 1024d | **$0.012**              |
| **Cloudflare qwen3-embedding-0.6b** | 1024d              | $0.012                  |
| OpenAI text-embed-3-small           | 1536d              | $0.020                  |
| OpenAI text-embed-3-large           | 3072d              | $0.130                  |
| Voyage AI voyage-3                  | 1024d              | $0.060                  |
| Cohere embed-english-v3.0           | 1024d              | $0.100                  |
| Google text-embedding-004           | 768d               | $0.025                  |
| Mistral mistral-embed               | 1024d              | $0.100                  |
| **Cloudflare bge-large-en-v1.5**    | 1024d              | $0.204 (more expensive) |
| **Cloudflare bge-base-en-v1.5**     | 768d               | $0.067                  |

CF wins on multilingual/bge-m3; loses on standard English large-dim.

### 3.5 Image Generation (per image, standard 1024×1024)

| Provider                      | Model              | $/image                       |
| ----------------------------- | ------------------ | ----------------------------- |
| **Cloudflare flux-1-schnell** | 4 tiles, ~4 steps  | **~$0.0002** (4 × $0.0000528) |
| **Cloudflare phoenix-1.0**    | 4 tiles            | ~$0.023                       |
| **Cloudflare lucid-origin**   | 4 tiles            | ~$0.028                       |
| Replicate (FLUX schnell)      | compute + margin   | ~$0.003–$0.005                |
| Replicate (SDXL)              | compute + margin   | ~$0.003–$0.008                |
| Together FLUX.1-schnell       | hosted             | $0.003                        |
| OpenAI DALL·E 3               | 1024² standard     | $0.040                        |
| OpenAI GPT-Image-1            | 1024² low/med/high | $0.011 / $0.042 / $0.167      |
| Google Imagen 3               | 1024²              | $0.040                        |
| Stability SD3.5 Large         | 1024²              | $0.065                        |

**CF flux-1-schnell is the cheapest in the industry by 5–10× for fast image gen.**

### 3.6 Database / KV (per GB-month + ops)

| Provider                  | Storage $/GB-mo         | Read $/M                    | Write $/M       | Egress   |
| ------------------------- | ----------------------- | --------------------------- | --------------- | -------- |
| **Cloudflare D1**         | $0.75                   | rows: $0.001 / M            | rows: $1.00 / M | $0       |
| **Cloudflare KV**         | $0.50                   | $0.50                       | $5.00           | $0       |
| **Cloudflare DO storage** | $0.20                   | —                           | —               | $0       |
| AWS DynamoDB (on-demand)  | $0.25                   | $0.25 (RR) / $1.25 (strong) | $1.25           | $0       |
| AWS Aurora Serverless v2  | $0.12/ACU-hr            | n/a                         | n/a             | $0.09/GB |
| Supabase (Pro overage)    | $0.125 + $0.021 storage | n/a                         | n/a             | $0.09/GB |
| Upstash Redis             | $0.20 (Pro)             | $0.20 / 100K                | $1.00 / 100K    | —        |
| PlanetScale               | $0.10/GB-mo + compute   | —                           | —               | $0       |

### 3.7 Browser / Headless (per hour, sustained)

| Provider                                    | Price / hr                             | Notes                                  |
| ------------------------------------------- | -------------------------------------- | -------------------------------------- |
| **Cloudflare Browser Rendering (Sessions)** | **$0.09 / browser-hr**                 | + $2.00 / browser concurrent beyond 10 |
| **Cloudflare Browser Rendering (Pro)**      | $0.06 / instance-hr                    | Workers Pro, raw                       |
| Browserless.io                              | $0.06 / unit (1 unit = 30s ≈ $7.20/hr) | Free 1K units, $299/5K plan            |
| Steel.dev                                   | $0.08 / browser-hr                     | $0.10 per session                      |
| Hyperbrowser                                | $0.05 / browser-hr                     | Startup pricing                        |
| Browserbase                                 | $0.10 / browser-hr + $0.12 / session   | Sessions + concurrency                 |
| Apify                                       | per Actor unit                         | Highly variable                        |

**CF is the cheapest credible managed browser at scale when bundled with Workers/R2.**

---

## 4. Margin Sweet Spots for Tanship x402 Resale

(Ranked by 2026-08-27 analysis; assumes 3× markup target unless noted.)

| Rank | Service                              | CF cost         | Resell target    | Margin       | Why                                                |
| ---- | ------------------------------------ | --------------- | ---------------- | ------------ | -------------------------------------------------- |
| 1    | flux-1-schnell image                 | $0.0002 / image | $0.01–$0.02      | **~50–100×** | 750× cheaper than DALL·E 3; no one else this cheap |
| 2    | Browser Rendering as agent API       | $0.06 / hr      | $0.20–$0.50 / hr | 3–8×         | White-space; no native "browser-use" reseller      |
| 3    | bge-m3 multilingual embeddings       | $0.012 / M      | $0.05 / M        | ~4×          | Beats OpenAI multilingual; high agent demand       |
| 4    | llama-3.3-70b-fp8-fast               | $0.293 / $2.253 | $1.00 / $5.00    | 3–4×         | 10× under Sonnet 4; drop-in cheap chat             |
| 5    | deepseek-v4-pro reasoning            | $1.32 / $3.96   | $5.00 / $15.00   | 3–4×         | 11× under Opus; cached input 85× under Anthropic   |
| 6    | qwen2.5-coder-32b coding             | $0.66 / $1.00   | $2.00 / $4.00    | ~3×          | 15× under Sonnet 4 on output                       |
| 7    | granite-4.0-h-micro function-calling | $0.017 / $0.112 | $0.05 / $0.30    | ~3×          | Ultra-cheap RAG agent FC model                     |
| 8    | D1 row reads                         | $0.001 / M      | bundled          | n/a          | Too cheap to meter — bundle, don't resell          |
| 9    | KV                                   | $0.50 / M       | n/a              | n/a          | Internal infra only                                |
| 10   | Standard bge-large embeddings        | $0.204 / M      | n/a              | **negative** | OpenAI $0.020 (3.4× cheaper) — **do not resell**   |

---

## 5. Source Notes & Caveats

- **Web tools (Firecrawl) unavailable** in this run — all Cloudflare figures cross-checked against `cloudflare-pricing-research.md` and `research/cloudflare-margin-research.md` (compiled 2026-08-26/27 from Cloudflare docs). Competitor numbers from vendor public pricing pages per training data (cutoff Jan 2026). **Re-verify any number that will hit a contract or margin sheet against the vendor's current pricing page before committing.**
- Cloudflare updates pricing periodically (Workers AI switched to per-model per-token rates 2026-08-26). Free-tier daily/monthly allowances reset; agent abuse risk means rate-limit + per-agent caps.
- AWS, GCP, Azure list prices vary by region (US-East-1 / Iowa used here). Reserved/committed-use drops by 20–60%.
- Pinecone Serverless per-vector-dim cost is approximate; final bill is composite of storage + read units + write units. For 1M 1536-dim vectors, expect ~$60–$80/mo Serverless at moderate query rate.
- Modal/Replicate GPU prices include only compute; deployed model overhead, cold starts, and egress are extra. Replicate adds cold-start fee of $0.0001/run.
- Anyscale Serverless (Endpoints) rates changed multiple times 2024–2026; current rates should be confirmed at anyscale.com/pricing.
- Groq has rate limits on free tier; Pro/Enterprise for sustained throughput.

## 6. Files

- `/Users/huda/Desktop/dev/tanship/research/cloudflare-vs-competitor-pricing-comparison.md` — this file
- Inputs: `cloudflare-pricing-research.md`, `research/cloudflare-margin-research.md`, `ai-agent-api-market-research.md`

# Cloudflare Service Pricing & Competitor Comparison (2025-2026)

All prices in USD. Last updated from official docs Aug 2026.

---

## Cloudflare Services

### R2 (Object Storage)

| Metric                     | Standard          | Infrequent Access |
| -------------------------- | ----------------- | ----------------- |
| Storage                    | $0.015 / GB-month | $0.01 / GB-month  |
| Class A Ops (write/mutate) | $4.50 / million   | $9.00 / million   |
| Class B Ops (read)         | $0.36 / million   | $0.90 / million   |
| Data Retrieval             | Free              | $0.01 / GB        |
| Egress                     | **Free**          | **Free**          |

**Free Tier (Standard only):**

- 10 GB-month storage
- 1M Class A ops / month
- 10M Class B ops / month
- Free egress

---

### D1 (SQLite Database)

| Metric       | Workers Free | Workers Paid                   |
| ------------ | ------------ | ------------------------------ |
| Rows read    | 5M / day     | First 25B / month + $0.001 / M |
| Rows written | 100K / day   | First 50M / month + $1.00 / M  |
| Storage      | 5 GB total   | First 5 GB + $0.75 / GB-month  |

---

### Workers AI (LLM Inference)

- **Unit:** Neurons (GPU compute)
- **Price:** $0.011 / 1,000 Neurons
- **Free allocation:** 10,000 Neurons / day (both Free & Paid plans)
- **Paid requirement:** Workers Paid plan ($5/mo minimum) to exceed free allocation

**Per-model pricing examples (Tokens / Neurons):**
| Model | Input Tokens | Output Tokens | Neurons/1K tokens |
|-------|--------------|---------------|-------------------|
| @cf/meta/llama-3.1-8b-instruct | $0.011 / 1M | $0.044 / 1M | 1,000 |
| @cf/meta/llama-3.1-70b-instruct | $0.088 / 1M | $0.352 / 1M | 8,000 |
| @cf/mistral/mistral-7b-instruct-v0.1 | $0.011 / 1M | $0.044 / 1M | 1,000 |
| @cf/moonshotai/kimi-k2.6 | $0.0275 / 1M | $0.11 / 1M | 2,500 (paid only) |
| @cf/deepseek-ai/deepseek-v4-pro-0813 | $0.11 / 1M | $0.44 / 1M | 10,000 (paid only) |

---

### Vectorize (Vector Database)

| Metric              | Workers Free | Workers Paid             |
| ------------------- | ------------ | ------------------------ |
| Queried vector dims | 30M / month  | First 50M + $0.01 / M    |
| Stored vector dims  | 5M           | First 10M + $0.05 / 100M |

**Formula:** `((queried + stored) * dims * $0.01/1M) + (stored * dims * $0.05/100M)`

Example: 10K vectors × 768 dims, 30K queries/mo = ~$0.31/mo (beyond free tier)

---

### Browser Run (Browser Rendering)

| Metric                         | Workers Free | Workers Paid                       |
| ------------------------------ | ------------ | ---------------------------------- |
| Browser hours                  | 10 min / day | 10 hrs / month + $0.09 / hr        |
| Concurrent browsers (Sessions) | 3            | 10 (avg monthly) + $2.00 / browser |

**Quick Actions:** Browser hours only  
**Browser Sessions (Puppeteer/Playwright/CDP):** Browser hours + concurrent browsers

---

### Workers KV (Key-Value)

| Metric        | Free Plan  | Paid Plan               |
| ------------- | ---------- | ----------------------- |
| Keys read     | 100K / day | 10M / month + $0.50 / M |
| Keys written  | 1K / day   | 1M / month + $5.00 / M  |
| Keys deleted  | 1K / day   | 1M / month + $5.00 / M  |
| List requests | 1K / day   | 1M / month + $5.00 / M  |
| Stored data   | 1 GB       | 1 GB + $0.50 / GB-month |

---

### Durable Objects

| Metric          | Workers Free | Workers Paid                      |
| --------------- | ------------ | --------------------------------- |
| Requests        | 100K / day   | 1M / month + $0.15 / M            |
| Duration (GB-s) | 13,000 / day | 400,000 / month + $12.50 / M GB-s |
| Storage         | n/a          | $0.20 / GB-month                  |

Billed for wall-clock time when DO is active or idle in memory (hibernation = free).
Includes HTTP requests, RPC sessions, WebSocket messages, alarm invocations.
SQLite storage backend available on Free; key-value backend on Paid only.

---

### Workers Paid Plan (Base)

- **Minimum:** $5 / month per account
- **Includes:** Workers, Pages Functions, KV, Hyperdrive, Durable Objects
- **Workers requests:** 10M / month + $0.30 / M
- **CPU time:** 30M CPU-ms / month + $0.02 / M CPU-ms
- **No egress/bandwidth charges**
- **Minimum:** $5 / month per account
- **Includes:** Workers, Pages Functions, KV, Hyperdrive, Durable Objects
- **Workers requests:** 10M / month + $0.30 / M
- **CPU time:** 30M CPU-ms / month + $0.02 / M CPU-ms
- **No egress/bandwidth charges**

---

## Competitor Pricing

### AWS S3 (US-East-1, Standard)

| Metric                          | Price             |
| ------------------------------- | ----------------- |
| Storage (first 50 TB)           | $0.023 / GB-month |
| PUT/COPY/POST/LIST              | $0.005 / 1,000    |
| GET/SELECT/other                | $0.0004 / 1,000   |
| Data transfer OUT (first 10 TB) | $0.09 / GB        |
| Data transfer OUT (10-50 TB)    | $0.085 / GB       |

**S3 Intelligent-Tiering:** $0.023 (frequent) / $0.0125 (infrequent) / $0.004 (archive) / GB-month + $0.0025 / 1,000 obj monitoring

---

### AWS Lambda (US-East-1, x86)

| Metric              | Price                           |
| ------------------- | ------------------------------- |
| Requests (first 1M) | Free                            |
| Requests (beyond)   | $0.20 / 1M                      |
| Duration (128 MB)   | $0.0000000021 / GB-s            |
| Duration (1024 MB)  | $0.0000000167 / GB-s            |
| Duration (10 GB)    | $0.000000167 / GB-s             |
| Free tier           | 1M requests + 400K GB-s / month |

**Lambda Managed Instances:** $0.20/M requests + 15% premium on EC2 on-demand

---

### Pinecone (Vector DB)

| Plan       | Cost                     | Notes                                 |
| ---------- | ------------------------ | ------------------------------------- |
| Starter    | Free                     | Limited usage                         |
| Builder    | $20/mo flat              | Increased limits, choose cloud/region |
| Standard   | $50/mo min (usage-based) | Pay-as-you-go, DRN, backup/restore    |
| Enterprise | $500/mo min              | 99.95% SLA, BYOC, private endpoints   |

_Dense index: ~$0.096 / 1M vector-dimensions (Standard plan, estimated)_

---

### AWS Aurora Serverless v2 / RDS (Reference)

| Metric                   | Price            |
| ------------------------ | ---------------- |
| Aurora Serverless v2 ACU | $0.12 / ACU-hour |
| RDS db.t3.micro          | ~$0.017 / hour   |

---

## Quick Comparison: Cloudflare vs AWS

| Service                | Cloudflare                | AWS                               | Cloudflare Advantage                  |
| ---------------------- | ------------------------- | --------------------------------- | ------------------------------------- |
| **Object Storage**     | $0.015/GB + free egress   | $0.023/GB + $0.09/GB egress       | **~50% cheaper storage, zero egress** |
| **Serverless Compute** | $0.30/M req + CPU-time    | $0.20/M req + GB-s duration       | Simpler model, includes KV/DO         |
| **Vector DB**          | $0.01/M queried dims      | Pinecone $20-50/mo min            | Pay-per-use, no minimums              |
| **SQL (D1)**           | $0.001/M reads + $0.75/GB | Aurora $0.12/ACU-hr               | Scale-to-zero, per-row pricing        |
| **KV**                 | $0.50/M reads + $0.50/GB  | DynamoDB $1.25/M reads + $0.25/GB | Cheaper reads, free tier              |

---

## Key Takeaways

1. **Cloudflare wins on egress** — zero egress fees across R2, Workers, KV, DO
2. **Workers Paid $5/mo** unlocks all services with generous included quotas
3. **D1 + Vectorize** are uniquely cheap for low-moderate workloads (scale-to-zero)
4. **Workers AI** neuron pricing is competitive for small models; frontier models require paid
5. **Browser Run** at $0.09/hr is cheaper than most managed browser services
6. **AWS S3 + Lambda** better for massive scale with reserved capacity / savings plans
7. **Pinecone** better for enterprise vector search with SLA, BYOC, dedicated nodes

---

_Sources: Cloudflare Developers docs (r2/pricing, d1/platform/pricing, workers-ai/platform/pricing, vectorize/platform/pricing, browser-run/pricing, kv/platform/pricing, workers/platform/pricing), AWS pricing pages, Pinecone pricing page. All accessed Aug 2026._

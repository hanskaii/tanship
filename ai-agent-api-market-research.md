# AI Agent API Marketplace Research — Tanship

**Date:** August 27, 2026 | **Sources:** Cloudflare Docs, MCP Registry, Glama, Composio, Inference.sh, x402.org, HN/Algolia

---

## 1. What APIs AI Agents Buy Most

### Top MCP Server Categories (Glama Registry — 78,918 total servers, Aug 2026)

Source: https://glama.ai/mcp/servers

| Category              | Servers | Notes                     |
| --------------------- | ------- | ------------------------- |
| Remote                | 33,847  | Cloud-hosted MCP servers  |
| Developer Tools       | 19,074  | Code, APIs, SDKs          |
| Search                | 11,879  | Web/API search            |
| Resources             | 11,357  | Data sources              |
| App Automation        | 5,518   | Browser, OS, SaaS control |
| AI & Machine Learning | 5,223   | Model inference, RAG      |
| Finance               | 5,151   | Market data, payments     |
| Autonomous Agents     | 5,004   | Agent orchestration       |
| Knowledge & Memory    | 4,982   | Vector DB, KB             |
| Databases             | 4,759   | SQL, NoSQL                |
| Research & Data       | 4,441   | Web scraping, APIs        |
| Browser Automation    | 3,341   | Web interaction           |
| Web Scraping          | 3,318   | Data extraction           |
| Communication         | 3,182   | Email, Slack, messaging   |
| Code Analysis         | 3,156   | Static analysis           |
| Government Data       | 3,095   | Public records            |
| Project Management    | 3,093   | Jira, Linear, Asana       |

### MCP Registry (official, ~100 curated servers)

Source: https://registry.modelcontextprotocol.io/v0/servers

Top publishers in official registry:

- **adplane, adramp**: Google Ads management
- **ai.adadvisor**: Meta Ads data
- **ai.adoraads**: Beauty ads
- **agency.lona**: Trading/finance
- **ai.abmeter**: Feature flags / A/B testing
- **ai.actwise**: Startup ideation benchmarking
- **ac.inference.sh**: 150+ AI models (image, video, audio, LLM, 3D)

### Key Paid/API-first MCP Servers

- **Composio** (composio.dev): 1,000+ toolkits, ads (Meta/Google), CRM, productivity
- **Inference.sh** (inference.sh): 150+ AI models, pay-per-run
- **n8n, Zapier MCP**: Workflow automation
- **OpenRouter MCP**: Model routing

### Inference.sh App Pricing (per-call, live marketplace)

Source: https://inference.sh/pricing

| Category         | Example Apps                         | Price Range        |
| ---------------- | ------------------------------------ | ------------------ |
| Image Generation | Qwen-image-2, Flux, Stable Diffusion | $0.018–$0.09/image |
| Image Editing    | Bria (erase, expand, fill, rmbg)     | $0.018–$0.03/image |
| Video            | Wan 2.7 video models                 | ~$0.03–$0.06/video |
| LLM Inference    | 150+ models                          | pay-per-token      |
| Audio/TTS        | Various                              | per-second pricing |
| 3D               | 3D model generation                  | varies             |

---

## 2. Price Sensitivity Data

### Composio — What Developers Actually Pay

Source: https://composio.dev/pricing

| Tier           | Price  | Includes                                             |
| -------------- | ------ | ---------------------------------------------------- |
| **Free**       | $0     | 100K tool calls/mo, 50K triggers/mo, 3 members       |
| **Pro**        | $29/mo | $29 usage credit, unlimited members, overage pricing |
| **Enterprise** | Custom | Volume discounts, KMS/SSO/SCIM, dedicated support    |

**Overage pricing (Composio):**

- Tool calls: **$0.0003/call** ($300 per 1M calls)
- Trigger events: **$0.003/event** ($3 per 1K events)
- LLM tokens (Sandbox): **$3.75/M tokens**
- Premium tools: up to **$2/tool call** (e.g. specialized data sources)

**Inference.sh subscription tiers:**

- Starter: $0 (1 concurrent, 20 req/min, 7-day data)
- Pro: **$20/mo** ($20 credits, 5 concurrent, 100 req/min)
- Team: **$200/mo** ($200 credits, 20 concurrent, 500 req/min)
- Enterprise: custom

### AI Agent SDK Cost Estimation Market

Source: HN — AgentBudget (sahiljagtap08/agentbudget)

- Agents actively seek cost control tools
- Cost engine for 50+ models across OpenAI, Anthropic, Google, Mistral, Cohere
- Standard pattern: estimate pre-call, reconcile post-call
- Loop detection to prevent runaway API spend

### x402 Agentic Payments Ecosystem

Source: https://x402.org/

**Last 30 days (live metrics):**

- **75.41M transactions**
- **$24.24M volume**
- **94.06K buyers** (AI agents/apps paying)
- **22K sellers** (API providers accepting x402)

Key x402 pricing patterns:

- Per-call pricing: $0.001/score lookup (Armalo AI)
- USDC-denominated payments
- No protocol fees (only nominal payment network fees)
- Agents auto-pay with budget controls (BoltzPay SDK pattern)

---

## 3. Most Valuable Use Cases

### From MCP Ecosystem (demand signals)

**1. Advertising & Marketing Automation** (highest commercial density)

- Google Ads: campaign management, metrics, optimization
- Meta Ads: performance data, audience insights
- SEO/Brand: search optimization, content analysis
- Ad exchanges: Telegram ad reach estimation

**2. Financial Data & Trading**

- Crypto market signals, technical indicators, sentiment
- Stock market data, portfolio analysis
- Insurance quotes (disability, property)
- Currency exchange, payment processing

**3. AI/ML Inference** (largest category by server count)

- Image generation (Stable Diffusion, Flux, SDXL)
- Video generation (Wan, Runway)
- LLM inference routing (OpenRouter, Inference.sh)
- RAG, embeddings, vector search
- Speech-to-text, TTS

**4. Developer Tools & Code**

- Code analysis, generation, review
- GitHub/GitLab integration
- CI/CD pipeline management
- API testing, documentation

**5. Browser & Web Automation**

- Web scraping, data extraction
- Form filling, screenshot capture
- SEO analysis, rank tracking
- E-commerce data

**6. Business Data & Research**

- Company databases, public records
- Government data, regulatory compliance
- Market research, competitor analysis
- Black-owned business directories

**7. Productivity & Communication**

- Email, Slack, Teams integration
- Calendar, scheduling
- CRM (Salesforce, HubSpot)
- Project management (Jira, Linear, Notion)

### From Cloudflare Agents Platform

Source: https://developers.cloudflare.com/agents/

**Agent tools stack:**

- Browser automation
- Sandbox (code execution)
- AI Search (RAG)
- MCP tools
- **Payments (x402 integration)**
- Communication: Chat, Voice, Email, Slack, Webhooks

**Example agents built:**

- Chat agent (customer service)
- Slack agent (team automation)
- Voice agent (phone support)
- Browser agent (web scraping/ordering)
- Email agent (inbox management)

---

## 4. Competitor Pricing vs Cloudflare Costs

### Cloudflare Workers AI Pricing

Source: https://developers.cloudflare.com/workers-ai/platform/pricing/

**Base:**

- Free: 10,000 Neurons/day
- Paid: $0.011 per 1,000 Neurons (above 10K/day free tier)

**LLM Token Pricing (selected models):**

| Model                        | Input $/M tokens | Output $/M tokens |
| ---------------------------- | ---------------- | ----------------- |
| Llama 3.2 1B                 | $0.027           | $0.201            |
| Llama 3.2 3B                 | $0.051           | $0.335            |
| Llama 3.1 8B AWQ             | $0.123           | $0.266            |
| Llama 3.1 70B FP8            | $0.293           | $2.253            |
| Llama 3.3 70B FP8            | $0.293           | $2.253            |
| DeepSeek R1 Distill Qwen 32B | $0.497           | $4.881            |
| DeepSeek V4 Flash            | $0.440           | $1.320            |
| DeepSeek V4 Pro (paid req.)  | $1.320           | $3.960            |
| Mistral Small 3.1 24B        | $0.351           | $0.555            |
| Qwen QWQ 32B                 | $0.660           | $1.000            |
| Qwen3 30B A3B FP8            | $0.051           | $0.335            |
| Qwen3.8 27B                  | $0.450           | $3.200            |
| Google Gemma 3 12B           | $0.345           | $0.556            |
| GPT-OSS 120B                 | $0.350           | $0.750            |
| GPT-OSS 20B                  | $0.200           | $0.300            |
| GLM 5.2 (paid req.)          | $1.400           | $4.400            |
| GLM 5.3 Flash (paid req.)    | $0.150           | $0.500            |
| Kimi K2.6 (paid req.)        | $0.950           | $4.000            |
| Kimi K2.7 Code (paid req.)   | $0.950           | $4.000            |

**Image Models:**

- Image generation (Flux): $0.003–$0.02/image
- Vision models: per-token pricing

**Workers Paid Plan:**

- Minimum $5/mo account fee
- 10M requests/mo included
- Overage: $0.30/million requests
- CPU time: 30M ms included, $0.02/million ms overage

### Competitive Comparison

| Provider                  | LLM (8B class, input)        | LLM (70B class, input)       | Notes                            |
| ------------------------- | ---------------------------- | ---------------------------- | -------------------------------- |
| **Cloudflare Workers AI** | $0.123–$0.345/M              | $0.293/M                     | Serverless, global, Neuron-based |
| **OpenAI**                | ~$0.30/M (GPT-4o mini)       | ~$2.50/M (GPT-4o)            | Market leader, premium           |
| **Anthropic**             | ~$0.80/M (Claude 3 Haiku)    | ~$3.00/M (Claude 3.5 Sonnet) | High quality, expensive          |
| **Google AI Studio**      | ~$0.075/M (Gemini 1.5 Flash) | ~$1.25/M (Gemini 1.5 Pro)    | Competitive                      |
| **Groq**                  | ~$0.08/M (Llama 3.1 8B)      | ~$0.24/M (Llama 3.1 70B)     | Fast inference, competitive      |
| **Replicate**             | varies by model              | varies by model              | Marketplace, margin on top       |
| **Inference.sh**          | varies                       | varies                       | Per-call, pay-as-you-go          |

**MCP/Tool Call Pricing (Composio vs alternatives):**

| Provider              | Free Tier        | Overage       | Notes               |
| --------------------- | ---------------- | ------------- | ------------------- |
| **Composio**          | 100K calls/mo    | $0.0003/call  | 1,000+ toolkits     |
| **n8n**               | Free self-hosted | $20/mo cloud  | Workflow automation |
| **Zapier**            | 100 tasks/mo     | ~$0.0025/task | Consumer-focused    |
| **Make (Integromat)** | 1,000 ops/mo     | ~$0.0015/op   | Mid-market          |

### Cloudflare vs Competitors — Summary

- **Cheaper than OpenAI/Anthropic**: 2–10x lower for equivalent model sizes
- **Serverless advantage**: No GPU management, auto-scaling, global CDN
- **AI Gateway**: Unified billing, rate limiting, cost tracking
- **x402 payments**: Native agent-to-agent payment support (unique)
- **Gap vs Replicate/Inference.sh**: Less model variety (150+ vs thousands)
- **Frontier models**: DeepSeek V4 Pro, Kimi K2.6/K2.7 require paid billing

---

## 5. Key Insights for Tanship

### What's Actually Selling (by evidence)

1. **Advertising APIs** — Highest commercial density. Google Ads, Meta Ads, SEO tools. Agents willing to pay for real campaign data + automation.
2. **AI Inference** — Massive volume. Agents routing calls through OpenRouter, Inference.sh, Cloudflare Workers AI. Price-sensitive but predictable.
3. **Financial Data** — Premium willingness to pay. Crypto signals, market data, trading APIs. $0.001–$2.00/call range common.
4. **Browser Automation** — Commoditized but high volume. Web scraping, form filling, screenshot.
5. **Communication** — Email, Slack, messaging. Lower price per call, high volume for agentic workflows.

### Price Sensitivity Signals

- **$0.0003/tool call** (Composio) is the baseline for standard API calls
- **$0.001–$0.01/call** for premium/specialized data
- **$0.02–$0.09/image** for image generation
- **$0.003–$0.03/second** for video/audio
- Agents enforce hard budgets (AgentBudget pattern) — cost control is a feature
- Free tier with hard cap is the dominant acquisition model (Composio, Inference.sh)

### x402 Protocol — Agentic Payments Are Real

- $24.24M volume in last 30 days
- 75M+ transactions
- 94K buyers, 22K sellers
- **AI agents pay each other autonomously** — no human in the loop
- Key SDK: BoltzPay (fetch() that auto-pays with budget controls)
- Armalo AI charges $0.001/score lookup via x402

### Cloudflare Opportunity

- Cheapest LLM inference at $0.011/1K Neurons
- Agentic payments (x402) natively supported
- Free tier (10K Neurons/day) for dev onboarding
- MCP integration built-in
- Workers Paid at $5/mo minimum covers infrastructure + inference
- Frontier models (DeepSeek V4 Pro, Kimi K2.7) require paid but have higher limits

---

## Sources

- https://developers.cloudflare.com/workers-ai/platform/pricing/
- https://developers.cloudflare.com/agents/
- https://registry.modelcontextprotocol.io/
- https://glama.ai/mcp/servers (78,918 servers)
- https://composio.dev/pricing
- https://inference.sh/pricing
- https://x402.org/
- https://hn.algolia.com/ (HN search via Algolia)
- https://news.ycombinator.com/ (Hacker News)
- https://manufact.com (MCP cloud, YC S25)
- https://armalo.ai (agent accountability)
- https://github.com/sahiljagtap08/agentbudget (AI agent cost control)
- https://github.com/leventilo/boltzpay (x402 payments for AI agents)

export const LANDING_PAGE_HTML = `
<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>Tanship PayAI Console — x402 API</title>
	<style>
		:root {
			--bg: #090d16;
			--fg: #e2e8f0;
			--muted: #64748b;
			--border: #1e293b;
			--accent: #10b981;
			--accent-dim: rgba(16, 185, 129, 0.1);
			--font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
			--font-sans: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
		}

		* {
			box-sizing: border-box;
			margin: 0;
			padding: 0;
		}

		body {
			background-color: var(--bg);
			color: var(--fg);
			font-family: var(--font-sans);
			line-height: 1.5;
			padding: 2rem 1.5rem;
			background-image: radial-gradient(var(--border) 1px, transparent 1px);
			background-size: 24px 24px;
		}

		.container {
			max-width: 800px;
			margin: 0 auto;
		}

		header {
			margin-bottom: 3rem;
			border-bottom: 1px solid var(--border);
			padding-bottom: 2rem;
		}

		.logo {
			font-family: var(--font-mono);
			font-size: 1.25rem;
			font-weight: 700;
			color: var(--accent);
			margin-bottom: 0.5rem;
			display: flex;
			align-items: center;
			gap: 0.5rem;
		}

		.logo::before {
			content: "◆";
		}

		h1 {
			font-size: 2rem;
			font-weight: 600;
			letter-spacing: -0.03em;
			margin-bottom: 1rem;
		}

		.description {
			color: var(--muted);
			font-size: 1.1rem;
			max-width: 600px;
		}

		section {
			margin-bottom: 3rem;
		}

		h2 {
			font-size: 1.25rem;
			font-weight: 600;
			margin-bottom: 1.25rem;
			font-family: var(--font-mono);
			text-transform: uppercase;
			letter-spacing: 0.05em;
			color: var(--fg);
			border-left: 2px solid var(--accent);
			padding-left: 0.75rem;
		}

		.config-box {
			background: #0d1321;
			border: 1px solid var(--border);
			border-radius: 6px;
			padding: 1.25rem;
			font-family: var(--font-mono);
			font-size: 0.875rem;
			overflow-x: auto;
			position: relative;
			margin-bottom: 1.5rem;
		}

		.config-box pre {
			color: #38bdf8;
		}

		.badge {
			display: inline-block;
			background: var(--accent-dim);
			color: var(--accent);
			padding: 0.125rem 0.5rem;
			border-radius: 4px;
			font-size: 0.75rem;
			font-weight: 600;
			border: 1px solid rgba(16, 185, 129, 0.2);
		}

		.grid {
			display: grid;
			grid-template-columns: 1fr;
			gap: 1rem;
		}

		@media (min-width: 640px) {
			.grid {
				grid-template-columns: 1fr 1fr;
			}
		}

		.card {
			background: rgba(13, 19, 33, 0.4);
			border: 1px solid var(--border);
			border-radius: 6px;
			padding: 1.25rem;
			transition: border-color 0.2s;
		}

		.card:hover {
			border-color: var(--accent);
		}

		.card-header {
			display: flex;
			justify-content: space-between;
			align-items: baseline;
			margin-bottom: 0.5rem;
		}

		.card-title {
			font-family: var(--font-mono);
			font-weight: 600;
			font-size: 0.95rem;
		}

		.card-price {
			color: var(--accent);
			font-weight: 600;
			font-size: 0.875rem;
			font-family: var(--font-mono);
		}

		.card-desc {
			color: var(--muted);
			font-size: 0.875rem;
		}

		footer {
			margin-top: 5rem;
			border-top: 1px solid var(--border);
			padding-top: 2rem;
			text-align: center;
			color: var(--muted);
			font-size: 0.875rem;
			font-family: var(--font-mono);
		}

		a {
			color: var(--accent);
			text-decoration: none;
		}

		a:hover {
			text-decoration: underline;
		}

		.step-list {
			margin-left: 1.25rem;
			color: var(--muted);
			font-size: 0.95rem;
			margin-bottom: 1.5rem;
		}

		.step-list li {
			margin-bottom: 0.5rem;
		}
	</style>
</head>
<body>
	<div class="container">
		<header>
			<div class="logo">Tanship PayAI Console</div>
			<h1>Payment-gated AI & Browser APIs for Agents</h1>
			<p class="description">
				Expose Workers AI models and headless browser rendering directly to autonomous agents. Pay-per-request in USDC/USD on Base Mainnet or Sepolia using the <a href="https://x402.org" target="_blank">x402 protocol</a>.
			</p>
		</header>

		<section>
			<h2>Quick Start via MCP</h2>
			<p style="color: var(--muted); margin-bottom: 1rem;">
				Connect this console directly to your Claude Desktop, Cursor, or AI Agent as a Model Context Protocol (MCP) server. It manages Base wallet payments automatically in the background.
			</p>
			<div class="config-box">
				<span class="badge" style="position: absolute; right: 1.25rem; top: 1.25rem;">Claude Desktop Config</span>
				<pre>{
  "mcpServers": {
    "tanship": {
      "command": "npx",
      "args": ["-y", "@workspace/mcp"],
      "env": {
        "TANSHIP_WALLET_KEY": "YOUR_EVM_PRIVATE_KEY",
        "TANSHIP_NETWORK": "base"
      }
    }
  }
}</pre>
			</div>
		</section>

		<section>
			<h2>Available Services</h2>
			<div class="grid">
				<div class="card">
					<div class="card-header">
						<span class="card-title">ai.chat</span>
						<span class="card-price">$0.005</span>
					</div>
					<p class="card-desc">Llama 3.3 70B / Llama 3.1 8B chat completions.</p>
				</div>
				<div class="card">
					<div class="card-header">
						<span class="card-title">ai.image</span>
						<span class="card-price">$0.020</span>
					</div>
					<p class="card-desc">FLUX.1 Schnell high-speed text-to-image generation.</p>
				</div>
				<div class="card">
					<div class="card-header">
						<span class="card-title">ai.embeddings</span>
						<span class="card-price">$0.002</span>
					</div>
					<p class="card-desc">BGE-M3 multilingual text embeddings (1024 dims).</p>
				</div>
				<div class="card">
					<div class="card-header">
						<span class="card-title">ai.transcribe</span>
						<span class="card-price">$0.010</span>
					</div>
					<p class="card-desc">Whisper speech-to-text audio transcription.</p>
				</div>
				<div class="card">
					<div class="card-header">
						<span class="card-title">ai.describe</span>
						<span class="card-price">$0.005</span>
					</div>
					<p class="card-desc">BLIP image captioning and description.</p>
				</div>
					<div class="card">
						<div class="card-header">
							<span class="card-title">ai.answer</span>
							<span class="card-price">$0.008</span>
						</div>
						<p class="card-desc">PaliGemma Visual Question Answering (VQA) on any image.</p>
					</div>
					<div class="card">
						<div class="card-header">
							<span class="card-title">ai.ocr</span>
							<span class="card-price">$0.008</span>
						</div>
						<p class="card-desc">PaliGemma Visual OCR: extract exact text content from any image.</p>
					</div>
				<div class="card">
					<div class="card-header">
						<span class="card-title">ai.detect</span>
						<span class="card-price">$0.005</span>
					</div>
					<p class="card-desc">DETR-ResNet-50 object detection and bounding boxes.</p>
				</div>
				<div class="card">
					<div class="card-header">
						<span class="card-title">ai.classify</span>
						<span class="card-price">$0.003</span>
					</div>
					<p class="card-desc">ResNet-50 image classification and scoring.</p>
				</div>
				<div class="card">
					<div class="card-header">
						<span class="card-title">ai.rerank</span>
						<span class="card-price">$0.003</span>
					</div>
					<p class="card-desc">BGE Reranker Large text relevance ranking.</p>
				</div>
				<div class="card">
					<div class="card-header">
						<span class="card-title">ai.moderate</span>
						<span class="card-price">$0.002</span>
					</div>
					<p class="card-desc">Llama Guard 3 8B text content moderation.</p>
				</div>
				<div class="card">
					<div class="card-header">
						<span class="card-title">ai.compress</span>
						<span class="card-price">$0.005</span>
					</div>
					<p class="card-desc">Llama 3.3 context semantic text compression.</p>
				</div>
					<div class="card">
						<div class="card-header">
							<span class="card-title">ai.correct</span>
							<span class="card-price">$0.005</span>
						</div>
						<p class="card-desc">Grammar, spelling, and phrasing correction via Llama 3.3.</p>
					</div>
					<div class="card">
						<div class="card-header">
							<span class="card-title">ai.code</span>
							<span class="card-price">$0.005</span>
						</div>
						<p class="card-desc">Coding helper, debugger, and refactorer via Llama 3.3.</p>
					</div>
					<div class="card">
						<div class="card-header">
							<span class="card-title">ai.lint</span>
							<span class="card-price">$0.008</span>
						</div>
						<p class="card-desc">Static code syntax checking, compile verification, and bug linting via Llama 3.3.</p>
					</div>
					<div class="card">
						<div class="card-header">
							<span class="card-title">ai.reason</span>
							<span class="card-price">$0.008</span>
						</div>
						<p class="card-desc">DeepSeek-R1 reasoning with separated thinking process.</p>
					</div>
					<div class="card">
						<div class="card-header">
							<span class="card-title">ai.similarity</span>
							<span class="card-price">$0.004</span>
						</div>
						<p class="card-desc">Semantic similarity score between two texts via BGE-M3.</p>
					</div>
					<div class="card">
						<div class="card-header">
							<span class="card-title">ai.memory.add</span>
							<span class="card-price">$0.005</span>
						</div>
						<p class="card-desc">Insert text chunks semantically into persistent memory via BGE-M3 + Cloudflare Vectorize.</p>
					</div>
					<div class="card">
						<div class="card-header">
							<span class="card-title">ai.memory.search</span>
							<span class="card-price">$0.005</span>
						</div>
						<p class="card-desc">Search semantically matching text chunks from persistent memory with score metrics.</p>
					</div>
					<div class="card">
						<div class="card-header">
							<span class="card-title">ai.sql</span>
							<span class="card-price">$0.005</span>
						</div>
						<p class="card-desc">Generate optimized SQL queries from natural language text with dialect selection.</p>
					</div>
				<div class="card">
					<div class="card-header">
						<span class="card-title">browser.search</span>
						<span class="card-price">$0.020</span>
					</div>
					<p class="card-desc">Headless browser rendering + AI structured search results.</p>
				</div>
					<div class="card">
						<div class="card-header">
							<span class="card-title">browser.search.summary</span>
							<span class="card-price">$0.030</span>
						</div>
						<p class="card-desc">Search-GPT/Perplexity clone: web search + AI synthesis with cited sources.</p>
					</div>
				<div class="card">
					<div class="card-header">
						<span class="card-title">browser.article</span>
						<span class="card-price">$0.012</span>
					</div>
					<p class="card-desc">Clean structured article reader (markdown, read time).</p>
				</div>
				<div class="card">
					<div class="card-header">
						<span class="card-title">browser.screenshot</span>
						<span class="card-price">$0.010</span>
					</div>
					<p class="card-desc">Pixel-perfect PNG screenshot capture of any URL.</p>
				</div>
				<div class="card">
					<div class="card-header">
						<span class="card-title">browser.pdf</span>
						<span class="card-price">$0.010</span>
					</div>
					<p class="card-desc">Render any URL to PDF via Browser Rendering.</p>
				</div>
				<div class="card">
					<div class="card-header">
						<span class="card-title">browser.markdown</span>
						<span class="card-price">$0.005</span>
					</div>
					<p class="card-desc">Convert page to clean markdown, stripping ads/headers.</p>
				</div>
				<div class="card">
					<div class="card-header">
						<span class="card-title">browser.extract</span>
						<span class="card-price">$0.015</span>
					</div>
					<p class="card-desc">Structured JSON data extraction via AI schema parsing.</p>
				</div>
				<div class="card">
					<div class="card-header">
						<span class="card-title">browser.metadata</span>
						<span class="card-price">$0.008</span>
					</div>
					<p class="card-desc">SEO & OpenGraph metadata extraction.</p>
				</div>
				<div class="card">
					<div class="card-header">
						<span class="card-title">browser.news</span>
						<span class="card-price">$0.005</span>
					</div>
					<p class="card-desc">Real-time news search (titles, links, dates, sources).</p>
				</div>
					<div class="card">
						<div class="card-header">
							<span class="card-title">browser.seo</span>
							<span class="card-price">$0.015</span>
						</div>
						<p class="card-desc">Perform automated SEO health audit and validator on any webpage via browser rendering + AI.</p>
					</div>
					<div class="card">
						<div class="card-header">
							<span class="card-title">browser.contacts</span>
							<span class="card-price">$0.012</span>
						</div>
						<p class="card-desc">Extract email addresses, phone numbers, and social media profile links from any webpage.</p>
					</div>
					<div class="card">
						<div class="card-header">
							<span class="card-title">browser.sitemap</span>
							<span class="card-price">$0.008</span>
						</div>
						<p class="card-desc">Extract website internal links to generate an XML sitemap or JSON URLs array via browser rendering.</p>
					</div>
			</div>
		</section>

		<section>
			<h2>Manual Integration Flow</h2>
			<ul class="step-list">
				<li>Make request to <code>https://x402.tanship.dev/v1/...</code></li>
				<li>Receive <code>402 Payment Required</code> challenge in <code>payment-required</code> header.</li>
				<li>Submit USDC transaction on Base or Sepolia according to challenge.</li>
				<li>Retry original request with transaction proof in <code>PAYMENT-SIGNATURE</code>.</li>
			</ul>
		</section>

		<footer>
			x402-gated API registry · Powered by Cloudflare Workers & Base L2
		</footer>
	</div>
</body>
</html>
`;

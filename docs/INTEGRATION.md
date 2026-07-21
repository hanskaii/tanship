# Strategi Integrasi Tanship API untuk AI Agents

Integrasi Tanship API (berbasis x402) ke framework AI Agents (MCP, Eliza, dll) menggunakan auto-discovery tool dan auto-payment wallet.

---

## 1. Konsep Arsitektur MCP Server (Model Context Protocol)

MCP Server mendeteksi service dari Tanship secara dinamis via `/v1/services` dan membungkusnya sebagai MCP Tools. Pembayaran diselesaikan otomatis di background menggunakan `@x402/fetch`.

```ts
// mcp-server.ts
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
	CallToolRequestSchema,
	ListToolsRequestSchema
} from "@modelcontextprotocol/sdk/types.js";
import { wrapFetchWithPayment } from "@x402/fetch";
import { privateKeyToAccount } from "viem/accounts";

const TANSHIP_BASE = "https://x402.tanship.dev";
const PRIVATE_KEY = process.env.TANSHIP_WALLET_KEY; // EVM Private Key

if (!PRIVATE_KEY) throw new Error("TANSHIP_WALLET_KEY required");

const account = privateKeyToAccount(PRIVATE_KEY as `0x${string}`);
const payFetch = wrapFetchWithPayment(fetch, account);

const server = new Server(
	{ name: "tanship-server", version: "1.0.0" },
	{ capabilities: { tools: {} } }
);

// Dynamic tools discovery
server.setRequestHandler(ListToolsRequestSchema, async () => {
	const res = await fetch(`${TANSHIP_BASE}/v1/services`);
	const data = (await res.json()) as any;

	const tools = data.data.services.map((svc: any) => ({
		name: svc.id.replace(/\./g, "_"), // e.g., ai.chat -> ai_chat
		description: svc.description,
		inputSchema: {
			type: "object",
			properties: svc.input,
			required: Object.keys(svc.input).filter(
				(k) => !svc.input[k].includes("Optional")
			)
		}
	}));

	return { tools };
});

// Execute tool call with auto-payment
server.setRequestHandler(CallToolRequestSchema, async (request) => {
	const serviceId = request.params.name.replace(/_/g, ".");
	const resServices = await fetch(`${TANSHIP_BASE}/v1/services`);
	const svcData = (await resServices.json()) as any;
	const svc = svcData.data.services.find((s: any) => s.id === serviceId);

	if (!svc) throw new Error(`Service ${serviceId} not found`);

	const response = await payFetch(`${TANSHIP_BASE}${svc.path}`, {
		method: svc.method,
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(request.params.arguments)
	});

	if (svc.mimeType.startsWith("image/")) {
		const buffer = await response.arrayBuffer();
		const base64 = Buffer.from(buffer).toString("base64");
		return {
			content: [{ type: "image", data: base64, mimeType: svc.mimeType }]
		};
	}

	const json = await response.json();
	return {
		content: [{ type: "text", text: JSON.stringify(json) }]
	};
});

const transport = new StdioServerTransport();
await server.connect(transport);
```

_ponytail: dynamic routing bypass compile-time schemas. Add schema validator (e.g. zod) when protocol strictly enforces types._

---

## 2. Integrasi Eliza Framework (Plugin)

Eliza menggunakan Actions untuk mengeksekusi Tanship API. Private key dibaca dari konfigurasi Agent.

```ts
// tanshipPlugin.ts
import { Action, Plugin, IAgentRuntime, Memory, State } from "@elizaos/core";
import { wrapFetchWithPayment } from "@x402/fetch";
import { privateKeyToAccount } from "viem/accounts";

const payFetch = (runtime: IAgentRuntime) => {
	const key = runtime.getSetting("TANSHIP_WALLET_KEY");
	const account = privateKeyToAccount(key as `0x${string}`);
	return wrapFetchWithPayment(fetch, account);
};

export const screenshotAction: Action = {
	name: "TANSHIP_SCREENSHOT",
	similes: ["TAKE_SCREENSHOT", "CAPTURE_WEBPAGE"],
	description: "Ambil screenshot website berbayar via Tanship API",
	validate: async (runtime: IAgentRuntime) => {
		return !!runtime.getSetting("TANSHIP_WALLET_KEY");
	},
	handler: async (runtime: IAgentRuntime, message: Memory, state: State) => {
		const fetcher = payFetch(runtime);
		// Ekstrak URL dari message content / state
		const url = "https://example.com";

		const res = await fetcher(
			"https://x402.tanship.dev/v1/browser/screenshot",
			{
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ url })
			}
		);

		const buffer = await res.arrayBuffer();
		// Simpan/kirim buffer image ke platform chat (Discord/Telegram)
		return true;
	},
	examples: [
		[
			{
				user: "{{user1}}",
				content: { text: "Tolong screenshot google.com" }
			},
			{
				agent: "{{agentName}}",
				content: {
					text: "Saya akan ambil screenshot",
					action: "TANSHIP_SCREENSHOT"
				}
			}
		]
	]
};

export const tanshipPlugin: Plugin = {
	name: "tanship-plugin",
	description: "Tanship pay-per-request browser & AI tools plugin",
	actions: [screenshotAction],
	providers: []
};
```

_ponytail: hardcoded action schemas. Add dynamic action generator when runtime supports remote plugin generation._

---

## 3. Strategi Adopsi Developer

1. **Auto-funded Wallet SDK**:
   Sediakan wrapper SDK (`@tanship/sdk`) yang secara otomatis membuat wallet lokal (kunci disimpan di `.env` atau keychain) jika belum ada, mempermudah developer pemula tanpa setup web3 manual.
2. **Awal CLI Playground**:
   Promosikan penggunaan `awal` CLI untuk mencoba API secara langsung dari terminal sebelum menulis kode:
   `npx awal@2.12.0 x402 pay -X POST -d '{"url":"https://example.com"}' https://x402.tanship.dev/v1/browser/markdown`
3. **Bazaar Registry Integration**:
   Karena Tanship mendukung ekstensi Bazaar, daftarkan Tanship API ke direktori global PayAI agar agent otonom lain dapat menemukan dan membayar API secara dinamis tanpa integrasi manual.

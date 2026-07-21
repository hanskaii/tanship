# Tanship MCP Server

Model Context Protocol (MCP) server for **x402.tanship.dev** paid API services. Exposes all paid AI & browser tools to Claude Desktop, Cursor, Eliza, and other AI agents with **on-chain auto-payment**.

---

## Features

- **Dynamic Tool Discovery**: Automatically fetches and maps available paid endpoints from `https://x402.tanship.dev/v1/services` into MCP tools.
- **Auto-Payment**: Intercepts `402 Payment Required` challenges, signs and submits the required USDC payment on Base network, waits for transaction confirmation, and retries requests automatically.
- **Zero Configuration**: No API keys, no sign-ups. Just fund your Base wallet.

---

## Configuration

The server requires a Base wallet private key to sign and submit payment transactions.

### Environment Variables

| Variable             | Description                               | Default | Required |
| :------------------- | :---------------------------------------- | :------ | :------- |
| `TANSHIP_WALLET_KEY` | EVM Private Key of the payer wallet       | -       | **Yes**  |
| `TANSHIP_NETWORK`    | Target network (`base` or `base-sepolia`) | `base`  | No       |

---

## Integration Guides

### 1. Claude Desktop

Add this to your Claude Desktop configuration file (typically at `~/Library/Application Support/Claude/claude_desktop_config.json` on macOS or `%APPDATA%/Claude/claude_desktop_config.json` on Windows):

```json
{
	"mcpServers": {
		"tanship": {
			"command": "npx",
			"args": ["-y", "@workspace/mcp"],
			"env": {
				"TANSHIP_WALLET_KEY": "YOUR_EVM_PRIVATE_KEY_HERE",
				"TANSHIP_NETWORK": "base"
			}
		}
	}
}
```

_Note: Replace `@workspace/mcp` with the published npm package name once published._

### 2. Cursor

1. Open Cursor Settings -> Features -> MCP.
2. Click **+ Add New MCP Server**.
3. Fill details:
    - **Name**: `tanship`
    - **Type**: `command`
    - **Command**: `TANSHIP_WALLET_KEY=your_key_here node /path/to/tanship/packages/mcp/dist/index.js`

---

## How it Works

1. **Discovery**: The MCP server queries the Tanship catalog to find active endpoints, pricing, descriptions, and schemas.
2. **Expose**: Emits these as standard tools to the agent.
3. **Execution**:
    - Agent requests tool.
    - MCP server forwards the request to `x402.tanship.dev`.
    - Server returns `402 Payment Required` with a decoded challenge.
    - MCP server signs a USDC transfer on Base/Sepolia, broadcasts it, gets the transaction hash, and appends the proof in the `PAYMENT-SIGNATURE` header.
    - Server processes and responds with the data.

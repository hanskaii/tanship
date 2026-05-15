## Why

Fumadocs is installed but no `/docs` routes exist — it wraps the entire app in `RootProvider` for no benefit and adds ~3 packages to the bundle. The AI chat feature (Cloudflare agents, Vercel AI SDK) was partially built but never completed; the implementation files are already deleted, leaving broken imports in the API entry point and dead dependencies across both apps.

## What Changes

- **BREAKING** Remove `fumadocs-core`, `fumadocs-mdx`, `fumadocs-ui` from `apps/web/package.json`
- Remove `RootProvider` import and wrapper from `apps/web/src/routes/__root.tsx`
- Delete generated `.source/` directory (`browser.ts`, `server.ts`, `dynamic.ts`) from `apps/web/`
- Delete `apps/web/src/changelog/` directory (v0.9.0.mdx, v1.0.0.mdx) — no consumer exists
- Remove dead `ChatAgent` import and `/agents/*` route handler from `apps/api/src/index.ts`
- **BREAKING** Remove AI/chat packages from `apps/api/package.json`: `agents`, `ai`, `@cloudflare/ai-chat`, `workers-ai-provider`
- **BREAKING** Remove AI/chat packages from `apps/web/package.json`: `agents`, `ai`, `@cloudflare/ai-chat`
- Remove `/agents` WebSocket proxy from `apps/web/vite.config.ts`
- Commit the already-deleted chat route files (`apps/web/src/routes/(app)/_app/chat/`, `-fn/chat-room.tsx`, `apps/api/src/agents/chat.agent.ts`) as part of this cleanup

## Capabilities

### New Capabilities

- `dead-code-removal`: Removal of fumadocs infrastructure and AI chat scaffolding — ensuring the codebase only contains actively used dependencies and code

### Modified Capabilities

<!-- none — no spec-level behavior changes; only deletions of non-functional scaffolding -->

## Impact

- **`apps/web/package.json`**: Remove 3 fumadocs deps + 3 AI deps
- **`apps/api/package.json`**: Remove 4 AI/agent deps
- **`apps/web/src/routes/__root.tsx`**: Remove `RootProvider` wrapper (simplifies root layout)
- **`apps/api/src/index.ts`**: Remove broken `ChatAgent` import + dead agent route
- **`apps/web/vite.config.ts`**: Remove `/agents` proxy config
- **Generated/content dirs**: `apps/web/.source/`, `apps/web/src/changelog/` deleted
- **Already-deleted files** (unstaged): chat route files — these get staged and committed
- No API contracts, auth logic, payment flows, or user-facing functionality is affected

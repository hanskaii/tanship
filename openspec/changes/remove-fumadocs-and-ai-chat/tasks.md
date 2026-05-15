## 1. Remove AI/Chat Packages

- [ ] 1.1 Remove `agents`, `ai`, `@cloudflare/ai-chat`, `workers-ai-provider` from `apps/api/package.json` dependencies
- [ ] 1.2 Remove `agents`, `ai`, `@cloudflare/ai-chat` from `apps/web/package.json` dependencies

## 2. Remove Fumadocs Packages

- [ ] 2.1 Remove `fumadocs-core`, `fumadocs-mdx`, `fumadocs-ui` from `apps/web/package.json` dependencies

## 3. Clean Up API Entry Point

- [ ] 3.1 Remove `ChatAgent` import from `apps/api/src/index.ts`
- [ ] 3.2 Remove `routeAgentRequest` import from `apps/api/src/index.ts`
- [ ] 3.3 Remove the `/agents/*` route handler block from `apps/api/src/index.ts`
- [ ] 3.4 Remove `ChatAgent` from the Cloudflare Workers `export default` object in `apps/api/src/index.ts`

## 4. Clean Up Web App

- [ ] 4.1 Remove `RootProvider` import and wrapper from `apps/web/src/routes/__root.tsx`
- [ ] 4.2 Remove `/agents` proxy entry from `apps/web/vite.config.ts`

## 5. Delete Generated and Content Directories

- [ ] 5.1 Delete `apps/web/.source/` directory (fumadocs-generated files)
- [ ] 5.2 Delete `apps/web/src/changelog/` directory (unused MDX content)

## 6. Sync Dependencies and Commit

- [ ] 6.1 Run `pnpm install` to regenerate the lockfile after package.json changes
- [ ] 6.2 Stage already-deleted chat files (`apps/api/src/agents/chat.agent.ts`, `apps/web/src/routes/(app)/_app/chat/` components, `apps/web/src/routes/-fn/chat-room.tsx`) and commit all changes together

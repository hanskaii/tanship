## ADDED Requirements

### Requirement: Fumadocs packages are removed from web app

The `apps/web` build SHALL NOT depend on `fumadocs-core`, `fumadocs-mdx`, or `fumadocs-ui`. The `RootProvider` wrapper SHALL be removed from `__root.tsx` and no fumadocs import SHALL remain in the web app source.

#### Scenario: Web app builds without fumadocs

- **WHEN** `pnpm build` runs in `apps/web`
- **THEN** the build SHALL succeed with no fumadocs-related imports or errors

#### Scenario: Root layout has no fumadocs provider

- **WHEN** `apps/web/src/routes/__root.tsx` is read
- **THEN** no import from `fumadocs-ui` SHALL be present and no `<RootProvider>` wrapper SHALL exist in the JSX

### Requirement: Fumadocs generated artifacts and content are deleted

The `apps/web/.source/` directory and `apps/web/src/changelog/` directory SHALL not exist in the repository after this change.

#### Scenario: Generated source directory is absent

- **WHEN** the repository is checked out
- **THEN** `apps/web/.source/` SHALL not exist as a directory

#### Scenario: Changelog MDX content is removed

- **WHEN** the repository is checked out
- **THEN** `apps/web/src/changelog/` SHALL not exist as a directory

### Requirement: AI/chat packages are removed from both apps

The `apps/api` package SHALL NOT depend on `agents`, `ai`, `@cloudflare/ai-chat`, or `workers-ai-provider`. The `apps/web` package SHALL NOT depend on `agents`, `ai`, or `@cloudflare/ai-chat`.

#### Scenario: API builds without AI packages

- **WHEN** `pnpm build` runs in `apps/api`
- **THEN** the build SHALL succeed with no imports from the removed AI packages

#### Scenario: Web app builds without AI packages

- **WHEN** `pnpm build` runs in `apps/web`
- **THEN** the build SHALL succeed with no imports from the removed AI packages

### Requirement: API entry point has no broken agent imports

`apps/api/src/index.ts` SHALL NOT contain any import of `ChatAgent`, `routeAgentRequest`, or any reference to `./agents/chat.agent`. The `/agents/*` route handler SHALL be removed.

#### Scenario: API index.ts has no ChatAgent reference

- **WHEN** `apps/api/src/index.ts` is read
- **THEN** no import or usage of `ChatAgent` or `routeAgentRequest` SHALL be present

#### Scenario: No /agents route is registered

- **WHEN** the API server starts
- **THEN** requests to `/agents/*` SHALL return 404 (no handler registered)

### Requirement: Vite config has no agents proxy

`apps/web/vite.config.ts` SHALL NOT contain a proxy entry for `/agents`.

#### Scenario: Vite config agents proxy is absent

- **WHEN** `apps/web/vite.config.ts` is read
- **THEN** no proxy rule targeting `/agents` SHALL be present

### Requirement: Previously deleted chat files are committed

All chat-related files that were deleted from the working tree (chat route components, chat server function, chat agent) SHALL be staged and included in the cleanup commit so the repository has no partially-deleted artifacts.

#### Scenario: No unstaged chat file deletions remain

- **WHEN** `git status` is run after the cleanup commit
- **THEN** no deleted chat files SHALL appear as unstaged changes

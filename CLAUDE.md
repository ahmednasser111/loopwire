# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

Package manager is pnpm (`pnpm-lock.yaml` is the lockfile in use).

```bash
pnpm install   # install deps
pnpm dev       # start dev server (http://localhost:3000)
pnpm build     # production build
pnpm start     # run production build
pnpm lint      # next lint
```

There is no test suite configured in this repo (no test script, no test files). `next.config.mjs` also disables build-time enforcement of both lint and type errors (`eslint.ignoreDuringBuilds`, `typescript.ignoreBuildErrors`), so `pnpm build` succeeding is not proof the code type-checks — run `pnpm lint` and `npx tsc --noEmit` separately when that matters.

## Architecture

This repo is the **frontend only**. It talks to a separate backend project (Kong API Gateway + an auth service on :3001 + a chat service on :3002 + Postgres/Kafka, referred to in comments as the `microservices-project` repo) over REST and Socket.IO. There is no backend code here beyond the single `/api/wake` route described below.

- **`hooks/use-chat.ts` is the single source of truth for client state.** It owns auth (token/user persisted to `localStorage`), the Socket.IO connection, messages, rooms, online users, and typing indicators. Pages call `useChat()` directly — there is no context provider or external store. `app/chat/page.tsx` and the auth forms under `components/auth/` are the consumers; keep new chat/auth features going through this hook rather than introducing a parallel state path.
- **Auth is a client-side gate, not middleware.** Each protected page sets an `isMounted` flag on mount (to avoid an SSR/CSR mismatch reading `localStorage`), then checks `isAuthenticated()` and redirects to `/auth` if it fails. There's no route-level protection.
- **API surface**: REST calls are built as `${NEXT_PUBLIC_GATEWAY_URL}` + `/auth/api/v1/auth/*` (login/register/logout) or `/chat/api/*` (messages/rooms/users), matching Kong's routing. Socket.IO connects straight to the gateway URL with the JWT in the handshake `auth`, and the event names it listens for/emits (`message:send`, `message:new`, `user:joined`, `typing:start`, `room:created`, etc.) are the contract with the chat service — see the README's "WebSocket Events" section before changing any event name.
- **`lib/api.ts` (`KongChatAPI` class) and `lib/chat-client.js` are unused legacy/reference code** predating `use-chat.ts` — nothing imports them. Don't extend them without first confirming a page actually consumes them.
- **Cold-start wake gate**: the deployed backend is an Azure VM that deallocates itself after 30 min idle to save hosting cost. `app/layout.tsx` wraps the whole app in `components/backend-wake-gate.tsx`, which polls `app/api/wake/route.ts` (server-side; talks to Azure Resource Manager to read power state and start the VM, then confirms the gateway's `/auth/health` actually responds — power "running" only means the OS booted, Postgres/Kafka/Kong take another ~minute) every 8s for up to 3 minutes, showing a "waking up" screen in the meantime. Without the `AZURE_*` env vars set (e.g. local dev), the route no-ops and the gate fails open immediately.
- **UI kit**: shadcn/ui (`new-york` style, see `components.json`) on Tailwind v4 with Radix primitives under `components/ui/`. Theme is user-toggleable (dark by default) via `next-themes` — `app/layout.tsx` wraps the app in `ThemeProvider` (`attribute="class"`, `defaultTheme="dark"`), and `components/theme-toggle.tsx` flips it. Brand palette (indigo primary + cyan accent) lives in `app/globals.css` as CSS vars, defined separately for `:root` (light) and `.dark`.

## Environment variables

See `.env.local.example`. `NEXT_PUBLIC_GATEWAY_URL` (the Kong gateway URL) is the only one needed for local dev against a running backend. The `AZURE_*` vars (`AZURE_TENANT_ID`, `AZURE_CLIENT_ID`, `AZURE_CLIENT_SECRET`, `AZURE_SUBSCRIPTION_ID`, `AZURE_RESOURCE_GROUP`, `AZURE_VM_NAME`) are only for the production wake-up flow and are optional everywhere else.

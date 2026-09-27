# Perfume Café — notes for Claude Code

Next.js 16 + React 19.2 + Prisma 7 + next-intl 4 + Auth.js v5 + Tailwind v4. Package manager: **pnpm**. See README.md.

## Conventions
- Next 16: `src/proxy.ts` (not middleware.ts); `params`/`searchParams`/`cookies()` are Promises — always `await`.
- Prisma 7: client is generated to `src/generated/prisma` (`import { PrismaClient } from "@/generated/prisma/client"`), connection URL lives in `prisma.config.ts`, driver adapter `@prisma/adapter-pg`. Never import Prisma in client components — use the shapes in `src/lib/catalog.ts`.
- All UI text lives in `messages/ar.json` + `messages/en.json` (same keys in both; typed via `src/global.d.ts`).
- Brand tokens are in `src/app/globals.css` `@theme` (bg-bg, text-ink, bg-gold, text-gold-text …). Use logical properties (ms/me/ps/pe/start/end) so RTL and LTR both work.
- Every admin Server Action starts with `requireStaff()` / `requireAdmin()` from `src/server/guard.ts`.
- Prices are integers in EGP. Order totals are always recomputed on the server (`placeOrder`).

## Verify before finishing any change
```bash
pnpm install
pnpm typecheck
pnpm lint
pnpm build
# with a database:
pnpm db:migrate --name init && pnpm db:seed
pnpm exec playwright install chromium && pnpm test:e2e
```
Fix every error these report; do not silence lint rules or use `any` / `@ts-ignore` to get green.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

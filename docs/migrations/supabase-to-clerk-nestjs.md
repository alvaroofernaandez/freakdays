# Migration: Supabase → Clerk (auth) + NestJS API (data)

**Status:** Planning
**Owner:** TBD
**Started:** 2026-05-13
**Estimated PRs:** 7–10 chained PRs

## Goal

Fully extract Supabase from `packages/web`. Auth moves to Clerk (already partially wired). All data access moves to the NestJS API at `packages/api` (already covers every web domain).

## Current state — what the audit found

### Already done (partial migration)

- `app/plugins/clerk.client.ts` — initializes Clerk on the client.
- `app/composables/useAuth.ts` — Clerk-based, declares legacy auth removed.
- `app/types/clerk.d.ts` — Clerk types.
- `packages/api/src/auth/` — full Clerk-aware module: JWT payload type, strategies, guards.
- `packages/api/src/common/guards/org-context.guard.ts` — org-context awareness.

### Not done (the work)

- `app/middleware/auth.global.ts` — **still** calls `useSupabase()` and `useSupabaseUser()`.
- 33 web server endpoints under `packages/web/server/api/*` use `serverSupabaseUser()` for auth and `new PrismaClient()` for data.
- `app/components/party/lists/PartyAnimeList.vue` and `TierListEditor.vue` import a `@/composables/useSupabase` file that **does not exist** (broken on `main`).
- `app/utils/legacy-guard.ts` and `app/utils/migration-flags.ts` — migration scaffolding, likely now dead code.
- `app/types/database.types.ts` — Supabase generated types.
- `packages/web/supabase/functions/quest-notifications/index.ts` — Supabase Edge function for notifications.
- `packages/web/vite-plugins/supabase-warnings-filter.ts` — silences Supabase noise (tech-debt indicator).
- `packages/web/prisma/schema.prisma` — separate Prisma schema parallel to `packages/api/prisma/schema.prisma`.
- 8+ test files import or mock `@supabase/*`.
- `package.json`: `@nuxtjs/supabase` dependency.

### Architecture today (pre-migration)

```
┌─────────────────────────────┐
│         packages/web        │
│  ┌─────────────────────┐    │
│  │ Vue pages / comps   │    │
│  └──────────┬──────────┘    │
│             ↓ $fetch        │
│  ┌─────────────────────┐    │
│  │ server/api/*        │    │
│  │  - serverSupabaseUser    │
│  │  - new PrismaClient()    │
│  └──────────┬──────────┘    │
│             ↓                │
│        web/prisma            │
│             ↓                │
└─────────────┼────────────────┘
              │
              ↓
        ┌──────────┐         ┌──────────────────┐
        │ Postgres │ ← also ─│  packages/api    │
        └──────────┘         │  (NestJS)        │
                             │  unused by web   │
                             └──────────────────┘
```

### Architecture after

```
┌─────────────────────────────┐
│         packages/web        │
│  ┌─────────────────────┐    │
│  │ Vue pages / comps   │    │
│  └──────────┬──────────┘    │
│             ↓ $fetch + Clerk JWT
│  ┌─────────────────────┐    │
│  │ server/api/* (proxy)│    │  (optional layer; may be removed)
│  │  - verify Clerk JWT │    │
│  │  - forward to API   │    │
│  └──────────┬──────────┘    │
└─────────────┼────────────────┘
              │ JWT
              ↓
        ┌──────────────────┐
        │ packages/api     │
        │ (NestJS + Clerk) │
        │  - prisma ONLY here │
        └──────────┬────────┘
                   ↓
              ┌──────────┐
              │ Postgres │
              └──────────┘
```

## Endpoint mapping

Every web endpoint maps to an existing NestJS controller — confirmed by the audit:

| Web endpoint                             | NestJS controller                                             | Action                                        |
| ---------------------------------------- | ------------------------------------------------------------- | --------------------------------------------- |
| `server/api/anime/*`                     | `anime.controller.ts`                                         | Migrate (forward or delete-and-call-directly) |
| `server/api/manga/*`                     | `manga.controller.ts`                                         | Migrate                                       |
| `server/api/party/[partyId]/lists/*`     | `party-lists.controller.ts`                                   | Migrate                                       |
| `server/api/party/lists/[listId]/*`      | `party-lists.controller.ts`                                   | Migrate                                       |
| `server/api/profile/*`                   | `profile.controller.ts`                                       | Migrate                                       |
| `server/api/quests/*`                    | `quests.controller.ts` + `quests-notifications.controller.ts` | Migrate                                       |
| `server/api/workouts/*`                  | `workouts.controller.ts`                                      | Migrate                                       |
| `supabase/functions/quest-notifications` | `quests-notifications.controller.ts` (extend if needed)       | Port to NestJS scheduled job                  |

No new NestJS controllers required.

## Sub-phase breakdown

Delivered as chained PRs. Each PR is independently mergeable and adds value.

### S1 — This planning doc

**Scope:** add this document under `docs/migrations/`.
**Risk:** zero.
**Outcome:** strategy of record for the migration.

### S2 — `useSupabase` placeholder fix

**Scope:** `PartyAnimeList.vue` and `TierListEditor.vue` import a missing `@/composables/useSupabase`. Either restore a minimal stub or replace the import with a TODO comment + temporary disable of those features. Goal: unbreak web `build`.
**Risk:** low.
**Outcome:** web `Build` job in CI goes green; can be promoted to gating.

### S3 — Web → NestJS HTTP client + auth bridge

**Scope:**

- Create `packages/web/server/utils/api-client.ts` — `$fetch` wrapper that reads the Clerk session token (from cookie or `useAuth().getToken()` server-side) and forwards to NestJS with `Authorization: Bearer <jwt>`.
- Add `NUXT_PUBLIC_API_URL` runtime config.
- Add Clerk session token retrieval helper for server-side endpoints.

**Risk:** medium. New plumbing, but additive.
**Outcome:** primitive that all subsequent endpoint migrations rely on.

### S4 — Auth middleware migration

**Scope:**

- Rewrite `app/middleware/auth.global.ts` to use `useAuth().isSignedIn` / `useUser()` from Clerk.
- Remove all `useSupabaseUser()` / `useSupabase()` calls.
- Verify onboarding and redirect logic still works.
- Update tests in `tests/unit/composables/useAuth.test.ts` and `tests/setup.ts`.

**Risk:** medium-high. Auth touches every protected page.
**Outcome:** front-end auth is 100% Clerk.

### S5 — Migrate web endpoints by domain (1 PR per domain)

**Scope per PR:**

- Replace each `server/api/<domain>/*` endpoint with a call to the corresponding NestJS controller via the `api-client` from S3.
- Keep the web endpoint file as a thin proxy _or_ delete it and have the client call NestJS directly. Decide per domain based on whether the client uses `$fetch('/api/<domain>')` or a typed wrapper.

Order (smallest first → largest):

1. S5.a — `anime` (4 endpoints)
2. S5.b — `manga` (4 endpoints)
3. S5.c — `party` + `party-lists` (5 endpoints)
4. S5.d — `profile` (3 endpoints)
5. S5.e — `quests` + `quests-notifications` (7 endpoints)
6. S5.f — `workouts` (10 endpoints)

**Risk:** medium per domain.
**Outcome:** each PR shrinks web's local Prisma usage; CI catches regressions.

### S6 — Delete web's Prisma layer

**Scope:**

- Delete `packages/web/prisma/`.
- Remove `@prisma/client` and `prisma` from `packages/web/package.json`.
- Remove web's `prisma:*` scripts and DATABASE_URL from `runtimeConfig`.
- Remove `server/utils/prisma.ts`.

**Risk:** low (once S5 is complete; tests will catch any miss).
**Outcome:** single source of truth for the database — NestJS.

### S7 — Port the Edge function

**Scope:**

- Port `packages/web/supabase/functions/quest-notifications/index.ts` to a NestJS scheduled job (using `@nestjs/schedule`).
- Delete `packages/web/supabase/` directory.

**Risk:** medium (functional behavior must be preserved — verify cron timing and email/notification flow).
**Outcome:** zero Supabase-hosted code.

### S8 — Remove Supabase artifacts

**Scope (mechanical, last step):**

- Remove `@nuxtjs/supabase` from `packages/web/package.json`.
- Remove `@nuxtjs/supabase` module from `nuxt.config.ts`.
- Remove `supabase` config block from `nuxt.config.ts`.
- Remove `SUPABASE_URL` / `SUPABASE_ANON_KEY` from `.env.example` and `runtimeConfig`.
- Delete `packages/web/app/types/database.types.ts`.
- Delete `packages/web/vite-plugins/supabase-warnings-filter.ts`.
- Delete `packages/web/app/utils/legacy-guard.ts` and `migration-flags.ts` (if confirmed dead).
- Delete `packages/web/tests/unit/composables/__mocks__/supabase.ts`.
- Update `tests/setup.ts` to drop Supabase mocks.

**Risk:** low (if previous phases were thorough).
**Outcome:** zero references to Supabase in the codebase.

### S9 — Tests rewrite

**Scope:**

- Audit the 8+ test files importing Supabase mocks.
- Rewrite using Clerk/NestJS-API mocks instead.
- Aim to unblock the 7 currently-failing tests if they're Supabase-related.

**Risk:** medium.
**Outcome:** non-blocking test job in CI can be promoted to gating.

## Pre-flight checks (before starting S2)

Before opening the next PR (S2), verify:

- [ ] This planning doc is merged.
- [ ] CI is green on `main` (or known non-blocking failures are documented).
- [ ] `NUXT_PUBLIC_CLERK_PUBLISHABLE_KEY` is documented in `.env.example`.
- [ ] `packages/api` has a documented `CLERK_SECRET_KEY` env (check `auth.module.ts`).
- [ ] Decide: do we run `packages/api` locally during web dev, or hit a staging API? Add to `docs/development.md`.

## Roll-back plan per sub-phase

- **S2–S5:** each PR is independently revertable — domain migrations are isolated.
- **S6 (delete web Prisma):** revert restores `prisma/` directory and the `@prisma/client` dep. Lockfile changes will need `pnpm install` afterwards.
- **S7 (port edge function):** keep the Supabase function file in git history; the NestJS scheduled job runs in parallel for one release before deleting.
- **S8 (remove deps):** revert restores deps. The hardest to roll back is the `nuxt.config.ts` module removal — keep a clear commit.

## Out of scope

- Performance optimisation (covered later in Phase 5 of the main refactor).
- New features.
- Touching the API's own architecture or schema.
- Changing the database itself (still Postgres, still same data).

## Open questions

1. Do we keep web's `server/api/*` as proxies (thin auth-forwarders) or have the Nuxt client call NestJS directly? **Recommendation:** proxies for v1 (no CORS/Origin complications); collapse later.
2. Does the team have a Clerk publishable + secret key for staging? If not, S3 is blocked.
3. Is the database currently shared between web/prisma and api/prisma (same `DATABASE_URL`)? If yes, schema drift is a real risk during the migration window.

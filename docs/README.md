# FreakDays — Documentation

Project documentation, organised by domain. Start here.

## Quick links

- **Just getting started?** → [`development/getting-started.md`](development/getting-started.md) — `make dev` is the single command to run everything
- **Database or Prisma setup?** → [`development/database-setup.md`](development/database-setup.md) and [`development/prisma-setup.md`](development/prisma-setup.md) — Postgres on port **5433**, Redis required
- **System architecture (F0–F4)?** → [`architecture/overview.md`](architecture/overview.md) — event-driven backbone, gamification engine, realtime gateway, immersive UI, social layer
- **Tracking a design decision?** → [`architecture/decisions/`](architecture/decisions/)
- **Deploying to production?** → [`deployment/overview.md`](deployment/overview.md) — Redis is a required production dependency
- **Quick command reference?** → [`guides/quick-reference.md`](guides/quick-reference.md)

## Directory layout

| Path                                                 | What lives here                                                                         |
| ---------------------------------------------------- | --------------------------------------------------------------------------------------- |
| [`architecture/`](architecture/)                     | System overview, component / page / composable maps, database schema.                   |
| [`architecture/decisions/`](architecture/decisions/) | Architecture Decision Records — short append-only logs of meaningful technical choices. |
| [`api/`](api/)                                       | API integration notes (NestJS endpoints, auth, contracts).                              |
| [`development/`](development/)                       | Local setup, dev workflow, Prisma usage, troubleshooting.                               |
| [`deployment/`](deployment/)                         | Production deployment, environments, infra notes.                                       |
| [`guides/`](guides/)                                 | How-to recipes — AI contributor guidelines, code examples, quick reference cheatsheet.  |
| [`migrations/`](migrations/)                         | One-off migration plans (Prisma version bumps, Supabase removal, etc.).                 |

## Conventions

- One topic per file. If a file grows past ~400 lines, split it.
- Filenames are `kebab-case.md`. No spaces, no ALL-CAPS.
- Internal links use relative paths from the doc's own directory.
- Add an ADR for any decision that is hard to reverse, expensive to undo, or non-obvious in six months — see [`architecture/decisions/README.md`](architecture/decisions/README.md) for the lightweight template.
- Cross-link liberally. Documentation nobody can find may as well not exist.

## Modules of the application

FreakDays is organised in these top-level modules:

- **Gamification** — event-driven engine: EXP/levels (F1), streaks (F1), achievements (F1), real-time updates via Socket.IO (F2), GSAP celebrations (F3)
- **Anime** — list management via the Jikan (MyAnimeList) API
- **Manga** — physical collection, wishlist, volume tracking
- **Workouts** — sessions, exercises, sets
- **Quests** — daily missions with difficulty tiers
- **Party** — group system, invite codes, member roles, leaderboards (F4), activity feed (F4)
- **Calendar** — monthly grid with drag-and-drop event scheduling

## Architecture layers (F0–F4)

All five layers are shipped and active:

| Layer  | Name                | Description                                                                                 |
| ------ | ------------------- | ------------------------------------------------------------------------------------------- |
| **F0** | Outbox + Event Bus  | Crash-safe BullMQ relay; domain events written in the same DB transaction as business state |
| **F1** | Gamification Engine | Idempotent handlers: EXP/level, streaks, achievements, stats projection                     |
| **F2** | Realtime Gateway    | Socket.IO authenticated via Clerk JWKS; `user:{id}` and `party:{id}` rooms; Redis adapter   |
| **F3** | Immersive UI        | Pixel/arcade layer: GSAP celebrations, WebAudio, menu transitions                           |
| **F4** | Social Layer        | Party leaderboards + activity feed                                                          |

## See also

- Project root [`README.md`](../README.md) — what FreakDays is, install steps, key scripts.
- [`../AGENTS.md`](../AGENTS.md) — instructions for AI / automated contributors.
- [`../CONTRIBUTING.md`](../CONTRIBUTING.md) — human contributor guide.
- [`../WORKFLOW.md`](../WORKFLOW.md) — branching, commits, releases.
- [`../SECURITY.md`](../SECURITY.md) — security policy and disclosure.

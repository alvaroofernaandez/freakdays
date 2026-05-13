# FreakDays — Documentation

Project documentation, organised by domain. Start here.

## Quick links

- **Just getting started?** → [`development/getting-started.md`](development/getting-started.md)
- **Need to set up the database?** → [`development/database-setup.md`](development/database-setup.md) and [`development/prisma-setup.md`](development/prisma-setup.md)
- **Looking for the system shape?** → [`architecture/overview.md`](architecture/overview.md)
- **Tracking a design decision?** → [`architecture/decisions/`](architecture/decisions/)

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

- 🎮 **Gamification** — levels, EXP, rewards
- 📺 **Anime** — list management via the Jikan (MyAnimeList) API
- 📚 **Manga** — physical collection, wishlist, volume tracking
- 💪 **Workouts** — sessions, exercises, sets
- ✅ **Quests** — daily missions with difficulty tiers
- 👥 **Party** — group system, invite codes, member roles
- 📅 **Calendar** — monthly grid with drag-and-drop event scheduling

## See also

- Project root [`README.md`](../README.md) — what FreakDays is, install steps, key scripts.
- [`../AGENTS.md`](../AGENTS.md) — instructions for AI / automated contributors.
- [`../CONTRIBUTING.md`](../CONTRIBUTING.md) — human contributor guide.
- [`../WORKFLOW.md`](../WORKFLOW.md) — branching, commits, releases.
- [`../SECURITY.md`](../SECURITY.md) — security policy and disclosure.

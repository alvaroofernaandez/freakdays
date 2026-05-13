# 0001. Record architecture decisions

**Status:** Accepted
**Date:** 2026-05-13
**Deciders:** @alvaroofernaandez

## Context

The repository accumulated a number of significant architectural choices
during 2025–2026 (Clerk for auth, NestJS for the API, PostgreSQL + Prisma
for persistence, pnpm workspaces for monorepo layout, the recent
Supabase → Clerk + NestJS migration). None of them were captured anywhere
durable, so the rationale lives in commit messages and PR descriptions
that nobody scrolls back to.

Future maintainers — including the same author six months from now — need
a way to look up **why** a structural decision was made without
re-reading the entire git history.

## Decision

We adopt Architecture Decision Records (ADRs), stored under
`docs/architecture/decisions/`, using the lightweight template at
[`adr-template.md`](adr-template.md). Each ADR is short, present-tense,
append-only.

New decisions are added in the PR that implements them. Reversals are
captured by writing a new ADR that supersedes the old one — the original
is never rewritten.

## Alternatives considered

- **Confluence / Notion** — out of repo, separate auth, dies the moment
  someone forgets to renew the seat. Nope.
- **Inline comments in code** — high-friction to find, no review trail.
- **Wiki on GitHub** — separate from the code, not versioned alongside
  PRs, easy to forget.

ADRs in-tree win on three axes: searchable with the repo, reviewed in
PRs, versioned with the code they document.

## Consequences

- ✅ Decisions become discoverable via `docs/architecture/decisions/`.
- ✅ New contributors can read the ADR log to learn the system's "why".
- ✅ Reversals leave an auditable trail (new ADR supersedes old).
- ⚠️ Adds a step to PRs that introduce hard-to-reverse changes.
- 🔁 Revisit if the ADR log grows beyond ~30 entries — at that point we
  may want better categorisation or per-domain sub-indices.

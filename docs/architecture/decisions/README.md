# Architecture Decision Records (ADRs)

Append-only log of meaningful technical decisions. Inspired by Michael Nygard's
[Documenting Architecture Decisions](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions).

## Why ADRs

Six months from now, no one remembers **why** we picked PostgreSQL over
Mongo, why auth went through Clerk, or why the web package proxies to NestJS
instead of hitting the DB directly. ADRs make those decisions discoverable.

## When to write one

Write an ADR when the choice is:

- **Hard to reverse** — schema shapes, framework choices, public API contracts.
- **Expensive to undo** — anything that ripples through 5+ files.
- **Non-obvious in six months** — anywhere a reader would ask "why on earth did we do it like this?".

Skip ADRs for:

- One-off bugfixes.
- Style or formatting changes.
- Anything covered by lint or CI rules.

## How to add one

1. Copy [`adr-template.md`](adr-template.md) to `NNNN-short-kebab-title.md` where `NNNN` is the next free number.
2. Fill in the headings. Be terse — the value is in `Context` and `Consequences`.
3. Status starts as `Proposed`. Land it in the PR that implements the decision; flip to `Accepted` on merge.
4. Never edit an `Accepted` ADR's substance. To revisit a decision, write a new ADR that supersedes it (and update the old one's `Status` to `Superseded by NNNN`).
5. List the new ADR in the index below.

## Index

| #                                             | Title                         | Status   |
| --------------------------------------------- | ----------------------------- | -------- |
| [0001](0001-record-architecture-decisions.md) | Record architecture decisions | Accepted |

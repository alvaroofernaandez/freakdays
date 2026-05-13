# Changesets

This directory holds [Changesets](https://github.com/changesets/changesets):
small Markdown files that describe a release-worthy change.

## Why

Changesets decouple "the code change" from "the version bump and changelog
entry". Contributors mark intent in the same PR that introduces the change;
a separate Release PR (created and maintained by the GitHub Action) accumulates
those entries and applies them in batch when merged.

## Workflow

### 1. While working on a PR

If the PR ships a user-visible change to either package (`freak-days`,
`freak-days-api`), generate a changeset:

```bash
pnpm changeset
```

This walks you through:

- which packages are affected
- semver bump level per package (`patch` | `minor` | `major`)
- a one-line summary that will land in `CHANGELOG.md`

A new file appears under `.changeset/<slug>.md`. **Commit it** in the same PR.

### 2. Skipping changesets

For PRs with no user-visible effect (refactors, internal tests, docs,
chore-only edits), skip the changeset. The release workflow does not require
one on every PR.

If you want the bot to leave you alone explicitly:

```bash
pnpm changeset --empty
```

### 3. Releases

The `.github/workflows/release.yml` action watches `main`. When it sees
unreleased changesets, it opens a "Version Packages" PR that:

- consumes the changeset files
- bumps each affected package's `package.json` version
- appends entries to that package's `CHANGELOG.md`

Merging that Release PR triggers the publish step (publishing to npm is
disabled — these packages are private — but the version bump + git tag still
fire so you have a clean release artifact).

## Conventions

- One changeset file per logical change. Multiple files in one PR are fine
  if the PR genuinely makes independent changes.
- Summary lines start with a verb in present tense ("Add Clerk auth bridge",
  "Fix race in Prisma generate").
- For internal-only churn that still bumps the package version (e.g.
  dependency-only updates), prefer `patch`.

See [the official docs](https://github.com/changesets/changesets/blob/main/docs/intro-to-using-changesets.md)
for the full feature set.

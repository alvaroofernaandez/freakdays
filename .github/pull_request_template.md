<!--
  Thanks for the PR! A clear description saves the reviewer (and future-you)
  hours. Delete sections that don't apply.
-->

## Summary

<!-- One or two sentences: WHAT this changes and WHY. -->

## Changes

<!-- Bulleted list. Keep it tight. -->

- …

## Type of change

<!-- Pick at least one. -->

- [ ] `feat` — new feature
- [ ] `fix` — bug fix
- [ ] `refactor` — internal restructure without behavior change
- [ ] `perf` — performance improvement
- [ ] `style` — formatting only, no logic
- [ ] `docs` — documentation only
- [ ] `test` — adding or rewriting tests
- [ ] `build` / `ci` — tooling, dependencies, pipelines
- [ ] `chore` — anything else

## Architecture / decisions

<!--
  Hard-to-reverse choice in this PR? Add an ADR under
  docs/architecture/decisions/ and link it here.
  Skip this section for bugfixes, style, docs, or test-only PRs.
-->

- [ ] Added an ADR
- [ ] N/A

## Verification

<!--
  How did you test this? Paste the commands you actually ran.
  Replace with what's relevant.
-->

```
✓ pnpm install
✓ pnpm format:check
✓ pnpm lint
✓ pnpm typecheck
✓ pnpm test
```

- [ ] CI is green
- [ ] Manual testing (describe): …

## Screenshots / recordings

<!-- For UI changes. Before/after preferred. -->

## Risk and rollback

<!-- What could go wrong? How would we revert if it does? -->

- Risk: …
- Rollback: `git revert <sha>` is sufficient / requires migration backout / …

## Out of scope

<!-- Anything intentionally NOT in this PR but related. Future work. -->

- …

## Linked issues

<!-- Closes #123, related to #456. -->

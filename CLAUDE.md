# Project rules for Claude Code

## Changelog (`app/changelog/page.tsx`)

**Never add, edit, or reorder entries in the `releases` array in `app/changelog/page.tsx` without explicit user approval first.** This applies even when the user asks for a feature/fix that "obviously" deserves a changelog note — propose the entry (date, title, bullets) and wait for the user to say "yes, add it" before writing.

Removing entries at the user's request is fine and does not need an extra confirmation.

## PR workflow — auto-merge

Once Claude has opened a draft PR for a change the user has already approved (i.e. the user said "merge", "ship it", or otherwise directed the work to land), squash-merge it automatically:

1. Mark the PR ready for review (`update_pull_request` with `draft: false`).
2. Squash-merge it (`merge_pull_request` with `merge_method: "squash"`).

Do this in the same turn as opening the PR. Do not ask "want me to merge?" — the user has indicated in this project that they want every PR Claude opens to land immediately. The exceptions stand: never auto-merge if (a) CI is reporting a failure, (b) there are unresolved review comments, (c) the user has said "wait" / "hold" / "don't merge yet" for this specific PR, or (d) the PR is intentionally exploratory and labelled as such by Claude in the PR body.

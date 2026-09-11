---
name: create-pr
description: Create a GitHub pull request directly or through one delegated worker, using the Korean template only for the lumo-landing React component generator project and the English template elsewhere.
---

# Create Pull Request

Create a GitHub pull request only when the user asks to create one, rather than merely to draft or review a PR description.

## Delegated execution

This skill is safe to run as a delegated PR worker. A coordinator may assign the entire workflow to one worker when it provides useful isolation or parallelism.

- Give the worker the exact repository or worktree path, the user's requested outcome (create or draft), any requested title/base/labels, and all relevant user constraints. State explicitly whether the user authorized PR creation.
- A delegated worker follows every instruction in this skill and reports the final URL or the precise blocker to its coordinator. It must not delegate the PR task again.
- The worker may create the PR with `gh pr create` only when the original user explicitly requested PR creation and the repository is ready. Delegation does not authorize committing, pushing, rebasing, changing the base branch, installing tools, or any other action prohibited below.
- The coordinator relays the worker's result to the user and does not issue a second create request after the worker reports a successful PR or an existing open PR.

## Choose the description template

1. Resolve the repository root with `git rev-parse --show-toplevel` and normalize its path separators.
2. If it is `C:/Users/student/Desktop/lumo-landing/react-component-generator-main` (case-insensitive on Windows), read [the Korean template](references/pull-request-ko.md).
3. For every other repository, read [the English template](references/pull-request-en.md).

Use the selected template as the PR body. Replace its guidance comments and placeholders with an accurate, concise account of the actual branch changes. Do not leave empty sections: write `없음` or `None` when a section does not apply.

## Prepare and create

- Inspect the repository, current branch, commits relative to the proposed base, and working-tree status before drafting the title and body. Infer the base branch from the repository's default branch or the branch's configured upstream; do not guess when neither is available.
- A PR must come from a non-default branch. Do not commit, stage, push, rebase, or change the base branch as a side effect. If creation needs any of those, explain the exact missing state and ask the user to do it or explicitly authorize it.
- Check whether an open PR already exists for the current branch. If one does, return its URL instead of creating a duplicate unless the user explicitly asks for a new PR.
- Use the GitHub CLI (`gh pr create`) when it is installed and authenticated. Pass the selected base, title, and completed body explicitly; keep temporary body files outside the repository and remove them after the command completes.
- If `gh` is unavailable or unauthenticated, report that creation could not be completed and provide the ready-to-paste title and selected-template body. Do not open a browser or install tooling without the user's request.
- After a successful creation, return the PR URL, base and head branches, title, and a brief verification summary.

Treat the PR title and body as user-facing release communication: reflect only verified changes and tests, avoid claims of completion not supported by repository evidence, and never include secrets, tokens, private keys, or local environment values.

---
name: pr-helper
description: >-
  Drafts or creates GitHub pull requests for CloneCV using the repo PR template
  and commit message convention. Use when the user asks for a PR, PR draft,
  pull request, PR 초안, PR 만들어줘, or 풀리퀘스트.
---

# PR Helper

## Steps

1. Gather state (run in parallel when possible):
   - `git status`
   - `git diff` and `git diff --staged`
   - `git log origin/main..HEAD` (or merge-base…HEAD)
   - Whether the branch tracks a remote and is up to date
2. Draft a PR title as a single conventional line, e.g. `feat: …` / `chore: …` (Korean summary in the body).
3. Fill `.github/pull_request_template.md` using its **Korean** section headings:
   - 요약 (1–3 bullets)
   - 명세 (F-XX if applicable)
   - 테스트 계획
   - 문서 (07 / 08 / README)
4. Show the draft to the user in Korean.
5. Create the PR with `gh pr create` **only** when the user explicitly asks to create/open it. Follow the user’s creating-pull-requests rules (push with `-u` if needed, HEREDOC body).

## Do not

- Force-push or rewrite history unless explicitly requested
- Skip hooks
- Open a PR with secrets (`.env*`) in the diff — warn instead

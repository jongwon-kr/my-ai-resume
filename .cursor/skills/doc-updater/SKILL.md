---
name: doc-updater
description: >-
  Updates CloneCV session docs (07 audit, 08 diary, README) after work.
  Use when the user asks to refresh the development diary, update 07/08,
  end a session, sync docs with code, or 문서 최신화 / 개발일지 갱신 / 세션 종료.
---

# Doc Updater

Keep `docs/07`, `docs/08`, and README aligned with the latest work. Do not implement features.

## Inputs

Prefer attaching:

- `@docs/07_현황감사.md`
- `@docs/08_개발일지.md`
- `@README.md`
- Current git diff / changed files

## Steps

1. Inspect `git status` and recent commits (or the conversation summary) for what changed.
2. Append a new entry to `docs/08_개발일지.md` using the template in that file:
   - 목표, 완료, 변경 파일, Agent 지시 요약, 테스트, 남은 TODO, 커밋 초안
   - **Never** write private environment details (workplace, home PC, personal identifiers).
3. If F-XX status, migrations, or backlog changed → update tables in `docs/07_현황감사.md`.
4. If user-facing features or screenshots changed → update only the affected README sections.
5. Draft a commit message in repo convention (`update:` / `chore:` + Korean one-liner). Commit **only** if the user asks.

## Do not

- Expand implementation scope
- Write blog drafts (use `blog-writer`)
- Create PRs (use `pr-helper`)

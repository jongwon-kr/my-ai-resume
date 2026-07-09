---
name: blog-writer
description: >-
  Writes CloneCV development-process blog drafts under docs/blog from the diary
  and commits. Use when the user asks for a blog draft, development story,
  retrospective draft, 블로그 초안, 개발 과정 글, or 회고 초안.
---

# Blog Writer

Write fact-based development posts. External publish (Tistory/Velog) is manual.

## Inputs

- `@docs/blog/00_작성_가이드.md` (required structure)
- `@docs/08_개발일지.md`
- Optional: `@docs/07_현황감사.md`, relevant commits

## Steps

1. Read the guide and recent diary entries / commits for the requested topic.
2. Create `docs/blog/YYYY-MM-DD_주제.md` or `docs/blog/NN_초안_주제.md`.
3. Structure: **HOOK → STORY → LEARN → NEXT** (short, factual).
4. Reference screenshots via `docs/screenshots/` paths if useful; do not invent metrics.
5. Self-check against the guide’s 금지 list before finishing.

## Do not

- Include workplace, personal identifiers, or private environment details
- Claim unfinished features as done
- Large product code changes
- Restore old private Tistory drafts from history

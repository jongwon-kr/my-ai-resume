---
name: blog-writer
description: >-
  Writes CloneCV development-process blog drafts under docs/blog from the diary
  and commits. Use when the user asks for a blog draft, development story,
  retrospective draft, 블로그 초안, 개발 과정 글, or 회고 초안.
---

# Blog Writer

Write **reader-facing** development posts: light, fun, useful. External publish (Tistory/Velog) is manual.

Audience is strangers on a blog — not the author reading the repo.

## Inputs (for the agent only — never paste these paths into the post body)

- `@docs/blog/00_작성_가이드.md`
- `@docs/08_개발일지.md`
- Optional: `@docs/07_현황감사.md`, git log, README

## Steps

1. **개요 먼저 (What & How)** — 주제와 **들어가며 → 내용 → 배운 점 → 다음에** 틀을 잡고 쓴다. (전 편 동일, 영문 HOOK/STORY 쓰지 말 것)
2. Read the guide and recent diary / commits for **재료** (경험·확실한 정보). Invent nothing.
3. Create or update a draft under `docs/blog/` (`YYYY-MM-DD_주제.md` or `NN_초안_주제.md` / `#N.md`).
4. Tech choices: accurate reasons only; **처음 보는 사람도 이해되게** 한 줄 풀어서. 은어·약어는 풀거나 빼기.
5. Screenshots for publish only — **no repo paths in the post body**.
6. Self-check against the guide’s 금지 list + writing checklist below.

## 글 잘 쓰는 법 (필수)

1. **개요** — What/How를 먼저. 정보 글은 목차, 주장은 [주장+근거].
2. **재료** — 직접 한 경험, 깊은 생각, 확인된 사실만. 재료가 좋으면 문장은 쉬워진다.
3. **문장은 짧고 단순하게** — 접속사(그래서/하지만/그런데) 최소화. 같은 말 반복 금지. 핵심은 단문.
4. **신박함 한 스푼** — 뻔한 문장 줄이기. 에피소드나 색다른 표현 하나.
5. **관심 있는 이야기만** — 억지로 쥐어짜지 말 것.
6. **조급하지 않게** — 주제 밖으로 새면 잘라낸다.
7. **가운데점(·) 남용 금지** — 사람 글처럼 쉼표, “이랑”, “그리고”를 쓴다.

개발 블로그 팁: 트러블/결정 뼈대(1) + 설명은 짧게(3) + **찐 경험 재료(2·7)** 가 핵심.

## Voice

- Anyone should enjoy it without knowing this repo
- Prefer product story over tooling inventory
- Short, warm, a bit of humor — not a lecture

## Do not

- Put **repo-only** details in the post: `docs/*`, `.cursor/*`, `SKILL.md`, commit hashes, `@파일` Agent workflows, internal filenames the reader cannot open
- Workplace, personal identifiers, or private environment details
- Claim unfinished features as done
- Large product code changes
- Restore old private Tistory drafts from history
- Write as if indexing the repository for yourself
- Pad with filler or repeat the same point in **들어가며** and **내용**
- Use English section titles (HOOK, STORY, LEARN, NEXT) — use fixed Korean: 들어가며, 내용, 배운 점, 다음에
- Rename section headings per episode (e.g. 시작 only in #1) — keep the same four for the whole series

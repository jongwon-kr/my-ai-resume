# CLAUDE.md

Behavioral guidelines to reduce common LLM coding mistakes. Merge with project-specific instructions as needed.

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:

- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:

- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:

- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:

- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:

```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

---

## 5. 이 저장소 (CloneCV)

### Next.js 16 주의

이 프로젝트의 Next.js는 학습 데이터와 API·규약·파일 구조가 다를 수 있습니다.
코드를 쓰기 전에 `node_modules/next/dist/docs/`의 해당 가이드를 읽고, deprecation 안내를 따르세요.
(`middleware.ts`가 아니라 `proxy.ts`를 씁니다.)

### 에이전트 역할

| 역할 | Skill | 언제 |
| ---- | ----- | ---- |
| 구현 | (기본) | 기능·버그 작업 |
| 문서 | `/doc-updater` | 개발일지 / 07·08 / 세션 종료 |
| 품질 | `/code-quality` | 품질 점검 / 머지 전 리뷰 |
| PR | `/pr-helper` | PR 초안·생성 |

요청하지 않으면 역할을 한 번에 섞지 마세요. 구현 중에 07/08을 조용히 고치거나 PR을 열지 말고, 해당 Skill로 넘기거나 확인하세요.

### 프로젝트 체크

- API: 사용자 친화적 에러, 클라이언트에 raw stack trace 금지
- service-role / admin 경로: 권한 확인 후 동작
- 채팅: 가능하면 Gemini 호출 전에 FAQ 매칭으로 단락, `/demo/*`는 저장·발행 부작용 없음
- 제품 동작을 바꿀 때 `docs/02`의 F-XX, `docs/07`의 상태와 정합성 확인

### 자주 쓰는 명령

`npm run lint` · `npm run test` · `npm run build` · `npm run format:check`

---

**These guidelines are working if:** fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.

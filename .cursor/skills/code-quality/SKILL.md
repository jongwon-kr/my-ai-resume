---
name: code-quality
description: >-
  Reviews CloneCV code quality against Karpathy guidelines and project checks.
  Use when the user asks for a quality check, code review, pre-merge inspection,
  lint/test guidance, 품질 점검, 리뷰해줘, or 머지 전에 검사.
---

# Code Quality

Review changes; do not rewrite large areas unless the user asks to fix findings.

## Steps

1. Identify the change set (`git diff`, open files, or named paths).
2. Run or instruct (prefer running when possible):
   - `npm run lint`
   - `npm run test`
   - Optionally `npm run format:check` and `npm run build` for merge-critical work
3. Apply Karpathy checks:
   - No speculative abstractions or drive-by refactors
   - Every change traces to the request
   - No features beyond the ask
4. CloneCV-specific checks:
   - API routes: try/catch, user-friendly errors
   - Admin/service-role paths: auth checks present
   - Chat/Gemini: avoid duplicate calls when FAQ match suffices; respect rate limits
   - `demoMode` / `/demo/*`: no real save/publish side effects
   - Spec alignment: mention F-XX from `docs/02` / `docs/07` when relevant
5. Report findings as:
   - **Critical** — must fix before merge
   - **Should-fix** — strong recommendation
   - **Nit** — optional
6. Suggest concrete fixes. Edit code only if the user asks.

## Related

- Rule: `.cursor/rules/code-quality.mdc`
- Behavioral: `.cursor/rules/karpathy-guidelines.mdc`

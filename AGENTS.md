<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# CloneCV 에이전트

프로젝트 Skills는 `.cursor/skills/`에 있습니다. **요청당 역할 하나**를 권장합니다.

| 에이전트 | Skill 경로 | 언제 쓰나 | 첨부하면 좋은 것 |
|----------|------------|-----------|------------------|
| 문서 정리 | `.cursor/skills/doc-updater` | 세션 종료, 개발일지·07·08 갱신 | `@docs/07` `@docs/08` `@README.md` |
| 코드 품질 | `.cursor/skills/code-quality` | 품질 점검, 머지 전 리뷰 | 변경 파일 / diff |
| PR | `.cursor/skills/pr-helper` | PR 초안·생성 | 브랜치 + PR 템플릿 |
| 블로그 | `.cursor/skills/blog-writer` | 개발 과정 블로그 초안 | `@docs/blog/00_작성_가이드.md` `@docs/08` |

호출 문구: [`docs/06_Cursor_시작프롬프트.md`](docs/06_Cursor_시작프롬프트.md) §8  
역할 구분: `.cursor/rules/agent-roles.mdc`

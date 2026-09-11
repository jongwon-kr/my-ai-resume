<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# CloneCV 에이전트

프로젝트 Skills는 `.claude/skills/`에 있습니다. **요청당 역할 하나**를 권장합니다.

| 에이전트  | 호출            | 언제 쓰나                      |
| --------- | --------------- | ------------------------------ |
| 문서 정리 | `/doc-updater`  | 세션 종료, 개발일지·07·08 갱신 |
| 코드 품질 | `/code-quality` | 품질 점검, 머지 전 리뷰        |
| PR        | `/pr-helper`    | PR 초안·생성                   |

역할 구분·프로젝트 규칙: [`CLAUDE.md`](CLAUDE.md) §5

코드베이스를 처음부터 이해하려면: [`docs/09_학습가이드.md`](docs/09_학습가이드.md) (Phase 0~8)

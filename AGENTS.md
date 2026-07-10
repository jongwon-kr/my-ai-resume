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

코드베이스를 처음부터 이해하려면: [`docs/09_학습가이드.md`](docs/09_학습가이드.md) (Phase 0~8)

## Cursor Cloud specific instructions

단일 Next.js 16 앱(패키지명 `my-ai-resume`)입니다. 명령은 `package.json` scripts 참고 (`dev`/`build`/`test`/`lint`/`format:check`). 서비스는 dev 서버 하나(`npm run dev`, 포트 3000)뿐이고 나머지(Supabase·Gemini·Upstash)는 외부 관리형 서비스입니다.

- **환경변수 없이 부팅 가능**: `.env.local.example`을 `.env.local`로 복사하면 됩니다. Supabase URL/anon/service-role에 임시 placeholder만 넣고 `NEXT_PUBLIC_SITE_URL=http://localhost:3000`이면 앱이 뜨고, DB 없이 동작하는 데모 `/@kimdev`·`/demo/*`로 UI 전반을 확인할 수 있습니다. 실제 로그인·DB·라이브 AI 채팅은 진짜 Supabase 키 + `GEMINI_API_KEY`(무료 티어)가 있어야 합니다.
- **의존성 설치는 `npm install`을 쓰세요.** `npm ci`는 커밋된 lockfile이 optional 네이티브 deps(@emnapi)와 어긋나 실패합니다(기존 이슈).
- **`npm run lint`와 `npm run format:check`는 main에서도 이미 깨져 있습니다.** `eslint.config.mjs`가 정의되지 않은 `rules(...)`를 호출해 ESLint가 로드 실패하고, prettier는 커밋 코드와 현재 `.prettierrc`(printWidth 80) 사이 드리프트로 ~73개 파일을 flag합니다. 클라우드 셋업이 만든 문제가 아니며, 새 코드 검증은 변경 파일에 `npx prettier --check`, 타입/컴파일은 `npm run build`로 하면 됩니다.
- **레이트리밋(Upstash)은 dev에서 자동 스킵**되므로 로컬 채팅 테스트에 Upstash 키는 불필요합니다.
- **채팅 모델 폴백**: 채팅은 `GEMINI_MODEL_CHAIN`(env `GEMINI_MODELS`, 쉼표 구분) 순서대로 시도하며 한도(429)/사용 불가(404) 시 다음 모델로 자동 전환하고, 모두 소진되면 한도 도달 메시지를 SSE `error`로 보냅니다. 단일 호출용 `GEMINI_MODEL`(PDF 가져오기 등)과는 별개입니다.

# CloneCV (my-ai-resume)

AI 이력서 클론 프로필 서비스 MVP. Next.js App Router, TypeScript, Tailwind CSS, shadcn/ui, Supabase 기반.

## 기술 스택

- **Framework**: Next.js 16 (App Router) + TypeScript
- **UI**: Tailwind CSS v4 + shadcn/ui + recharts
- **Backend**: Supabase (Auth, Postgres, Storage)
- **AI**: Google Gemini API (`gemini-2.5-flash`, 무료 티어)
- **Rate limit**: Upstash Redis

## 사전 준비

1. [Node.js](https://nodejs.org/) 20+
2. [Supabase](https://supabase.com/) 프로젝트 생성
3. [Google AI Studio](https://aistudio.google.com/) Gemini API 키
4. [Upstash](https://upstash.com/) Redis (레이트리밋)
5. (선택) [Kakao Developers](https://developers.kakao.com/) JavaScript 키

## 로컬 실행

```bash
npm install
cp .env.local.example .env.local
# .env.local에 실제 키 입력

# Supabase 마이그레이션 적용 (최초 1회 또는 스키마 변경 시)
npm run db:push

npm run dev
```

브라우저: [http://localhost:3000](http://localhost:3000)

## 테스트

```bash
npm run test           # Vitest 단위 테스트
npm run test:e2e       # Playwright E2E (dev 서버 자동 기동)
npm run build          # 프로덕션 빌드 검증
npm run lint           # ESLint
```

E2E 최초 실행 전 Playwright 브라우저 설치:

```bash
npx playwright install chromium
```

## 주요 스크립트

| 명령 | 설명 |
|------|------|
| `npm run dev` | 개발 서버 |
| `npm run build` | 프로덕션 빌드 |
| `npm run test` | Vitest 단위 테스트 |
| `npm run test:e2e` | Playwright E2E |
| `npm run db:push` | Supabase 마이그레이션 원격 적용 |
| `npm run db:types` | DB 타입 재생성 |

## 폴더 구조

```
app/
├── (auth)/login, signup, forgot-password, reset-password
├── onboarding/
├── dashboard/               # 소유자 대시보드
├── admin/                   # 관리자 모더레이션
├── [id]/                    # 퍼블릭 프로필 + opengraph-image
└── api/
components/
lib/
supabase/migrations/
tests/                       # Vitest
e2e/                         # Playwright
middleware.ts
```

## 환경변수

`.env.local.example` 참고. 필수:

| 변수 | 용도 |
|------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | 서버 전용 |
| `GEMINI_API_KEY` | Gemini API |
| `UPSTASH_REDIS_REST_URL` / `TOKEN` | 레이트리밋 |
| `NEXT_PUBLIC_SITE_URL` | OG/공유/비밀번호 재설정 redirect |

선택: `NEXT_PUBLIC_KAKAO_JS_KEY`, `GEMINI_MODEL`

### 관리자 계정

Supabase Auth → Users → `app_metadata`:

```json
{ "role": "admin" }
```

## Vercel 배포 절차

### 1. Supabase (DB) — **먼저 적용**

```bash
npm run db:push
```

마이그레이션 순서:

1. `20260705150000_initial_schema.sql`
2. `20260705160000_avatars_storage.sql`
3. `20260705170000_profile_daily_stats.sql`
4. `20260705180000_admin_moderation.sql`
5. `20260705190000_reports_resolution.sql`

### 2. Supabase Auth / Storage

- Email + Google OAuth 설정
- Redirect URLs에 Vercel 도메인 + `/auth/callback` 추가
- 비밀번호 재설정 redirect: `{SITE_URL}/auth/callback?next=/reset-password`

### 3. Vercel

1. GitHub 저장소 연결
2. Environment Variables 등록
3. `NEXT_PUBLIC_SITE_URL` = 프로덕션 URL
4. Deploy

### 4. 배포 후 확인

- [ ] 회원가입 / 로그인 / 비밀번호 재설정
- [ ] 온보딩 → 이력서 발행 → `/@slug`
- [ ] AI 채팅, OG 이미지 미리보기
- [ ] 대시보드 통계, 신고 → `/admin` 처리

## 알려진 제한 / 향후 작업

| 항목 | 상태 |
|------|------|
| Gemini Pro 유료 모델 | 무료 `gemini-2.5-flash` 기본 사용 |
| middleware → proxy | Next.js 16 deprecation 경고 (기능 정상) |
| OG 이미지 커스텀 폰트 | 시스템 sans-serif 사용 |
| E2E 인증/채팅 플로우 | smoke 테스트만 — 통합 시나리오 확장 가능 |
| CI 파이프라인 | GitHub Actions 미구성 |

## 문서

- `docs/01_요구사항명세서.md`
- `docs/02_기능명세서.md`
- `docs/04_아키텍처명세서.md`
- `supabase/README.md`

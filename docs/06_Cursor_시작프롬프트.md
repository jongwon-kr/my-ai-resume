# Cursor 개발 시작 프롬프트 모음

버전: v1.0 | 작성일: 2026-07-05

사용법: 1)~7) 순서대로 진행하세요. 각 프롬프트 사용 전에 `docs/` 폴더의 5개 명세서 파일을 프로젝트 루트에 넣고, Cursor의 `@` 참조 기능으로 해당 문서를 컨텍스트에 포함시킨 뒤 프롬프트를 실행하세요. (예: `@docs/04_아키텍처명세서.md` 를 프롬프트 앞에 첨부)

---

## 0. 사전 준비 (Cursor 실행 전)

1. 이 6개 문서를 프로젝트 루트의 `docs/` 폴더에 저장
2. `05_기술스택_서비스정리.md`의 체크리스트대로 Supabase/Gemini/Upstash/Vercel 계정 및 키 준비
3. Cursor에서 프로젝트 폴더 열기 → Composer(또는 Chat) 모드로 아래 프롬프트 진행

---

## 1단계 — 프로젝트 초기 세팅 프롬프트

```
너는 시니어 풀스택 개발자야. 아래 문서를 참고해서 Next.js 14 (App Router, TypeScript) 프로젝트를
처음부터 세팅해줘.

@docs/04_아키텍처명세서.md
@docs/05_기술스택_서비스정리.md

요구사항:
1. `create-next-app`으로 TypeScript + Tailwind CSS + App Router 구조로 초기화
2. shadcn/ui 설치 및 기본 설정 (button, input, card, dialog, tabs 컴포넌트 우선 추가)
3. Supabase 클라이언트 설정 (`lib/supabase/client.ts`, `lib/supabase/server.ts` — 브라우저용/서버용 분리)
4. 환경변수 템플릿 파일 `.env.local.example` 생성 (문서의 환경변수 목록 반영)
5. 폴더 구조를 다음과 같이 잡아줘:
   - app/(auth)/login, app/(auth)/signup
   - app/onboarding
   - app/dashboard/edit, app/dashboard
   - app/@[id]  ← 동적 라우트로 퍼블릭 프로필 페이지 (실제로는 app/[id] 형태로 만들고 slug 앞에 @는 미들웨어에서 처리)
   - app/api/chat, app/api/prompt
   - lib/, types/, components/
6. ESLint + Prettier 설정
7. README.md에 로컬 실행 방법 작성

완료 후 실행 가능한 상태로 만들고, 남은 작업 목록을 TODO 주석으로 정리해줘.
```

---

## 2단계 — DB 스키마 및 인증 프롬프트

```
아래 아키텍처 문서의 DB 스키마 섹션을 참고해서 Supabase 마이그레이션 SQL 파일을 작성해줘.

@docs/04_아키텍처명세서.md

요구사항:
1. supabase/migrations 폴더에 SQL 마이그레이션 파일 생성 (profiles, skills, projects,
   system_prompts, chat_sessions, chat_messages, reports 테이블 전부)
2. 문서에 명시된 RLS 정책을 각 테이블에 그대로 적용하는 SQL도 함께 작성
3. profiles 테이블은 auth.users 생성 시 트리거로 빈 row가 자동 생성되도록 함수/트리거 작성
4. Next.js 쪽에 이메일/비밀번호 회원가입, 로그인, 로그아웃, Google OAuth 로그인 페이지 구현
   (app/(auth)/login, app/(auth)/signup)
5. 회원가입 성공 시 /onboarding으로 리다이렉트
6. TypeScript 타입은 Supabase CLI의 `supabase gen types typescript` 결과를 기반으로
   types/database.ts에 정리한다고 가정하고, 임시 타입 정의를 남겨줘

작업 후 로컬에서 supabase start (또는 원격 프로젝트 기준) 마이그레이션 적용 방법을 안내해줘.
```

---

## 3단계 — 온보딩 및 멀티스텝 폼 프롬프트

```
아래 요구사항/기능 명세서를 참고해서 온보딩 및 이력서 빌더 폼을 구현해줘.

@docs/01_요구사항명세서.md
@docs/02_기능명세서.md

요구사항:
1. /onboarding 페이지: 고유 ID(slug) 입력 → 실시간 중복 체크(debounce) → profiles.slug 업데이트
   - 예약어 차단 리스트 포함 (admin, api, login, signup, dashboard 등)
2. /dashboard/edit 페이지: React Hook Form + Zod로 4단계 멀티스텝 폼 구현
   - Step 1: 기본정보 (이름, 직무, 한줄소개, 프로필 사진 업로드 → Supabase Storage)
   - Step 2: 기술스택 (태그 입력 UI, 자동완성 목록은 하드코딩된 인기 기술 배열 사용)
   - Step 3: 프로젝트 반복 입력 (최대 3개, 트러블슈팅 구조: 상황/수행/성과/트러블슈팅 필드 분리)
   - Step 4: 전체 미리보기 + "발행하기" 버튼
3. 각 필드는 blur 또는 30초 간격으로 자동 draft 저장 (status='draft')
4. 발행 버튼 클릭 시 /api/prompt/generate 호출하도록 연결 (다음 단계에서 이 API 구현 예정이니
   지금은 mock 함수로 연결만 해줘)
5. 각 단계 진행률 표시 UI 포함

컴포넌트는 재사용 가능하게 분리하고, 상태는 zustand 또는 context로 단계 간 공유해줘.
```

---

## 4단계 — 시스템 프롬프트 생성 엔진 프롬프트

```
아래 아키텍처 문서의 "시스템 프롬프트 템플릿" 섹션을 참고해서 프롬프트 생성 API를 구현해줘.

@docs/04_아키텍처명세서.md

요구사항:
1. app/api/prompt/generate/route.ts 작성
2. 요청받은 profile_id로 profiles, skills, projects 테이블 데이터를 조회
3. 문서의 템플릿 형식대로 문자열을 조합 (가드레일 규칙 4개 항목 반드시 포함,
   특히 "프롬프트 인젝션 방어" 규칙 누락하지 말 것)
4. 완성된 프롬프트를 system_prompts 테이블에 새 버전으로 insert (기존 버전은 유지, version 컬럼 +1)
5. profiles.status를 'published'로 업데이트
6. 이 API는 반드시 서버에서만 실행되고, 생성된 프롬프트 원문이 클라이언트로 응답되지 않도록 함
   (성공 여부만 응답)

테스트를 위해 샘플 profile/project 데이터로 생성된 프롬프트 예시를 콘솔에 로그로 남겨줘.
```

---

## 5단계 — 퍼블릭 프로필 + 챗봇 프롬프트

```
아래 문서들을 참고해서 퍼블릭 프로필 페이지와 실시간 챗봇을 구현해줘.

@docs/02_기능명세서.md
@docs/04_아키텍처명세서.md

요구사항:
1. app/[id]/page.tsx (SSR): slug로 profiles 조회, status='published' 이고 is_private=false 인 경우만 렌더
   - is_private=true면 "비공개 프로필입니다" 안내 화면
   - 좌측: 이력서 뷰 (기본정보/기술스택 뱃지/프로젝트 아코디언)
   - 우측: 채팅 UI (말풍선, 추천 질문 칩, 입력창)
   - 모바일 뷰포트에서는 탭 전환 UI로 변경 (이력서/채팅)
   - 하단 워터마크 CTA 컴포넌트 포함
   - generateMetadata로 OG 태그 동적 생성 (이름, 직무, 대표 이미지)
2. app/api/chat/route.ts: Google Gemini API 스트리밍 연동 (`@google/genai` SDK, 모델은
   Gemini Pro 계열, 예: `gemini-2.5-pro` — 실제 사용 가능한 Pro 모델명은 Google AI Studio
   문서에서 확인 후 반영)
   - Upstash Redis로 IP+profile_id 기준 레이트리밋 체크 (분당 5회, 일 50회 초과 시 429 응답)
   - chat_sessions 없으면 생성, 최근 10턴 chat_messages 조회해서 히스토리로 포함
   - system_prompts 최신 버전은 Gemini의 `systemInstruction` 파라미터로 전달하고,
     히스토리 + 신규 질문은 `contents` 배열로 구성해 `generateContentStream` 호출
   - 응답을 Server-Sent Events 형태로 클라이언트에 스트리밍
   - 응답 완료 후 user/assistant 메시지 각각 chat_messages에 저장
   - 응답 텍스트에 민감 키워드(연봉, 계좌, 주민번호 등) 감지 시 정해진 대체 문구로 강제 치환하는
     후처리 필터 함수도 작성
3. 클라이언트에서 스트리밍 응답을 실시간 타이핑 효과로 렌더링

보안 유의: 시스템 프롬프트 원문은 이 API 응답에 절대 포함하지 마.
```

---

## 6단계 — 대시보드 및 성장 장치 프롬프트

```
아래 명세서를 참고해서 소유자 대시보드와 바이럴 성장 기능을 구현해줘.

@docs/02_기능명세서.md

요구사항:
1. /dashboard 페이지 (탭 UI): 프로필 관리 / 대화 로그 / 통계
   - 프로필 관리: 링크 복사 버튼, 비공개 전환 토글, 수정하기 버튼(→ /dashboard/edit)
   - 대화 로그: chat_sessions 목록(날짜순), 클릭 시 해당 세션의 전체 chat_messages 표시
   - 통계: view_count, 세션 수, 최근 7일 추이를 간단한 카드/차트(recharts)로 표시
2. 퍼블릭 프로필 페이지에 소셜 공유 버튼 추가 (카카오톡 공유 SDK, 링크 복사, X 공유)
3. 랜딩페이지 (app/page.tsx) 작성: 서비스 소개, 예시 프로필 링크, "무료로 시작하기" CTA
4. 프로필 조회 시 view_count 증가 로직 추가 (동일 세션 중복 카운트 방지)

카카오 공유는 NEXT_PUBLIC_KAKAO_JS_KEY 환경변수를 사용해서 SDK 초기화하도록 구현해줘.
```

---

## 7단계 — 모더레이션 및 마무리 프롬프트

```
아래 명세서를 참고해서 신고 기능과 최종 QA 작업을 진행해줘.

@docs/02_기능명세서.md
@docs/01_요구사항명세서.md

요구사항:
1. 퍼블릭 프로필 페이지에 신고하기 버튼 추가 → reports 테이블에 저장하는 API 구현
2. /admin 페이지: role='admin'인 유저만 접근 가능하도록 미들웨어 처리, 신고 목록 조회 및
   프로필 강제 비공개 처리 버튼
3. 전체 프로젝트에 대해 아래 항목 점검 및 수정:
   - 모든 API route의 에러 핸들링 (try/catch, 사용자 친화적 에러 메시지)
   - 로딩 상태 UI (스켈레톤 등) 누락된 곳 보완
   - 접근성(a11y) 기본 체크 (버튼 aria-label 등)
   - 모바일 반응형 최종 점검
4. README.md에 배포 절차(Vercel + Supabase 마이그레이션 적용 순서) 정리

작업 완료 후 남은 버그나 TODO를 리스트로 정리해줘.
```

---

## 참고: 프롬프트 사용 팁

- 각 단계 프롬프트를 실행하기 전, Cursor Chat/Composer에서 **관련 명세서 파일들을 `@` 로 먼저 첨부**하세요.
- 한 번에 모든 단계를 던지지 말고, **1단계씩 순차적으로 실행 → 결과 확인 → 다음 단계** 흐름을 권장합니다.
- 각 단계 완료 후 "이 부분을 요구사항 명세서 FR-X.X 기준으로 다시 검토해줘" 같은 방식으로 명세서 번호를 참조하며 리뷰를 요청하면 정확도가 올라갑니다.

---

## 8. 멀티 PC / 에이전트 이어하기 (MVP 완료 후)

MVP 1~7단계는 **초기 구축용**입니다. 이후 작업·다른 PC에서는 아래 흐름을 사용하세요.

### 세션 시작

```
@docs/07_현황감사.md
@docs/08_개발일지.md
@README.md

개발일지 마지막 항목 이후로 이어서 작업할 거야.
오늘 목표: [한 줄]
먼저 현재 상태 확인하고 작업 계획 3줄만 제시해줘.
```

### 세션 종료 (doc-updater)

```
@docs/07_현황감사.md
@docs/08_개발일지.md
@README.md

오늘 작업을 docs/08_개발일지.md에 추가해줘.
변경 파일, Agent 지시 요약, 테스트 방법, 남은 TODO, 커밋 메시지 초안 포함.
07 backlog가 바뀌었으면 docs/07_현황감사.md도 갱신해줘.
```

### PR 전 (code-quality → pr-helper)

```
머지 전에 품질 점검해줘. lint·test 기준으로 Critical / Should-fix / Nit로 정리해줘.
```

통과 후:

```
PR 초안 작성해줘. 템플릿(.github/pull_request_template.md) 형식으로.
(생성까지 원하면: PR 만들어줘)
```

### 주간 기록 (blog-writer)

```
@docs/blog/00_작성_가이드.md
@docs/08_개발일지.md

이번 주 작업을 블로그 초안으로 작성해줘.
주제: [한 줄]
docs/blog/ 아래에 저장.
```

에이전트 목록: [`AGENTS.md`](../AGENTS.md) · Skills: `.cursor/skills/`

### Git 동기화

```bash
git pull          # 작업 시작
git add -A && git commit -m "..." && git push   # 작업 종료
```

### 에이전트 대화 원문 동기화 (선택)

Cursor Chat/에이전트 이력은 PC 로컬 저장입니다. 대화 UI까지 옮기려면 [cursaves](https://github.com/Callum-Ward/cursaves) 등 서드파티 도구를 사용하세요. **작업 맥락 공유는 Git 문서(07, 08)가 핵심**입니다.

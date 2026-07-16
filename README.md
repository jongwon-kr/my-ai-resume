# CloneCV

**이력서 PDF 하나 던지는 대신, 나와 대화할 수 있는 링크를 내보세요.**

CloneCV는 이력서를 입력하면 그 내용을 바탕으로 **AI 클론**이 만들어지는 서비스입니다. 발행 후 `/@슬러그` 주소 하나로 **웹 이력서**와 **실시간 채팅**을 함께 공유할 수 있습니다. 면접관은 문서를 끝까지 읽지 않아도, 궁금한 점을 바로 물어볼 수 있습니다.

> 처음 써보시려면 가상 프로필 **[@kimdev](https://my-ai-resume-alpha.vercel.app/@kimdev)** 에서 먼저 체험해 보세요. 실제 사용자 데이터가 아닌 예시 전용 프로필입니다.

---

## 한눈에 보기

|                            |                                                                   |
| -------------------------- | ----------------------------------------------------------------- |
| **누구를 위한 서비스인가** | IT 취업·이직 준비생, 포트폴리오를 링크로 넘기는 개발자            |
| **핵심 경험**              | 이력서 작성 → AI 클론 발행 → `/@id` 공유 → 방문자가 채팅으로 질문 |
| **비용**                   | Gemini·Upstash 무료 티어 기준으로 운영 가능 (개인 프로젝트 규모)  |
| **현재 상태**              | MVP + 한국 시장 맞춤 기능까지 구현 완료, 프로덕션 배포 가능 수준  |

---

## 왜 만들었나

PDF 이력서는 읽히기도 전에 넘어가고, 웹 포트폴리오는 정적이라 **"이 사람한테 직접 물어보고 싶은 것"** 을 확인하기 어렵습니다. CloneCV는 이력서에 있는 사실만 근거로 1인칭 답변하는 AI를 붙여서, **읽기 → 대화** 로 전환하는 실험입니다.

---

## 화면 미리보기

### 랜딩 — 서비스 소개와 예시 링크

홈에서 바로 `@kimdev` 예시 프로필로 이동할 수 있습니다. 본인 프로필이 아닌 **가상의 김개발** 데이터만 보여 줍니다.

![랜딩 페이지](docs/screenshots/01-landing.png)

### 예시 프로필 — 이력서 + AI 채팅

데스크톱에서는 좌측 이력서, 우측 채팅. 모바일에서는 탭으로 전환합니다.

<table>
<tr>
<td width="50%">

**데스크톱** (`/@kimdev`)

![공개 프로필 데스크톱](docs/screenshots/04-public-profile-desktop.png)

</td>
<td width="50%">

**모바일**

![공개 프로필 모바일](docs/screenshots/05-public-profile-mobile.png)

</td>
</tr>
</table>

### 회원가입 · 로그인

이메일 또는 Google OAuth. 가입 후 슬러그(`/@원하는주소`)를 정하면 본인 프로필을 만들 수 있습니다.

<table>
<tr>
<td width="50%">

![회원가입](docs/screenshots/02-signup.png)

</td>
<td width="50%">

![로그인](docs/screenshots/03-login.png)

</td>
</tr>
</table>

> 빌더·대시보드·온보딩 화면은 로그인 없이 **`/demo/*` 예시 경로**에서 @kimdev 가상 데이터로 미리볼 수 있습니다. `npm run test:e2e:screenshots` 로 README 스크린샷을 갱신할 수 있습니다.

### 온보딩 — 슬러그 설정

가입 직후 `/@원하는주소` 형태의 고유 슬러그를 정합니다. 중복 확인 후 프로필 편집으로 이동합니다.

![온보딩](docs/screenshots/07-onboarding.png)

### 프로필 편집 — 이력서 빌더

9개 섹션을 사이드바에서 순서 변경·on/off 할 수 있습니다. blur·30초 간격 자동 저장, 완성도 카드, PDF 가져오기(Gemini 추출)를 지원합니다.

![프로필 편집](docs/screenshots/09-dashboard-edit.png)

### 대시보드 — 프로필 관리

링크 복사, 비공개 전환, PDF 다운로드, **모의 면접** 연습을 한 화면에서 관리합니다.

![대시보드 프로필 관리](docs/screenshots/08-dashboard-profile.png)

### 대시보드 — 대화 로그 · 통계 · 받은 질문

방문자가 AI에게 무엇을 물었는지 확인하고, 조회수·세션 추이를 보며, AI가 답하지 못한 문의를 받을 수 있습니다. 대화/통계에서 **FAQ 원클릭 저장**도 가능합니다.

<table>
<tr>
<td width="33%">

**대화 로그**

![대화 로그](docs/screenshots/10-dashboard-logs.png)

</td>
<td width="33%">

**통계**

![통계](docs/screenshots/11-dashboard-stats.png)

</td>
<td width="33%">

**받은 질문**

![받은 질문](docs/screenshots/12-dashboard-inquiries.png)

</td>
</tr>
</table>

예시 경로: [`/demo/onboarding`](https://my-ai-resume-alpha.vercel.app/demo/onboarding) · [`/demo/dashboard`](https://my-ai-resume-alpha.vercel.app/demo/dashboard) · [`/demo/dashboard/edit`](https://my-ai-resume-alpha.vercel.app/demo/dashboard/edit)

---

## 지금 할 수 있는 것

### 지원자(소유자) 입장

1. **회원가입 & 슬러그 설정** — `/@my-name` 형태의 고유 주소
2. **이력서 빌더** (`/dashboard/edit`) — 9개 섹션, 사이드바에서 순서 변경·섹션 on/off
   - 기본 정보, 경력, 학력, 자격·어학·수상, 경험/활동, 기술 스택, 프로젝트(STAR), 자기소개서, 예상 질문 답변
   - **외부 링크**: GitHub·블로그 등 이름+URL을 자유롭게 추가 (고정 필드 없음)
   - blur·30초 간격 **자동 저장**, **완성도** 카드, **PDF 가져오기**(Gemini 추출)
3. **발행** — 시스템 프롬프트 생성 후 `published` 상태로 전환
4. **대시보드** (`/dashboard`)
   - 링크 복사, 비공개 전환, PDF 다운로드
   - **대화 로그** — 방문자가 무엇을 물었는지 확인
   - **통계** — 조회수, 세션 수, 7일 추이
   - **받은 질문** — AI가 답하지 못한 문의 이메일
   - **모의 면접** — 면접관 모드로 답변 연습
   - 대화/통계에서 **FAQ 원클릭 저장**

### 면접관(방문자) 입장

1. `/@슬러그` 접속 — 로그인 없음
2. 이력서 패널에서 경력·프로젝트 등 확인
3. AI 채팅 — 스트리밍 답변, 추천 질문 칩, 답변 어려울 때 **직접 문의** 폼
4. 카카오톡·X·링크 복사로 공유

### 예시 프로필 `@kimdev`

- 코드에 박아 둔 **가상 데이터**(김개발, 프론트엔드 3년차)
- DB·조회수·신고와 무관, 랜딩 **예시 보기** 전용
- 실제 사용자 이력서가 노출되지 않음

---

## AI 채팅은 어떻게 동작하나

- 이력서·FAQ·자기소개서 내용을 **템플릿으로 조합**한 시스템 프롬프트 사용 (매번 LLM으로 이력서 재작성하지 않음)
- **1인칭 존댓말**, 지원동기·STAR·경력기술 질문 유형별 답변 가이드
- 이력서에 없는 내용은 지어내지 않음 → 모를 때 정해진 문구 + **직접 문의** 유도
- 전화번호·정확한 생년은 채팅에서 비공개 (나이대만), 이력서 패널 표시는 소유자가 토글
- Upstash Redis **레이트리밋** (분당 5회, 일 50회)
- 시스템 프롬프트 원문은 클라이언트에 노출하지 않음

인사말은 짧게 고정되어 있습니다.

> 안녕하세요, {이름}의 AI 챗봇입니다! 궁금하신 점이 있으시면 편하게 물어보세요.

---

## 기술 스택

Next.js 16 · React 19 · TypeScript · Tailwind v4 · shadcn/ui · Supabase (Auth, Postgres, Storage, RLS) · Google Gemini · Upstash Redis · Vitest · Playwright · Vercel

---

## 로컬에서 실행하기

```bash
npm install
cp .env.local.example .env.local   # 키 입력
npm run db:push                    # 마이그레이션 적용
npm run dev
```

[https://my-ai-resume-alpha.vercel.app](https://my-ai-resume-alpha.vercel.app) — 예시는 [https://my-ai-resume-alpha.vercel.app/@kimdev](https://my-ai-resume-alpha.vercel.app/@kimdev)

### 자주 쓰는 명령

| 명령                           | 설명                       |
| ------------------------------ | -------------------------- |
| `npm run dev`                  | 개발 서버                  |
| `npm run build`                | 프로덕션 빌드              |
| `npm run test`                 | Vitest                     |
| `npm run test:e2e`             | Playwright smoke           |
| `npm run test:e2e:integration` | Playwright 통합 (발행→채팅) |
| `npm run test:e2e:screenshots` | README 스크린샷 갱신       |
| `npm run db:push`              | Supabase 마이그레이션      |
| `npm run db:types`             | `types/database.ts` 재생성 |

환경변수는 [`.env.local.example`](.env.local.example) 참고.  
프로덕션 출시 전: [`docs/10_프로덕션_체크리스트.md`](docs/10_프로덕션_체크리스트.md)

---

## DB 마이그레이션 (16개)

| #   | 파일                                                        | 요약                            |
| --- | ----------------------------------------------------------- | ------------------------------- |
| 1   | `20260705150000_initial_schema.sql`                         | 초기 스키마, RLS, auth 트리거   |
| 2   | `20260705160000_avatars_storage.sql`                        | 프로필 사진 Storage             |
| 3   | `20260705170000_profile_daily_stats.sql`                    | 일별 조회 통계                  |
| 4   | `20260705180000_admin_moderation.sql`                       | 관리자·모더레이션               |
| 5   | `20260705190000_reports_resolution.sql`                     | 신고 처리 상태                  |
| 6   | `20260705200000_resume_data_expansion.sql`                  | 경력·학력·연락처 등             |
| 7   | `20260705210000_profile_enabled_sections.sql`               | 섹션 on/off                     |
| 8   | `20260706000000_owner_faqs.sql`                             | 예상 질문 답변                  |
| 9   | `20260706120000_resume_sections_expansion.sql`              | 학력·자격·활동 분리             |
| 10  | `20260706130000_skills_sort_order.sql`                      | 기술 스택 정렬                  |
| 11  | `20260706140000_profile_section_order.sql`                  | 섹션 표시 순서                  |
| 12  | `20260707000000_korean_market_improvements.sql`             | PII 토글, 문의, 채팅 세션 타입  |
| 13  | `20260708000000_profile_links_replace_external_sources.sql` | 외부 링크 테이블, RSS 연동 제거 |
| 14  | `20260714100000_multi_profiles.sql`                         | 다중 프로필(3개), owner_id RLS  |
| 15  | `20260714110000_profile_label.sql`                          | 프로필 라벨                     |
| 16  | `20260715100000_mvp_security_hardening.sql`                 | RLS·RPC 보안 강화               |

상세: [`supabase/README.md`](supabase/README.md)

---

## 문서

| 문서                                                               | 내용                        |
| ------------------------------------------------------------------ | --------------------------- |
| [`docs/09_학습가이드.md`](docs/09_학습가이드.md)                   | A–Z 학습 (TS/Next 초보용)   |
| [`docs/02_기능명세서.md`](docs/02_기능명세서.md)                   | F-01~F-27 기능 상세         |
| [`docs/06_Cursor_시작프롬프트.md`](docs/06_Cursor_시작프롬프트.md) | 세션·에이전트 호출 프롬프트 |
| [`docs/07_현황감사.md`](docs/07_현황감사.md)                       | 코드 vs 명세, backlog       |
| [`docs/08_개발일지.md`](docs/08_개발일지.md)                       | 세션별 작업 로그            |
| [`docs/04_아키텍처명세서.md`](docs/04_아키텍처명세서.md)           | DB·API·프롬프트 구조        |
| [`AGENTS.md`](AGENTS.md)                                           | Cursor 에이전트 역할        |

멀티 PC에서 이어할 때:

```bash
git pull
# 에이전트: @docs/07_현황감사.md @docs/08_개발일지.md @README.md
```

에이전트(문서·품질·PR·블로그): [`AGENTS.md`](AGENTS.md) · [`docs/06` §8](docs/06_Cursor_시작프롬프트.md)

---

## 아직 손볼 부분

- OG 이미지 한글 폰트 (현재 시스템 sans-serif)
- Playwright 브라우저 설치 후 `test:e2e:screenshots` 로 캡처 자동화

전체 backlog: [`docs/07_현황감사.md`](docs/07_현황감사.md)

---

## 라이선스

개인 프로젝트. 상업 이용 시 별도 문의.

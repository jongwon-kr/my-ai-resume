# Supabase (CloneCV)

## Prerequisites

- [Supabase CLI](https://supabase.com/docs/guides/cli) — this repo includes it as a dev dependency (`npm install` 후 `npx` 또는 npm scripts 사용)
- Docker Desktop (for `supabase start` local stack only)

## Remote project (recommended — already configured in `.env.local`)

1. Log in and link the project (once):

```bash
supabase login
supabase link --project-ref rrvzqbaofergdueiexbg
```

2. Apply migrations to the remote database:

```bash
npm run db:push
# 또는: npx supabase db push
```

3. Regenerate TypeScript types from remote:

```bash
supabase gen types typescript --linked > types/database.ts
```

4. Supabase Dashboard setup for auth:

- **Authentication → Providers → Google**: enable and add OAuth client ID/secret
- **Authentication → Providers → Email** (개발용 권장):
  - **Confirm email** 끄기 → 가입 즉시 로그인, 확인 메일 미발송
  - 기본 SMTP는 시간당 이메일 수가 매우 적어 `email rate limit exceeded` 가 자주 발생함
- **Authentication → URL Configuration**:
  - Site URL: `http://localhost:3000` (dev) or production URL
  - Redirect URLs: `http://localhost:3000/auth/callback`, production callback URL

### `email rate limit exceeded` 해결

Supabase 무료 플랜 기본 SMTP는 **시간당 이메일 발송 한도**가 낮습니다. 회원가입을 여러 번 시도하면 이 한도에 걸립니다.

| 방법 | 설명 |
|------|------|
| **1. 이메일 확인 끄기 (개발용)** | Dashboard → Authentication → Providers → Email → Confirm email **OFF** |
| **2. Google OAuth 사용** | `/signup`에서 "Google로 가입하기" |
| **3. 대기** | 약 1시간 후 다시 시도 |
| **4. 커스텀 SMTP (운영용)** | Resend 등 연동 시 한도 완화 |

## Local Supabase stack

1. Initialize (if not already linked):

```bash
supabase init
```

2. Start local services (Postgres, Auth, Studio):

```bash
supabase start
```

3. Apply migrations locally:

```bash
supabase db reset
```

`db reset` runs all files in `supabase/migrations/` on a fresh local DB.

4. Point `.env.local` to local keys printed by `supabase start`:

```
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key from supabase start>
SUPABASE_SERVICE_ROLE_KEY=<service_role key from supabase start>
```

5. Generate types from local:

```bash
supabase gen types typescript --local > types/database.ts
```

## Migration files

| File                                | Description                            |
| ----------------------------------- | -------------------------------------- |
| `20260705150000_initial_schema.sql` | Tables, RLS, `handle_new_user` trigger |

## Verify

After migration, sign up at `/signup` — a `profiles` row with `pending_<uuid>` slug should appear automatically via trigger.

import { test } from "@playwright/test";

export function requireE2ECredentials() {
  const email = process.env.E2E_TEST_EMAIL;
  const password = process.env.E2E_TEST_PASSWORD;

  if (!email || !password) {
    test.skip(
      true,
      "E2E_TEST_EMAIL / E2E_TEST_PASSWORD 환경변수가 필요합니다.",
    );
  }

  return { email, password };
}

export function requireIntegrationEnv() {
  const credentials = requireE2ECredentials();

  const missing = [
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "GEMINI_API_KEY",
    "UPSTASH_REDIS_REST_URL",
    "UPSTASH_REDIS_REST_TOKEN",
  ].filter((key) => !process.env[key]);

  if (missing.length > 0) {
    test.skip(
      true,
      `통합 E2E에 필요한 환경변수가 없습니다: ${missing.join(", ")}`,
    );
  }

  return credentials;
}

export function createE2ESlug() {
  const suffix = Date.now().toString(36).slice(-8);
  return `e2e-${suffix}`;
}

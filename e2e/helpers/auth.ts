import { expect, type Page } from "@playwright/test";

export async function loginWithPassword(
  page: Page,
  email: string,
  password: string,
) {
  await page.goto("/login");
  await page.getByLabel("이메일").fill(email);
  await page.getByLabel("비밀번호").fill(password);
  await page.getByRole("button", { name: "로그인" }).click();
  await expect(page).toHaveURL(/\/(dashboard|onboarding)/, {
    timeout: 20_000,
  });
}

export async function completeOnboarding(page: Page, slug: string) {
  await page.getByLabel("고유 ID").fill(slug);
  await expect(page.getByText("사용 가능한 슬러그입니다.")).toBeVisible({
    timeout: 10_000,
  });
  await page.getByRole("button", { name: "프로필 편집 시작하기" }).click();
  await expect(page).toHaveURL(/\/dashboard\/edit/, { timeout: 15_000 });
}

export async function readSlugFromEditPage(page: Page) {
  await page.goto("/dashboard/edit");
  const publishHint = page.getByText(/발행하면 공개 프로필\(@/);
  await expect(publishHint).toBeVisible({ timeout: 15_000 });
  const text = await publishHint.innerText();
  const match = text.match(/@([a-z0-9-]+)/);
  if (!match) {
    throw new Error("대시보드 편집 화면에서 슬러그를 찾지 못했습니다.");
  }
  return match[1];
}

export async function resolveActiveSlug(page: Page, newSlug: string) {
  if (process.env.E2E_TEST_SLUG) {
    if (page.url().includes("/onboarding")) {
      await page.goto("/dashboard");
    }
    if (!page.url().includes("/dashboard/edit")) {
      await page.goto("/dashboard/edit");
    }
    return process.env.E2E_TEST_SLUG;
  }

  if (page.url().includes("/onboarding")) {
    await completeOnboarding(page, newSlug);
    return newSlug;
  }

  return readSlugFromEditPage(page);
}

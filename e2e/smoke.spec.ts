import { expect, test } from "@playwright/test";

test.describe("public pages", () => {
  test("landing page renders hero and CTA", async ({ page }) => {
    await page.goto("/");

    await expect(
      page.getByRole("heading", { name: /대화하는 AI 이력서/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "무료로 시작하기" }).first(),
    ).toBeVisible();
  });

  test("login page renders form", async ({ page }) => {
    await page.goto("/login");

    await expect(page.getByLabel("이메일")).toBeVisible({ timeout: 10_000 });
    await expect(page.getByLabel("비밀번호")).toBeVisible();
    await expect(page.getByRole("button", { name: "로그인" })).toBeVisible();
  });

  test("forgot password page renders", async ({ page }) => {
    await page.goto("/forgot-password");

    await expect(page.getByText("비밀번호 재설정")).toBeVisible();
    await expect(page.getByLabel("이메일")).toBeVisible();
    await expect(
      page.getByRole("button", { name: "재설정 메일 보내기" }),
    ).toBeVisible();
  });
});

test.describe("auth guard", () => {
  test("dashboard redirects unauthenticated users to login", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/.*login/);
  });
});
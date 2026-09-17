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
  test("dashboard redirects unauthenticated users to login", async ({
    page,
  }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/.*login/);
  });
});

test.describe("builder preview", () => {
  test("shows the public page without its chrome, and writes nothing", async ({
    page,
  }) => {
    const viewPings: string[] = [];
    await page.route("**/api/profile/view", (route) => {
      viewPings.push(route.request().url());
      return route.fulfill({ status: 200, body: "{}" });
    });

    await page.goto("/demo/dashboard/edit");
    await page.getByRole("button", { name: "공개 프로필 미리보기" }).click();

    const preview = page.getByRole("dialog");
    await expect(preview).toBeVisible({ timeout: 10_000 });
    await expect(preview.getByRole("heading", { level: 1 })).toHaveText(
      "김개발",
    );

    // The preview must not carry the live page's chrome.
    await expect(preview.getByRole("banner")).toHaveCount(0);
    await expect(
      preview.getByRole("button", { name: "링크 복사" }),
    ).toHaveCount(0);
    await expect(
      preview.getByRole("button", { name: /AI 챗봇 열기/ }),
    ).toHaveCount(0);

    // Nor may it inflate the view counter or seed the chat window.
    expect(viewPings).toHaveLength(0);
    expect(
      await page.evaluate(() => localStorage.getItem("clonecv:chat-window")),
    ).toBeNull();

    await page.keyboard.press("Escape");
    await expect(preview).toBeHidden();
  });

  test("blocks uploads in demo mode", async ({ page }) => {
    await page.goto("/demo/dashboard/edit");

    const inputs = page.locator('input[type="file"]');
    await expect(inputs.first()).toBeAttached({ timeout: 10_000 });

    for (let index = 0; index < (await inputs.count()); index += 1) {
      await expect(inputs.nth(index)).toBeDisabled();
    }
    await expect(
      page.getByText("예시 모드에서는 파일을 업로드할 수 없습니다.").first(),
    ).toBeVisible();
  });
});

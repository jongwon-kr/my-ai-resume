import { test, expect } from "@playwright/test";

import { loginWithPassword } from "./helpers/auth";
import { createE2ESlug, requireIntegrationEnv } from "./helpers/env";

test.describe("multi-profile", () => {
  test("create second profile and switch dashboard tab", async ({ page }) => {
    test.setTimeout(120_000);

    const { email, password } = requireIntegrationEnv();
    const secondSlug = createE2ESlug();

    await loginWithPassword(page, email!, password!);
    await page.goto("/dashboard");

    await page.getByRole("button", { name: "프로필 추가" }).click();
    await page.getByLabel("고유 ID").fill(secondSlug);
    await expect(page.getByText("사용 가능한 슬러그입니다.")).toBeVisible({
      timeout: 15_000,
    });
    await page.getByLabel("프로필 라벨 (선택)").fill("E2E 두 번째");
    await page.getByRole("button", { name: "프로필 만들기" }).click();

    await expect(page).toHaveURL(/\/dashboard\/edit\//, { timeout: 15_000 });

    await page.goto("/dashboard");
    await expect(page.getByRole("link", { name: "E2E 두 번째" })).toBeVisible({
      timeout: 10_000,
    });
  });
});

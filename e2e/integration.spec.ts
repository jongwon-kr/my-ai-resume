import { expect, test } from "@playwright/test";

import {
  loginWithPassword,
  resolveActiveSlug,
} from "./helpers/auth";
import { createE2ESlug, requireIntegrationEnv } from "./helpers/env";
import {
  disableOptionalResumeSections,
  fillMinimumResume,
  publishResume,
  TEST_RESUME,
} from "./helpers/resume-builder";

test.describe("core user journey", () => {
  test("login → resume publish → public profile chat", async ({ page }) => {
    test.setTimeout(180_000);

    const { email, password } = requireIntegrationEnv();
    const slug = createE2ESlug();

    await loginWithPassword(page, email, password);
    const activeSlug = await resolveActiveSlug(page, slug);

    if (!page.url().includes("/dashboard/edit")) {
      await page.goto("/dashboard/edit");
    }

    await expect(page.getByRole("heading", { name: "기본 정보" })).toBeVisible({
      timeout: 15_000,
    });

    await disableOptionalResumeSections(page);
    await fillMinimumResume(page);
    await publishResume(page);

    await page.goto(`/@${activeSlug}`);
    await expect(page.getByText(`@${activeSlug}`)).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByText(TEST_RESUME.name)).toBeVisible();

    const chatInput = page.getByRole("textbox", {
      name: "채팅 메시지 입력",
    });
    await chatInput.fill("이름이 무엇인가요?");
    await page.getByRole("button", { name: "메시지 전송" }).click();

    const assistantMessages = page.locator(
      '[aria-live="polite"] .bg-muted.text-foreground',
    );
    await expect(assistantMessages.last()).not.toHaveText(/^\.{3}$/, {
      timeout: 90_000,
    });
    await expect(assistantMessages.last()).not.toHaveText("", {
      timeout: 5_000,
    });
  });
});

import { expect, test } from "@playwright/test";
import path from "node:path";

const OUT_DIR = path.join(process.cwd(), "docs", "screenshots");

test.describe("README screenshots", () => {
  test("capture public pages", async ({ page }) => {
    test.setTimeout(120_000);
    await page.setViewportSize({ width: 1280, height: 800 });

    await page.goto("/");
    await expect(
      page.getByRole("heading", { name: /이력서를 AI 클론으로/i }),
    ).toBeVisible();
    await page.screenshot({
      path: path.join(OUT_DIR, "01-landing.png"),
      fullPage: true,
    });

    await page.goto("/signup");
    await expect(page.getByLabel("이메일")).toBeVisible({ timeout: 10_000 });
    await page.screenshot({
      path: path.join(OUT_DIR, "02-signup.png"),
      fullPage: false,
    });

    await page.goto("/login");
    await expect(page.getByLabel("이메일")).toBeVisible();
    await page.screenshot({
      path: path.join(OUT_DIR, "03-login.png"),
      fullPage: false,
    });

    await page.goto("/forgot-password");
    await expect(page.getByText("비밀번호 재설정")).toBeVisible();
    await page.screenshot({
      path: path.join(OUT_DIR, "06-forgot-password.png"),
      fullPage: false,
    });

    await page.goto("/");
    const exampleLink = page
      .getByRole("link", { name: /@.+ 예시/i })
      .first();
    let exampleHref =
      (await exampleLink.getAttribute("href").catch(() => null)) ??
      "/@kimdev";

    if (!exampleHref.startsWith("/@")) {
      exampleHref = "/@kimdev";
    }

    await page.goto(exampleHref);
    await expect(
      page.getByText(/CloneCV 예시 프로필|@kimdev/i).first(),
    ).toBeVisible({
      timeout: 15_000,
    });

    await page.setViewportSize({ width: 1280, height: 800 });
    await page.screenshot({
      path: path.join(OUT_DIR, "04-public-profile-desktop.png"),
      fullPage: false,
    });

    await page.setViewportSize({ width: 390, height: 844 });
    await page.screenshot({
      path: path.join(OUT_DIR, "05-public-profile-mobile.png"),
      fullPage: false,
    });
  });
});

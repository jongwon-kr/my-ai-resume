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

    await page.goto("/demo/onboarding");
    await expect(page.getByText("프로필 슬러그 설정")).toBeVisible({
      timeout: 10_000,
    });
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.screenshot({
      path: path.join(OUT_DIR, "07-onboarding.png"),
      fullPage: false,
    });

    await page.goto("/demo/dashboard");
    await expect(page.getByText("김개발")).toBeVisible({ timeout: 10_000 });
    await page.screenshot({
      path: path.join(OUT_DIR, "08-dashboard-profile.png"),
      fullPage: false,
    });

    await page.goto("/demo/dashboard/edit");
    await expect(
      page.getByRole("heading", { name: "프로필 편집" }),
    ).toBeVisible({ timeout: 10_000 });
    await page.screenshot({
      path: path.join(OUT_DIR, "09-dashboard-edit.png"),
      fullPage: true,
    });

    await page.goto("/demo/dashboard?tab=logs");
    await expect(page.getByText("세션 목록")).toBeVisible({ timeout: 10_000 });
    await page.screenshot({
      path: path.join(OUT_DIR, "10-dashboard-logs.png"),
      fullPage: false,
    });

    await page.goto("/demo/dashboard?tab=stats");
    await expect(page.getByText("최근 7일 추이")).toBeVisible({
      timeout: 10_000,
    });
    await page.screenshot({
      path: path.join(OUT_DIR, "11-dashboard-stats.png"),
      fullPage: false,
    });

    await page.goto("/demo/dashboard?tab=inquiries");
    await expect(page.getByText("방문자 직접 문의 1건")).toBeVisible({
      timeout: 10_000,
    });
    await page.screenshot({
      path: path.join(OUT_DIR, "12-dashboard-inquiries.png"),
      fullPage: false,
    });
  });
});

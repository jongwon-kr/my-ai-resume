import { expect, test } from "@playwright/test";
import path from "node:path";

const OUT_DIR = path.join(process.cwd(), "docs", "screenshots");

test.describe("README screenshots", () => {
  test("capture public pages", async ({ page }) => {
    test.setTimeout(120_000);
    await page.setViewportSize({ width: 1280, height: 800 });

    // 1. 랜딩 페이지 캡처
    await page.goto("/");
    await expect(
      page.getByRole("heading", { name: /대화하는 AI 이력서/i }),
    ).toBeVisible({ timeout: 10_000 });
    await page.screenshot({
      path: path.join(OUT_DIR, "01-landing.png"),
      fullPage: true,
    });

    // 2. 회원가입 페이지 캡처
    await page.goto("/signup");
    await expect(page.getByLabel("이메일")).toBeVisible({ timeout: 10_000 });
    await page.screenshot({
      path: path.join(OUT_DIR, "02-signup.png"),
      fullPage: false,
    });

    // 3. 로그인 페이지 캡처
    await page.goto("/login");
    await expect(page.getByLabel("이메일")).toBeVisible({ timeout: 10_000 });
    await page.screenshot({
      path: path.join(OUT_DIR, "03-login.png"),
      fullPage: false,
    });

    // 4. 공개 프로필 캡처 (데스크톱)
    await page.goto("/@kimdev");
    await expect(
      page.getByRole("heading", { name: "김개발" }).first(),
    ).toBeVisible({ timeout: 10_000 });
    await page.screenshot({
      path: path.join(OUT_DIR, "04-public-profile-desktop.png"),
      fullPage: true,
    });

    // 5. 공개 프로필 캡처 (모바일)
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/@kimdev");
    await expect(
      page.getByRole("heading", { name: "김개발" }).first(),
    ).toBeVisible({ timeout: 10_000 });
    await page.screenshot({
      path: path.join(OUT_DIR, "05-public-profile-mobile.png"),
      fullPage: true,
    });

    await page.setViewportSize({ width: 1280, height: 800 });

    // 6. 비밀번호 찾기 캡처
    await page.goto("/forgot-password");
    await expect(page.getByText("비밀번호 재설정")).toBeVisible({
      timeout: 10_000,
    });
    await page.screenshot({
      path: path.join(OUT_DIR, "06-forgot-password.png"),
      fullPage: false,
    });

    await page.goto("/demo/onboarding");
    const allHeadings = await page
      .locator("h1, h2, h3, h4, .card-title")
      .allInnerTexts();
    console.log("Found headings:", allHeadings);
    await expect(
      page.locator(":text('프로필 슬러그 설정')").first(),
    ).toBeVisible({ timeout: 15_000 });
    await page.screenshot({
      path: path.join(OUT_DIR, "07-onboarding.png"),
      fullPage: false,
    });

    // 8. 대시보드 프로필 캡처
    await page.goto("/demo/dashboard");
    await expect(page.getByText("김개발")).toBeVisible({ timeout: 10_000 });
    await page.screenshot({
      path: path.join(OUT_DIR, "08-dashboard-profile.png"),
      fullPage: false,
    });

    // 9. 대시보드 편집 캡처
    await page.goto("/demo/dashboard/edit");
    await expect(
      page.getByRole("heading", { name: "프로필 편집" }),
    ).toBeVisible({ timeout: 10_000 });
    await page.screenshot({
      path: path.join(OUT_DIR, "09-dashboard-edit.png"),
      fullPage: true,
    });

    // 10. 대시보드 로그 캡처
    await page.goto("/demo/dashboard?tab=logs");
    await expect(page.getByText("세션 목록")).toBeVisible({ timeout: 10_000 });
    await page.screenshot({
      path: path.join(OUT_DIR, "10-dashboard-logs.png"),
      fullPage: false,
    });

    // 11. 대시보드 통계 캡처
    await page.goto("/demo/dashboard?tab=stats");
    await expect(page.getByText("최근 7일 추이")).toBeVisible({
      timeout: 10_000,
    });
    await page.screenshot({
      path: path.join(OUT_DIR, "11-dashboard-stats.png"),
      fullPage: false,
    });

    // 12. 대시보드 문의 캡처
    await page.goto("/demo/dashboard?tab=inquiries");
    await page.screenshot({
      path: path.join(OUT_DIR, "12-dashboard-inquiries.png"),
      fullPage: false,
    });
  });
});

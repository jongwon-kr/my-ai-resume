import { expect, test } from "@playwright/test";
import path from "node:path";

const OUT_DIR = path.join(process.cwd(), "docs", "screenshots");

/** Scrolls the whole page so scroll-triggered reveals run, then returns to top. */
async function revealByScrolling(page: import("@playwright/test").Page) {
  const height = await page.evaluate(() => document.body.scrollHeight);
  const viewport = page.viewportSize()?.height ?? 800;

  for (let y = 0; y < height; y += viewport) {
    await page.evaluate((top) => window.scrollTo({ top }), y);
    await page.waitForTimeout(250);
  }

  await page.evaluate(() => window.scrollTo({ top: 0 }));
  await page.waitForTimeout(600);
}

test.describe("README screenshots", () => {
  test("capture public pages", async ({ page }) => {
    test.setTimeout(120_000);
    await page.setViewportSize({ width: 1280, height: 800 });

    // 1. 랜딩 페이지 캡처
    await page.goto("/");
    await expect(
      page.getByRole("heading", { name: /대화하는 AI 이력서/i }),
    ).toBeVisible({ timeout: 10_000 });
    // The landing reveals sections on scroll, and a fullPage capture never
    // scrolls — without this pass the IntersectionObserver never fires and the
    // How-it-works cards photograph blank. Also lets the hero demo type a turn.
    await revealByScrolling(page);
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
    // Tall viewport instead of fullPage: a full-page capture resizes the
    // viewport, which restarts the Recharts entry animation and freezes the
    // bars at zero height. Sizing up front avoids the resize entirely.
    await page.setViewportSize({ width: 1280, height: 1900 });
    await page.goto("/demo/dashboard?tab=stats");
    await expect(page.getByText("최근 7일 추이")).toBeVisible({
      timeout: 10_000,
    });
    // Bars animate in over ~1.5s; waiting for the element alone catches them
    // mid-flight, so poll until their heights stop changing.
    const barHeights = () =>
      page
        .locator(".recharts-bar-rectangle path")
        .evaluateAll((nodes) =>
          nodes.map((node) => node.getBoundingClientRect().height).join(),
        );

    await expect(page.locator(".recharts-bar-rectangle").first()).toBeVisible({
      timeout: 10_000,
    });

    let previousHeights = "";
    await expect
      .poll(
        async () => {
          const current = await barHeights();
          const settled = current !== "" && current === previousHeights;
          previousHeights = current;
          return settled;
        },
        { timeout: 10_000, intervals: [300] },
      )
      .toBe(true);

    await page.screenshot({
      path: path.join(OUT_DIR, "11-dashboard-stats.png"),
      fullPage: false,
    });
    await page.setViewportSize({ width: 1280, height: 800 });

    // 12. 대시보드 문의 캡처
    await page.goto("/demo/dashboard?tab=inquiries");
    await page.screenshot({
      path: path.join(OUT_DIR, "12-dashboard-inquiries.png"),
      fullPage: false,
    });

    // 13. 디자인 커스터마이저 캡처
    // Wider than the other dashboard shots: the 40:60 split needs the room to
    // show controls and the live preview side by side.
    await page.setViewportSize({ width: 1440, height: 1100 });
    await page.goto("/demo/dashboard?tab=design");
    await expect(page.getByText("공개 프로필 디자인")).toBeVisible({
      timeout: 10_000,
    });
    await page.screenshot({
      path: path.join(OUT_DIR, "13-dashboard-design.png"),
      fullPage: false,
    });
    await page.setViewportSize({ width: 1280, height: 800 });

    // 14. AI 채팅 창 캡처
    // The panel lives behind a floating launcher, so the public-profile shots
    // never show it. Viewport-sized on purpose: the window is fixed-position,
    // and a full-page shot would shrink it against the whole resume.
    // No message is sent — that would spend Gemini quota and the reply is not
    // reproducible. The welcome line and the suggested-question chips are the
    // part worth showing anyway.
    await page.goto("/@kimdev");
    await page.getByRole("button", { name: "김개발님의 AI 챗봇 열기" }).click();
    await expect(
      page.getByRole("dialog", { name: "김개발님의 AI 챗봇" }),
    ).toBeVisible({ timeout: 10_000 });
    await page.getByRole("button", { name: "추천 질문" }).click();
    await expect(
      page.locator('[aria-label^="추천 질문: "]').first(),
    ).toBeVisible({ timeout: 10_000 });
    await page.screenshot({
      path: path.join(OUT_DIR, "14-public-profile-chat.png"),
      fullPage: false,
    });
  });
});

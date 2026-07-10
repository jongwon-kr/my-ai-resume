import { expect, type Page } from "@playwright/test";

const TEST_RESUME = {
  name: "E2E 테스터",
  roleTitle: "풀스택 개발자",
  intro: "Playwright 통합 테스트용 AI 클론 프로필입니다.",
  projectTitle: "CloneCV MVP",
  projectPeriod: "2026.01 - 2026.06",
  projectRole: "풀스택",
  projectTech: "Next.js, Supabase, Gemini",
  projectSituation: "정적 이력서만으로는 지원자 역량을 검증하기 어려웠습니다.",
  projectActions: "AI 클론 프로필과 실시간 채팅 UI를 구현했습니다.",
  projectResults: "면접관이 대화로 지원자를 사전 검증할 수 있게 되었습니다.",
  projectTroubleshooting:
    "채팅 비용 폭주 → Upstash Redis 레이트리밋으로 해결했습니다.",
};

export async function disableOptionalResumeSections(page: Page) {
  for (const label of ["경력", "학력·자격증", "자기소개서"]) {
    const toggle = page.getByRole("button", { name: `${label} 제외` });
    if (await toggle.isVisible()) {
      await toggle.click();
    }
  }
}

export async function fillMinimumResume(page: Page) {
  const basicSection = page.locator("#resume-section-1");
  await basicSection.getByPlaceholder("홍길동").fill(TEST_RESUME.name);
  await basicSection
    .getByPlaceholder("프론트엔드 개발자")
    .fill(TEST_RESUME.roleTitle);
  await basicSection
    .getByPlaceholder("3년차 React/Next.js 개발자입니다.")
    .fill(TEST_RESUME.intro);

  await page.locator("#resume-section-4").scrollIntoViewIfNeeded();
  await page.getByRole("button", { name: "+ TypeScript" }).click();
  const emptySkillDelete = page.getByRole("button", {
    name: " 삭제",
    exact: true,
  });
  if (await emptySkillDelete.isVisible()) {
    await emptySkillDelete.click();
  }

  const projectSection = page.locator("#resume-section-5");
  await projectSection.scrollIntoViewIfNeeded();
  await projectSection
    .getByPlaceholder("2024.01 - 2024.06")
    .fill(TEST_RESUME.projectPeriod);
  await projectSection
    .getByPlaceholder("프론트엔드 리드")
    .fill(TEST_RESUME.projectRole);
  await projectSection
    .getByPlaceholder("Next.js, TypeScript, Supabase")
    .fill(TEST_RESUME.projectTech);

  const projectCard = projectSection.locator(".rounded-lg.border.p-4").first();
  await projectCard.locator("input").first().fill(TEST_RESUME.projectTitle);
  await projectCard
    .getByText("상황 / 과제")
    .locator("..")
    .locator("textarea")
    .fill(TEST_RESUME.projectSituation);
  await projectCard
    .getByText("수행 내용")
    .locator("..")
    .locator("textarea")
    .fill(TEST_RESUME.projectActions);
  await projectCard
    .getByText("성과", { exact: true })
    .locator("..")
    .locator("textarea")
    .fill(TEST_RESUME.projectResults);
  await projectCard
    .getByText("트러블슈팅")
    .locator("..")
    .locator("textarea")
    .fill(TEST_RESUME.projectTroubleshooting);
}

export async function publishResume(page: Page) {
  await page.getByRole("button", { name: "발행하기" }).scrollIntoViewIfNeeded();
  await page.getByRole("button", { name: "발행하기" }).click();
  await expect(page.getByText("발행 완료")).toBeVisible({ timeout: 30_000 });
}

export { TEST_RESUME };

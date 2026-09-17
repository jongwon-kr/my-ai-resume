import { describe, expect, it } from "vitest";

import { buildPreviewProfileData } from "@/lib/public-profile/from-form-values";
import { getVisiblePublicSections } from "@/lib/public-profile/sections";
import {
  defaultResumeFormValues,
  type ResumeFormValues,
} from "@/lib/resume/schema";
import { getResumeSectionVisibility } from "@/lib/resume/section-visibility";

const META = { profileId: "profile-1", slug: "tester" };

function values(overrides: Partial<ResumeFormValues> = {}): ResumeFormValues {
  return { ...defaultResumeFormValues, name: "김개발", ...overrides };
}

describe("buildPreviewProfileData", () => {
  it("renames snake_case form keys to the public camelCase shape", () => {
    const data = buildPreviewProfileData(
      values({
        profile_links: [{ label: "깃허브", url: "https://example.com" }],
        cover_letters: [{ title: "지원 동기", content: "내용" }],
      }),
      META,
    );

    expect(data.profileLinks).toHaveLength(1);
    expect(data.coverLetters).toHaveLength(1);
    expect(Array.isArray(data.sectionOrder)).toBe(true);
    expect(Array.isArray(data.enabledSections)).toBe(true);
  });

  it("defaults every missing optional array to empty", () => {
    const data = buildPreviewProfileData(
      values({
        careers: undefined,
        education: undefined,
        certifications: undefined,
        activities: undefined,
        portfolio_items: undefined,
        cover_letters: undefined,
        profile_links: undefined,
        owner_faqs: undefined,
      }),
      META,
    );

    expect(data.careers).toEqual([]);
    expect(data.education).toEqual([]);
    expect(data.certifications).toEqual([]);
    expect(data.activities).toEqual([]);
    expect(data.portfolioItems).toEqual([]);
    expect(data.coverLetters).toEqual([]);
    expect(data.profileLinks).toEqual([]);
  });

  // Mirrors saveResumeDraft: blank rows never reach the DB, so the preview
  // must not show them either.
  it("drops blank rows exactly as publishing does", () => {
    const data = buildPreviewProfileData(
      values({
        careers: [
          { company: "  ", position: "무시됨" },
          { company: "스마트웍스" },
        ],
        skills: [{ name: " " }, { name: "TypeScript" }],
      }),
      META,
    );

    expect(data.careers.map((career) => career.company)).toEqual([
      "스마트웍스",
    ]);
    expect(data.skills.map((skill) => skill.name)).toEqual(["TypeScript"]);
  });

  it("filters portfolio rows on url, not title", () => {
    const data = buildPreviewProfileData(
      values({
        portfolio_items: [
          { kind: "link", title: "제목만", description: "", url: "" },
          { kind: "link", title: "", description: "", url: "https://a.test" },
        ],
      }),
      META,
    );

    expect(data.portfolioItems).toHaveLength(1);
    expect(data.portfolioItems[0].url).toBe("https://a.test");
  });

  it("trims strings and turns blanks into null", () => {
    const data = buildPreviewProfileData(
      values({ careers: [{ company: " 스마트웍스 ", position: "   " }] }),
      META,
    );

    expect(data.careers[0].company).toBe("스마트웍스");
    expect(data.careers[0].position).toBeNull();
  });

  it("numbers sort_order after filtering, not before", () => {
    const data = buildPreviewProfileData(
      values({ careers: [{ company: "" }, { company: "네오소프트" }] }),
      META,
    );

    expect(data.careers[0].sort_order).toBe(0);
  });

  it("keeps saved ids and synthesises stable ones for new rows", () => {
    const input = values({
      careers: [{ id: "saved-uuid", company: "A" }, { company: "B" }],
    });

    const first = buildPreviewProfileData(input, META);
    const second = buildPreviewProfileData(input, META);

    expect(first.careers[0].id).toBe("saved-uuid");
    expect(first.careers[1].id).toBe("preview-career-1");
    expect(second.careers.map((c) => c.id)).toEqual(
      first.careers.map((c) => c.id),
    );
  });

  // resume-panel reads project.tech_stack.length with no optional chain.
  it("always gives a project a tech_stack array", () => {
    const data = buildPreviewProfileData(
      values({ projects: [{ title: "프로젝트", tech_stack: undefined }] }),
      META,
    );

    expect(data.projects[0].tech_stack).toEqual([]);
  });

  it("uses the supplied identity and renders as published and public", () => {
    const data = buildPreviewProfileData(values(), META);

    expect(data.profile.id).toBe("profile-1");
    expect(data.profile.slug).toBe("tester");
    expect(data.profile.status).toBe("published");
    expect(data.profile.is_private).toBe(false);
  });

  it("delegates privacy gating to sanitizePublicProfile", () => {
    const hidden = buildPreviewProfileData(
      values({ phone: "010-1234-5678", show_phone: false }),
      META,
    );
    const shown = buildPreviewProfileData(
      values({ phone: "010-1234-5678", show_phone: true }),
      META,
    );

    expect(hidden.profile.phone).toBeNull();
    expect(shown.profile.phone).toBe("010-1234-5678");
    expect("birth_year" in hidden.profile).toBe(false);
  });

  it("derives an age band from birth_year", () => {
    const data = buildPreviewProfileData(
      values({ birth_year: 1996, show_exact_age: false }),
      META,
    );

    expect(data.profile.ageLabel).toContain("대");
  });

  it("builds chat copy from the converted rows", () => {
    const data = buildPreviewProfileData(
      values({ projects: [{ title: "대시보드 리뉴얼" }] }),
      META,
    );

    expect(data.suggestedQuestions.join(" ")).toContain("대시보드 리뉴얼");
    expect(data.welcomeMessage).toContain("김개발");
  });

  it("falls back to 지원자 in the welcome message when the name is blank", () => {
    const data = buildPreviewProfileData(values({ name: "" }), META);

    expect(data.welcomeMessage).toContain("지원자");
  });

  // The adapter is a third mirror of the same visibility rules. If it drifts
  // from the PDF's mirror, this fails loudly instead of silently.
  it("agrees with the PDF's section visibility helper", () => {
    const input = values({
      careers: [{ company: "스마트웍스" }],
      education: [{ school: "한빛대학교" }],
      certifications: [{ category: "자격", name: "정보처리기사" }],
      activities: [{ title: "동아리" }],
      cover_letters: [{ title: "지원 동기", content: "내용" }],
      enabled_sections: [
        "careers",
        "education",
        "certifications",
        "activities",
        "cover_letters",
      ],
    });

    const ids = getVisiblePublicSections(
      buildPreviewProfileData(input, META),
    ).map((section) => section.id);
    const visibility = getResumeSectionVisibility(input);

    expect(ids.includes(2)).toBe(visibility.showCareers);
    expect(ids.includes(3)).toBe(visibility.showEducation);
    expect(ids.includes(4)).toBe(visibility.showCertifications);
    expect(ids.includes(5)).toBe(visibility.showActivities);
    expect(ids.includes(8)).toBe(visibility.showCoverLetters);
  });

  it("repairs a damaged section order", () => {
    const data = buildPreviewProfileData(
      values({ section_order: [7, 7, 999] }),
      META,
    );

    expect(new Set(data.sectionOrder).size).toBe(data.sectionOrder.length);
    expect(data.sectionOrder).toContain(7);
  });
});

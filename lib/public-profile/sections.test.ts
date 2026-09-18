import { describe, expect, it } from "vitest";

import {
  getVisiblePublicSections,
  publicSectionElementId,
} from "@/lib/public-profile/sections";
import type { PublicProfileData } from "@/lib/public-profile/types";
import { DEFAULT_THEME_CONFIG } from "@/lib/types/profile";

function buildData(
  overrides: Partial<PublicProfileData> = {},
): PublicProfileData {
  return {
    profile: {} as PublicProfileData["profile"],
    profileLinks: [],
    skills: [{ id: "s1", name: "TypeScript", proficiency: null }],
    projects: [
      {
        id: "p1",
        title: "프로젝트",
        period: null,
        role: null,
        situation: null,
        actions: null,
        results: null,
        troubleshooting: null,
        sort_order: 0,
        tech_stack: [],
      },
    ],
    careers: [
      {
        id: "c1",
        company: "회사",
        position: null,
        period: null,
        description: null,
        sort_order: 0,
      },
    ],
    education: [
      {
        id: "e1",
        school: "학교",
        major: null,
        degree: null,
        status: null,
        period: null,
        sort_order: 0,
      },
    ],
    certifications: [],
    activities: [],
    portfolioItems: [],
    coverLetters: [],
    enabledSections: [
      "careers",
      "education",
      "certifications",
      "cover_letters",
    ],
    sectionOrder: [1, 2, 3, 4, 5, 6, 7, 10, 8, 9],
    themeConfig: DEFAULT_THEME_CONFIG,
    suggestedQuestions: [],
    welcomeMessage: "",
    ownerEmail: null,
    ...overrides,
  };
}

describe("getVisiblePublicSections", () => {
  it("always drops 기본 정보 (1) and 예상 질문 답변 (9)", () => {
    const ids = getVisiblePublicSections(buildData()).map(
      (section) => section.id,
    );

    expect(ids).not.toContain(1);
    expect(ids).not.toContain(9);
  });

  it("keeps only sections that are enabled and have rows", () => {
    // certifications is enabled but empty; activities has rows but is disabled.
    const sections = getVisiblePublicSections(
      buildData({
        activities: [
          {
            id: "a1",
            title: "활동",
            organization: null,
            period: null,
            description: null,
            sort_order: 0,
          },
        ],
      }),
    );

    expect(sections.map((section) => section.id)).toEqual([2, 3, 6, 7]);
  });

  it("gates skills and projects on row count alone", () => {
    const sections = getVisiblePublicSections(
      buildData({ skills: [], projects: [] }),
    );

    expect(sections.map((section) => section.id)).toEqual([2, 3]);
  });

  it("respects a custom section_order", () => {
    const sections = getVisiblePublicSections(
      buildData({ sectionOrder: [7, 6, 3, 2, 1, 4, 5, 8, 9, 10] }),
    );

    expect(sections.map((section) => section.id)).toEqual([7, 6, 3, 2]);
  });

  it("labels sections from RESUME_BUILDER_STEPS", () => {
    const labels = getVisiblePublicSections(buildData()).map(
      (section) => section.label,
    );

    expect(labels).toEqual(["경력", "학력", "기술 스택", "프로젝트"]);
  });

  it("returns an empty list when nothing has content", () => {
    expect(
      getVisiblePublicSections(
        buildData({ skills: [], projects: [], careers: [], education: [] }),
      ),
    ).toEqual([]);
  });
});

describe("publicSectionElementId", () => {
  it("builds a stable anchor id", () => {
    expect(publicSectionElementId(7)).toBe("profile-section-7");
  });
});

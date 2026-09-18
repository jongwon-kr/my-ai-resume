import { describe, expect, it } from "vitest";

import {
  buildSuggestedQuestions,
  buildWelcomeMessage,
} from "@/lib/public-profile/suggested-questions";

const ALL_SECTIONS = [
  "careers",
  "education",
  "certifications",
  "activities",
  "portfolio_items",
  "cover_letters",
  "owner_faqs",
];

describe("buildSuggestedQuestions", () => {
  it("merges resume, faq, and answered visitor questions", () => {
    const questions = buildSuggestedQuestions({
      name: "김클론",
      roleTitle: "프론트엔드",
      intro: "React로 3년간 개발했습니다.",
      projects: [
        {
          title: "CloneCV",
          role: "프론트엔드 리드",
          tech_stack: ["React"],
          situation: null,
          actions: "채팅 패널을 설계했습니다.",
          results: "응답 실패율 40% 감소",
          troubleshooting: null,
        },
      ],
      careers: [
        { company: "A", position: "개발자", description: "프론트 개발" },
      ],
      skills: [{ name: "React" }],
      coverLetters: [{ title: "지원동기", content: "지원하게 된 이유는..." }],
      ownerFaqQuestions: ["왜 지원했나요?"],
      enabledSections: ALL_SECTIONS,
      topVisitorQuestions: ["React 경험이 궁금합니다"],
    });

    expect(questions.some((q) => q.includes("CloneCV"))).toBe(true);
    expect(questions).toContain("왜 지원했나요?");
    expect(questions).toContain("React 경험이 궁금합니다");
  });

  it("drops visitor questions the resume has no evidence for", () => {
    const questions = buildSuggestedQuestions({
      name: "김클론",
      roleTitle: "프론트엔드",
      projects: [],
      careers: [],
      skills: [{ name: "React" }],
      coverLetters: [],
      enabledSections: ALL_SECTIONS,
      topVisitorQuestions: ["희망 연봉이 어떻게 되나요?", "혈액형이 뭔가요?"],
    });

    expect(questions).not.toContain("희망 연봉이 어떻게 되나요?");
    expect(questions).not.toContain("혈액형이 뭔가요?");
  });

  it("returns nothing for a resume with no answerable topic", () => {
    expect(
      buildSuggestedQuestions({
        name: "김클론",
        roleTitle: null,
        projects: [],
        careers: [],
        skills: [],
        coverLetters: [],
        enabledSections: [],
      }),
    ).toEqual([]);
  });
});

describe("buildWelcomeMessage", () => {
  it("returns a simple greeting with the profile name", () => {
    const message = buildWelcomeMessage({ name: "김클론" });

    expect(message).toBe(
      "안녕하세요, 김클론의 AI 챗봇입니다! 궁금하신 점이 있으시면 편하게 물어보세요.",
    );
  });
});

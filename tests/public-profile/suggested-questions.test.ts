import { describe, expect, it } from "vitest";

import {
  buildSuggestedQuestions,
  buildWelcomeMessage,
} from "@/lib/public-profile/suggested-questions";

describe("buildSuggestedQuestions", () => {
  it("merges resume, faq, and top visitor questions", () => {
    const questions = buildSuggestedQuestions({
      name: "김클론",
      roleTitle: "프론트엔드",
      projects: [
        {
          id: "1",
          title: "CloneCV",
          period: null,
          role: null,
          tech_stack: null,
          situation: null,
          actions: null,
          results: null,
          troubleshooting: null,
          sort_order: 0,
        },
      ],
      careers: [
        {
          id: "1",
          company: "A",
          position: null,
          period: null,
          description: null,
          sort_order: 0,
        },
      ],
      skills: [{ id: "1", name: "React", proficiency: null }],
      coverLetters: [
        { id: "1", title: "지원동기", content: "...", sort_order: 0 },
      ],
      ownerFaqQuestions: ["왜 지원했나요?"],
      topVisitorQuestions: ["포트폴리오 링크 알려주세요"],
    });

    expect(questions.length).toBeGreaterThan(0);
    expect(questions.some((q) => q.includes("CloneCV"))).toBe(true);
    expect(questions.some((q) => q.includes("왜 지원"))).toBe(true);
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

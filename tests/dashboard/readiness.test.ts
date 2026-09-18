import { describe, expect, it } from "vitest";

import { buildCoverageGaps } from "@/lib/chat/question-coverage";
import { getAnswerReadiness, READINESS_BASES } from "@/lib/dashboard/readiness";

function gap(basis: (typeof READINESS_BASES)[number]) {
  return { basis, label: basis, hint: "", stepId: 1 };
}

describe("getAnswerReadiness", () => {
  it("is 100% with no gaps", () => {
    expect(getAnswerReadiness([])).toEqual({
      percent: 100,
      remaining: 0,
      total: READINESS_BASES.length,
    });
  });

  it("is 0% when every basis is missing", () => {
    expect(getAnswerReadiness(READINESS_BASES.map(gap)).percent).toBe(0);
  });

  it("rounds a partial score", () => {
    // 7 bases, 2 missing → 5/7 = 71.4%
    const result = getAnswerReadiness([gap("intro"), gap("skill")]);
    expect(result.remaining).toBe(2);
    expect(result.percent).toBe(71);
  });

  it("does not go negative on a duplicated basis", () => {
    expect(getAnswerReadiness([gap("faq"), gap("faq")]).remaining).toBe(1);
  });
});

describe("READINESS_BASES", () => {
  it("covers every gap buildCoverageGaps can report", () => {
    // A resume empty in exactly the ways that trigger all seven gaps.
    const gaps = buildCoverageGaps({
      name: "김클론",
      roleTitle: null,
      intro: null,
      projects: [
        {
          title: "이름만 있는 프로젝트",
          role: null,
          tech_stack: [],
          situation: null,
          actions: null,
          results: null,
          troubleshooting: null,
        },
      ],
      careers: [{ company: "스마트웍스", position: null, description: null }],
      skills: [],
      coverLetters: [{ title: "성장 과정", content: "어릴 때부터..." }],
      ownerFaqQuestions: [],
      enabledSections: ["careers", "cover_letters", "owner_faqs"],
    });

    expect(new Set(gaps.map((item) => item.basis))).toEqual(
      new Set(READINESS_BASES),
    );
  });
});

import { describe, expect, it } from "vitest";

import {
  buildCoverageGaps,
  buildProfileCoverage,
  isQuestionAnswerable,
  type CoverageInput,
} from "@/lib/chat/question-coverage";

const ALL_SECTIONS = [
  "careers",
  "education",
  "certifications",
  "activities",
  "portfolio_items",
  "cover_letters",
  "owner_faqs",
];

function input(overrides: Partial<CoverageInput> = {}): CoverageInput {
  return {
    name: "김클론",
    roleTitle: "프론트엔드 개발자",
    intro: "React로 3년간 B2B 제품을 만들었습니다.",
    projects: [],
    careers: [],
    skills: [],
    coverLetters: [],
    enabledSections: ALL_SECTIONS,
    ...overrides,
  };
}

const RICH_PROJECT = {
  title: "실시간 대시보드",
  role: "프론트엔드 리드",
  tech_stack: ["React", "WebSocket"],
  situation: "지표 갱신이 느렸습니다.",
  actions: "WebSocket 스트리밍으로 교체했습니다.",
  results: "갱신 지연 4초 → 0.5초",
  troubleshooting: "메모리 누수를 구독 해제로 해결했습니다.",
};

const texts = (coverageInput: CoverageInput) =>
  buildProfileCoverage(coverageInput).questions.map(
    (question) => question.text,
  );

describe("buildProfileCoverage questions", () => {
  it("omits the troubleshooting question when no project has one", () => {
    const questions = texts(
      input({ projects: [{ ...RICH_PROJECT, troubleshooting: null }] }),
    );

    expect(questions).not.toContain(
      "가장 어려웠던 문제는 어떻게 해결하셨나요?",
    );
  });

  it("asks about troubleshooting once a project describes one", () => {
    expect(texts(input({ projects: [RICH_PROJECT] }))).toContain(
      "가장 어려웠던 문제는 어떻게 해결하셨나요?",
    );
  });

  it("skips a project that has only a title", () => {
    const questions = texts(
      input({
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
      }),
    );

    expect(questions.some((q) => q.includes("이름만 있는 프로젝트"))).toBe(
      false,
    );
  });

  it("returns nothing for an empty resume", () => {
    expect(
      texts({
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

  it("ranks owner FAQ questions first", () => {
    const coverage = buildProfileCoverage(
      input({
        projects: [RICH_PROJECT],
        skills: [{ name: "React" }],
        ownerFaqQuestions: ["왜 지원했나요?"],
      }),
    );

    expect(coverage.questions[0]).toMatchObject({
      text: "왜 지원했나요?",
      basis: "faq",
      strength: 1,
    });
  });

  it("ignores data from a section the owner turned off", () => {
    const questions = texts(
      input({
        careers: [
          { company: "스마트웍스", position: "개발자", description: "개발" },
        ],
        enabledSections: [],
      }),
    );

    expect(questions).not.toContain("경력이 어떻게 되나요?");
  });

  it("only asks about motivation when a cover letter discusses it", () => {
    expect(
      texts(
        input({
          coverLetters: [{ title: "성장 과정", content: "어릴 때부터..." }],
        }),
      ),
    ).not.toContain("지원 동기가 어떻게 되나요?");

    expect(
      texts(
        input({
          coverLetters: [
            {
              title: "지원 동기",
              content: "지원하게 된 이유는 제품 때문입니다.",
            },
          ],
        }),
      ),
    ).toContain("지원 동기가 어떻게 되나요?");
  });
});

describe("isQuestionAnswerable", () => {
  const coverage = buildProfileCoverage(
    input({ projects: [RICH_PROJECT], skills: [{ name: "React" }] }),
  );

  it("accepts a question naming resume evidence", () => {
    expect(
      isQuestionAnswerable("실시간 대시보드는 어떻게 만드셨나요?", coverage),
    ).toBe(true);
    expect(isQuestionAnswerable("React 경험을 말씀해 주세요.", coverage)).toBe(
      true,
    );
  });

  it("rejects sensitive topics outright", () => {
    expect(isQuestionAnswerable("희망 연봉이 어떻게 되나요?", coverage)).toBe(
      false,
    );
    expect(isQuestionAnswerable("주소가 어디인가요?", coverage)).toBe(false);
  });

  it("rejects topics with no evidence", () => {
    expect(isQuestionAnswerable("반려동물을 키우시나요?", coverage)).toBe(
      false,
    );
  });
});

describe("buildCoverageGaps", () => {
  it("reports the empty troubleshooting field", () => {
    const gaps = buildCoverageGaps(
      input({
        projects: [{ ...RICH_PROJECT, troubleshooting: null }],
        skills: [{ name: "React" }],
      }),
    );

    expect(gaps.map((gap) => gap.basis)).toContain("project_troubleshooting");
  });

  it("reports nothing about a filled section", () => {
    const gaps = buildCoverageGaps(
      input({ projects: [RICH_PROJECT], skills: [{ name: "React" }] }),
    );

    expect(gaps.map((gap) => gap.basis)).not.toContain(
      "project_troubleshooting",
    );
    expect(gaps.map((gap) => gap.basis)).not.toContain("skill");
  });
});

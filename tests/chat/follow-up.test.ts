import { describe, expect, it } from "vitest";

import { selectFollowUpQuestions } from "@/lib/chat/follow-up";
import {
  buildProfileCoverage,
  type ProfileCoverage,
} from "@/lib/chat/question-coverage";

const coverage: ProfileCoverage = buildProfileCoverage({
  name: "김클론",
  roleTitle: "프론트엔드 개발자",
  intro: "React로 3년간 개발했습니다.",
  projects: [
    {
      title: "실시간 대시보드",
      role: "프론트엔드 리드",
      tech_stack: ["React"],
      situation: "지표 갱신이 느렸습니다.",
      actions: "WebSocket으로 교체했습니다.",
      results: "지연 4초 → 0.5초",
      troubleshooting: "메모리 누수를 구독 해제로 해결했습니다.",
    },
  ],
  careers: [],
  skills: [{ name: "React" }],
  coverLetters: [],
  enabledSections: [],
});

describe("selectFollowUpQuestions", () => {
  it("drops generated questions the resume cannot answer", () => {
    const selected = selectFollowUpQuestions({
      generated: [
        "그때 팀 규모는 몇 명이었나요?",
        "실시간 대시보드의 성과를 더 설명해 주세요.",
      ],
      coverage,
      askedQuestions: [],
    });

    expect(selected).not.toContain("그때 팀 규모는 몇 명이었나요?");
    expect(selected).toContain("실시간 대시보드의 성과를 더 설명해 주세요.");
  });

  it("tops up from coverage so the visitor always gets a way forward", () => {
    const selected = selectFollowUpQuestions({
      generated: [],
      coverage,
      askedQuestions: [],
    });

    expect(selected).toHaveLength(3);
    expect(
      selected.every((question) =>
        coverage.questions.some((item) => item.text === question),
      ),
    ).toBe(true);
  });

  it("never repeats a question already asked", () => {
    const asked = coverage.questions[0].text;
    const selected = selectFollowUpQuestions({
      generated: [asked],
      coverage,
      askedQuestions: [asked],
    });

    expect(selected).not.toContain(asked);
  });

  it("passes generated questions through when coverage is unavailable", () => {
    const selected = selectFollowUpQuestions({
      generated: ["아무 질문이나 해봅니다."],
      coverage: null,
      askedQuestions: [],
    });

    expect(selected).toEqual(["아무 질문이나 해봅니다."]);
  });
});

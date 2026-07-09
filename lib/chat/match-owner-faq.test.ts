import { describe, expect, it } from "vitest";

import {
  buildOwnerFaqInjection,
  matchOwnerFaq,
} from "@/lib/chat/match-owner-faq";

describe("matchOwnerFaq", () => {
  const faqs = [
    {
      question: "이 직무에 지원한 이유가 뭔가요?",
      answer: "몰라요",
    },
    {
      question: "가장 큰 강점은 무엇인가요?",
      answer: "꼼꼼하게 일합니다.",
    },
  ];

  it("matches semantically similar motivation questions", () => {
    const match = matchOwnerFaq("왜 이 직무에 지원했어요?", faqs);
    expect(match?.question).toBe("이 직무에 지원한 이유가 뭔가요?");
    expect(match?.answer).toBe("몰라요");
  });

  it("matches alternate phrasing for motivation questions", () => {
    const match = matchOwnerFaq("이 포지션에 지원하신 동기가 무엇인가요?", faqs);
    expect(match?.question).toBe("이 직무에 지원한 이유가 뭔가요?");
  });

  it("does not match unrelated questions", () => {
    const match = matchOwnerFaq("주로 사용하는 기술 스택은?", faqs);
    expect(match).toBeNull();
  });

  it("builds injection with priority instructions", () => {
    const match = matchOwnerFaq("왜 이 직무에 지원했어요?", faqs);
    expect(match).not.toBeNull();
    const injection = buildOwnerFaqInjection(match!);
    expect(injection).toContain("최우선 답변");
    expect(injection).toContain("몰라요");
    expect(injection).toContain("OUT_OF_SCOPE");
  });
});

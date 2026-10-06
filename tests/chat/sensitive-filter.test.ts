import { describe, expect, it } from "vitest";

import {
  classifyAnswer,
  containsPii,
  containsSensitiveTerm,
  createPiiStreamGuard,
  shouldOfferInquiry,
} from "@/lib/chat/sensitive-filter";
import {
  OUT_OF_SCOPE_REPLY,
  promptGuardReply,
  UNKNOWN_FACT_REPLY,
} from "@/lib/chat/constants";

describe("containsPii", () => {
  it("detects Korean mobile phone numbers", () => {
    expect(containsPii("연락처는 010-1234-5678 입니다.")).toBe(true);
  });

  it("detects resident registration style numbers", () => {
    expect(containsPii("900101-1234567")).toBe(true);
  });

  it.each([
    "휴대폰 앱 개발 프로젝트에서 React Native를 사용했습니다.",
    "급여 정산 시스템의 배치 성능을 개선했습니다.",
    "주소 검색 API를 연동해 입력 오류를 줄였습니다.",
    "2023.03 - 2024.02 동안 근무했습니다.",
  ])("lets ordinary answers through: %s", (text) => {
    expect(containsPii(text)).toBe(false);
  });
});

describe("containsSensitiveTerm", () => {
  it("still flags sensitive topics in questions", () => {
    expect(containsSensitiveTerm("연봉은 얼마인가요?")).toBe(true);
  });
});

function runGuard(deltas: string[]) {
  const guard = createPiiStreamGuard();
  let emitted = "";
  for (const delta of deltas) {
    const result = guard.push(delta);
    if (result.blocked) return { emitted, blocked: true };
    emitted += result.emit;
  }
  return { emitted: emitted + guard.flush(), blocked: false };
}

describe("createPiiStreamGuard", () => {
  it("emits plain text immediately", () => {
    const guard = createPiiStreamGuard();
    expect(guard.push("저는 프론트엔드")).toEqual({
      emit: "저는 프론트엔드",
      blocked: false,
    });
  });

  it("never emits any digit of a number split across deltas", () => {
    const result = runGuard(["연락처는 010-12", "34-5678 입니다."]);
    expect(result.blocked).toBe(true);
    expect(result.emitted).toBe("연락처는");
  });

  it("releases held digits once they cannot become PII", () => {
    const result = runGuard(["성능을 30", "% 개선했습니다."]);
    expect(result).toEqual({
      emitted: "성능을 30% 개선했습니다.",
      blocked: false,
    });
  });

  it("flushes a trailing number at stream end", () => {
    expect(runGuard(["2024년 ", "3"])).toEqual({
      emitted: "2024년 3",
      blocked: false,
    });
  });
});

describe("classifyAnswer", () => {
  const clean = { wasFiltered: false };

  it("classifies the fixed replies from constants", () => {
    expect(classifyAnswer(UNKNOWN_FACT_REPLY, clean)).toBe("unknown_fact");
    expect(classifyAnswer(OUT_OF_SCOPE_REPLY, clean)).toBe("out_of_scope");
    expect(classifyAnswer(promptGuardReply("김클론"), clean)).toBe(
      "prompt_guard",
    );
  });

  it("recognizes phrasings from older published prompts", () => {
    expect(
      classifyAnswer("해당 경험은 이력서에 명시되어 있지 않습니다.", clean),
    ).toBe("unknown_fact");
  });

  it("marks filtered answers regardless of text", () => {
    expect(classifyAnswer(OUT_OF_SCOPE_REPLY, { wasFiltered: true })).toBe(
      "sensitive_filtered",
    );
  });

  it("treats normal answers as answered", () => {
    expect(classifyAnswer("React 프로젝트에서 성과를 냈습니다.", clean)).toBe(
      "answered",
    );
  });
});

describe("shouldOfferInquiry", () => {
  it("offers the inquiry form for refusals the owner can answer", () => {
    expect(shouldOfferInquiry("unknown_fact")).toBe(true);
    expect(shouldOfferInquiry("out_of_scope")).toBe(true);
    expect(shouldOfferInquiry("sensitive_filtered")).toBe(true);
  });

  it("does not offer it for answers or injection attempts", () => {
    expect(shouldOfferInquiry("answered")).toBe(false);
    expect(shouldOfferInquiry("prompt_guard")).toBe(false);
  });
});

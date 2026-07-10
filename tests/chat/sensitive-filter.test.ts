import { describe, expect, it } from "vitest";

import {
  applySensitiveContentFilter,
  shouldOfferInquiryFallback,
} from "@/lib/chat/sensitive-filter";
import { SENSITIVE_REPLACEMENT } from "@/lib/chat/constants";

describe("applySensitiveContentFilter", () => {
  it("replaces text containing salary keywords", () => {
    expect(applySensitiveContentFilter("제 연봉은 5000만원입니다.")).toBe(
      SENSITIVE_REPLACEMENT,
    );
  });

  it("replaces Korean mobile phone numbers", () => {
    expect(applySensitiveContentFilter("연락처는 010-1234-5678 입니다.")).toBe(
      SENSITIVE_REPLACEMENT,
    );
  });

  it("replaces resident registration style numbers", () => {
    expect(applySensitiveContentFilter("900101-1234567")).toBe(
      SENSITIVE_REPLACEMENT,
    );
  });

  it("returns original text when clean", () => {
    const text = "Next.js와 TypeScript로 프로젝트를 진행했습니다.";
    expect(applySensitiveContentFilter(text)).toBe(text);
  });
});

describe("shouldOfferInquiryFallback", () => {
  it("returns true for out-of-scope style replies", () => {
    expect(shouldOfferInquiryFallback(SENSITIVE_REPLACEMENT)).toBe(true);
  });

  it("returns false for normal answers", () => {
    expect(
      shouldOfferInquiryFallback("React 프로젝트에서 성과를 냈습니다."),
    ).toBe(false);
  });
});

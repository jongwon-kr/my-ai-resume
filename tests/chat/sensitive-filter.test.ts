import { describe, expect, it } from "vitest";

import { applySensitiveContentFilter } from "@/lib/chat/sensitive-filter";
import { SENSITIVE_REPLACEMENT } from "@/lib/chat/constants";

describe("applySensitiveContentFilter", () => {
  it("replaces text containing sensitive keywords", () => {
    expect(applySensitiveContentFilter("제 연봉은 5000만원입니다.")).toBe(
      SENSITIVE_REPLACEMENT,
    );
  });

  it("returns original text when no sensitive keywords are found", () => {
    const text = "Next.js와 TypeScript로 프로젝트를 진행했습니다.";
    expect(applySensitiveContentFilter(text)).toBe(text);
  });
});

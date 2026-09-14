import { describe, expect, it } from "vitest";

import {
  estimateTokens,
  truncateHistoryByChars,
} from "@/lib/chat/token-budget";

function turn(role: "user" | "assistant", content: string) {
  return { role, content };
}

/** Builds n user/assistant pairs whose contents are `size` chars each. */
function history(pairs: number, size: number) {
  return Array.from({ length: pairs * 2 }, (_, i) =>
    turn(i % 2 === 0 ? "user" : "assistant", "x".repeat(size)),
  );
}

describe("estimateTokens", () => {
  it("returns 0 for empty text", () => {
    expect(estimateTokens("")).toBe(0);
  });

  it("over-estimates rather than under-estimates", () => {
    expect(estimateTokens("x".repeat(150))).toBe(100);
  });

  it("rounds up partial tokens", () => {
    expect(estimateTokens("ab")).toBe(2);
  });
});

describe("truncateHistoryByChars", () => {
  it("returns history unchanged when under the cap", () => {
    const h = history(2, 10);
    expect(truncateHistoryByChars(h, 1000)).toBe(h);
  });

  it("handles an empty history", () => {
    expect(truncateHistoryByChars([], 100)).toEqual([]);
  });

  it("drops the oldest turns first", () => {
    const h = [
      turn("user", "oldest-question"),
      turn("assistant", "oldest-answer"),
      turn("user", "newest-question"),
      turn("assistant", "newest-answer"),
    ];
    const result = truncateHistoryByChars(h, 30);
    expect(result.at(-1)?.content).toBe("newest-answer");
    expect(result.map((m) => m.content)).not.toContain("oldest-question");
  });

  it("keeps the first message a user turn", () => {
    for (const cap of [1, 10, 25, 50, 99]) {
      const result = truncateHistoryByChars(history(4, 10), cap);
      if (result.length > 0) {
        expect(result[0].role).toBe("user");
      }
    }
  });

  it("brings the total within the cap", () => {
    const result = truncateHistoryByChars(history(5, 100), 250);
    const total = result.reduce((sum, m) => sum + m.content.length, 0);
    expect(total).toBeLessThanOrEqual(250);
  });

  it("empties the history when even one pair exceeds the cap", () => {
    expect(truncateHistoryByChars(history(1, 100), 10)).toEqual([]);
  });
});

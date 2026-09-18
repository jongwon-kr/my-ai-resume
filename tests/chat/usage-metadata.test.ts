import { describe, expect, it } from "vitest";

import { readGeminiUsage } from "@/lib/chat/usage-metadata";

describe("readGeminiUsage", () => {
  it("reads the token counts off a final stream chunk", () => {
    expect(
      readGeminiUsage({
        usageMetadata: { promptTokenCount: 4200, candidatesTokenCount: 310 },
      }),
    ).toEqual({ inputTokens: 4200, outputTokens: 310 });
  });

  it("bills thinking tokens as output", () => {
    expect(
      readGeminiUsage({
        usageMetadata: {
          promptTokenCount: 100,
          candidatesTokenCount: 50,
          thoughtsTokenCount: 25,
        },
      }),
    ).toEqual({ inputTokens: 100, outputTokens: 75 });
  });

  it("returns null for the text chunks that carry no usage", () => {
    expect(readGeminiUsage({ text: "안녕하세요" })).toBeNull();
    expect(readGeminiUsage({ usageMetadata: null })).toBeNull();
  });

  it("returns null rather than throwing on junk", () => {
    expect(readGeminiUsage(null)).toBeNull();
    expect(readGeminiUsage("chunk")).toBeNull();
    expect(readGeminiUsage(undefined)).toBeNull();
  });

  it("ignores non-numeric counts instead of trusting them", () => {
    expect(
      readGeminiUsage({
        usageMetadata: { promptTokenCount: "4200", candidatesTokenCount: -1 },
      }),
    ).toBeNull();

    expect(
      readGeminiUsage({
        usageMetadata: { promptTokenCount: 10, candidatesTokenCount: NaN },
      }),
    ).toEqual({ inputTokens: 10, outputTokens: 0 });
  });
});

import { describe, expect, it } from "vitest";

import { summarizeTokenUsage } from "@/lib/dashboard/ai-usage";

const SYSTEM_PROMPT_TOKENS = 4000;

function assistant(
  content: string,
  input: number | null = null,
  output: number | null = null,
) {
  return {
    role: "assistant",
    content,
    input_tokens: input,
    output_tokens: output,
  };
}

function user(content: string) {
  return {
    role: "user",
    content,
    input_tokens: null,
    output_tokens: null,
  };
}

describe("summarizeTokenUsage", () => {
  it("sums measured turns from the recorded counts", () => {
    const { measured, estimated } = summarizeTokenUsage(
      [assistant("답변", 4100, 300), assistant("답변", 4200, 250)],
      SYSTEM_PROMPT_TOKENS,
    );

    expect(measured).toEqual({
      turns: 2,
      inputTokens: 8300,
      outputTokens: 550,
    });
    expect(estimated.turns).toBe(0);
  });

  it("estimates turns recorded before token capture", () => {
    const { measured, estimated } = summarizeTokenUsage(
      [assistant("여섯 글자입니다")],
      SYSTEM_PROMPT_TOKENS,
    );

    expect(measured.turns).toBe(0);
    expect(estimated.turns).toBe(1);
    expect(estimated.inputTokens).toBe(SYSTEM_PROMPT_TOKENS);
    expect(estimated.outputTokens).toBeGreaterThan(0);
  });

  it("never counts a turn in both buckets", () => {
    const { measured, estimated } = summarizeTokenUsage(
      [assistant("측정됨", 100, 20), assistant("추정됨")],
      SYSTEM_PROMPT_TOKENS,
    );

    expect(measured.turns).toBe(1);
    expect(estimated.turns).toBe(1);
  });

  it("counts a turn as measured when only one side was reported", () => {
    const { measured, estimated } = summarizeTokenUsage(
      [assistant("입력만 기록됨", 4000, null)],
      SYSTEM_PROMPT_TOKENS,
    );

    expect(measured).toEqual({
      turns: 1,
      inputTokens: 4000,
      outputTokens: 0,
    });
    expect(estimated.turns).toBe(0);
  });

  it("ignores user rows — their text is billed inside the assistant turn", () => {
    const { measured, estimated } = summarizeTokenUsage(
      [user("질문입니다"), assistant("답변", 100, 20)],
      SYSTEM_PROMPT_TOKENS,
    );

    expect(measured.turns).toBe(1);
    expect(estimated.turns).toBe(0);
  });

  it("returns zeroes for an empty history", () => {
    const { measured, estimated } = summarizeTokenUsage([], 0);

    expect(measured).toEqual({ turns: 0, inputTokens: 0, outputTokens: 0 });
    expect(estimated).toEqual({ turns: 0, inputTokens: 0, outputTokens: 0 });
  });
});

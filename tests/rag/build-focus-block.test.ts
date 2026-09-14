import { describe, expect, it } from "vitest";

import { buildFocusBlock } from "@/lib/rag/build-focus-block";
import type { ScoredChunk } from "@/lib/rag/select-injection";

function chunk(content: string, similarity = 0.8): ScoredChunk {
  return { section_key: "project", title: "제목", content, similarity };
}

describe("buildFocusBlock", () => {
  it("returns an empty string with no chunks", () => {
    expect(buildFocusBlock([])).toBe("");
  });

  it("numbers each chunk", () => {
    const block = buildFocusBlock([chunk("첫 항목"), chunk("둘째 항목")]);
    expect(block).toContain("1. 첫 항목");
    expect(block).toContain("2. 둘째 항목");
  });

  it("states that it adds no new facts, to stay consistent with the guardrails", () => {
    const block = buildFocusBlock([chunk("본문")]);
    expect(block).toContain("새로운 사실을 추가하지 않습니다");
  });

  it("tells the model it may still use the rest of the résumé", () => {
    const block = buildFocusBlock([chunk("본문")]);
    expect(block).toContain(
      "여기에 없는 내용도 위 이력서에 있다면 사용하십시오",
    );
  });
});

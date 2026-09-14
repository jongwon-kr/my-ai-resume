import { describe, expect, it } from "vitest";

import {
  FAQ_SEMANTIC_THRESHOLD,
  RAG_FOCUS_THRESHOLD,
  RAG_FOCUS_TOP_K,
} from "@/lib/rag/constants";
import { selectInjection, type ScoredChunk } from "@/lib/rag/select-injection";

function chunk(
  section_key: string,
  similarity: number,
  content = "본문",
): ScoredChunk {
  return { section_key, title: `${section_key} 제목`, content, similarity };
}

function faqChunk(similarity: number, q = "강점이 뭔가요", a = "꼼꼼함입니다") {
  return {
    section_key: "faq",
    title: `예상 질문 — ${q}`,
    content: `Q: ${q}\nA: ${a}`,
    similarity,
  };
}

describe("selectInjection", () => {
  it("returns none with no keyword match and no chunks", () => {
    expect(selectInjection({ keywordMatch: null, scoredChunks: [] })).toEqual({
      kind: "none",
    });
  });

  it("lets an exact keyword match win over retrieval", () => {
    const result = selectInjection({
      keywordMatch: { question: "Q", answer: "A", score: 1 },
      scoredChunks: [faqChunk(0.99, "다른 질문", "다른 답변")],
    });
    expect(result.kind).toBe("faq");
    if (result.kind === "faq") {
      expect(result.match.answer).toBe("A");
    }
  });

  it("uses a semantic FAQ hit above the threshold", () => {
    const result = selectInjection({
      keywordMatch: null,
      scoredChunks: [faqChunk(FAQ_SEMANTIC_THRESHOLD + 0.05)],
    });
    expect(result.kind).toBe("faq");
    if (result.kind === "faq") {
      expect(result.match.question).toBe("강점이 뭔가요");
      expect(result.match.answer).toBe("꼼꼼함입니다");
    }
  });

  it("ignores a semantic FAQ hit below the threshold", () => {
    const result = selectInjection({
      keywordMatch: null,
      scoredChunks: [faqChunk(FAQ_SEMANTIC_THRESHOLD - 0.01)],
    });
    expect(result.kind).not.toBe("faq");
  });

  it("falls back to a weaker keyword match when retrieval finds no FAQ", () => {
    const result = selectInjection({
      keywordMatch: { question: "Q", answer: "A", score: 0.5 },
      scoredChunks: [chunk("project", 0.9)],
    });
    expect(result.kind).toBe("faq");
  });

  it("suppresses the focus block whenever a FAQ is chosen", () => {
    const result = selectInjection({
      keywordMatch: null,
      scoredChunks: [
        faqChunk(FAQ_SEMANTIC_THRESHOLD + 0.1),
        chunk("project", 0.95),
      ],
    });
    expect(result.kind).toBe("faq");
  });

  it("builds a focus block from chunks above the threshold", () => {
    const result = selectInjection({
      keywordMatch: null,
      scoredChunks: [
        chunk("project", RAG_FOCUS_THRESHOLD + 0.3),
        chunk("career", RAG_FOCUS_THRESHOLD + 0.1),
        chunk("skills", RAG_FOCUS_THRESHOLD - 0.1),
      ],
    });
    expect(result.kind).toBe("focus");
    if (result.kind === "focus") {
      expect(result.chunks).toHaveLength(2);
      expect(result.chunks[0].similarity).toBeGreaterThan(
        result.chunks[1].similarity,
      );
    }
  });

  it("caps the focus block at the configured top-k", () => {
    const result = selectInjection({
      keywordMatch: null,
      scoredChunks: Array.from({ length: RAG_FOCUS_TOP_K + 3 }, (_, i) =>
        chunk("project", 0.9 - i * 0.01),
      ),
    });
    expect(result.kind).toBe("focus");
    if (result.kind === "focus") {
      expect(result.chunks).toHaveLength(RAG_FOCUS_TOP_K);
    }
  });

  it("returns none when every chunk is below the focus threshold", () => {
    const result = selectInjection({
      keywordMatch: null,
      scoredChunks: [chunk("project", RAG_FOCUS_THRESHOLD - 0.2)],
    });
    expect(result).toEqual({ kind: "none" });
  });

  it("skips a malformed FAQ chunk instead of injecting garbage", () => {
    const result = selectInjection({
      keywordMatch: null,
      scoredChunks: [
        {
          section_key: "faq",
          title: "예상 질문",
          content: "Q와 A 구분이 없는 본문",
          similarity: 0.95,
        },
      ],
    });
    expect(result.kind).toBe("focus");
  });
});

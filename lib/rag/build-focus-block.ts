import type { ScoredChunk } from "@/lib/rag/select-injection";

/**
 * Appended after the stored system prompt, which already contains the full
 * résumé. This block only re-surfaces the most relevant parts — it never
 * replaces anything, so a bad retrieval costs tokens, not recall.
 */
export function buildFocusBlock(chunks: ScoredChunk[]): string {
  if (chunks.length === 0) {
    return "";
  }

  const items = chunks
    .map((chunk, index) => `${index + 1}. ${chunk.content.trim()}`)
    .join("\n\n");

  return `[현재 질문과 가장 관련 있는 이력 항목]
아래는 위 이력서 내용 중 지금 질문과 관련도가 높은 부분입니다. 답변에 우선 활용하되,
여기에 없는 내용도 위 이력서에 있다면 사용하십시오. 이 블록은 새로운 사실을 추가하지 않습니다.

${items}`;
}

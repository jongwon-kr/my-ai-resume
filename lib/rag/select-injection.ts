import type { OwnerFaqMatch } from "@/lib/chat/match-owner-faq";
import {
  FAQ_SEMANTIC_THRESHOLD,
  RAG_FOCUS_THRESHOLD,
  RAG_FOCUS_TOP_K,
} from "@/lib/rag/constants";

export interface ScoredChunk {
  section_key: string;
  title: string;
  content: string;
  similarity: number;
}

export type Injection =
  | { kind: "faq"; match: OwnerFaqMatch }
  | { kind: "focus"; chunks: ScoredChunk[] }
  | { kind: "none" };

interface SelectInjectionInput {
  keywordMatch: OwnerFaqMatch | null;
  scoredChunks: ScoredChunk[];
}

/**
 * Decides what, if anything, gets appended to the stored system prompt.
 *
 * Pure so it can be tested with hand-written similarity numbers, no embedding
 * call involved.
 */
export function selectInjection({
  keywordMatch,
  scoredChunks,
}: SelectInjectionInput): Injection {
  // An exact / containment keyword hit is an explicit owner contract
  // (match_mode 'exact'), so it wins outright.
  if (keywordMatch?.score === 1) {
    return { kind: "faq", match: keywordMatch };
  }

  const semanticFaq = scoredChunks
    .filter(
      (chunk) =>
        chunk.section_key === "faq" &&
        chunk.similarity >= FAQ_SEMANTIC_THRESHOLD,
    )
    .sort((a, b) => b.similarity - a.similarity)[0];

  if (semanticFaq) {
    const parsed = parseFaqChunk(semanticFaq.content);
    if (parsed) {
      return {
        kind: "faq",
        match: { ...parsed, score: semanticFaq.similarity },
      };
    }
  }

  if (keywordMatch) {
    return { kind: "faq", match: keywordMatch };
  }

  const focus = scoredChunks
    .filter((chunk) => chunk.similarity >= RAG_FOCUS_THRESHOLD)
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, RAG_FOCUS_TOP_K);

  return focus.length > 0 ? { kind: "focus", chunks: focus } : { kind: "none" };
}

/** FAQ chunks are stored as "Q: ...\nA: ...". */
function parseFaqChunk(
  content: string,
): { question: string; answer: string } | null {
  const match = content.match(/^Q:\s*([\s\S]*?)\nA:\s*([\s\S]*)$/);
  if (!match) {
    return null;
  }

  const question = match[1].trim();
  const answer = match[2].trim();
  return question && answer ? { question, answer } : null;
}

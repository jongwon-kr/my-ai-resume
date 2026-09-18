import {
  compactText,
  matchedIntentGroups,
  tokenize,
} from "@/lib/chat/korean-text";

export interface OwnerFaqMatch {
  question: string;
  answer: string;
  score: number;
}

function jaccardSimilarity(a: Set<number>, b: Set<number>) {
  if (a.size === 0 && b.size === 0) {
    return 0;
  }

  const intersection = [...a].filter((value) => b.has(value)).length;
  const union = new Set([...a, ...b]).size;
  return union === 0 ? 0 : intersection / union;
}

function tokenOverlapScore(a: string, b: string) {
  const tokensA = tokenize(a);
  const tokensB = tokenize(b);

  if (tokensA.length === 0 || tokensB.length === 0) {
    return 0;
  }

  const setB = new Set(tokensB);
  const overlap = tokensA.filter((token) => setB.has(token)).length;
  return overlap / Math.max(tokensA.length, tokensB.length);
}

function combinedScore(userMessage: string, faqQuestion: string) {
  const intentScore = jaccardSimilarity(
    matchedIntentGroups(userMessage),
    matchedIntentGroups(faqQuestion),
  );
  const tokenScore = tokenOverlapScore(userMessage, faqQuestion);

  const compactUser = compactText(userMessage);
  const compactFaq = compactText(faqQuestion);
  const exactBonus =
    compactUser === compactFaq ||
    compactUser.includes(compactFaq) ||
    compactFaq.includes(compactUser)
      ? 1
      : 0;

  return Math.max(intentScore * 0.7 + tokenScore * 0.3, exactBonus);
}

const MATCH_THRESHOLD = 0.34;

/** Finds the best owner FAQ for a visitor question using intent/keyword similarity. */
export function matchOwnerFaq(
  userMessage: string,
  faqs: Array<{
    question: string;
    answer: string;
    match_mode?: string | null;
  }>,
): OwnerFaqMatch | null {
  const trimmedMessage = userMessage.trim();
  if (!trimmedMessage || faqs.length === 0) {
    return null;
  }

  let best: OwnerFaqMatch | null = null;

  for (const faq of faqs) {
    const question = faq.question.trim();
    const answer = faq.answer.trim();
    if (!question || !answer) {
      continue;
    }

    if (faq.match_mode === "exact") {
      const compactUser = compactText(trimmedMessage);
      const compactFaq = compactText(question);
      if (compactUser !== compactFaq) {
        continue;
      }
      return { question, answer, score: 1 };
    }

    const score = combinedScore(trimmedMessage, question);
    if (score >= MATCH_THRESHOLD && (!best || score > best.score)) {
      best = { question, answer, score };
    }
  }

  return best;
}

export function buildOwnerFaqInjection(match: OwnerFaqMatch) {
  return `[현재 질문 매칭 - 최우선 답변]
면접관 질문은 위 [소유자가 미리 준비한 답변] 목록의 아래 항목과 의미가 같거나 매우 유사합니다.
등록된 예상 질문: ${match.question}
준비된 답변: ${match.answer}

지시:
1. 반드시 위 "준비된 답변"을 1인칭으로 자연스럽게 재서술해 답하세요.
2. 이 지시는 OUT_OF_SCOPE 가드레일보다 우선합니다. "답하기 어려운 부분" 응답을 사용하지 마세요.
3. 준비된 답변의 사실 관계는 유지하되, 면접 말투로 다듬을 수 있습니다.`;
}

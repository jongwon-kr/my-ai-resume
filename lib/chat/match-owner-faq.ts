const STOP_WORDS = new Set([
  "이",
  "그",
  "저",
  "것",
  "수",
  "등",
  "를",
  "을",
  "에",
  "의",
  "가",
  "은",
  "는",
  "로",
  "와",
  "과",
  "도",
  "나",
  "요",
  "세요",
  "습니까",
  "인가요",
  "뭔가요",
  "무엇인가요",
  "있나요",
  "했어요",
  "했나요",
  "하셨",
  "하신",
  "하나요",
  "해주세요",
  "알려",
  "주세요",
  "좀",
  "한",
  "하는",
  "해서",
  "대해",
  "대해서",
  "관해",
  "관해서",
  "어떤",
  "어떻게",
  "무엇",
  "뭐",
  "뭔",
  "왜",
  "어디",
  "언제",
  "누구",
]);

const INTENT_GROUPS: string[][] = [
  ["지원", "지원한", "지원하", "지원했", "지원동기", "지원이유"],
  ["이유", "동기", "왜"],
  ["직무", "포지션", "역할", "직책"],
  ["경력", "이력", "근무", "회사"],
  ["프로젝트", "프로젝트경험"],
  ["강점", "장점", "잘하는"],
  ["약점", "단점", "보완"],
  ["협업", "팀워크", "소통"],
  ["성과", "결과", "성과지표"],
  ["트러블슈팅", "문제해결"],
  ["기술", "스택", "기술스택"],
  ["자기소개", "소개"],
  ["입사", "합류", "채용"],
  ["연봉", "처우", "보상"],
];

export interface OwnerFaqMatch {
  question: string;
  answer: string;
  score: number;
}

function normalizeText(text: string) {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function compactText(text: string) {
  return normalizeText(text).replace(/\s+/g, "");
}

function matchedIntentGroups(text: string) {
  const compact = compactText(text);
  const groups = new Set<number>();

  INTENT_GROUPS.forEach((keywords, groupIndex) => {
    if (keywords.some((keyword) => compact.includes(keyword))) {
      groups.add(groupIndex);
    }
  });

  return groups;
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
  const tokensA = normalizeText(a)
    .split(" ")
    .filter((token) => token.length > 1 && !STOP_WORDS.has(token));
  const tokensB = normalizeText(b)
    .split(" ")
    .filter((token) => token.length > 1 && !STOP_WORDS.has(token));

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
  faqs: Array<{ question: string; answer: string }>,
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

    const score = combinedScore(trimmedMessage, question);
    if (score >= MATCH_THRESHOLD && (!best || score > best.score)) {
      best = { question, answer, score };
    }
  }

  return best;
}

export function buildOwnerFaqInjection(match: OwnerFaqMatch) {
  return `[현재 질문 매칭 - 최우선 답변]
면접관 질문은 아래 "등록된 예상 질문"과 의미가 같거나 매우 유사합니다.
등록된 예상 질문: ${match.question}
준비된 답변: ${match.answer}

지시:
1. 반드시 위 "준비된 답변"을 1인칭으로 자연스럽게 재서술해 답하세요.
2. 이 지시는 OUT_OF_SCOPE 가드레일보다 우선합니다. "답하기 어려운 부분" 응답을 사용하지 마세요.
3. 준비된 답변의 사실 관계는 유지하되, 면접 말투로 다듬을 수 있습니다.`;
}

/**
 * Korean question-matching primitives shared by owner-FAQ matching and
 * question-coverage checks. Both need the same notion of "these two Korean
 * questions are about the same thing", so the tokenizer and intent groups live
 * here rather than being duplicated per caller.
 */

export const STOP_WORDS = new Set([
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

/**
 * Index-addressed on purpose: callers compare group membership by index, so
 * appending is safe but reordering is not.
 */
export const INTENT_GROUPS: string[][] = [
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

export function normalizeText(text: string) {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function compactText(text: string) {
  return normalizeText(text).replace(/\s+/g, "");
}

/** Content tokens only — single characters and particles carry no topic signal. */
export function tokenize(text: string) {
  return normalizeText(text)
    .split(" ")
    .filter((token) => token.length > 1 && !STOP_WORDS.has(token));
}

export function matchedIntentGroups(text: string) {
  const compact = compactText(text);
  const groups = new Set<number>();

  INTENT_GROUPS.forEach((keywords, groupIndex) => {
    if (keywords.some((keyword) => compact.includes(keyword))) {
      groups.add(groupIndex);
    }
  });

  return groups;
}

import { PROMPT_GUARD_MARKER } from "@/lib/chat/constants";

/**
 * Topics a *question* must not steer toward. Checked against question text
 * only (suggested-question filtering) — never against answers, where words
 * like "휴대폰 앱" or "급여 정산 시스템" are ordinary project descriptions.
 */
const SENSITIVE_TOPIC_PATTERNS = [
  /연봉/u,
  /급여/u,
  /주민등록/u,
  /주민번호/u,
  /주민/u,
  /계좌/u,
  /통장/u,
  /비밀번호/u,
  /카드번호/u,
  /신용카드/u,
  /주소/u,
  /도로명/u,
  /아파트/u,
  /동\s*\d+/u,
  /호\s*\d+/u,
  /전화번호/u,
  /휴대폰/u,
  /핸드폰/u,
  /ssn/i,
  /salary/i,
];

/**
 * Data shapes an *answer* must never carry. The prompt already omits phone and
 * birth date, so this is defense in depth against the model echoing one.
 */
const PII_OUTPUT_PATTERNS = [
  // Korean resident registration number (YYMMDD-GXXXXXX)
  /\d{6}[-\s]?[1-4]\d{6}/u,
  // Korean mobile (010/011/016/017/018/019)
  /01[016789][-\s.]?\d{3,4}[-\s.]?\d{4}/u,
  // Landline with area code
  /0\d{1,2}[-\s.]?\d{3,4}[-\s.]?\d{4}/u,
];

/** Trailing run that could still grow into a PII match: hold it back. */
const TRAILING_NUMERIC_RUN = /[\d\s.-]*\d[\d\s.-]*$/u;

/** True when text touches a topic the clone must never answer from. */
export function containsSensitiveTerm(text: string) {
  return SENSITIVE_TOPIC_PATTERNS.some((pattern) => pattern.test(text));
}

export function containsPii(text: string) {
  return PII_OUTPUT_PATTERNS.some((pattern) => pattern.test(text));
}

/**
 * Releases streamed text only once it can no longer become a PII match, so a
 * number never reaches the client piecewise before the filter sees it whole.
 */
export function createPiiStreamGuard() {
  let received = "";
  let released = 0;

  return {
    push(delta: string): { emit: string; blocked: boolean } {
      received += delta;
      if (containsPii(received)) {
        return { emit: "", blocked: true };
      }

      const held = received.match(TRAILING_NUMERIC_RUN)?.[0].length ?? 0;
      const safeEnd = received.length - held;
      const emit = received.slice(released, safeEnd);
      released = Math.max(released, safeEnd);
      return { emit, blocked: false };
    },
    /** Remainder held back at stream end; already checked by `push`. */
    flush(): string {
      const rest = received.slice(released);
      released = received.length;
      return rest;
    },
  };
}

export type AnswerStatus =
  | "answered"
  | "out_of_scope"
  | "unknown_fact"
  | "prompt_guard"
  | "sensitive_filtered";

/**
 * Distinctive slices of the fixed replies in constants.ts (tests pin them to
 * those constants), plus phrasings older published prompts still produce.
 */
const UNKNOWN_FACT_MARKERS = [
  "이력서 데이터에 포함되어 있지 않",
  "명시되어 있지 않",
  "이력서에 없",
];
const OUT_OF_SCOPE_MARKERS = ["답하기 어려운", "직접 답변"];

export function classifyAnswer(
  text: string,
  { wasFiltered }: { wasFiltered: boolean },
): AnswerStatus {
  if (wasFiltered) return "sensitive_filtered";

  const normalized = text.trim();
  if (normalized.includes(PROMPT_GUARD_MARKER)) return "prompt_guard";
  if (UNKNOWN_FACT_MARKERS.some((marker) => normalized.includes(marker))) {
    return "unknown_fact";
  }
  if (OUT_OF_SCOPE_MARKERS.some((marker) => normalized.includes(marker))) {
    return "out_of_scope";
  }
  return "answered";
}

/** A refusal the visitor can route to the owner via the inquiry form. */
export function shouldOfferInquiry(status: AnswerStatus) {
  return (
    status === "unknown_fact" ||
    status === "out_of_scope" ||
    status === "sensitive_filtered"
  );
}

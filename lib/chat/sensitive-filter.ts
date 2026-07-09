import { SENSITIVE_REPLACEMENT } from "@/lib/chat/constants";

const SENSITIVE_PATTERNS = [
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
  // Korean resident registration number (YYMMDD-GXXXXXX)
  /\d{6}[-\s]?[1-4]\d{6}/u,
  // Korean mobile (010/011/016/017/018/019)
  /01[016789][-\s.]?\d{3,4}[-\s.]?\d{4}/u,
  // Landline with area code
  /0\d{1,2}[-\s.]?\d{3,4}[-\s.]?\d{4}/u,
];

/** Replaces assistant text when sensitive keywords are detected. */
export function applySensitiveContentFilter(text: string) {
  if (SENSITIVE_PATTERNS.some((pattern) => pattern.test(text))) {
    return SENSITIVE_REPLACEMENT;
  }

  return text;
}

export function shouldOfferInquiryFallback(text: string) {
  const normalized = text.trim();
  return (
    normalized === SENSITIVE_REPLACEMENT ||
    normalized.includes("답하기 어려운") ||
    normalized.includes("직접 답변") ||
    normalized.includes("명시되어 있지 않") ||
    normalized.includes("이력서에 없")
  );
}

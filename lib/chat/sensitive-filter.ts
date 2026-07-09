import { SENSITIVE_REPLACEMENT } from "@/lib/chat/constants";

const SENSITIVE_PATTERNS = [
  /연봉/u,
  /급여/u,
  /주민등록/u,
  /주민번호/u,
  /계좌/u,
  /통장/u,
  /비밀번호/u,
  /카드번호/u,
  /신용카드/u,
  /주소/u,
  /전화번호/u,
  /휴대폰/u,
  /ssn/i,
  /salary/i,
];

/** Replaces assistant text when sensitive keywords are detected. */
export function applySensitiveContentFilter(text: string) {
  if (SENSITIVE_PATTERNS.some((pattern) => pattern.test(text))) {
    return SENSITIVE_REPLACEMENT;
  }

  return text;
}

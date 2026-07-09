export const REPORT_REASONS = [
  { value: "inappropriate", label: "부적절한 콘텐츠" },
  { value: "misinformation", label: "허위/과장 정보" },
  { value: "spam", label: "스팸/광고" },
  { value: "harassment", label: "괴롭힘/욕설" },
  { value: "other", label: "기타" },
] as const;

export type ReportReason = (typeof REPORT_REASONS)[number]["value"];

export const REPORT_SUCCESS_MESSAGE =
  "신고가 접수되었습니다. 검토 후 조치하겠습니다.";

export const REPORT_ERROR_MESSAGE =
  "신고 접수에 실패했습니다. 잠시 후 다시 시도해 주세요.";

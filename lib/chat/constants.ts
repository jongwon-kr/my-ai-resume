/** Google AI Studio free tier — Flash models only (Pro has zero free quota). */
export const GEMINI_FREE_MODEL = "gemini-2.5-flash";

const DEFAULT_GEMINI_MODELS = [
  "gemini-3.5-flash-lite",
  "gemini-3.1-flash-lite",
  "gemini-3-flash",
  "gemini-2.5-flash",
  "gemini-3.5-flash",
];

function parseCommaSeparatedModels(raw: string | undefined): string[] {
  if (!raw) return [];
  return [
    ...new Set(
      raw
        .split(",")
        .map((model) => model.trim())
        .filter(Boolean),
    ),
  ];
}

/** Default model for chat UI and non-chat Gemini calls (PDF import, etc.). */
export const GEMINI_MODEL =
  process.env.GEMINI_MODEL?.trim() || GEMINI_FREE_MODEL;

/**
 * Selectable / auto-fallback model list.
 * Override with `GEMINI_MODELS` (comma-separated).
 * If `GEMINI_MODEL` is missing from the list, it is prepended so the default is always choosable.
 */
export const GEMINI_MODELS: string[] = (() => {
  const fromEnv = parseCommaSeparatedModels(process.env.GEMINI_MODELS);
  const base = fromEnv.length > 0 ? fromEnv : DEFAULT_GEMINI_MODELS;
  return base.includes(GEMINI_MODEL) ? base : [GEMINI_MODEL, ...base];
})();

/** @deprecated Use GEMINI_MODELS — kept as an alias for older imports. */
export const GEMINI_MODEL_CHAIN = GEMINI_MODELS;

export function formatGeminiModelLabel(modelId: string): string {
  const rest = modelId.replace(/^gemini-/i, "");
  const titled = rest
    .split("-")
    .filter(Boolean)
    .map((part) =>
      part.toLowerCase() === "lite"
        ? "Lite"
        : part.charAt(0).toUpperCase() + part.slice(1),
    )
    .join(" ");
  return `Gemini ${titled}`;
}

export function isAllowedChatModel(modelId: string): boolean {
  return modelId === "auto" || GEMINI_MODELS.includes(modelId);
}

export const CHAT_RATE_LIMIT_PER_MINUTE = 5;
export const CHAT_RATE_LIMIT_PER_DAY = 50;
export const CHAT_HISTORY_TURN_LIMIT = 10;

export const CHAT_ERROR_MESSAGE =
  "서버 응답에 실패했습니다. 잠시 후 다시 시도해주세요.";
export const CHAT_QUOTA_ERROR_MESSAGE =
  "현재 AI 모델의 사용량이 초과되었습니다. 잠시 후 다시 시도하거나 Auto 모드를 사용해보세요.";
export const CHAT_ALL_MODELS_EXHAUSTED_MESSAGE =
  "현재 사용 가능한 모든 AI 모델의 일일 한도가 초과되었습니다. 잠시 후 다시 시도해주세요.";

export const SENSITIVE_REPLACEMENT =
  "그 부분은 AI 클론인 제가 답하기 어려운 부분이라, 본 면접에서 직접 답변드리겠습니다.";

export const OUT_OF_SCOPE_REPLY = SENSITIVE_REPLACEMENT;

export const DEFAULT_SUGGESTED_QUESTIONS = [
  "가장 어려웠던 프로젝트는 무엇인가요?",
  "주요 기술 스택과 경험을 설명해 주세요.",
  "팀에서 어떤 역할을 맡았나요?",
] as const;

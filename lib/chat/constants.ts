/** Google AI Studio free tier — Flash models only (Pro has zero free quota). */
export const GEMINI_FREE_MODEL = "gemini-2.5-flash";

export const GEMINI_MODEL = process.env.GEMINI_MODEL ?? GEMINI_FREE_MODEL;

/**
 * Ordered fallback chain of free-tier Flash models. Each model is tried in order;
 * when one hits its quota (429) or is unavailable (404), the next one is used.
 * Override the order/models with the `GEMINI_MODELS` env var (comma-separated).
 * Default: Gemini 3 Flash → Gemini 3.5 Flash → Gemini 2.5 Flash.
 */
const DEFAULT_GEMINI_MODEL_CHAIN = [
  "gemini-3-flash-preview",
  "gemini-3.5-flash",
  GEMINI_FREE_MODEL,
];

export const GEMINI_MODEL_CHAIN: string[] = [
  ...new Set(
    (process.env.GEMINI_MODELS
      ? process.env.GEMINI_MODELS.split(",")
      : DEFAULT_GEMINI_MODEL_CHAIN
    )
      .map((model) => model.trim())
      .filter(Boolean),
  ),
];

export const CHAT_RATE_LIMIT_PER_MINUTE = 5;
export const CHAT_RATE_LIMIT_PER_DAY = 50;
export const CHAT_HISTORY_TURN_LIMIT = 10;

export const CHAT_ERROR_MESSAGE = "잠시 후 다시 시도해주세요.";
export const CHAT_QUOTA_ERROR_MESSAGE =
  "AI 응답 한도에 도달했습니다. 잠시 후 다시 시도해 주세요.";
export const CHAT_ALL_MODELS_EXHAUSTED_MESSAGE =
  "현재 모든 AI 모델의 응답 한도에 도달했어요. 잠시 후 다시 시도해 주세요.";

export const SENSITIVE_REPLACEMENT =
  "그 부분은 AI 클론인 제가 답하기 어려운 부분이라, 본 면접에서 직접 답변드리겠습니다.";

export const OUT_OF_SCOPE_REPLY = SENSITIVE_REPLACEMENT;

export const DEFAULT_SUGGESTED_QUESTIONS = [
  "가장 어려웠던 프로젝트는 무엇인가요?",
  "주요 기술 스택과 경험을 설명해 주세요.",
  "팀에서 어떤 역할을 맡았나요?",
] as const;

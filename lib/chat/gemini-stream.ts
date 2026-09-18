import { GoogleGenAI } from "@google/genai";
import {
  CHAT_QUOTA_ERROR_MESSAGE,
  CHAT_ALL_MODELS_EXHAUSTED_MESSAGE,
  CHAT_CONTEXT_TOO_LONG_MESSAGE,
  CHAT_MAX_OUTPUT_TOKENS,
  GEMINI_MODELS,
} from "@/lib/chat/constants";

const CONTEXT_LENGTH_PATTERN =
  /token|context length|too long|exceeds the maximum/i;

/** Distinguishes "prompt too big" 400s from other bad-request failures. */
export function isContextLengthError(error: unknown): boolean {
  const message =
    error instanceof Error
      ? error.message
      : typeof error === "string"
        ? error
        : ((error as { message?: string })?.message ?? "");
  return CONTEXT_LENGTH_PATTERN.test(message);
}

export interface GeminiStreamOptions {
  ai: GoogleGenAI;
  contents: any[];
  systemInstruction: string;
  requestedModel: string;
}

export interface GeminiStreamResult {
  stream: AsyncGenerator<any>;
  usedModel: string;
  /** Requests actually sent, including fallback attempts that failed. */
  attempts: number;
}

export async function executeGeminiStream({
  ai,
  contents,
  systemInstruction,
  requestedModel,
}: GeminiStreamOptions): Promise<GeminiStreamResult> {
  // Auto 모드일 경우 준비된 모델 전체 순회, 특정 모델 지정 시 해당 모델만 시도
  const modelsToTry =
    requestedModel === "auto" ? GEMINI_MODELS : [requestedModel];

  let lastError: any = null;
  let isQuotaError = false;
  let attempts = 0;

  for (const targetModel of modelsToTry) {
    attempts += 1;
    try {
      console.log(`[chat] Trying model: ${targetModel}`);
      const responseStream = await ai.models.generateContentStream({
        model: targetModel,
        contents,
        config: {
          systemInstruction,
          maxOutputTokens: CHAT_MAX_OUTPUT_TOKENS,
        },
      });

      // 스트림 객체가 정상적으로 생성되면 루프를 멈추고 반환 (Fallback 성공)
      return { stream: responseStream, usedModel: targetModel, attempts };
    } catch (error: any) {
      console.warn(
        `[chat] Model ${targetModel} failed:`,
        error.message || error,
      );
      lastError = error;

      // Google Gen AI SDK 에러 상태 코드 확인 (429: 할당량 초과, 503: 서버 과부하)
      if (error.status === 429) {
        isQuotaError = true;
      }

      // 컨텍스트 초과는 400으로 돌아온다. 모델을 바꿔도 결과가 같으므로
      // 폴백을 멈추고, 쿼터 초과와 구분되는 메시지를 던진다.
      if (error.status === 400 && isContextLengthError(error)) {
        throw new Error(CHAT_CONTEXT_TOO_LONG_MESSAGE);
      }

      // 모델 변경을 통한 Fallback 계속 진행
    }
  }

  // 모든 모델이 실패했을 경우, 에러의 원인에 따라 맞춤형 메시지 Throw
  console.error(
    "[chat] All Gemini models exhausted. Last error:",
    lastError?.message || lastError,
  );

  if (isQuotaError) {
    throw new Error(CHAT_QUOTA_ERROR_MESSAGE);
  } else {
    throw new Error(CHAT_ALL_MODELS_EXHAUSTED_MESSAGE);
  }
}

import { GoogleGenAI, ApiError } from "@google/genai";
import {
  CHAT_ERROR_MESSAGE,
  CHAT_QUOTA_ERROR_MESSAGE,
  CHAT_ALL_MODELS_EXHAUSTED_MESSAGE,
  GEMINI_MODELS,
} from "@/lib/chat/constants";

export interface GeminiStreamOptions {
  ai: GoogleGenAI;
  contents: any[];
  systemInstruction: string;
  requestedModel: string;
}

export interface GeminiStreamResult {
  stream: AsyncGenerator<any>;
  usedModel: string;
}

export async function executeGeminiStream({
  ai,
  contents,
  systemInstruction,
  requestedModel,
}: GeminiStreamOptions): Promise<GeminiStreamResult> {
  // Auto 모드일 경우 5개 모델 전체 순회, 특정 모델 지정 시 해당 모델만 1번 시도
  const modelsToTry =
    requestedModel === "auto" ? GEMINI_MODELS : [requestedModel];
  let lastError: unknown = null;

  for (const targetModel of modelsToTry) {
    try {
      console.log(`[chat] Trying model: ${targetModel}`);
      const responseStream = await ai.models.generateContentStream({
        model: targetModel,
        contents,
        config: { systemInstruction },
      });

      // 스트림 객체가 정상적으로 생성되면 루프를 멈추고 반환 (Fallback 성공)
      return { stream: responseStream, usedModel: targetModel };
    } catch (error) {
      console.warn(`[chat] model ${targetModel} failed:`, error);
      lastError = error;
    }
  }

  // 배열 내의 모든 모델이 실패했을 경우 예외 처리
  const isQuotaError =
    lastError instanceof ApiError && lastError.status === 429;

  const errorMessage =
    requestedModel === "auto"
      ? CHAT_ALL_MODELS_EXHAUSTED_MESSAGE
      : isQuotaError
        ? CHAT_QUOTA_ERROR_MESSAGE
        : CHAT_ERROR_MESSAGE;

  // 상위 라우터에서 catch 할 수 있도록 에러 던짐
  throw new Error(errorMessage);
}

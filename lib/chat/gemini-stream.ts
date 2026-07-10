import { GoogleGenAI } from "@google/genai";
import {
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
  // Auto 모드일 경우 준비된 모델 전체 순회, 특정 모델 지정 시 해당 모델만 시도
  const modelsToTry =
    requestedModel === "auto" ? GEMINI_MODELS : [requestedModel];

  let lastError: any = null;
  let isQuotaError = false;

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

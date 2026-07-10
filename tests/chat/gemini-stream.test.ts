import { describe, it, expect, vi, beforeEach } from "vitest";
import { executeGeminiStream } from "@/lib/chat/gemini-stream";
import { ApiError } from "@google/genai";
import {
  CHAT_ERROR_MESSAGE,
  CHAT_QUOTA_ERROR_MESSAGE,
  CHAT_ALL_MODELS_EXHAUSTED_MESSAGE,
  GEMINI_MODELS,
} from "@/lib/chat/constants";

vi.mock("@google/genai", () => {
  class MockApiError extends Error {
    status?: number;
    constructor(message: string, status?: number) {
      super(message);
      this.name = "ApiError";
      this.status = status;
      Object.setPrototypeOf(this, MockApiError.prototype);
    }
  }
  return {
    GoogleGenAI: vi.fn(),
    ApiError: MockApiError,
  };
});

describe("executeGeminiStream", () => {
  const generateContentStreamMock = vi.fn();
  const mockAi = {
    models: {
      generateContentStream: generateContentStreamMock,
    },
  } as any;

  const defaultOptions = {
    ai: mockAi,
    contents: [{ role: "user", parts: [{ text: "안녕" }] }],
    systemInstruction: "테스트 인스트럭션",
    requestedModel: "auto",
  };

  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("특정 모델이 지정된 경우 해당 모델만 호출하고 성공 결과를 반환해야 한다", async () => {
    const mockStream = { value: "스트림_데이터" };
    generateContentStreamMock.mockResolvedValueOnce(mockStream);

    const result = await executeGeminiStream({
      ...defaultOptions,
      requestedModel: "gemini-2.5-pro",
    });

    expect(generateContentStreamMock).toHaveBeenCalledTimes(1);
    expect(generateContentStreamMock).toHaveBeenCalledWith(
      expect.objectContaining({
        model: "gemini-2.5-pro",
      }),
    );
    expect(result.stream).toBe(mockStream);
    expect(result.usedModel).toBe("gemini-2.5-pro");
  });

  it("Auto 모드일 때 첫 번째 모델이 성공하면 즉시 결과를 반환해야 한다", async () => {
    const mockStream = { value: "스트림_데이터" };
    generateContentStreamMock.mockResolvedValueOnce(mockStream);

    const result = await executeGeminiStream(defaultOptions);

    expect(generateContentStreamMock).toHaveBeenCalledTimes(1);
    expect(generateContentStreamMock).toHaveBeenCalledWith(
      expect.objectContaining({
        model: GEMINI_MODELS[0],
      }),
    );
    expect(result.usedModel).toBe(GEMINI_MODELS[0]);
  });

  it("Auto 모드에서 앞의 모델들이 실패하면 다음 모델로 폴백(Fallback)해야 한다", async () => {
    const mockStream = { value: "스트림_데이터" };

    generateContentStreamMock
      .mockRejectedValueOnce(new Error("첫 번째 모델 실패"))
      .mockRejectedValueOnce(new Error("두 번째 모델 실패"))
      .mockResolvedValueOnce(mockStream);

    const result = await executeGeminiStream(defaultOptions);

    expect(generateContentStreamMock).toHaveBeenCalledTimes(3);
    expect(generateContentStreamMock).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ model: GEMINI_MODELS[0] }),
    );
    expect(generateContentStreamMock).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({ model: GEMINI_MODELS[1] }),
    );
    expect(generateContentStreamMock).toHaveBeenNthCalledWith(
      3,
      expect.objectContaining({ model: GEMINI_MODELS[2] }),
    );
    expect(result.usedModel).toBe(GEMINI_MODELS[2]);
    expect(result.stream).toBe(mockStream);
  });

  it("Auto 모드에서 모든 모델이 실패하면 한도 초과(EXHAUSTED) 에러를 던져야 한다", async () => {
    generateContentStreamMock.mockRejectedValue(new Error("알 수 없는 에러"));

    await expect(executeGeminiStream(defaultOptions)).rejects.toThrow(
      CHAT_ALL_MODELS_EXHAUSTED_MESSAGE,
    );

    expect(generateContentStreamMock).toHaveBeenCalledTimes(
      GEMINI_MODELS.length,
    );
  });

  it("특정 모델이 429(Rate Limit) 에러를 발생시키면 Quota 에러 메시지를 던져야 한다", async () => {
    const quotaError = new ApiError({
      message: "Too Many Requests",
      status: 429,
    });
    quotaError.status = 429;
    generateContentStreamMock.mockImplementationOnce(() =>
      Promise.reject(quotaError),
    );

    await expect(
      executeGeminiStream({
        ...defaultOptions,
        requestedModel: "gemini-2.5-flash",
      }),
    ).rejects.toThrow(CHAT_QUOTA_ERROR_MESSAGE);

    expect(generateContentStreamMock).toHaveBeenCalledTimes(1);
  });
});

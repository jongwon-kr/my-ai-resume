import { ApiError, type GoogleGenAI } from "@google/genai";

/** Thrown when every model in the fallback chain is exhausted or unavailable. */
export class AllModelsExhaustedError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = "AllModelsExhaustedError";
  }
}

/**
 * Quota / rate-limit (429) or model-unavailable (404) errors are safe to recover
 * from by trying the next model in the chain.
 */
export function isFallbackableError(error: unknown): boolean {
  return (
    error instanceof ApiError && (error.status === 429 || error.status === 404)
  );
}

interface GeminiContent {
  role: "user" | "model";
  parts: Array<{ text: string }>;
}

interface StreamChatOptions {
  ai: GoogleGenAI;
  models: string[];
  contents: GeminiContent[];
  systemInstruction: string;
  onDelta: (delta: string) => void;
}

/**
 * Streams a chat completion, falling back through `models` in order when a model
 * hits its quota (429) or is unavailable (404). Fallback only happens before any
 * text has been emitted for the current attempt, so already-streamed output is
 * never duplicated. Throws {@link AllModelsExhaustedError} when every model in the
 * chain is exhausted or unavailable.
 */
export async function streamChatCompletion({
  ai,
  models,
  contents,
  systemInstruction,
  onDelta,
}: StreamChatOptions): Promise<{ model: string; text: string }> {
  let lastError: unknown;

  for (const model of models) {
    let text = "";
    let emitted = false;

    try {
      const stream = await ai.models.generateContentStream({
        model,
        contents,
        config: { systemInstruction },
      });

      for await (const chunk of stream) {
        const delta = chunk.text ?? "";
        if (!delta) {
          continue;
        }

        emitted = true;
        text += delta;
        onDelta(delta);
      }

      return { model, text };
    } catch (error) {
      lastError = error;

      if (!emitted && isFallbackableError(error)) {
        continue;
      }

      throw error;
    }
  }

  throw new AllModelsExhaustedError(
    "All Gemini models are exhausted or unavailable.",
    { cause: lastError },
  );
}

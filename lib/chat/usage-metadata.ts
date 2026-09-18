/**
 * Reads Gemini's `usageMetadata` off a stream chunk or a one-shot response.
 *
 * The SDK stream is typed as `AsyncGenerator<any>`, so this is the boundary
 * where that shape gets narrowed: everything downstream works with real types.
 */

export interface GeminiUsage {
  inputTokens: number;
  outputTokens: number;
}

function readCount(source: Record<string, unknown>, key: string): number {
  const value = source[key];
  return typeof value === "number" && Number.isFinite(value) && value >= 0
    ? value
    : 0;
}

/**
 * Returns null when the value carries no usage metadata — most stream chunks
 * do not, and only the last one reports the final totals.
 */
export function readGeminiUsage(value: unknown): GeminiUsage | null {
  if (typeof value !== "object" || value === null) {
    return null;
  }

  const metadata = (value as { usageMetadata?: unknown }).usageMetadata;
  if (typeof metadata !== "object" || metadata === null) {
    return null;
  }

  const source = metadata as Record<string, unknown>;
  const inputTokens = readCount(source, "promptTokenCount");
  // Thinking models bill reasoning separately from the visible answer.
  const outputTokens =
    readCount(source, "candidatesTokenCount") +
    readCount(source, "thoughtsTokenCount");

  if (inputTokens === 0 && outputTokens === 0) {
    return null;
  }

  return { inputTokens, outputTokens };
}

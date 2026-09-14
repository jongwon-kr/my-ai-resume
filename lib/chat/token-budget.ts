/**
 * Character-based token budgeting.
 *
 * We deliberately do not call Gemini's countTokens per request: it adds a
 * round trip and burns free-tier quota, while all we need is a "did this go
 * over the cap" decision. Korean text averages well under 2 chars per token,
 * so dividing by 1.5 stays conservative (over-estimates, never under).
 */
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 1.5);
}

/**
 * Trims history from the oldest end until it fits `maxChars`.
 *
 * Must run AFTER the user/model alternation cleanup, and drops two messages at
 * a time so the result keeps starting with a user turn (Gemini requires it).
 */
export function truncateHistoryByChars<T extends { content: string }>(
  history: T[],
  maxChars: number,
): T[] {
  let total = history.reduce((sum, item) => sum + item.content.length, 0);

  if (total <= maxChars) {
    return history;
  }

  const trimmed = [...history];
  // Always drop a whole user+model pair so the survivor still starts on a user
  // turn; dropping an odd number would leave a leading model turn.
  while (trimmed.length > 0 && total > maxChars) {
    for (let i = 0; i < 2 && trimmed.length > 0; i += 1) {
      total -= trimmed[0].content.length;
      trimmed.shift();
    }
  }

  return trimmed;
}

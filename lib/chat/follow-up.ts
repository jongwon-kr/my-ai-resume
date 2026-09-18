import { compactText } from "@/lib/chat/korean-text";
import {
  isQuestionAnswerable,
  type ProfileCoverage,
} from "@/lib/chat/question-coverage";

/** Matches the panel's chip limit. */
export const FOLLOW_UP_COUNT = 3;

/**
 * Turns raw LLM follow-up suggestions into chips the clone can actually answer.
 *
 * The generator reliably drifts past the resume — asked to deepen an answer it
 * reaches for team sizes and metrics nobody wrote down — so anything without
 * evidence is dropped and the list is topped up from the coverage catalog. That
 * top-up is also the way back: after a refused turn the visitor still gets
 * answerable questions instead of variations on what just failed.
 */
export function selectFollowUpQuestions(input: {
  generated: string[];
  coverage: ProfileCoverage | null;
  askedQuestions: string[];
}): string[] {
  const { generated, coverage, askedQuestions } = input;

  const asked = new Set(
    askedQuestions.map((question) => compactText(question)),
  );
  const seen = new Set<string>();
  const selected: string[] = [];

  const push = (question: string) => {
    const trimmed = question.trim();
    const key = compactText(trimmed);
    if (!trimmed || !key || asked.has(key) || seen.has(key)) {
      return;
    }
    seen.add(key);
    selected.push(trimmed);
  };

  for (const question of generated) {
    if (selected.length >= FOLLOW_UP_COUNT) break;
    // Without coverage (owner modes, or a failed backfill) there is nothing to
    // check against, so the generated questions stand as-is.
    if (coverage && !isQuestionAnswerable(question, coverage)) continue;
    push(question);
  }

  // Already sorted by evidence strength.
  for (const question of coverage?.questions ?? []) {
    if (selected.length >= FOLLOW_UP_COUNT) break;
    push(question.text);
  }

  return selected;
}

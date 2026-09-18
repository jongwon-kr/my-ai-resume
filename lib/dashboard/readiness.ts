import type { CoverageBasis, CoverageGap } from "@/lib/chat/question-coverage";

/**
 * Every gap kind `buildCoverageGaps` can report.
 *
 * Kept here rather than in the chat module so this UI addition does not touch
 * answering logic. `tests/dashboard/readiness.test.ts` drives that function
 * with a deliberately empty profile and asserts the two stay in sync.
 */
export const READINESS_BASES: CoverageBasis[] = [
  "intro",
  "skill",
  "project_troubleshooting",
  "project_star",
  "career",
  "cover_letter",
  "faq",
];

export interface AnswerReadiness {
  percent: number;
  /** Gap kinds still unresolved. */
  remaining: number;
  total: number;
}

/**
 * How much of the interview the clone can actually speak to.
 *
 * Distinct from resume completion: a section can be filled in and still leave
 * the clone unable to answer, because coverage keys off the specific fields an
 * answer needs (a project with no troubleshooting cannot say what went wrong).
 */
export function getAnswerReadiness(gaps: CoverageGap[]): AnswerReadiness {
  const total = READINESS_BASES.length;
  // Defensive: a repeated basis must not push the score below zero.
  const remaining = Math.min(new Set(gaps.map((gap) => gap.basis)).size, total);

  return {
    percent: Math.round(((total - remaining) / total) * 100),
    remaining,
    total,
  };
}

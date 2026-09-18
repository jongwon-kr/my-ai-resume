import {
  buildProfileCoverage,
  isQuestionAnswerable,
  type CoverageInput,
} from "@/lib/chat/question-coverage";

export type SuggestedQuestionInput = CoverageInput & {
  /** Questions real visitors asked and the clone answered. */
  topVisitorQuestions?: string[];
};

/**
 * Chat prompt chips for the public profile.
 *
 * Every question comes from the coverage engine, so a chip is only shown when
 * the resume holds the evidence to answer it. Returns an empty list for a
 * resume with no answerable topics — the panel then hides the chips entirely.
 */
export function buildSuggestedQuestions(input: SuggestedQuestionInput) {
  const { topVisitorQuestions = [], ...coverageInput } = input;
  const coverage = buildProfileCoverage(coverageInput);

  const visitorQuestions = topVisitorQuestions
    .filter((question) => isQuestionAnswerable(question, coverage))
    .slice(0, 2);

  // Real demand that the clone already handled outranks the generated list,
  // but never the owner's own FAQ.
  const questions = [
    ...coverage.questions
      .filter((question) => question.basis === "faq")
      .map((question) => question.text),
    ...visitorQuestions,
    ...coverage.questions
      .filter((question) => question.basis !== "faq")
      .map((question) => question.text),
  ];

  return Array.from(
    new Set(questions.map((question) => question.trim()).filter(Boolean)),
  ).slice(0, 6);
}

export function buildWelcomeMessage(input: { name: string }) {
  const name = input.name.trim() || "지원자";
  return `안녕하세요, ${name}의 AI 챗봇입니다! 궁금하신 점이 있으시면 편하게 물어보세요.`;
}

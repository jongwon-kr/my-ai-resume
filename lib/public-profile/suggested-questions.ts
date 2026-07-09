import { DEFAULT_SUGGESTED_QUESTIONS } from "@/lib/chat/constants";
import type {
  PublicCareer,
  PublicCoverLetter,
  PublicProject,
  PublicSkill,
} from "@/lib/public-profile/types";

export interface SuggestedQuestionInput {
  name: string;
  roleTitle: string | null;
  projects: PublicProject[];
  careers: PublicCareer[];
  skills: PublicSkill[];
  coverLetters: PublicCoverLetter[];
  ownerFaqQuestions?: string[];
  topVisitorQuestions?: string[];
}

export function buildSuggestedQuestions(input: SuggestedQuestionInput) {
  const {
    name,
    roleTitle,
    projects,
    careers,
    skills,
    coverLetters,
    ownerFaqQuestions = [],
    topVisitorQuestions = [],
  } = input;

  const questions: string[] = [];

  if (roleTitle) {
    questions.push(`${roleTitle}로서 어떤 강점이 있나요?`);
  }

  if (projects[0]?.title) {
    questions.push(
      `${projects[0].title} 프로젝트에서 맡은 역할과 성과는 무엇인가요?`,
    );
  }

  if (careers.length > 0) {
    questions.push("경력이 어떻게 되나요?");
  }

  if (coverLetters.length > 0) {
    questions.push("지원 동기가 어떻게 되나요?");
  }

  if (skills[0]?.name) {
    questions.push(`${skills[0].name} 경험에 대해 설명해 주세요.`);
  }

  questions.push(...ownerFaqQuestions.slice(0, 2));
  questions.push(...topVisitorQuestions.slice(0, 2));
  questions.push(...DEFAULT_SUGGESTED_QUESTIONS);
  questions.push(`${name}님의 강점은 무엇인가요?`);

  return Array.from(new Set(questions.map((q) => q.trim()).filter(Boolean))).slice(
    0,
    6,
  );
}

export function buildWelcomeMessage(input: { name: string }) {
  const name = input.name.trim() || "지원자";
  return `안녕하세요, ${name}의 AI 챗봇입니다! 궁금하신 점이 있으시면 편하게 물어보세요.`;
}

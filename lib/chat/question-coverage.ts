/**
 * Question coverage: which questions this resume can actually answer.
 *
 * The chatbot's guardrails refuse anything not present in the prompt, so a
 * suggested question whose supporting field is empty is a guaranteed refusal.
 * Everything here is derived from the same data `buildSystemPrompt` renders,
 * with the same section gating, so a question can only be produced when its
 * evidence is in the prompt.
 */

import {
  compactText,
  matchedIntentGroups,
  tokenize,
} from "@/lib/chat/korean-text";
import { containsSensitiveTerm } from "@/lib/chat/sensitive-filter";
import {
  isPromptSectionEnabled,
  type SystemPromptInput,
} from "@/lib/prompt/build-system-prompt";
import type { ResumeFormValues } from "@/lib/resume/schema";

export type CoverageBasis =
  | "faq"
  | "project_star"
  | "project_troubleshooting"
  | "career"
  | "skill"
  | "cover_letter"
  | "portfolio"
  | "education"
  | "certification"
  | "activity"
  | "intro";

export interface CoverageQuestion {
  text: string;
  basis: CoverageBasis;
  /** 1.0 owner-authored answer · 0.8 narrative field filled · 0.5 bare entry. */
  strength: number;
}

export interface CoverageGap {
  basis: CoverageBasis;
  label: string;
  hint: string;
  /** Resume builder step that fills this gap. */
  stepId: number;
}

/**
 * Stored as jsonb on `system_prompts`, so it stays plain JSON — no Sets.
 * `intents` holds INTENT_GROUPS indices the resume has evidence for.
 */
export interface ProfileCoverage {
  questions: CoverageQuestion[];
  tokens: string[];
  intents: number[];
}

/** Accepts both DB rows (null) and form values (undefined). */
type OptionalText = string | null | undefined;

interface CoverageProject {
  title: string;
  role?: OptionalText;
  tech_stack?: string[] | null;
  situation?: OptionalText;
  actions?: OptionalText;
  results?: OptionalText;
  troubleshooting?: OptionalText;
}

interface CoverageCareer {
  company: string;
  position?: OptionalText;
  description?: OptionalText;
}

interface CoverageSkill {
  name: string;
}

interface CoverageCoverLetter {
  title: string;
  content?: OptionalText;
}

interface CoveragePortfolioItem {
  title: string;
  description?: OptionalText;
}

interface CoverageEducation {
  school: string;
  major?: OptionalText;
}

interface CoverageCertification {
  name: string;
}

interface CoverageActivity {
  title: string;
  description?: OptionalText;
}

export interface CoverageInput {
  name: string;
  roleTitle: OptionalText;
  intro?: OptionalText;
  projects: CoverageProject[];
  careers: CoverageCareer[];
  skills: CoverageSkill[];
  coverLetters: CoverageCoverLetter[];
  portfolioItems?: CoveragePortfolioItem[];
  education?: CoverageEducation[];
  certifications?: CoverageCertification[];
  activities?: CoverageActivity[];
  ownerFaqQuestions?: string[];
  enabledSections: string[];
}

/** More than two per basis crowds out the other sections. */
const MAX_PER_BASIS = 2;
const MAX_QUESTIONS = 6;

/** Cover letters only support a motivation question if they discuss one. */
const MOTIVATION_TERMS = ["지원동기", "지원이유", "지원하게", "입사", "합류"];

function filled(value: string | null | undefined) {
  return Boolean(value && value.trim());
}

function hasNarrative(project: CoverageProject) {
  return (
    filled(project.situation) ||
    filled(project.actions) ||
    filled(project.results)
  );
}

function mentionsMotivation(letter: CoverageCoverLetter) {
  const haystack = compactText(`${letter.title} ${letter.content ?? ""}`);
  return MOTIVATION_TERMS.some((term) => haystack.includes(term));
}

/**
 * Resolves each optional section once. Skills and projects are always in the
 * prompt, so they are not gated.
 */
function resolveSections(input: CoverageInput) {
  const on = (key: string) =>
    isPromptSectionEnabled(input.enabledSections, key);
  return {
    careers: on("careers") ? input.careers : [],
    education: on("education") ? (input.education ?? []) : [],
    certifications: on("certifications") ? (input.certifications ?? []) : [],
    activities: on("activities") ? (input.activities ?? []) : [],
    portfolioItems: on("portfolio_items") ? (input.portfolioItems ?? []) : [],
    coverLetters: on("cover_letters") ? input.coverLetters : [],
    ownerFaqQuestions: on("owner_faqs") ? (input.ownerFaqQuestions ?? []) : [],
  };
}

function buildQuestions(input: CoverageInput): CoverageQuestion[] {
  const sections = resolveSections(input);
  const { projects, skills } = input;
  const questions: CoverageQuestion[] = [];
  const perBasis = new Map<CoverageBasis, number>();

  const add = (text: string, basis: CoverageBasis, strength: number) => {
    const trimmed = text.trim();
    const used = perBasis.get(basis) ?? 0;
    if (!trimmed || used >= MAX_PER_BASIS) {
      return;
    }
    perBasis.set(basis, used + 1);
    questions.push({ text: trimmed, basis, strength });
  };

  // Owner-authored answers are the only questions with a guaranteed reply.
  for (const question of sections.ownerFaqQuestions) {
    add(question, "faq", 1);
  }

  for (const project of projects) {
    if (
      filled(project.title) &&
      filled(project.role) &&
      hasNarrative(project)
    ) {
      add(
        `${project.title.trim()} 프로젝트에서 맡은 역할과 성과는 무엇인가요?`,
        "project_star",
        0.8,
      );
    }
  }

  if (projects.some((project) => filled(project.troubleshooting))) {
    add(
      "가장 어려웠던 문제는 어떻게 해결하셨나요?",
      "project_troubleshooting",
      0.8,
    );
  }

  if (sections.careers.length > 0) {
    add(
      "경력이 어떻게 되나요?",
      "career",
      sections.careers.some((career) => filled(career.description)) ? 0.8 : 0.5,
    );
  }

  if (
    projects.some((project) => filled(project.role)) ||
    sections.careers.some((career) => filled(career.position))
  ) {
    add("팀에서 어떤 역할을 맡았나요?", "career", 0.8);
  }

  if (skills.length > 0) {
    add("주요 기술 스택과 경험을 설명해 주세요.", "skill", 0.8);

    // A skill only earns a deep-dive question if some project or career
    // actually describes using it.
    const evidence = compactText(
      [
        ...projects.flatMap((project) => [
          ...(project.tech_stack ?? []),
          project.actions ?? "",
          project.situation ?? "",
        ]),
        ...sections.careers.map((career) => career.description ?? ""),
      ].join(" "),
    );
    const grounded = skills.find(
      (skill) =>
        filled(skill.name) && evidence.includes(compactText(skill.name)),
    );
    if (grounded) {
      add(`${grounded.name.trim()} 경험에 대해 설명해 주세요.`, "skill", 0.8);
    }
  }

  const motivationLetter = sections.coverLetters.find(
    (letter) => filled(letter.content) && mentionsMotivation(letter),
  );
  if (motivationLetter) {
    add("지원 동기가 어떻게 되나요?", "cover_letter", 0.8);
  } else {
    const letter = sections.coverLetters.find(
      (item) => filled(item.title) && filled(item.content),
    );
    if (letter) {
      add(`${letter.title.trim()}에 대해 설명해 주세요.`, "cover_letter", 0.8);
    }
  }

  for (const item of sections.portfolioItems) {
    if (filled(item.title) && filled(item.description)) {
      add(
        `${item.title.trim()} 포트폴리오에 대해 설명해 주세요.`,
        "portfolio",
        0.8,
      );
    }
  }

  for (const activity of sections.activities) {
    if (filled(activity.title) && filled(activity.description)) {
      add(
        `${activity.title.trim()} 활동에 대해 설명해 주세요.`,
        "activity",
        0.8,
      );
    }
  }

  if (sections.education.some((item) => filled(item.school))) {
    add("학력이 어떻게 되나요?", "education", 0.5);
  }

  if (sections.certifications.some((item) => filled(item.name))) {
    add("보유하신 자격증이나 어학 성적이 있나요?", "certification", 0.5);
  }

  const hasStrengthEvidence =
    filled(input.intro) ||
    sections.careers.length > 0 ||
    projects.some((project) => filled(project.title));
  if (hasStrengthEvidence) {
    if (filled(input.roleTitle)) {
      add(`${input.roleTitle!.trim()}로서 어떤 강점이 있나요?`, "intro", 0.8);
    } else if (filled(input.name)) {
      add(`${input.name.trim()}님의 강점은 무엇인가요?`, "intro", 0.5);
    }
  }

  return questions
    .sort((a, b) => b.strength - a.strength)
    .slice(0, MAX_QUESTIONS);
}

/**
 * Evidence vocabulary: proper nouns a visitor might name (project titles,
 * companies, skills) plus the intent groups the resume can speak to.
 */
function buildEvidence(input: CoverageInput) {
  const sections = resolveSections(input);
  const tokens = new Set<string>();
  const intents = new Set<number>();

  const addText = (value: string | null | undefined) => {
    if (!filled(value)) return;
    for (const token of tokenize(value!)) {
      tokens.add(token);
    }
  };

  const addIntents = (value: string) => {
    for (const group of matchedIntentGroups(value)) {
      intents.add(group);
    }
  };

  addText(input.intro);
  addText(input.roleTitle);
  if (filled(input.roleTitle) || filled(input.intro)) {
    addIntents("자기소개 강점 직무");
  }

  for (const project of input.projects) {
    addText(project.title);
    addText(project.role);
    addText(project.situation);
    addText(project.actions);
    addText(project.results);
    addText(project.troubleshooting);
    addText((project.tech_stack ?? []).join(" "));
  }
  if (input.projects.length > 0) {
    addIntents("프로젝트 역할 성과");
  }
  if (input.projects.some((project) => filled(project.troubleshooting))) {
    addIntents("트러블슈팅 문제해결");
  }

  for (const career of sections.careers) {
    addText(career.company);
    addText(career.position);
    addText(career.description);
  }
  if (sections.careers.length > 0) {
    addIntents("경력 회사 근무 직무");
  }

  for (const skill of input.skills) {
    addText(skill.name);
  }
  if (input.skills.length > 0) {
    addIntents("기술 스택");
  }

  for (const letter of sections.coverLetters) {
    addText(letter.title);
    addText(letter.content);
    if (mentionsMotivation(letter)) {
      addIntents("지원 동기 입사");
    }
  }

  for (const item of sections.portfolioItems) {
    addText(item.title);
    addText(item.description);
  }

  for (const activity of sections.activities) {
    addText(activity.title);
    addText(activity.description);
  }

  for (const item of sections.education) {
    addText(item.school);
    addText(item.major);
  }

  for (const item of sections.certifications) {
    addText(item.name);
  }

  for (const question of sections.ownerFaqQuestions) {
    addText(question);
    addIntents(question);
  }

  return { tokens: [...tokens], intents: [...intents] };
}

/** Reshapes the prompt builder's input so publishing can reuse its one fetch. */
export function coverageInputFromPrompt(
  input: SystemPromptInput,
): CoverageInput {
  return {
    name: input.profile.name,
    roleTitle: input.profile.role_title,
    intro: input.profile.intro,
    projects: input.projects,
    careers: input.careers,
    skills: input.skills,
    coverLetters: input.coverLetters,
    portfolioItems: input.portfolioItems,
    education: input.education,
    certifications: input.certifications,
    activities: input.activities,
    ownerFaqQuestions: input.ownerFaqs.map((faq) => faq.question),
    enabledSections: input.enabledSections,
  };
}

/** Reshapes builder form values, for previews and owner-facing gap guidance. */
export function coverageInputFromResumeValues(
  values: ResumeFormValues,
): CoverageInput {
  return {
    name: values.name,
    roleTitle: values.role_title,
    intro: values.intro,
    projects: values.projects ?? [],
    careers: values.careers ?? [],
    skills: values.skills ?? [],
    coverLetters: values.cover_letters ?? [],
    portfolioItems: values.portfolio_items ?? [],
    education: values.education ?? [],
    certifications: values.certifications ?? [],
    activities: values.activities ?? [],
    ownerFaqQuestions: (values.owner_faqs ?? [])
      .filter((faq) => faq.question.trim() && faq.answer.trim())
      .map((faq) => faq.question),
    enabledSections: values.enabled_sections ?? [],
  };
}

/** Builds the full coverage record stored alongside the system prompt. */
export function buildProfileCoverage(input: CoverageInput): ProfileCoverage {
  const { tokens, intents } = buildEvidence(input);
  return { questions: buildQuestions(input), tokens, intents };
}

/**
 * Gate for questions this module did not write — LLM-generated follow-ups and
 * visitor questions replayed as suggestions.
 */
export function isQuestionAnswerable(
  text: string,
  coverage: ProfileCoverage,
): boolean {
  const trimmed = text.trim();
  if (!trimmed || containsSensitiveTerm(trimmed)) {
    return false;
  }

  const tokens = tokenize(trimmed);
  const evidence = new Set(coverage.tokens);
  if (tokens.some((token) => evidence.has(token))) {
    return true;
  }

  const intents = new Set(coverage.intents);
  return [...matchedIntentGroups(trimmed)].some((group) => intents.has(group));
}

/** Empty fields that silence a whole question type, for owner guidance. */
export function buildCoverageGaps(input: CoverageInput): CoverageGap[] {
  const sections = resolveSections(input);
  const on = (key: string) =>
    isPromptSectionEnabled(input.enabledSections, key);
  const gaps: CoverageGap[] = [];

  if (!filled(input.roleTitle) && !filled(input.intro)) {
    gaps.push({
      basis: "intro",
      label: "강점·자기소개",
      hint: "직무와 한줄소개가 비어 있어 강점을 묻는 질문에 답할 수 없습니다.",
      stepId: 1,
    });
  }

  if (input.skills.length === 0) {
    gaps.push({
      basis: "skill",
      label: "기술 스택",
      hint: "기술을 1개 이상 등록하면 기술 경험 질문에 답할 수 있습니다.",
      stepId: 6,
    });
  }

  if (
    input.projects.length > 0 &&
    !input.projects.some((project) => filled(project.troubleshooting))
  ) {
    gaps.push({
      basis: "project_troubleshooting",
      label: "프로젝트 트러블슈팅",
      hint: '트러블슈팅이 비어 있어 "가장 어려웠던 문제" 질문에 답할 수 없습니다.',
      stepId: 7,
    });
  }

  if (
    input.projects.length > 0 &&
    !input.projects.some(
      (project) => filled(project.role) && hasNarrative(project),
    )
  ) {
    gaps.push({
      basis: "project_star",
      label: "프로젝트 역할·성과",
      hint: "역할과 상황·수행·성과가 비어 있어 프로젝트 질문에 답할 수 없습니다.",
      stepId: 7,
    });
  }

  if (
    sections.careers.length > 0 &&
    !sections.careers.some((career) => filled(career.description))
  ) {
    gaps.push({
      basis: "career",
      label: "경력 상세",
      hint: "경력 설명이 비어 있어 담당 업무 질문에 깊게 답할 수 없습니다.",
      stepId: 2,
    });
  }

  if (
    on("cover_letters") &&
    !sections.coverLetters.some((letter) => mentionsMotivation(letter))
  ) {
    gaps.push({
      basis: "cover_letter",
      label: "지원 동기",
      hint: "자기소개서에 지원 동기 내용이 없어 지원 동기 질문에 답할 수 없습니다.",
      stepId: 8,
    });
  }

  if (on("owner_faqs") && sections.ownerFaqQuestions.length === 0) {
    gaps.push({
      basis: "faq",
      label: "예상 질문 답변",
      hint: "예상 질문을 등록하면 원하는 답변을 그대로 내보낼 수 있습니다.",
      stepId: 9,
    });
  }

  return gaps;
}

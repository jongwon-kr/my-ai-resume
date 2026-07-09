import type { OptionalSectionKey, ResumeFormValues } from "@/lib/resume/schema";

export interface CompletionCheckItem {
  id: string;
  label: string;
  stepId: number;
  complete: boolean;
  hint: string;
}

export interface ResumeCompletionResult {
  percent: number;
  completedCount: number;
  totalCount: number;
  items: CompletionCheckItem[];
  incompleteItems: CompletionCheckItem[];
}

function isBasicInfoComplete(values: ResumeFormValues) {
  return Boolean(
    values.name.trim() && values.role_title.trim() && values.intro.trim(),
  );
}

function isSkillsComplete(values: ResumeFormValues) {
  return (values.skills ?? []).some((skill) => skill.name.trim());
}

function isProjectsComplete(values: ResumeFormValues) {
  return (values.projects ?? []).some(
    (project) =>
      project.title.trim() &&
      project.period.trim() &&
      project.role.trim() &&
      project.tech_stack.trim() &&
      project.situation.trim() &&
      project.actions.trim() &&
      project.results.trim(),
  );
}

function isCareersComplete(values: ResumeFormValues) {
  return (values.careers ?? []).some((career) => career.company.trim());
}

function isEducationComplete(values: ResumeFormValues) {
  const hasEducation = (values.education ?? []).some((item) =>
    item.school.trim(),
  );
  const hasCertification = (values.certifications ?? []).some((cert) =>
    cert.name.trim(),
  );
  return hasEducation || hasCertification;
}

function isCoverLettersComplete(values: ResumeFormValues) {
  return (values.cover_letters ?? []).some(
    (letter) => letter.title.trim() && letter.content?.trim(),
  );
}

function isOwnerFaqsComplete(values: ResumeFormValues) {
  return (values.owner_faqs ?? []).some(
    (faq) => faq.question.trim() && faq.answer.trim(),
  );
}

function sectionEnabled(
  enabledSections: OptionalSectionKey[],
  key: OptionalSectionKey,
) {
  return enabledSections.includes(key);
}

/** Computes resume completion % from current form values. */
export function getResumeCompletion(
  values: ResumeFormValues,
): ResumeCompletionResult {
  const enabled = values.enabled_sections ?? [];
  const items: CompletionCheckItem[] = [
    {
      id: "basic_info",
      label: "기본 정보",
      stepId: 1,
      complete: isBasicInfoComplete(values),
      hint: "이름, 직무, 한줄소개를 입력하세요.",
    },
  ];

  if (sectionEnabled(enabled, "careers")) {
    items.push({
      id: "careers",
      label: "경력",
      stepId: 2,
      complete: isCareersComplete(values),
      hint: "경력 항목을 1개 이상 추가하세요.",
    });
  }

  if (sectionEnabled(enabled, "education_certifications")) {
    items.push({
      id: "education_certifications",
      label: "학력·자격증",
      stepId: 3,
      complete: isEducationComplete(values),
      hint: "학력 또는 자격증을 1개 이상 입력하세요.",
    });
  }

  items.push(
    {
      id: "skills",
      label: "기술 스택",
      stepId: 4,
      complete: isSkillsComplete(values),
      hint: "기술을 1개 이상 추가하세요.",
    },
    {
      id: "projects",
      label: "프로젝트",
      stepId: 5,
      complete: isProjectsComplete(values),
      hint: "프로젝트 STAR 항목(기간·역할·기술·상황·수행·성과)을 채우세요.",
    },
  );

  if (sectionEnabled(enabled, "cover_letters")) {
    items.push({
      id: "cover_letters",
      label: "자기소개서",
      stepId: 6,
      complete: isCoverLettersComplete(values),
      hint: "자기소개서 제목과 내용을 입력하세요.",
    });
  }

  items.push({
    id: "owner_faqs",
    label: "예상 질문 답변",
    stepId: 7,
    complete: isOwnerFaqsComplete(values),
    hint: "예상 질문과 답변을 1쌍 이상 등록하세요.",
  });

  const completedCount = items.filter((item) => item.complete).length;
  const totalCount = items.length;
  const percent =
    totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

  return {
    percent,
    completedCount,
    totalCount,
    items,
    incompleteItems: items.filter((item) => !item.complete),
  };
}

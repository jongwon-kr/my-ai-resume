import type { GeminiResumeImportResponse } from "@/lib/resume/import/schema";
import {
  DEFAULT_SECTION_ORDER,
  defaultProjectItem,
  type CertificationFormItem,
  type OptionalSectionKey,
  type ResumeFormValues,
} from "@/lib/resume/schema";

function trim(value: string | undefined | null) {
  return value?.trim() ?? "";
}

function hasText(value: string | undefined | null) {
  return Boolean(trim(value));
}

function normalizeOptionalSections(
  data: GeminiResumeImportResponse,
): OptionalSectionKey[] {
  const enabled: OptionalSectionKey[] = [];

  if (data.careers.some((item) => hasText(item.company))) {
    enabled.push("careers");
  }

  if (data.education.some((item) => hasText(item.school))) {
    enabled.push("education");
  }

  if (data.certifications.some((item) => hasText(item.name))) {
    enabled.push("certifications");
  }

  if (data.activities?.some((item) => hasText(item.title))) {
    enabled.push("activities");
  }

  if (data.cover_letters.some((item) => hasText(item.title))) {
    enabled.push("cover_letters");
  }

  if (data.owner_faqs.some((item) => hasText(item.question) && hasText(item.answer))) {
    enabled.push("owner_faqs");
  }

  return enabled.length > 0
    ? enabled
    : ["careers", "education", "certifications", "cover_letters"];
}

/** Converts Gemini extraction output into builder form values. */
export function normalizeImportedResume(
  data: GeminiResumeImportResponse,
): ResumeFormValues {
  const careers = data.careers
    .filter((item) => hasText(item.company))
    .slice(0, 10)
    .map((item) => ({
      company: trim(item.company),
      position: trim(item.position),
      period: trim(item.period),
      description: trim(item.description),
    }));

  const education = data.education
    .filter((item) => hasText(item.school))
    .slice(0, 10)
    .map((item) => ({
      school: trim(item.school),
      major: trim(item.major),
      degree: trim(item.degree),
      status: trim(item.status),
      period: trim(item.period),
    }));

  const certifications: CertificationFormItem[] = data.certifications
    .filter((item) => hasText(item.name))
    .slice(0, 20)
    .map((item) => ({
      category:
        item.category === "어학" || item.category === "수상"
          ? item.category
          : "자격",
      name: trim(item.name),
      issuer: trim(item.issuer),
      acquired_date: trim(item.acquired_date),
    }));

  const activities = (data.activities ?? [])
    .filter((item) => hasText(item.title))
    .slice(0, 20)
    .map((item) => ({
      title: trim(item.title),
      organization: trim(item.organization),
      period: trim(item.period),
      description: trim(item.description),
    }));

  const skills = data.skills
    .filter((item) => hasText(item.name))
    .slice(0, 20)
    .map((item) => ({
      name: trim(item.name),
      proficiency: trim(item.proficiency),
    }));

  const projects = data.projects
    .filter((item) => hasText(item.title))
    .slice(0, 3)
    .map((item) => ({
      title: trim(item.title),
      period: trim(item.period),
      role: trim(item.role),
      tech_stack: trim(item.tech_stack),
      situation: trim(item.situation),
      actions: trim(item.actions),
      results: trim(item.results),
      troubleshooting: trim(item.troubleshooting),
    }));

  const cover_letters = data.cover_letters
    .filter((item) => hasText(item.title))
    .slice(0, 10)
    .map((item) => ({
      title: trim(item.title),
      content: trim(item.content),
    }));

  const owner_faqs = data.owner_faqs
    .filter((item) => hasText(item.question) && hasText(item.answer))
    .slice(0, 20)
    .map((item) => ({
      question: trim(item.question),
      answer: trim(item.answer),
    }));

  return {
    name: trim(data.name),
    role_title: trim(data.role_title),
    intro: trim(data.intro),
    avatar_url: "",
    birth_year: data.birth_year ?? undefined,
    phone: trim(data.phone),
    public_email: trim(data.public_email),
    location: trim(data.location),
    profile_links: [
      trim(data.github_url)
        ? { label: "GitHub", url: trim(data.github_url) }
        : null,
      trim(data.linkedin_url)
        ? { label: "LinkedIn", url: trim(data.linkedin_url) }
        : null,
      trim(data.blog_url) ? { label: "블로그", url: trim(data.blog_url) } : null,
    ].filter((link): link is { label: string; url: string } => Boolean(link)),
    show_phone: false,
    show_exact_age: false,
    suggest_top_questions_in_chat: false,
    careers,
    education,
    certifications,
    activities,
    skills: skills.length > 0 ? skills : [{ name: "", proficiency: "" }],
    projects:
      projects.length > 0 ? projects : [defaultProjectItem()],
    cover_letters,
    owner_faqs,
    enabled_sections: normalizeOptionalSections(data),
    section_order: [...DEFAULT_SECTION_ORDER],
  };
}

export function buildImportSummary(values: ResumeFormValues) {
  return {
    careers: values.careers?.length ?? 0,
    education: values.education?.length ?? 0,
    certifications: values.certifications?.length ?? 0,
    activities: values.activities?.length ?? 0,
    skills: values.skills.filter((skill) => hasText(skill.name)).length,
    projects: values.projects.filter((project) => hasText(project.title)).length,
    coverLetters: values.cover_letters?.length ?? 0,
    ownerFaqs: values.owner_faqs?.length ?? 0,
  };
}

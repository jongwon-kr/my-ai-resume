import { sanitizePublicProfile } from "@/lib/public-profile/sanitize-public-profile";
import {
  buildSuggestedQuestions,
  buildWelcomeMessage,
} from "@/lib/public-profile/suggested-questions";
import type {
  PublicActivity,
  PublicCareer,
  PublicCertification,
  PublicCoverLetter,
  PublicEducation,
  PublicPortfolioItem,
  PublicProfileData,
  PublicProfileLink,
  PublicProject,
  PublicSkill,
} from "@/lib/public-profile/types";
import { normalizeEnabledSections } from "@/lib/resume/enabled-sections";
import type { ResumeFormValues } from "@/lib/resume/schema";
import { normalizeSectionOrder } from "@/lib/resume/section-order";

export interface PreviewProfileMeta {
  profileId: string;
  slug: string;
}

/** `""`/whitespace -> `null`, mirroring saveResumeDraft's `?.trim() || null`. */
function text(value: string | null | undefined): string | null {
  return value?.trim() || null;
}

/**
 * React key for a row that has not been saved yet.
 *
 * Index-based on purpose: the row's content changes on every keystroke, so a
 * content-derived key would remount the card mid-typing. Saved rows keep their
 * uuid, which can never collide with the `preview-` prefix.
 */
function rowId(prefix: string, index: number, id?: string): string {
  return id ?? `preview-${prefix}-${index}`;
}

/**
 * Builder form values -> the public page's view model, for the in-builder
 * preview.
 *
 * Row filtering, trimming and `sort_order` mirror `saveResumeDraft`
 * (lib/resume/persistence.ts) exactly. If they drift, the preview shows rows
 * that publishing silently drops. `from-form-values.test.ts` pins the two.
 */
export function buildPreviewProfileData(
  values: ResumeFormValues,
  meta: PreviewProfileMeta,
): PublicProfileData {
  const skills: PublicSkill[] = values.skills
    .filter((skill) => skill.name.trim())
    .map((skill, index) => ({
      id: rowId("skill", index, skill.id),
      name: skill.name.trim(),
      proficiency: text(skill.proficiency),
    }));

  const projects: PublicProject[] = values.projects
    .filter((project) => project.title.trim())
    .map((project, index) => ({
      id: rowId("project", index, project.id),
      title: project.title.trim(),
      period: text(project.period),
      role: text(project.role),
      // Required, not optional: resume-panel reads `.length` unguarded.
      tech_stack: project.tech_stack ?? [],
      situation: text(project.situation),
      actions: text(project.actions),
      results: text(project.results),
      troubleshooting: text(project.troubleshooting),
      sort_order: index,
    }));

  const careers: PublicCareer[] = (values.careers ?? [])
    .filter((career) => career.company.trim())
    .map((career, index) => ({
      id: rowId("career", index, career.id),
      company: career.company.trim(),
      position: text(career.position),
      period: text(career.period),
      description: text(career.description),
      sort_order: index,
    }));

  const education: PublicEducation[] = (values.education ?? [])
    .filter((item) => item.school.trim())
    .map((item, index) => ({
      id: rowId("education", index, item.id),
      school: item.school.trim(),
      major: text(item.major),
      degree: text(item.degree),
      status: text(item.status),
      period: text(item.period),
      sort_order: index,
    }));

  const certifications: PublicCertification[] = (values.certifications ?? [])
    .filter((cert) => cert.name.trim())
    .map((cert, index) => ({
      id: rowId("certification", index, cert.id),
      category: cert.category ?? "자격",
      name: cert.name.trim(),
      issuer: text(cert.issuer),
      acquired_date: text(cert.acquired_date),
      sort_order: index,
    }));

  const activities: PublicActivity[] = (values.activities ?? [])
    .filter((item) => item.title.trim())
    .map((item, index) => ({
      id: rowId("activity", index, item.id),
      title: item.title.trim(),
      organization: text(item.organization),
      period: text(item.period),
      description: text(item.description),
      sort_order: index,
    }));

  // Filtered on url, not title — same rule as saveResumeDraft.
  const portfolioItems: PublicPortfolioItem[] = (values.portfolio_items ?? [])
    .filter((item) => item.url.trim())
    .map((item, index) => ({
      id: rowId("portfolio", index, item.id),
      kind: item.kind,
      title: item.title.trim(),
      description: text(item.description),
      url: item.url.trim(),
      sort_order: index,
    }));

  const coverLetters: PublicCoverLetter[] = (values.cover_letters ?? [])
    .filter((letter) => letter.title.trim())
    .map((letter, index) => ({
      id: rowId("cover-letter", index, letter.id),
      title: letter.title.trim(),
      content: text(letter.content),
      sort_order: index,
    }));

  const profileLinks: PublicProfileLink[] = (values.profile_links ?? [])
    .filter((link) => link.label.trim() && link.url?.trim())
    .map((link, index) => ({
      id: rowId("profile-link", index, link.id),
      label: link.label.trim(),
      url: link.url!.trim(),
      sort_order: index,
    }));

  const ownerFaqQuestions = (values.owner_faqs ?? [])
    .filter((faq) => faq.question.trim() && faq.answer.trim())
    .map((faq) => faq.question.trim());

  return {
    profile: sanitizePublicProfile({
      id: meta.profileId,
      slug: meta.slug,
      name: values.name.trim(),
      role_title: text(values.role_title),
      intro: text(values.intro),
      avatar_url: values.avatar_url || null,
      // The preview answers "what will visitors see once this is live", so it
      // always renders the published, public variant.
      status: "published",
      is_private: false,
      public_email: text(values.public_email),
      location: text(values.location),
      show_phone: values.show_phone,
      show_exact_age: values.show_exact_age,
      suggest_top_questions_in_chat: values.suggest_top_questions_in_chat,
      phone: values.phone ?? null,
      birth_year: values.birth_year ?? null,
    }),
    profileLinks,
    skills,
    projects,
    careers,
    education,
    certifications,
    activities,
    portfolioItems,
    coverLetters,
    enabledSections: normalizeEnabledSections(values.enabled_sections),
    sectionOrder: normalizeSectionOrder(values.section_order),
    // `topVisitorQuestions` needs the DB, and the preview renders no chat panel
    // where they would show, so the preview does no I/O at all.
    suggestedQuestions: buildSuggestedQuestions({
      name: values.name.trim(),
      roleTitle: text(values.role_title),
      intro: text(values.intro),
      projects,
      careers,
      skills,
      coverLetters,
      portfolioItems,
      education,
      certifications,
      activities,
      ownerFaqQuestions,
      enabledSections: values.enabled_sections ?? [],
    }),
    welcomeMessage: buildWelcomeMessage({ name: values.name }),
    ownerEmail: text(values.public_email),
  };
}

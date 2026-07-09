import type { ResumeFormValues } from "@/lib/resume/schema";

/** Mirrors public resume-panel section visibility rules. */
export function getResumeSectionVisibility(values: ResumeFormValues) {
  const careers = values.careers ?? [];
  const education = values.education ?? [];
  const certifications = values.certifications ?? [];
  const coverLetters = values.cover_letters ?? [];

  return {
    showCareers:
      values.enabled_sections.includes("careers") && careers.length > 0,
    showEducation:
      values.enabled_sections.includes("education_certifications") &&
      (education.length > 0 || certifications.length > 0),
    showCoverLetters:
      values.enabled_sections.includes("cover_letters") &&
      coverLetters.length > 0,
  };
}

import { isSectionEnabled } from "@/lib/resume/enabled-sections";
import type { ResumeFormValues } from "@/lib/resume/schema";

/**
 * Mirrors public resume-panel section visibility rules.
 *
 * The public page applies the same rules to `PublicProfileData` in
 * `lib/public-profile/sections.ts` — keep the two in sync. They stay separate
 * because the input shapes differ (form values vs. the public view model).
 */
export function getResumeSectionVisibility(values: ResumeFormValues) {
  const careers = values.careers ?? [];
  const education = values.education ?? [];
  const certifications = values.certifications ?? [];
  const activities = values.activities ?? [];
  const coverLetters = values.cover_letters ?? [];
  const enabled = values.enabled_sections ?? [];

  return {
    showCareers: isSectionEnabled(enabled, "careers") && careers.length > 0,
    showEducation:
      isSectionEnabled(enabled, "education") && education.length > 0,
    showCertifications:
      isSectionEnabled(enabled, "certifications") && certifications.length > 0,
    showActivities:
      isSectionEnabled(enabled, "activities") && activities.length > 0,
    showCoverLetters:
      isSectionEnabled(enabled, "cover_letters") && coverLetters.length > 0,
  };
}

import type { PublicProfileData } from "@/lib/public-profile/types";
import { isSectionEnabled } from "@/lib/resume/enabled-sections";
import { RESUME_BUILDER_STEPS } from "@/lib/resume/schema";
import { getPublicContentStepOrder } from "@/lib/resume/section-order";

export interface PublicSection {
  /** Builder step id from RESUME_BUILDER_STEPS. */
  id: number;
  label: string;
}

/** Anchor target for a public profile section. */
export function publicSectionElementId(stepId: number) {
  return `profile-section-${stepId}`;
}

const STEP_LABELS = new Map<number, string>(
  RESUME_BUILDER_STEPS.map((step) => [step.id, step.label]),
);

/**
 * Sections that actually have content, in the owner's order.
 *
 * Shared by the résumé body and the nav rail so the rail never lists a section
 * the page does not render. Mirrors `lib/resume/section-visibility.ts`, which
 * applies the same rules to the PDF's `ResumeFormValues` shape.
 */
export function getVisiblePublicSections(
  data: PublicProfileData,
): PublicSection[] {
  const enabled = data.enabledSections;

  const hasContent: Record<number, boolean> = {
    2: isSectionEnabled(enabled, "careers") && data.careers.length > 0,
    3: isSectionEnabled(enabled, "education") && data.education.length > 0,
    4:
      isSectionEnabled(enabled, "certifications") &&
      data.certifications.length > 0,
    5: isSectionEnabled(enabled, "activities") && data.activities.length > 0,
    6: data.skills.length > 0,
    7: data.projects.length > 0,
    8:
      isSectionEnabled(enabled, "cover_letters") &&
      data.coverLetters.length > 0,
    10:
      isSectionEnabled(enabled, "portfolio_items") &&
      data.portfolioItems.length > 0,
  };

  return getPublicContentStepOrder(data.sectionOrder)
    .filter((stepId) => hasContent[stepId])
    .map((stepId) => ({ id: stepId, label: STEP_LABELS.get(stepId) ?? "" }));
}

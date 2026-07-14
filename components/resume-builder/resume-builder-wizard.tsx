"use client";

import { useEffect, useMemo } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { AutosaveIndicator } from "@/components/resume-builder/autosave-indicator";
import { ResumeCompletionCard } from "@/components/resume-builder/resume-completion-card";
import { ResumePdfImportCard } from "@/components/resume-builder/resume-pdf-import-card";
import { ResumePublishBar } from "@/components/resume-builder/resume-publish-bar";
import { ResumeSectionSidebar } from "@/components/resume-builder/resume-section-sidebar";
import { StepActivities } from "@/components/resume-builder/step-activities";
import { StepBasicInfo } from "@/components/resume-builder/step-basic-info";
import { StepCareer } from "@/components/resume-builder/step-career";
import { StepCertifications } from "@/components/resume-builder/step-certifications";
import { StepCoverLetter } from "@/components/resume-builder/step-cover-letter";
import { StepEducation } from "@/components/resume-builder/step-education";
import { StepOwnerFaq } from "@/components/resume-builder/step-owner-faq";
import { StepProjects } from "@/components/resume-builder/step-projects";
import { StepSkills } from "@/components/resume-builder/step-skills";
import { useResumeAutosave } from "@/hooks/use-resume-autosave";
import { RESUME_BUILDER_SCROLL_OFFSET } from "@/lib/resume/builder-constants";
import { getResumeCompletion } from "@/lib/resume/completion";
import {
  getStepsInOrder,
  getVisibleStepIds,
  reorderVisibleSteps,
} from "@/lib/resume/section-order";
import {
  OPTIONAL_SECTION_KEYS,
  resumeFormSchema,
  type OptionalSectionKey,
  type ResumeFormValues,
} from "@/lib/resume/schema";
import { useResumeBuilderStore } from "@/stores/resume-builder-store";
import type { ProfileStatus } from "@/types/database";

interface ResumeBuilderWizardProps {
  profileId: string;
  slug: string;
  profileStatus: ProfileStatus;
  initialValues: ResumeFormValues;
  demoMode?: boolean;
}

function sectionElementId(stepId: number) {
  return `resume-section-${stepId}`;
}

export function ResumeBuilderWizard({
  profileId,
  slug,
  profileStatus,
  initialValues,
  demoMode = false,
}: ResumeBuilderWizardProps) {
  const currentStep = useResumeBuilderStore((state) => state.currentStep);
  const { setProfileMeta, setStep } = useResumeBuilderStore();

  const form = useForm<ResumeFormValues>({
    resolver: zodResolver(resumeFormSchema),
    defaultValues: initialValues,
    mode: "onBlur",
  });

  const { saveOnBlur, persistDraft } = useResumeAutosave(form, demoMode);
  // eslint-disable-next-line react-hooks/incompatible-library
  const enabledSections = form.watch("enabled_sections");
  const sectionOrder = form.watch("section_order");
  const formValues = form.watch();
  const completion = useMemo(
    () => getResumeCompletion(formValues),
    [formValues],
  );
  const visibleSteps = useMemo(
    () => getStepsInOrder(sectionOrder, enabledSections),
    [sectionOrder, enabledSections],
  );

  useEffect(() => {
    setProfileMeta(profileId, slug);
  }, [profileId, slug, setProfileMeta]);

  function handleNavigate(stepId: number) {
    saveOnBlur();
    setStep(stepId);

    const element = document.getElementById(sectionElementId(stepId));
    if (!element) {
      return;
    }

    const y =
      element.getBoundingClientRect().top +
      window.scrollY -
      RESUME_BUILDER_SCROLL_OFFSET;
    window.scrollTo({ top: y, behavior: "smooth" });
  }

  function toggleSection(key: OptionalSectionKey) {
    const next = OPTIONAL_SECTION_KEYS.filter((sectionKey) =>
      sectionKey === key
        ? !enabledSections.includes(sectionKey)
        : enabledSections.includes(sectionKey),
    );

    form.setValue("enabled_sections", next, { shouldDirty: true });
    void persistDraft();
  }

  function handleReorderSection(from: number, to: number) {
    const visibleStepIds = getVisibleStepIds(sectionOrder, enabledSections);
    const nextOrder = reorderVisibleSteps(
      sectionOrder,
      visibleStepIds,
      from,
      to,
    );

    form.setValue("section_order", nextOrder, { shouldDirty: true });
    void persistDraft();
  }

  function renderStep(stepId: number) {
    switch (stepId) {
      case 1:
        return <StepBasicInfo onBlurSave={saveOnBlur} />;
      case 2:
        return <StepCareer onBlurSave={saveOnBlur} />;
      case 3:
        return <StepEducation onBlurSave={saveOnBlur} />;
      case 4:
        return <StepCertifications onBlurSave={saveOnBlur} />;
      case 5:
        return <StepActivities onBlurSave={saveOnBlur} />;
      case 6:
        return <StepSkills onBlurSave={saveOnBlur} />;
      case 7:
        return <StepProjects onBlurSave={saveOnBlur} />;
      case 8:
        return <StepCoverLetter onBlurSave={saveOnBlur} />;
      case 9:
        return <StepOwnerFaq onBlurSave={saveOnBlur} />;
      default:
        return null;
    }
  }

  return (
    <FormProvider {...form}>
      <div className="flex flex-col gap-6 lg:flex-row-reverse">
        <aside className="space-y-4 lg:sticky lg:top-28 lg:max-h-[calc(100vh-8rem)] lg:w-64 lg:shrink-0 lg:self-start lg:overflow-y-auto">
          <ResumeSectionSidebar
            currentStep={currentStep}
            enabledSections={enabledSections}
            sectionOrder={sectionOrder}
            onNavigate={handleNavigate}
            onToggleSection={toggleSection}
            onReorderSection={handleReorderSection}
          />
          <ResumeCompletionCard
            completion={completion}
            onNavigate={handleNavigate}
          />
          <AutosaveIndicator />
        </aside>

        <main className="min-w-0 flex-1 space-y-6">
          <ResumePdfImportCard persistDraft={persistDraft} />

          {visibleSteps.map((step) => (
            <section
              key={step.id}
              id={sectionElementId(step.id)}
              className="scroll-mt-[7.5rem]"
            >
              {renderStep(step.id)}
            </section>
          ))}

          <ResumePublishBar
            persistDraft={persistDraft}
            profileStatus={profileStatus}
            demoMode={demoMode}
          />
        </main>
      </div>
    </FormProvider>
  );
}

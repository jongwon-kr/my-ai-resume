"use client";

import { useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { AutosaveIndicator } from "@/components/resume-builder/autosave-indicator";
import { ResumePublishBar } from "@/components/resume-builder/resume-publish-bar";
import { ResumeSectionSidebar } from "@/components/resume-builder/resume-section-sidebar";
import { StepBasicInfo } from "@/components/resume-builder/step-basic-info";
import { StepCareer } from "@/components/resume-builder/step-career";
import { StepCoverLetter } from "@/components/resume-builder/step-cover-letter";
import { StepEducationCertifications } from "@/components/resume-builder/step-education-certifications";
import { StepProjects } from "@/components/resume-builder/step-projects";
import { StepSkills } from "@/components/resume-builder/step-skills";
import { useResumeAutosave } from "@/hooks/use-resume-autosave";
import {
  OPTIONAL_SECTION_KEYS,
  RESUME_BUILDER_STEPS,
  resumeFormSchema,
  type OptionalSectionKey,
  type ResumeFormValues,
} from "@/lib/resume/schema";
import { useResumeBuilderStore } from "@/stores/resume-builder-store";

interface ResumeBuilderWizardProps {
  profileId: string;
  slug: string;
  initialValues: ResumeFormValues;
}

function getVisibleSteps(enabled: readonly OptionalSectionKey[]) {
  return RESUME_BUILDER_STEPS.filter(
    (step) => !("optionalKey" in step) || enabled.includes(step.optionalKey),
  );
}

function sectionElementId(stepId: number) {
  return `resume-section-${stepId}`;
}

export function ResumeBuilderWizard({
  profileId,
  slug,
  initialValues,
}: ResumeBuilderWizardProps) {
  const currentStep = useResumeBuilderStore((state) => state.currentStep);
  const { setProfileMeta, setStep } = useResumeBuilderStore();

  const form = useForm<ResumeFormValues>({
    resolver: zodResolver(resumeFormSchema),
    defaultValues: initialValues,
    mode: "onBlur",
  });

  const { saveOnBlur, persistDraft } = useResumeAutosave(form);

  const enabledSections = form.watch("enabled_sections");
  const visibleSteps = getVisibleSteps(enabledSections);

  useEffect(() => {
    setProfileMeta(profileId, slug);
  }, [profileId, slug, setProfileMeta]);

  function handleNavigate(stepId: number) {
    saveOnBlur();
    setStep(stepId);
    document
      .getElementById(sectionElementId(stepId))
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
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

  function renderStep(stepId: number) {
    switch (stepId) {
      case 1:
        return <StepBasicInfo onBlurSave={saveOnBlur} />;
      case 2:
        return <StepCareer onBlurSave={saveOnBlur} />;
      case 3:
        return <StepEducationCertifications onBlurSave={saveOnBlur} />;
      case 4:
        return <StepSkills onBlurSave={saveOnBlur} />;
      case 5:
        return <StepProjects onBlurSave={saveOnBlur} />;
      case 6:
        return <StepCoverLetter onBlurSave={saveOnBlur} />;
      default:
        return null;
    }
  }

  return (
    <FormProvider {...form}>
      <div className="flex flex-col gap-6 lg:flex-row-reverse">
        <aside className="space-y-4 lg:sticky lg:top-6 lg:h-fit lg:w-64 lg:shrink-0">
          <ResumeSectionSidebar
            currentStep={currentStep}
            enabledSections={enabledSections}
            onNavigate={handleNavigate}
            onToggleSection={toggleSection}
          />
          <AutosaveIndicator />
        </aside>

        <main className="min-w-0 flex-1 space-y-6">
          {visibleSteps.map((step) => (
            <section
              key={step.id}
              id={sectionElementId(step.id)}
              className="scroll-mt-6"
            >
              {renderStep(step.id)}
            </section>
          ))}

          <ResumePublishBar persistDraft={persistDraft} />
        </main>
      </div>
    </FormProvider>
  );
}

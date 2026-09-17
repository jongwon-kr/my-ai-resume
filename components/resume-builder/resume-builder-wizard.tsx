"use client";

import { useEffect, useMemo, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { EyeIcon } from "lucide-react";

import { AutosaveIndicator } from "@/components/resume-builder/autosave-indicator";
import { Button } from "@/components/ui/button";
import { ResumeCompletionCard } from "@/components/resume-builder/resume-completion-card";
import { ResumePdfImportCard } from "@/components/resume-builder/resume-pdf-import-card";
import { ResumePreviewDialog } from "@/components/resume-builder/resume-preview-dialog";
import { ResumePublishBar } from "@/components/resume-builder/resume-publish-bar";
import { ResumeSectionSidebar } from "@/components/resume-builder/resume-section-sidebar";
import { StepActivities } from "@/components/resume-builder/step-activities";
import { StepBasicInfo } from "@/components/resume-builder/step-basic-info";
import { StepCareer } from "@/components/resume-builder/step-career";
import { StepCertifications } from "@/components/resume-builder/step-certifications";
import { StepCoverLetter } from "@/components/resume-builder/step-cover-letter";
import { StepEducation } from "@/components/resume-builder/step-education";
import { StepOwnerFaq } from "@/components/resume-builder/step-owner-faq";
import { StepPortfolio } from "@/components/resume-builder/step-portfolio";
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

  const [previewOpen, setPreviewOpen] = useState(false);

  useEffect(() => {
    setProfileMeta(profileId, slug, demoMode);
  }, [profileId, slug, demoMode, setProfileMeta]);

  // A file dropped anywhere but a dropzone would navigate the tab to it and
  // lose unsaved edits. Dropzones stopPropagation, so this never sees theirs.
  useEffect(() => {
    const swallow = (event: DragEvent) => event.preventDefault();
    document.addEventListener("dragover", swallow);
    document.addEventListener("drop", swallow);

    return () => {
      document.removeEventListener("dragover", swallow);
      document.removeEventListener("drop", swallow);
    };
  }, []);

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
      case 10:
        return <StepPortfolio onBlurSave={saveOnBlur} />;
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
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => setPreviewOpen(true)}
          >
            <EyeIcon />
            공개 프로필 미리보기
          </Button>

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

      {/* The aside is sticky only at lg+; below that it scrolls away, so the
          preview needs its own always-reachable trigger. z-40 keeps it under
          the dialog backdrop. */}
      <Button
        type="button"
        onClick={() => setPreviewOpen(true)}
        className="fixed right-4 bottom-4 z-40 h-11 gap-2 rounded-full px-4 shadow-lg lg:hidden"
      >
        <EyeIcon className="size-4" />
        미리보기
      </Button>

      {/* Inside FormProvider so the dialog can read live form values. */}
      <ResumePreviewDialog
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        profileId={profileId}
        slug={slug}
        profileStatus={profileStatus}
      />
    </FormProvider>
  );
}

"use client";

import { useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { AutosaveIndicator } from "@/components/resume-builder/autosave-indicator";
import { StepBasicInfo } from "@/components/resume-builder/step-basic-info";
import { StepPreview } from "@/components/resume-builder/step-preview";
import { StepProgress } from "@/components/resume-builder/step-progress";
import { StepProjects } from "@/components/resume-builder/step-projects";
import { StepSkills } from "@/components/resume-builder/step-skills";
import { Button } from "@/components/ui/button";
import { useResumeAutosave } from "@/hooks/use-resume-autosave";
import {
  resumeFormSchema,
  stepSchemas,
  type ResumeFormValues,
} from "@/lib/resume/schema";
import { useResumeBuilderStore } from "@/stores/resume-builder-store";

interface ResumeBuilderWizardProps {
  profileId: string;
  slug: string;
  initialValues: ResumeFormValues;
}

export function ResumeBuilderWizard({
  profileId,
  slug,
  initialValues,
}: ResumeBuilderWizardProps) {
  const currentStep = useResumeBuilderStore((state) => state.currentStep);
  const { setProfileMeta, setStep, nextStep, prevStep } =
    useResumeBuilderStore();

  const form = useForm<ResumeFormValues>({
    resolver: zodResolver(resumeFormSchema),
    defaultValues: initialValues,
    mode: "onBlur",
  });

  const { saveOnBlur, persistDraft } = useResumeAutosave(form);

  useEffect(() => {
    setProfileMeta(profileId, slug);
  }, [profileId, slug, setProfileMeta]);

  async function handleNext() {
    const schema = stepSchemas[currentStep - 1];
    const values = form.getValues();
    const fields =
      currentStep === 1
        ? (["name", "role_title", "intro", "avatar_url"] as const)
        : currentStep === 2
          ? (["skills"] as const)
          : currentStep === 3
            ? (["projects"] as const)
            : ([] as const);

    const parsed = schema.safeParse(values);
    if (!parsed.success) {
      for (const field of fields) {
        await form.trigger(field);
      }
      return;
    }

    await persistDraft(values);
    nextStep();
  }

  return (
    <FormProvider {...form}>
      <div className="space-y-6">
        <StepProgress />
        <AutosaveIndicator />

        {currentStep === 1 ? <StepBasicInfo onBlurSave={saveOnBlur} /> : null}
        {currentStep === 2 ? <StepSkills onBlurSave={saveOnBlur} /> : null}
        {currentStep === 3 ? <StepProjects onBlurSave={saveOnBlur} /> : null}
        {currentStep === 4 ? <StepPreview persistDraft={persistDraft} /> : null}

        <div className="flex justify-between gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={currentStep === 1}
            onClick={prevStep}
          >
            이전
          </Button>

          {currentStep < 4 ? (
            <Button type="button" onClick={handleNext}>
              다음
            </Button>
          ) : (
            <Button type="button" variant="ghost" onClick={() => setStep(3)}>
              프로젝트 수정
            </Button>
          )}
        </div>
      </div>
    </FormProvider>
  );
}

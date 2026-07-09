"use client";

import { ResumeBuilderWizard } from "@/components/resume-builder/resume-builder-wizard";
import type { ResumeFormValues } from "@/lib/resume/schema";

interface ResumeBuilderClientProps {
  profileId: string;
  slug: string;
  initialValues: ResumeFormValues;
}

export function ResumeBuilderClient({
  profileId,
  slug,
  initialValues,
}: ResumeBuilderClientProps) {
  return (
    <ResumeBuilderWizard
      profileId={profileId}
      slug={slug}
      initialValues={initialValues}
    />
  );
}

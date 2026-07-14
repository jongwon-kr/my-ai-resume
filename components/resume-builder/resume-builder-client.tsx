"use client";

import { ResumeBuilderWizard } from "@/components/resume-builder/resume-builder-wizard";
import type { ResumeFormValues } from "@/lib/resume/schema";

import type { ProfileStatus } from "@/types/database";

interface ResumeBuilderClientProps {
  profileId: string;
  slug: string;
  profileStatus: ProfileStatus;
  initialValues: ResumeFormValues;
  demoMode?: boolean;
}

export function ResumeBuilderClient({
  profileId,
  slug,
  profileStatus,
  initialValues,
  demoMode = false,
}: ResumeBuilderClientProps) {
  return (
    <ResumeBuilderWizard
      profileId={profileId}
      slug={slug}
      profileStatus={profileStatus}
      initialValues={initialValues}
      demoMode={demoMode}
    />
  );
}

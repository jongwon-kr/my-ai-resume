"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { DeleteProfileDialog } from "@/components/dashboard/delete-profile-dialog";
import { MockInterviewPanel } from "@/components/dashboard/mock-interview-panel";
import { ProfileLabelField } from "@/components/dashboard/profile-label-field";
import { ChatCoverageCard } from "@/components/resume-builder/chat-coverage-card";
import { ResumeCompletionCard } from "@/components/resume-builder/resume-completion-card";
import { ResumePdfDownloadButton } from "@/components/resume-builder/resume-pdf-download-button";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { CoverageGap } from "@/lib/chat/question-coverage";
import type { OwnerProfile } from "@/lib/dashboard/types";
import {
  getProfileDisplayLabel,
  getProfileLabelSubtitle,
} from "@/lib/profile/display";
import type { ResumeCompletionResult } from "@/lib/resume/completion";

interface ProfileManagementTabProps {
  profile: OwnerProfile;
  completion: ResumeCompletionResult;
  coverageGaps: CoverageGap[];
  /** Drives the last-profile guard on deletion. */
  profileCount: number;
  demoMode?: boolean;
}

export function ProfileManagementTab({
  profile,
  completion,
  coverageGaps,
  profileCount,
  demoMode = false,
}: ProfileManagementTabProps) {
  const router = useRouter();
  const [storageWarning, setStorageWarning] = useState<string | null>(null);
  const displayLabel = getProfileDisplayLabel(profile);
  const labelSubtitle = getProfileLabelSubtitle(profile);

  // The public link and visibility switch moved to ProfilePublishBar so they
  // stay visible from every tab.

  return (
    <Card>
      <CardHeader>
        <CardTitle>{displayLabel}</CardTitle>
        <CardDescription>{labelSubtitle ?? `@${profile.slug}`}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <ProfileLabelField
          profileId={profile.id}
          initialLabel={profile.label ?? ""}
          demoMode={demoMode}
        />

        <ResumeCompletionCard
          completion={completion}
          onNavigate={(stepId) =>
            router.push(
              demoMode
                ? `/demo/dashboard/edit#resume-section-${stepId}`
                : `/dashboard/edit/${profile.id}#resume-section-${stepId}`,
            )
          }
        />

        <ChatCoverageCard
          gaps={coverageGaps}
          onNavigate={(stepId) =>
            router.push(
              demoMode
                ? `/demo/dashboard/edit#resume-section-${stepId}`
                : `/dashboard/edit/${profile.id}#resume-section-${stepId}`,
            )
          }
        />

        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <Link
            href={
              demoMode
                ? "/demo/dashboard/edit"
                : `/dashboard/edit/${profile.id}`
            }
            className={buttonVariants()}
          >
            프로필 편집
          </Link>
          <ResumePdfDownloadButton slug={profile.slug} profileId={profile.id} />
        </div>

        <MockInterviewPanel profileId={profile.id} profileName={profile.name} />

        {demoMode ? null : (
          <div className="space-y-3 rounded-lg border border-destructive/30 p-4">
            <div>
              <p className="font-medium text-destructive">위험 구역</p>
              <p className="text-sm text-muted-foreground">
                프로필을 삭제하면 이력서와 대화 기록이 모두 사라집니다.
              </p>
            </div>

            {storageWarning ? (
              <p className="text-sm text-destructive" role="alert">
                {storageWarning}
              </p>
            ) : null}

            <DeleteProfileDialog
              profileId={profile.id}
              slug={profile.slug}
              isLastProfile={profileCount <= 1}
              onDeleted={(nextProfileId, storageCleanupFailed) => {
                if (storageCleanupFailed) {
                  setStorageWarning(
                    "프로필은 삭제했지만 업로드한 파일 일부를 지우지 못했습니다. 관리자에게 문의해 주세요.",
                  );
                }
                router.push(
                  nextProfileId
                    ? `/dashboard?profile=${nextProfileId}`
                    : "/dashboard",
                );
                router.refresh();
              }}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

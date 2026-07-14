"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button, buttonVariants } from "@/components/ui/button";
import { ResumePdfDownloadButton } from "@/components/resume-builder/resume-pdf-download-button";
import { generateSystemPrompt } from "@/lib/resume/publish";
import { getPublicProfilePath } from "@/lib/site/url";
import { useResumeBuilderStore } from "@/stores/resume-builder-store";
import type { ProfileStatus } from "@/types/database";

interface ResumePublishBarProps {
  persistDraft: () => Promise<void>;
  profileStatus: ProfileStatus;
  demoMode?: boolean;
}

export function ResumePublishBar({
  persistDraft,
  profileStatus,
  demoMode = false,
}: ResumePublishBarProps) {
  const router = useRouter();
  const profileId = useResumeBuilderStore((state) => state.profileId);
  const slug = useResumeBuilderStore((state) => state.slug);
  const [publishing, setPublishing] = useState(false);
  const [justPublished, setJustPublished] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const publicProfilePath = slug ? getPublicProfilePath(slug) : null;
  const isPublished = profileStatus === "published";

  async function handlePublish() {
    if (demoMode || !profileId) {
      return;
    }

    setPublishing(true);
    setError(null);

    try {
      await persistDraft();
      await generateSystemPrompt(profileId);
      setJustPublished(true);
    } catch (publishError) {
      setError(
        publishError instanceof Error
          ? publishError.message
          : "발행에 실패했습니다.",
      );
    } finally {
      setPublishing(false);
    }
  }

  if (justPublished) {
    return (
      <div className="space-y-4 rounded-lg border border-emerald-200 bg-emerald-50/50 p-4 dark:border-emerald-900 dark:bg-emerald-950/20">
        <div>
          <p className="font-medium text-emerald-800 dark:text-emerald-300">
            발행 완료
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            공개 프로필(@{slug})에 반영되었습니다.
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <Button
            type="button"
            className="w-full"
            onClick={() => {
              router.push(
                demoMode
                  ? "/demo/dashboard"
                  : profileId
                    ? `/dashboard?profile=${profileId}`
                    : "/dashboard",
              );
              router.refresh();
            }}
          >
            대시보드
          </Button>
          {publicProfilePath ? (
            <a
              href={publicProfilePath}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonVariants({
                variant: "outline",
                className: "w-full",
              })}
            >
              공개 프로필 보기
            </a>
          ) : null}
          {slug ? (
            <ResumePdfDownloadButton
              slug={slug}
              profileId={profileId ?? undefined}
              fullWidth
            />
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 rounded-lg border p-4">
      {isPublished ? (
        <p className="text-sm text-emerald-700 dark:text-emerald-400">
          현재 공개 중입니다. 수정 후 다시 발행하면 공개 프로필에 반영됩니다.
        </p>
      ) : (
        <p className="text-sm text-muted-foreground">
          발행하면 공개 프로필(@{slug})에 반영됩니다.
        </p>
      )}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <Button
        type="button"
        className="w-full"
        disabled={publishing || demoMode}
        onClick={handlePublish}
      >
        {demoMode
          ? "예시 화면 (발행 불가)"
          : publishing
            ? "발행 중..."
            : isPublished
              ? "변경사항 발행"
              : "발행하기"}
      </Button>
      {slug ? (
        <ResumePdfDownloadButton
          slug={slug}
          profileId={profileId ?? undefined}
          fullWidth
        />
      ) : null}
      <Link
        href={
          demoMode
            ? "/demo/dashboard"
            : profileId
              ? `/dashboard?profile=${profileId}`
              : "/dashboard"
        }
        className={buttonVariants({
          variant: "ghost",
          size: "sm",
          className: "w-full",
        })}
      >
        대시보드로 돌아가기
      </Link>
    </div>
  );
}

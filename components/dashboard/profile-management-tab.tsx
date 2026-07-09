"use client";

import Link from "next/link";
import { useState } from "react";

import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { OwnerProfile } from "@/lib/dashboard/types";
import { getPublicProfileUrl } from "@/lib/site/url";
import { cn } from "@/lib/utils";

interface ProfileManagementTabProps {
  profile: OwnerProfile;
}

export function ProfileManagementTab({ profile }: ProfileManagementTabProps) {
  const [isPrivate, setIsPrivate] = useState(profile.is_private);
  const [isSaving, setIsSaving] = useState(false);
  const [copyMessage, setCopyMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const publicUrl = getPublicProfileUrl(profile.slug);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopyMessage("링크가 복사되었습니다.");
    } catch {
      setCopyMessage("링크 복사에 실패했습니다.");
    }

    window.setTimeout(() => setCopyMessage(null), 2000);
  }

  async function togglePrivacy(nextValue: boolean) {
    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch("/api/profile/privacy", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPrivate: nextValue }),
      });

      if (!response.ok) {
        throw new Error("프로필 공개 설정 변경에 실패했습니다.");
      }

      const payload = (await response.json()) as { isPrivate: boolean };
      setIsPrivate(payload.isPrivate);
    } catch (toggleError) {
      setError(
        toggleError instanceof Error
          ? toggleError.message
          : "프로필 공개 설정 변경에 실패했습니다.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{profile.name || "내 프로필"}</CardTitle>
        <CardDescription>@{profile.slug}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-wrap items-center gap-3">
          <span
            className={cn(
              "rounded-full px-3 py-1 text-xs font-medium",
              profile.status === "published"
                ? "bg-emerald-100 text-emerald-800"
                : "bg-amber-100 text-amber-800",
            )}
          >
            {profile.status === "published" ? "발행됨" : "작성 중"}
          </span>
          <span className="text-sm text-muted-foreground">
            {isPrivate ? "비공개" : "공개"}
          </span>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium">퍼블릭 링크</p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <code className="flex-1 rounded-md border bg-muted/40 px-3 py-2 text-sm break-all">
              {publicUrl}
            </code>
            <Button
              type="button"
              variant="outline"
              onClick={copyLink}
              aria-label="퍼블릭 프로필 링크 복사"
            >
              링크 복사
            </Button>
            {profile.status === "published" && !isPrivate ? (
              <a
                href={publicUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={buttonVariants({ variant: "outline" })}
              >
                새 탭에서 열기
              </a>
            ) : (
              <span className="self-center text-xs text-muted-foreground">
                발행 후 공개 상태에서 열 수 있어요
              </span>
            )}
          </div>
          {copyMessage ? (
            <p className="text-xs text-muted-foreground">{copyMessage}</p>
          ) : null}
        </div>

        <div className="flex items-center justify-between rounded-lg border p-4">
          <div>
            <p className="font-medium">비공개 전환</p>
            <p className="text-sm text-muted-foreground">
              켜면 방문자가 프로필을 볼 수 없습니다.
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={isPrivate}
            aria-label="프로필 비공개 전환"
            disabled={isSaving}
            onClick={() => void togglePrivacy(!isPrivate)}
            className={cn(
              "relative h-7 w-12 rounded-full transition-colors disabled:opacity-50",
              isPrivate ? "bg-primary" : "bg-muted",
            )}
          >
            <span
              className={cn(
                "absolute top-0.5 size-6 rounded-full bg-white transition-transform",
                isPrivate ? "translate-x-5" : "translate-x-0.5",
              )}
            />
          </button>
        </div>

        {error ? <p className="text-sm text-destructive">{error}</p> : null}

        <Link href="/dashboard/edit" className={buttonVariants()}>
          수정하기
        </Link>
      </CardContent>
    </Card>
  );
}

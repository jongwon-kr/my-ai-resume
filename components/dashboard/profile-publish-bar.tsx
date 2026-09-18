"use client";

import { useState } from "react";
import { Copy, ExternalLink } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import { getPublicProfileUrl } from "@/lib/site/url";
import { cn } from "@/lib/utils";
import type { ProfileStatus } from "@/types/database";

interface ProfilePublishBarProps {
  profileId: string;
  slug: string;
  status: ProfileStatus;
  initialIsPrivate: boolean;
  demoMode?: boolean;
}

/**
 * The public address and its visibility switch, pinned above the tabs.
 *
 * These were buried inside the profile tab, so the one thing an owner shares
 * was invisible from the other three tabs. Lives here rather than in
 * `SiteHeader` because the header only knows the account's primary profile,
 * not the `?profile=` one the dashboard is actually showing.
 */
export function ProfilePublishBar({
  profileId,
  slug,
  status,
  initialIsPrivate,
  demoMode = false,
}: ProfilePublishBarProps) {
  const [isPrivate, setIsPrivate] = useState(initialIsPrivate);
  const [isSaving, setIsSaving] = useState(false);
  const [copyMessage, setCopyMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const publicUrl = getPublicProfileUrl(slug);
  const isLive = status === "published" && !isPrivate;

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
    if (demoMode) {
      setIsPrivate(nextValue);
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch("/api/profile/privacy", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPrivate: nextValue, profileId }),
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
    // Sits under the sticky SiteHeader (z-40, h-14); -mx-6 lets it span the
    // page gutter while the page keeps its padding.
    <div className="sticky top-14 z-30 -mx-6 mb-4 border-b bg-background/85 px-6 py-3 backdrop-blur">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <span
          className={cn(
            "rounded-full px-2.5 py-1 text-xs font-medium",
            status === "published"
              ? "bg-emerald-100 text-emerald-800"
              : "bg-amber-100 text-amber-800",
          )}
        >
          {status === "published" ? "발행됨" : "작성 중"}
        </span>

        <code className="min-w-0 flex-1 truncate rounded-md border bg-muted/40 px-3 py-1.5 text-sm">
          {publicUrl}
        </code>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={copyLink}
            aria-label="공개 프로필 링크 복사"
          >
            <Copy className="size-4" />
            링크 복사
          </Button>

          {isLive ? (
            <a
              href={publicUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              <ExternalLink className="size-4" />
              열기
            </a>
          ) : null}

          <span className="ml-1 text-sm text-muted-foreground">
            {isPrivate ? "비공개" : "공개"}
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={!isPrivate}
            aria-label="프로필 공개 전환"
            disabled={isSaving}
            onClick={() => void togglePrivacy(!isPrivate)}
            className={cn(
              "inline-flex h-6 w-11 shrink-0 rounded-full p-0.5 transition-colors disabled:opacity-50",
              isPrivate ? "bg-muted" : "bg-primary",
            )}
          >
            <span
              className={cn(
                "block size-5 rounded-full bg-white shadow-sm transition-transform",
                isPrivate ? "translate-x-0" : "translate-x-5",
              )}
            />
          </button>
        </div>
      </div>

      {copyMessage || error || !isLive ? (
        <p
          className={cn(
            "mt-1.5 text-xs",
            error ? "text-destructive" : "text-muted-foreground",
          )}
          role={error ? "alert" : undefined}
        >
          {error ??
            copyMessage ??
            (status === "published"
              ? "비공개 상태라 방문자가 열 수 없습니다."
              : "아직 발행 전이라 방문자가 열 수 없습니다.")}
        </p>
      ) : null}
    </div>
  );
}

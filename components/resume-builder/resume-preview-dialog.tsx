"use client";

import { memo, useMemo, useState } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { XIcon } from "lucide-react";

import { PublicProfileBody } from "@/components/public-profile/public-profile-body";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { useDebouncedValue } from "@/hooks/use-debounce";
import { buildPreviewProfileData } from "@/lib/public-profile/from-form-values";
import type { PublicProfileData } from "@/lib/public-profile/types";
import type { ResumeFormValues } from "@/lib/resume/schema";
import { cn } from "@/lib/utils";
import type { ProfileStatus } from "@/types/database";

/** Long enough to skip mid-word rebuilds, short enough to feel live. */
const PREVIEW_DEBOUNCE_MS = 200;

interface ResumePreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profileId: string;
  slug: string;
  profileStatus: ProfileStatus;
}

export function ResumePreviewDialog({
  open,
  onOpenChange,
  profileId,
  slug,
  profileStatus,
}: ResumePreviewDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        // The header owns the close button so it is the first tabbable element;
        // the default one renders after the content and would drop focus into
        // the middle of the previewed page.
        showCloseButton={false}
        className="top-0 left-0 h-[100dvh] w-full max-w-none translate-x-0 translate-y-0 grid-rows-[auto_minmax(0,1fr)] gap-0 rounded-none bg-background p-0 text-base ring-0 sm:max-w-none"
      >
        <PreviewHeader slug={slug} profileStatus={profileStatus} />
        <PreviewScroller profileId={profileId} slug={slug} />
      </DialogContent>
    </Dialog>
  );
}

function PreviewHeader({
  slug,
  profileStatus,
}: {
  slug: string;
  profileStatus: ProfileStatus;
}) {
  const isPublished = profileStatus === "published";

  return (
    <div className="flex shrink-0 items-start justify-between gap-4 border-b bg-muted/40 px-4 py-3 sm:px-6">
      <div className="min-w-0 space-y-1">
        <DialogTitle>공개 프로필 미리보기</DialogTitle>
        <DialogDescription
          className={cn(
            "text-xs",
            !isPublished && "text-amber-700 dark:text-amber-400",
          )}
        >
          {isPublished
            ? `지금 편집 중인 내용입니다. 발행해야 @${slug} 에 반영됩니다.`
            : `아직 발행 전입니다. 발행해야 @${slug} 에서 볼 수 있습니다.`}
          {" 비어 있는 항목은 발행할 때와 똑같이 제외됩니다."}
        </DialogDescription>
      </div>
      <DialogClose
        render={
          <Button variant="ghost" size="icon-sm" aria-label="미리보기 닫기" />
        }
      >
        <XIcon />
      </DialogClose>
    </div>
  );
}

function PreviewScroller({
  profileId,
  slug,
}: {
  profileId: string;
  slug: string;
}) {
  const { control, getValues } = useFormContext<ResumeFormValues>();
  // A callback ref into state, not useRef: SectionNav's effect has to re-run
  // once the scroll container exists, and a ref mutation would not trigger it.
  const [scrollRoot, setScrollRoot] = useState<HTMLElement | null>(null);

  // Subscription only. The hook's return value is a DeepPartial, so the typed
  // snapshot comes from getValues(); this exists to re-render on edits.
  useWatch({ control });

  // A primitive, so the debounce settles instead of re-arming on every render.
  const snapshot = JSON.stringify(getValues());
  const debouncedSnapshot = useDebouncedValue(snapshot, PREVIEW_DEBOUNCE_MS);

  const data = useMemo(
    () =>
      buildPreviewProfileData(
        JSON.parse(debouncedSnapshot) as ResumeFormValues,
        {
          profileId,
          slug,
        },
      ),
    [debouncedSnapshot, profileId, slug],
  );

  return (
    <div
      ref={setScrollRoot}
      className="min-h-0 overflow-y-auto overscroll-contain"
    >
      <PreviewBody data={data} scrollRoot={scrollRoot} />
    </div>
  );
}

// memo turns the stable `data` identity into an actual bail-out; useMemo alone
// would not stop the child re-rendering with its parent.
const PreviewBody = memo(function PreviewBody({
  data,
  scrollRoot,
}: {
  data: PublicProfileData;
  scrollRoot: HTMLElement | null;
}) {
  return (
    <PublicProfileBody data={data} showShare={false} scrollRoot={scrollRoot} />
  );
});

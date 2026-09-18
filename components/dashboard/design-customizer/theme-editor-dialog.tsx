"use client";

import { useState } from "react";
import { XIcon } from "lucide-react";

import { ThemeControlPanel } from "@/components/dashboard/design-customizer/theme-control-panel";
import {
  ThemePreviewSurface,
  ViewportToggle,
  type PreviewViewport,
} from "@/components/dashboard/design-customizer/theme-preview-frame";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import type { ResumeFormValues } from "@/lib/resume/schema";
import type { ThemeConfig } from "@/lib/types/profile";

interface ThemeEditorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profileId: string;
  slug: string;
  values: ResumeFormValues;
  theme: ThemeConfig;
  onThemeChange: (next: ThemeConfig) => void;
  isDirty: boolean;
  isSaving: boolean;
  onSave: () => void;
  onReset: () => void;
  error: string | null;
}

/**
 * Full-screen design editing.
 *
 * The inline card's preview is too small to judge a layout change, so this puts
 * the profile at real width with the controls docked beside it. Theme state
 * stays in the parent tab, so opening and closing this never loses edits and
 * both surfaces always show the same thing.
 *
 * Shell mirrors `ResumePreviewDialog` — same full-screen geometry and the same
 * reason for `showCloseButton={false}`: the header's close button must be the
 * first tabbable element, not one rendered after the whole page.
 */
export function ThemeEditorDialog({
  open,
  onOpenChange,
  profileId,
  slug,
  values,
  theme,
  onThemeChange,
  isDirty,
  isSaving,
  onSave,
  onReset,
  error,
}: ThemeEditorDialogProps) {
  const [viewport, setViewport] = useState<PreviewViewport>("desktop");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="top-0 left-0 h-[100dvh] w-full max-w-none translate-x-0 translate-y-0 grid-rows-[auto_minmax(0,1fr)] gap-0 rounded-none bg-background p-0 text-base ring-0 sm:max-w-none"
      >
        <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b bg-muted/40 px-4 py-3 sm:px-6">
          <div className="min-w-0">
            <DialogTitle>공개 프로필 디자인 편집</DialogTitle>
            <DialogDescription className="text-xs">
              실제 공개 화면 그대로입니다. 저장해야 @{slug} 에 반영됩니다.
            </DialogDescription>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <ViewportToggle value={viewport} onChange={setViewport} />
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isSaving || !isDirty}
              onClick={onReset}
            >
              되돌리기
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={isSaving || !isDirty}
              onClick={onSave}
            >
              {isSaving ? "저장 중..." : "디자인 저장"}
            </Button>
            <DialogClose
              render={
                <Button variant="ghost" size="icon-sm" aria-label="편집 닫기" />
              }
            >
              <XIcon />
            </DialogClose>
          </div>
        </div>

        <div className="grid min-h-0 grid-rows-[auto_minmax(0,1fr)] lg:grid-cols-[22rem_minmax(0,1fr)] lg:grid-rows-1">
          {/* Controls scroll independently so a long panel never pushes the
              preview off-screen. */}
          <aside className="min-h-0 overflow-y-auto border-b p-4 lg:border-r lg:border-b-0 lg:p-6">
            <ThemeControlPanel value={theme} onChange={onThemeChange} />
            {error ? (
              <p className="mt-4 text-sm text-destructive" role="alert">
                {error}
              </p>
            ) : null}
          </aside>

          <ThemePreviewSurface
            values={values}
            profileId={profileId}
            slug={slug}
            theme={theme}
            viewport={viewport}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

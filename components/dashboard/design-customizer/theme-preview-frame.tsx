"use client";

import { memo, useMemo, useState } from "react";
import { Monitor, Smartphone } from "lucide-react";

import { PublicProfileBody } from "@/components/public-profile/public-profile-body";
import { Button } from "@/components/ui/button";
import { buildPreviewProfileData } from "@/lib/public-profile/from-form-values";
import type { PublicProfileData } from "@/lib/public-profile/types";
import type { ResumeFormValues } from "@/lib/resume/schema";
import type { ThemeConfig } from "@/lib/types/profile";
import { cn } from "@/lib/utils";

export type PreviewViewport = "desktop" | "mobile";

interface PreviewSurfaceProps {
  values: ResumeFormValues;
  profileId: string;
  slug: string;
  theme: ThemeConfig;
  viewport: PreviewViewport;
  className?: string;
}

// memo turns the stable `data` identity into an actual bail-out; useMemo alone
// would not stop the child re-rendering with its parent.
const PreviewBody = memo(function PreviewBody({
  data,
  scrollRoot,
  narrow,
}: {
  data: PublicProfileData;
  scrollRoot: HTMLElement | null;
  narrow: boolean;
}) {
  return (
    <PublicProfileBody
      data={data}
      showShare={false}
      scrollRoot={scrollRoot}
      narrow={narrow}
    />
  );
});

/**
 * The scrollable preview itself, with no chrome of its own.
 *
 * Renders the real public profile — `PublicProfileBody` is the same component
 * the live page uses, and it applies the theme from `data.themeConfig`, so
 * moving a control re-renders with new CSS variables and nothing is fetched.
 *
 * Shared by the inline card and the full-screen editor so the two can never
 * disagree about what the page looks like.
 */
export function ThemePreviewSurface({
  values,
  profileId,
  slug,
  theme,
  viewport,
  className,
}: PreviewSurfaceProps) {
  // A callback ref into state, not useRef: SectionNav's effect has to re-run
  // once the scroll container exists, and a ref mutation would not trigger it.
  const [scrollRoot, setScrollRoot] = useState<HTMLElement | null>(null);

  const data = useMemo(
    () =>
      buildPreviewProfileData(values, { profileId, slug, themeConfig: theme }),
    [values, profileId, slug, theme],
  );

  return (
    <div
      ref={setScrollRoot}
      className={cn(
        "min-h-0 overflow-y-auto overscroll-contain bg-muted/30",
        className,
      )}
    >
      {/* Width, not an iframe: SectionNav already supports a container as its
          scroll root, and an iframe would lose the inherited font variables. */}
      <div
        className={cn(
          "mx-auto bg-background transition-[max-width]",
          viewport === "mobile"
            ? "max-w-[390px] border-x shadow-sm"
            : "max-w-none",
        )}
      >
        <PreviewBody
          data={data}
          scrollRoot={scrollRoot}
          narrow={viewport === "mobile"}
        />
      </div>
    </div>
  );
}

export function ViewportToggle({
  value,
  onChange,
}: {
  value: PreviewViewport;
  onChange: (next: PreviewViewport) => void;
}) {
  return (
    <div className="flex gap-1">
      <Button
        type="button"
        size="sm"
        variant={value === "desktop" ? "default" : "ghost"}
        aria-pressed={value === "desktop"}
        onClick={() => onChange("desktop")}
      >
        <Monitor className="size-4" />
        데스크톱
      </Button>
      <Button
        type="button"
        size="sm"
        variant={value === "mobile" ? "default" : "ghost"}
        aria-pressed={value === "mobile"}
        onClick={() => onChange("mobile")}
      >
        <Smartphone className="size-4" />
        모바일
      </Button>
    </div>
  );
}

/** Inline preview for the tab — a small window with its own toolbar. */
export function ThemePreviewFrame(
  props: Omit<PreviewSurfaceProps, "viewport" | "className">,
) {
  const [viewport, setViewport] = useState<PreviewViewport>("desktop");

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-lg border">
      <div className="flex items-center justify-between gap-2 border-b px-3 py-2">
        <p className="text-sm text-muted-foreground">미리보기</p>
        <ViewportToggle value={viewport} onChange={setViewport} />
      </div>
      <ThemePreviewSurface {...props} viewport={viewport} className="flex-1" />
    </div>
  );
}

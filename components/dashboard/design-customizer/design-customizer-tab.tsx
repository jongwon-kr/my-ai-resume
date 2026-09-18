"use client";

import { useState } from "react";
import { Maximize2 } from "lucide-react";

import { ThemeControlPanel } from "@/components/dashboard/design-customizer/theme-control-panel";
import { ThemeEditorDialog } from "@/components/dashboard/design-customizer/theme-editor-dialog";
import { ThemePreviewFrame } from "@/components/dashboard/design-customizer/theme-preview-frame";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { ResumeFormValues } from "@/lib/resume/schema";
import type { ThemeConfig } from "@/lib/types/profile";

interface DesignCustomizerTabProps {
  profileId: string;
  slug: string;
  values: ResumeFormValues;
  initialTheme: ThemeConfig;
  demoMode?: boolean;
}

export function DesignCustomizerTab({
  profileId,
  slug,
  values,
  initialTheme,
  demoMode = false,
}: DesignCustomizerTabProps) {
  const [theme, setTheme] = useState<ThemeConfig>(initialTheme);
  const [savedTheme, setSavedTheme] = useState<ThemeConfig>(initialTheme);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);
  const [fullscreenOpen, setFullscreenOpen] = useState(false);

  const isDirty = JSON.stringify(theme) !== JSON.stringify(savedTheme);

  function resetTheme() {
    setTheme(savedTheme);
    setError(null);
  }

  async function save() {
    if (demoMode) {
      setSavedTheme(theme);
      setSavedMessage("예시 모드에서는 저장되지 않습니다.");
      window.setTimeout(() => setSavedMessage(null), 2000);
      return;
    }

    setIsSaving(true);
    setError(null);
    setSavedMessage(null);

    try {
      const response = await fetch("/api/profile/theme", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileId, themeConfig: theme }),
      });

      const payload = (await response.json().catch(() => null)) as {
        error?: string;
        themeConfig?: ThemeConfig;
      } | null;

      if (!response.ok || !payload?.themeConfig) {
        throw new Error(payload?.error ?? "디자인 설정 저장에 실패했습니다.");
      }

      // Server-normalized value wins, so the UI can never drift from storage.
      setTheme(payload.themeConfig);
      setSavedTheme(payload.themeConfig);
      setSavedMessage("디자인을 저장했습니다.");
      window.setTimeout(() => setSavedMessage(null), 2000);
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "디자인 설정 저장에 실패했습니다.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>공개 프로필 디자인</CardTitle>
        <CardDescription>
          바꾸는 즉시 오른쪽 미리보기에 반영됩니다. 저장해야 방문자에게
          적용됩니다.
        </CardDescription>
        <CardAction>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setFullscreenOpen(true)}
          >
            <Maximize2 className="size-4" />
            전체 화면에서 편집
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 lg:grid-cols-[2fr_3fr]">
          <div className="space-y-4">
            <ThemeControlPanel value={theme} onChange={setTheme} />

            <div className="flex flex-wrap items-center gap-2 border-t pt-4">
              <Button
                type="button"
                disabled={isSaving || !isDirty}
                onClick={() => void save()}
              >
                {isSaving ? "저장 중..." : "디자인 저장"}
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={isSaving || !isDirty}
                onClick={resetTheme}
              >
                되돌리기
              </Button>
            </div>

            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            {savedMessage ? (
              <p className="text-xs text-muted-foreground">{savedMessage}</p>
            ) : null}
          </div>

          {/* Sticky so the preview stays in view while the controls scroll. */}
          <div className="h-[36rem] min-h-0 lg:sticky lg:top-32">
            <ThemePreviewFrame
              values={values}
              profileId={profileId}
              slug={slug}
              theme={theme}
            />
          </div>
        </div>
      </CardContent>

      <ThemeEditorDialog
        open={fullscreenOpen}
        onOpenChange={setFullscreenOpen}
        profileId={profileId}
        slug={slug}
        values={values}
        theme={theme}
        onThemeChange={setTheme}
        isDirty={isDirty}
        isSaving={isSaving}
        onSave={() => void save()}
        onReset={resetTheme}
        error={error}
      />
    </Card>
  );
}

"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PROFILE_LABEL_MAX_LENGTH } from "@/lib/profile/display";

interface ProfileLabelFieldProps {
  profileId: string;
  initialLabel: string;
  demoMode?: boolean;
  onSaved?: (label: string) => void;
}

export function ProfileLabelField({
  profileId,
  initialLabel,
  demoMode = false,
  onSaved,
}: ProfileLabelFieldProps) {
  const [label, setLabel] = useState(initialLabel);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);
  const isDirty = label.trim() !== initialLabel.trim();

  async function saveLabel() {
    if (demoMode) {
      onSaved?.(label.trim());
      return;
    }

    setIsSaving(true);
    setError(null);
    setSavedMessage(null);

    try {
      const response = await fetch("/api/profile/label", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileId, label }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(payload?.error ?? "프로필 라벨 저장에 실패했습니다.");
      }

      const payload = (await response.json()) as { label: string };
      setLabel(payload.label);
      setSavedMessage("라벨이 저장되었습니다.");
      onSaved?.(payload.label);
      window.setTimeout(() => setSavedMessage(null), 2000);
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "프로필 라벨 저장에 실패했습니다.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-2 rounded-lg border p-4">
      <div>
        <p className="font-medium">프로필 라벨</p>
        <p className="text-sm text-muted-foreground">
          대시보드에서 프로필을 구분할 이름입니다. 공개 프로필에는 표시되지
          않습니다.
        </p>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Input
          value={label}
          onChange={(event) => setLabel(event.target.value)}
          placeholder="예: 프론트엔드 지원용, 이직용"
          maxLength={PROFILE_LABEL_MAX_LENGTH}
          disabled={isSaving}
          aria-label="프로필 라벨"
        />
        <Button
          type="button"
          variant="outline"
          disabled={isSaving || !isDirty}
          onClick={() => void saveLabel()}
        >
          {isSaving ? "저장 중..." : "저장"}
        </Button>
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {savedMessage ? (
        <p className="text-xs text-muted-foreground">{savedMessage}</p>
      ) : null}
    </div>
  );
}

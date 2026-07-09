"use client";

import { useResumeBuilderStore } from "@/stores/resume-builder-store";

export function AutosaveIndicator() {
  const saveStatus = useResumeBuilderStore((state) => state.saveStatus);
  const saveError = useResumeBuilderStore((state) => state.saveError);
  const lastSavedAt = useResumeBuilderStore((state) => state.lastSavedAt);

  if (saveStatus === "saving") {
    return <p className="text-xs text-muted-foreground">저장 중...</p>;
  }

  if (saveStatus === "error" && saveError) {
    return <p className="text-xs text-destructive">{saveError}</p>;
  }

  if (saveStatus === "saved" && lastSavedAt) {
    return (
      <p className="text-xs text-muted-foreground">
        임시 저장됨 · {lastSavedAt.toLocaleTimeString("ko-KR")}
      </p>
    );
  }

  return <p className="text-xs text-muted-foreground">자동 저장 대기 중</p>;
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { generateSystemPrompt } from "@/lib/resume/publish";
import { useResumeBuilderStore } from "@/stores/resume-builder-store";

interface ResumePublishBarProps {
  persistDraft: () => Promise<void>;
}

export function ResumePublishBar({ persistDraft }: ResumePublishBarProps) {
  const router = useRouter();
  const profileId = useResumeBuilderStore((state) => state.profileId);
  const slug = useResumeBuilderStore((state) => state.slug);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handlePublish() {
    if (!profileId) {
      return;
    }

    setPublishing(true);
    setError(null);

    try {
      await persistDraft();
      await generateSystemPrompt(profileId);
      router.push("/dashboard");
      router.refresh();
    } catch (publishError) {
      setError(
        publishError instanceof Error
          ? publishError.message
          : "발행에 실패했습니다.",
      );
      setPublishing(false);
    }
  }

  return (
    <div className="space-y-3 rounded-lg border p-4">
      <p className="text-sm text-muted-foreground">
        발행하면 공개 프로필(@{slug})에 반영됩니다.
      </p>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <Button
        type="button"
        className="w-full"
        disabled={publishing}
        onClick={handlePublish}
      >
        {publishing ? "발행 중..." : "발행하기"}
      </Button>
    </div>
  );
}

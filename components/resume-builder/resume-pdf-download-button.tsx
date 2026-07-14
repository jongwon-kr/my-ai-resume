"use client";

import { Download } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ResumePdfDownloadButtonProps {
  slug: string;
  profileId?: string;
  className?: string;
  variant?: React.ComponentProps<typeof Button>["variant"];
  size?: React.ComponentProps<typeof Button>["size"];
  fullWidth?: boolean;
}

export function ResumePdfDownloadButton({
  slug,
  profileId,
  className,
  variant = "outline",
  size = "default",
  fullWidth = false,
}: ResumePdfDownloadButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDownload() {
    setLoading(true);
    setError(null);

    try {
      const apiUrl = profileId
        ? `/api/resume/export-pdf?profileId=${encodeURIComponent(profileId)}`
        : "/api/resume/export-pdf";
      const response = await fetch(apiUrl);

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(payload?.error ?? "PDF 다운로드에 실패했습니다.");
      }

      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = objectUrl;
      anchor.download = `${slug}-resume.pdf`;
      anchor.click();
      URL.revokeObjectURL(objectUrl);
    } catch (downloadError) {
      setError(
        downloadError instanceof Error
          ? downloadError.message
          : "PDF 다운로드에 실패했습니다.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={cn(fullWidth && "w-full", className)}>
      <Button
        type="button"
        variant={variant}
        size={size}
        className={cn(fullWidth && "w-full")}
        disabled={loading}
        onClick={() => void handleDownload()}
      >
        <Download className="size-4" />
        {loading ? "PDF 생성 중..." : "PDF 다운로드"}
      </Button>
      {error ? <p className="mt-2 text-sm text-destructive">{error}</p> : null}
    </div>
  );
}

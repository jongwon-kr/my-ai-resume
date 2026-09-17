"use client";

import { UploadCloudIcon } from "lucide-react";
import { useId, useState } from "react";

import { isFileDrag } from "@/components/resume-builder/sortable-drag";
import { cn } from "@/lib/utils";
import { useResumeBuilderStore } from "@/stores/resume-builder-store";

const DEMO_BLOCKED_MESSAGE = "예시 모드에서는 파일을 업로드할 수 없습니다.";

interface UploadDropzoneProps {
  accept: string;
  label: string;
  onFile: (file: File) => void;
  hint?: string;
  busy?: boolean;
  busyLabel?: string;
  className?: string;
}

/**
 * Drop target shared by the avatar, portfolio and PDF-import uploads.
 *
 * It owns the only `<input type="file">` on each of those paths, which makes it
 * the single place the demo-mode guard has to live.
 */
export function UploadDropzone({
  accept,
  label,
  onFile,
  hint,
  busy = false,
  busyLabel = "업로드 중…",
  className,
}: UploadDropzoneProps) {
  const demoMode = useResumeBuilderStore((state) => state.demoMode);
  const inputId = useId();
  const [dragOver, setDragOver] = useState(false);

  const blocked = busy || demoMode;

  function take(file: File | undefined) {
    if (!file || blocked) {
      return;
    }
    onFile(file);
  }

  // A sort drag carries our custom MIME and no "Files" entry, so it passes
  // straight through to SortableItem instead of being swallowed here.
  function allow(event: React.DragEvent) {
    if (blocked || !isFileDrag(event)) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    event.dataTransfer.dropEffect = "copy";
    setDragOver(true);
  }

  return (
    <label
      htmlFor={inputId}
      data-drag-over={dragOver || undefined}
      className={cn(
        "flex cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-input px-4 py-6 text-center transition-colors",
        "hover:border-ring hover:bg-muted/40",
        "has-[input:focus-visible]:border-ring has-[input:focus-visible]:ring-3 has-[input:focus-visible]:ring-ring/50",
        "data-[drag-over]:border-primary data-[drag-over]:bg-primary/5",
        blocked &&
          "cursor-not-allowed opacity-60 hover:border-input hover:bg-transparent",
        className,
      )}
      onDragEnter={allow}
      onDragOver={allow}
      onDragLeave={(event) => {
        if (event.currentTarget.contains(event.relatedTarget as Node)) {
          return;
        }
        setDragOver(false);
      }}
      onDrop={(event) => {
        if (blocked || !isFileDrag(event)) {
          return;
        }
        event.preventDefault();
        event.stopPropagation();
        setDragOver(false);
        take(event.dataTransfer.files[0]);
      }}
    >
      {/* `sr-only`, not `hidden`: the input keeps its place in the tab order so
          Enter or Space opens the picker with no synthetic key handling. */}
      <input
        id={inputId}
        type="file"
        accept={accept}
        disabled={blocked}
        className="sr-only"
        onChange={(event) => {
          const file = event.target.files?.[0];
          // Reset so picking the same file twice still fires change.
          event.target.value = "";
          take(file);
        }}
      />
      <UploadCloudIcon aria-hidden className="size-5 text-muted-foreground" />
      <span className="text-sm font-medium">{busy ? busyLabel : label}</span>
      {hint ? (
        <span className="text-xs text-muted-foreground">{hint}</span>
      ) : null}
      {demoMode ? (
        <span className="text-xs text-muted-foreground">
          {DEMO_BLOCKED_MESSAGE}
        </span>
      ) : null}
    </label>
  );
}

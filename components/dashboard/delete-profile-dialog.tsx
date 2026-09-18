"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface DeleteProfileDialogProps {
  profileId: string;
  slug: string;
  /** Disables deletion at the last profile, matching the API's own guard. */
  isLastProfile: boolean;
  onDeleted: (
    nextProfileId: string | null,
    storageCleanupFailed: boolean,
  ) => void;
}

export function DeleteProfileDialog({
  profileId,
  slug,
  isLastProfile,
  onDeleted,
}: DeleteProfileDialogProps) {
  const [open, setOpen] = useState(false);
  const [confirmation, setConfirmation] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Typing the slug back is the whole safety mechanism: this wipes the resume,
  // every visitor conversation and the uploaded files with no undo.
  const canSubmit = confirmation.trim() === slug && !submitting;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canSubmit) {
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/profiles/${profileId}`, {
        method: "DELETE",
      });

      const payload = (await response.json().catch(() => null)) as {
        error?: string;
        nextProfileId?: string | null;
        storageCleanupFailed?: boolean;
      } | null;

      if (!response.ok) {
        throw new Error(payload?.error ?? "프로필 삭제에 실패했습니다.");
      }

      setOpen(false);
      setConfirmation("");
      onDeleted(
        payload?.nextProfileId ?? null,
        payload?.storageCleanupFailed ?? false,
      );
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "프로필 삭제에 실패했습니다.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (isLastProfile) {
    return (
      <div className="space-y-2">
        <Button type="button" variant="outline" size="sm" disabled>
          <Trash2 className="size-4" />
          프로필 삭제
        </Button>
        <p className="text-sm text-muted-foreground">
          마지막 프로필은 삭제할 수 없습니다. 새 프로필을 만든 뒤 삭제하세요.
        </p>
      </div>
    );
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (!nextOpen) {
          setConfirmation("");
          setError(null);
        }
      }}
    >
      <DialogTrigger
        render={
          <button
            type="button"
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            <Trash2 className="size-4" />
            프로필 삭제
          </button>
        }
      />
      {/* Wider than the default: the consequence list wraps badly at sm. */}
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>프로필을 삭제할까요?</DialogTitle>
          <DialogDescription>
            이 작업은 되돌릴 수 없습니다. 아래 항목이 함께 영구 삭제됩니다.
          </DialogDescription>
        </DialogHeader>

        <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
          <li>이력서 전체 (경력·프로젝트·자기소개서·예상 질문 답변)</li>
          <li>방문자와의 대화 로그, 받은 질문, 조회수·통계</li>
          <li>업로드한 프로필 사진과 포트폴리오 파일</li>
          <li>
            <span className="font-medium text-foreground">@{slug}</span> 공개
            주소 — 접속 시 더 이상 열리지 않습니다
          </li>
        </ul>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label
              htmlFor="delete-profile-confirmation"
              className="text-sm font-medium"
            >
              확인을 위해{" "}
              <span className="font-mono text-foreground">{slug}</span> 을(를)
              입력하세요
            </label>
            <Input
              id="delete-profile-confirmation"
              value={confirmation}
              onChange={(event) => setConfirmation(event.target.value)}
              placeholder={slug}
              autoComplete="off"
              spellCheck={false}
            />
          </div>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}

          <Button
            type="submit"
            variant="destructive"
            className="w-full"
            disabled={!canSubmit}
          >
            {submitting ? "삭제 중..." : "프로필 영구 삭제"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

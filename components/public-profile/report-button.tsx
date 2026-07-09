"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  REPORT_ERROR_MESSAGE,
  REPORT_REASONS,
  REPORT_SUCCESS_MESSAGE,
  type ReportReason,
} from "@/lib/reports/constants";

interface ReportButtonProps {
  profileId: string;
}

export function ReportButton({ profileId }: ReportButtonProps) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<ReportReason>("inappropriate");
  const [detail, setDetail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function submitReport() {
    setIsSubmitting(true);
    setError(null);
    setMessage(null);

    try {
      const response = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileId, reason, detail }),
      });

      const payload = (await response.json().catch(() => null)) as {
        error?: string;
      } | null;

      if (!response.ok) {
        throw new Error(payload?.error ?? REPORT_ERROR_MESSAGE);
      }

      setMessage(REPORT_SUCCESS_MESSAGE);
      setDetail("");
      window.setTimeout(() => setOpen(false), 1200);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : REPORT_ERROR_MESSAGE,
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-muted-foreground"
            aria-label="프로필 신고하기"
          />
        }
      >
        신고하기
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>프로필 신고</DialogTitle>
          <DialogDescription>
            부적절한 프로필이나 AI 대화 내용을 신고할 수 있습니다.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="report-reason" className="text-sm font-medium">
              신고 사유
            </label>
            <select
              id="report-reason"
              value={reason}
              onChange={(event) =>
                setReason(event.target.value as ReportReason)
              }
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
            >
              {REPORT_REASONS.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="report-detail" className="text-sm font-medium">
              상세 내용 (선택)
            </label>
            <Input
              id="report-detail"
              value={detail}
              onChange={(event) => setDetail(event.target.value)}
              placeholder="추가 설명을 입력해 주세요"
              maxLength={500}
            />
          </div>

          {message ? (
            <p className="text-sm text-emerald-600" role="status">
              {message}
            </p>
          ) : null}
          {error ? (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          ) : null}
        </div>

        <DialogFooter>
          <Button
            type="button"
            disabled={isSubmitting || Boolean(message)}
            onClick={() => void submitReport()}
            aria-label="신고 제출"
          >
            {isSubmitting ? "접수 중..." : "신고 접수"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

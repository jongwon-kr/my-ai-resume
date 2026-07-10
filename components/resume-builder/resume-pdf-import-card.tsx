"use client";

import { AlertTriangle, FileUp } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { useFormContext } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  buildImportPreviewDiff,
  hasImportChanges,
} from "@/lib/resume/import/diff-import";
import { mergeResumeImport } from "@/lib/resume/import/merge-import";
import type { ResumeImportApiResponse } from "@/lib/resume/import/schema";
import type { ResumeFormValues } from "@/lib/resume/schema";
import { cn } from "@/lib/utils";

interface ResumePdfImportCardProps {
  persistDraft: () => Promise<void>;
}

export function ResumePdfImportCard({
  persistDraft,
}: ResumePdfImportCardProps) {
  const form = useFormContext<ResumeFormValues>();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [applying, setApplying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [pendingImport, setPendingImport] =
    useState<ResumeImportApiResponse | null>(null);

  const previewItems = useMemo(() => {
    if (!pendingImport) {
      return [];
    }

    return buildImportPreviewDiff(
      form.getValues(),
      pendingImport.imported,
      pendingImport.needsReview,
    );
  }, [pendingImport, form]);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const body = new FormData();
      body.append("file", file);

      const response = await fetch("/api/resume/import-pdf", {
        method: "POST",
        body,
      });

      const payload = (await response.json()) as
        ResumeImportApiResponse | { error?: string };

      if (!response.ok) {
        throw new Error(
          "error" in payload && payload.error
            ? payload.error
            : "자동 추출에 실패했습니다. 이력서를 직접 입력해 주세요.",
        );
      }

      setPendingImport(payload as ResumeImportApiResponse);
      setPreviewOpen(true);
    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "자동 추출에 실패했습니다. 이력서를 직접 입력해 주세요.",
      );
    } finally {
      setUploading(false);
    }
  }

  async function handleApply() {
    if (!pendingImport) {
      return;
    }

    setApplying(true);
    setError(null);

    try {
      const merged = mergeResumeImport(
        form.getValues(),
        pendingImport.imported,
      );
      form.reset(merged);
      await persistDraft();
      setPreviewOpen(false);
      setPendingImport(null);
    } catch (applyError) {
      setError(
        applyError instanceof Error
          ? applyError.message
          : "적용에 실패했습니다.",
      );
    } finally {
      setApplying(false);
    }
  }

  const reviewCount = pendingImport?.needsReview.length ?? 0;
  const changesDetected = hasImportChanges(previewItems);

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>PDF에서 불러오기</CardTitle>
          <CardDescription>
            기존 이력서 PDF를 업로드하면 AI가 항목을 추출합니다. 적용 전
            미리보기에서 확인하세요.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf,.pdf"
            className="hidden"
            onChange={handleFileChange}
          />
          <Button
            type="button"
            variant="outline"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
          >
            <FileUp className="size-4" />
            {uploading ? "PDF 분석 중..." : "PDF 업로드"}
          </Button>
          <p className="text-xs text-muted-foreground">
            PDF만 가능 · 최대 5MB · 시간당 3회 · Gemini 1회 호출
          </p>
          {error && !previewOpen ? (
            <p className="text-sm text-destructive">{error}</p>
          ) : null}
        </CardContent>
      </Card>

      <Dialog
        open={previewOpen}
        onOpenChange={(open) => {
          setPreviewOpen(open);
          if (!open) {
            setPendingImport(null);
            setError(null);
          }
        }}
      >
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>추출 결과 미리보기</DialogTitle>
            <DialogDescription>
              적용하면 아래 내용으로 폼이 업데이트됩니다. 불확실한 항목은 반드시
              확인하세요.
            </DialogDescription>
          </DialogHeader>

          {reviewCount > 0 ? (
            <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
              <AlertTriangle className="mt-0.5 size-4 shrink-0" />
              <p>
                확인 필요 항목 {reviewCount}개 — AI가 PDF에서 확신하지 못한
                필드입니다.
              </p>
            </div>
          ) : null}

          {!changesDetected ? (
            <p className="text-sm text-muted-foreground">
              현재 폼과 비교해 변경될 항목이 거의 없습니다.
            </p>
          ) : (
            <ul className="space-y-3">
              {previewItems.map((item) => (
                <li key={item.label} className="rounded-lg border p-3 text-sm">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <span className="font-medium">{item.label}</span>
                    {item.needsReview ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-800 dark:bg-amber-950 dark:text-amber-200">
                        <AlertTriangle className="size-3" />
                        확인 필요
                      </span>
                    ) : null}
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <div>
                      <p className="text-xs text-muted-foreground">현재</p>
                      <p className="break-words">{item.current}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">추출</p>
                      <p
                        className={cn(
                          "break-words",
                          item.current !== item.imported &&
                            "font-medium text-primary",
                        )}
                      >
                        {item.imported}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {pendingImport?.needsReview.length ? (
            <div className="rounded-lg border bg-muted/40 p-3 text-xs text-muted-foreground">
              <p className="mb-1 font-medium text-foreground">확인 필요 경로</p>
              <p>{pendingImport.needsReview.join(", ")}</p>
            </div>
          ) : null}

          {error && previewOpen ? (
            <p className="text-sm text-destructive">{error}</p>
          ) : null}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setPreviewOpen(false);
                setPendingImport(null);
              }}
            >
              취소
            </Button>
            <Button
              type="button"
              disabled={applying || !pendingImport}
              onClick={() => void handleApply()}
            >
              {applying ? "적용 중..." : "폼에 적용"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

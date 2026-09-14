"use client";

import { useState } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SortableItem } from "@/components/resume-builder/sortable-item";
import {
  PORTFOLIO_MAX_ITEMS,
  PORTFOLIO_UPLOAD_FAILED_MESSAGE,
} from "@/lib/portfolio/constants";
import {
  PORTFOLIO_ACCEPT_BY_KIND,
  validatePortfolioFile,
  type UploadKind,
} from "@/lib/portfolio/validate-upload";
import {
  removePortfolioMedia,
  uploadPortfolioMedia,
} from "@/lib/resume/persistence";
import {
  defaultPortfolioItem,
  type PortfolioKind,
  type ResumeFormValues,
} from "@/lib/resume/schema";
import { createClient } from "@/lib/supabase/client";
import { useResumeBuilderStore } from "@/stores/resume-builder-store";

const KIND_LABELS: Record<PortfolioKind, string> = {
  image: "이미지",
  file: "PDF · 슬라이드",
  video: "동영상",
  link: "링크",
};

const ADD_BUTTONS: Array<{ kind: PortfolioKind; label: string }> = [
  { kind: "image", label: "이미지 추가" },
  { kind: "file", label: "PDF · 슬라이드 추가" },
  { kind: "video", label: "동영상 추가" },
  { kind: "link", label: "링크 추가" },
];

interface StepPortfolioProps {
  onBlurSave: () => void;
}

export function StepPortfolio({ onBlurSave }: StepPortfolioProps) {
  const profileId = useResumeBuilderStore((state) => state.profileId);
  const {
    control,
    register,
    setValue,
    watch,
    formState: { errors },
  } = useFormContext<ResumeFormValues>();

  const { fields, append, remove, move } = useFieldArray({
    control,
    name: "portfolio_items",
  });

  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);

  async function handleFileChange(
    index: number,
    kind: UploadKind,
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0];
    if (!file || !profileId) {
      return;
    }

    const validationError = validatePortfolioFile(kind, file);
    if (validationError) {
      setUploadError(validationError);
      event.target.value = "";
      return;
    }

    setUploadError(null);
    setUploadingIndex(index);

    try {
      const supabase = createClient();
      const { url, storagePath } = await uploadPortfolioMedia(
        supabase,
        profileId,
        file,
      );
      setValue(`portfolio_items.${index}.url`, url, { shouldDirty: true });
      setValue(`portfolio_items.${index}.storage_path`, storagePath, {
        shouldDirty: true,
      });
      if (!watch(`portfolio_items.${index}.title`)?.trim()) {
        setValue(`portfolio_items.${index}.title`, file.name, {
          shouldDirty: true,
        });
      }
      // Persist immediately so an upload can't outlive the row that owns it.
      onBlurSave();
    } catch (error) {
      console.error(error);
      setUploadError(PORTFOLIO_UPLOAD_FAILED_MESSAGE);
    } finally {
      setUploadingIndex(null);
    }
  }

  async function handleRemove(index: number) {
    const storagePath = watch(`portfolio_items.${index}.storage_path`);

    if (storagePath && profileId) {
      try {
        await removePortfolioMedia(createClient(), storagePath);
      } catch (error) {
        // Best effort: the row goes away regardless, so don't block the UI.
        console.error(error);
      }
    }

    remove(index);
    onBlurSave();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>포트폴리오</CardTitle>
        <CardDescription>
          작업 이미지, 발표 자료(PDF), 데모 영상, 외부 링크를 최대{" "}
          {PORTFOLIO_MAX_ITEMS}개까지 등록할 수 있습니다. 드래그하여 표시 순서를
          변경할 수 있습니다.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {fields.map((field, index) => {
          const kind = watch(`portfolio_items.${index}.kind`) ?? "link";
          const url = watch(`portfolio_items.${index}.url`);
          const fieldErrors = errors.portfolio_items?.[index];

          return (
            <SortableItem
              key={field.id}
              index={index}
              disabled={fields.length < 2}
              onMove={(from, to) => {
                move(from, to);
                onBlurSave();
              }}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">
                    {KIND_LABELS[kind]} {index + 1}
                  </h3>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemove(index)}
                  >
                    삭제
                  </Button>
                </div>

                {kind === "image" || kind === "file" ? (
                  <PortfolioField
                    label="파일"
                    error={fieldErrors?.url?.message}
                  >
                    <input
                      type="file"
                      accept={PORTFOLIO_ACCEPT_BY_KIND[kind]}
                      disabled={uploadingIndex === index}
                      onChange={(event) => handleFileChange(index, kind, event)}
                      className="block w-full text-sm file:mr-3 file:rounded-md file:border file:border-input file:bg-transparent file:px-3 file:py-1.5 file:text-sm"
                    />
                    {uploadingIndex === index ? (
                      <p className="text-xs text-muted-foreground">
                        업로드 중…
                      </p>
                    ) : url ? (
                      <p className="truncate text-xs text-muted-foreground">
                        업로드됨: {url}
                      </p>
                    ) : null}
                  </PortfolioField>
                ) : (
                  <PortfolioField
                    label={kind === "video" ? "동영상 주소" : "링크 주소"}
                    error={fieldErrors?.url?.message}
                  >
                    <Input
                      {...register(`portfolio_items.${index}.url`)}
                      onBlur={onBlurSave}
                      placeholder={
                        kind === "video"
                          ? "https://www.youtube.com/watch?v=..."
                          : "https://..."
                      }
                    />
                  </PortfolioField>
                )}

                <PortfolioField
                  label="제목"
                  error={fieldErrors?.title?.message}
                >
                  <Input
                    {...register(`portfolio_items.${index}.title`)}
                    onBlur={onBlurSave}
                    placeholder="대시보드 리디자인"
                  />
                </PortfolioField>

                <PortfolioField
                  label="설명 (선택)"
                  error={fieldErrors?.description?.message}
                >
                  <Input
                    {...register(`portfolio_items.${index}.description`)}
                    onBlur={onBlurSave}
                    placeholder="사용 기술, 맡은 역할, 성과를 한 줄로"
                  />
                </PortfolioField>
              </div>
            </SortableItem>
          );
        })}

        {uploadError ? (
          <p className="text-xs text-destructive">{uploadError}</p>
        ) : null}

        {errors.portfolio_items?.message ? (
          <p className="text-xs text-destructive">
            {errors.portfolio_items.message as string}
          </p>
        ) : null}

        {fields.length < PORTFOLIO_MAX_ITEMS ? (
          <div className="flex flex-wrap gap-2">
            {ADD_BUTTONS.map(({ kind, label }) => (
              <Button
                key={kind}
                type="button"
                variant="outline"
                onClick={() => {
                  setUploadError(null);
                  append(defaultPortfolioItem(kind));
                }}
              >
                {label}
              </Button>
            ))}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

function PortfolioField({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>
      {children}
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}

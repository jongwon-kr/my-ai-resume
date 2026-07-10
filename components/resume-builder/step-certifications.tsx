"use client";

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
  CERTIFICATION_CATEGORIES,
  defaultCertificationItem,
  type ResumeFormValues,
} from "@/lib/resume/schema";
import { cn } from "@/lib/utils";

interface StepCertificationsProps {
  onBlurSave: () => void;
}

export function StepCertifications({ onBlurSave }: StepCertificationsProps) {
  const {
    control,
    register,
    formState: { errors },
  } = useFormContext<ResumeFormValues>();

  const { fields, append, remove, move } = useFieldArray({
    control,
    name: "certifications",
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>자격 · 어학 · 수상</CardTitle>
        <CardDescription>
          자격증, 어학 성적, 수상 내역을 분류별로 입력하세요. 항목 2개 이상일 때
          카드 왼쪽 ⋮⋮ 핸들로 순서를 변경할 수 있습니다.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {fields.map((field, index) => (
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
                <h3 className="font-medium">항목 {index + 1}</h3>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => remove(index)}
                >
                  삭제
                </Button>
              </div>

              <ItemField label="분류">
                <select
                  {...register(`certifications.${index}.category`)}
                  onBlur={onBlurSave}
                  className={cn(
                    "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm",
                    "ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  )}
                >
                  {CERTIFICATION_CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </ItemField>

              <ItemField
                label="항목명"
                error={errors.certifications?.[index]?.name?.message}
              >
                <Input
                  {...register(`certifications.${index}.name`)}
                  onBlur={onBlurSave}
                  placeholder="정보처리기사 / TOEIC 900 / 우수상"
                />
              </ItemField>

              <div className="grid gap-4 sm:grid-cols-2">
                <ItemField label="발급기관 / 기관">
                  <Input
                    {...register(`certifications.${index}.issuer`)}
                    onBlur={onBlurSave}
                    placeholder="한국산업인력공단 / ETS"
                  />
                </ItemField>
                <ItemField label="취득일 / 일자">
                  <Input
                    {...register(`certifications.${index}.acquired_date`)}
                    onBlur={onBlurSave}
                    placeholder="2021.08"
                  />
                </ItemField>
              </div>
            </div>
          </SortableItem>
        ))}

        {fields.length < 20 ? (
          <Button
            type="button"
            variant="outline"
            onClick={() => append(defaultCertificationItem())}
          >
            항목 추가
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}

function ItemField({
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

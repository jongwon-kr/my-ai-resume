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
  defaultEducationItem,
  type ResumeFormValues,
} from "@/lib/resume/schema";

interface StepEducationProps {
  onBlurSave: () => void;
}

export function StepEducation({ onBlurSave }: StepEducationProps) {
  const {
    control,
    register,
    formState: { errors },
  } = useFormContext<ResumeFormValues>();

  const { fields, append, remove, move } = useFieldArray({
    control,
    name: "education",
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>학력</CardTitle>
        <CardDescription>
          학교, 전공, 학위, 상태, 기간을 입력하세요. 항목 2개 이상일 때
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
                <h3 className="font-medium">학력 {index + 1}</h3>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => remove(index)}
                >
                  삭제
                </Button>
              </div>

              <ItemField
                label="학교명"
                error={errors.education?.[index]?.school?.message}
              >
                <Input
                  {...register(`education.${index}.school`)}
                  onBlur={onBlurSave}
                  placeholder="클론대학교"
                />
              </ItemField>

              <div className="grid gap-4 sm:grid-cols-2">
                <ItemField label="전공">
                  <Input
                    {...register(`education.${index}.major`)}
                    onBlur={onBlurSave}
                    placeholder="컴퓨터공학"
                  />
                </ItemField>
                <ItemField label="학위">
                  <Input
                    {...register(`education.${index}.degree`)}
                    onBlur={onBlurSave}
                    placeholder="학사"
                  />
                </ItemField>
                <ItemField label="상태">
                  <Input
                    {...register(`education.${index}.status`)}
                    onBlur={onBlurSave}
                    placeholder="졸업 / 재학 / 휴학"
                  />
                </ItemField>
                <ItemField label="기간">
                  <Input
                    {...register(`education.${index}.period`)}
                    onBlur={onBlurSave}
                    placeholder="2016.03 - 2020.02"
                  />
                </ItemField>
              </div>
            </div>
          </SortableItem>
        ))}

        {fields.length < 10 ? (
          <Button
            type="button"
            variant="outline"
            onClick={() => append(defaultEducationItem())}
          >
            학력 추가
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

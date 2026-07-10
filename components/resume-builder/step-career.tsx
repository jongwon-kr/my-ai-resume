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
import { defaultCareerItem, type ResumeFormValues } from "@/lib/resume/schema";

interface StepCareerProps {
  onBlurSave: () => void;
}

export function StepCareer({ onBlurSave }: StepCareerProps) {
  const {
    control,
    register,
    formState: { errors },
  } = useFormContext<ResumeFormValues>();

  const { fields, append, remove, move } = useFieldArray({
    control,
    name: "careers",
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>경력</CardTitle>
        <CardDescription>
          항목 2개 이상일 때 카드 왼쪽 ⋮⋮ 핸들을 드래그해 표시 순서를 변경할 수
          있습니다.
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
                <h3 className="font-medium">경력 {index + 1}</h3>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => remove(index)}
                >
                  삭제
                </Button>
              </div>

              <CareerField
                label="회사명"
                error={errors.careers?.[index]?.company?.message}
              >
                <Input
                  {...register(`careers.${index}.company`)}
                  onBlur={onBlurSave}
                  placeholder="클론컴퍼니"
                />
              </CareerField>

              <div className="grid gap-4 sm:grid-cols-2">
                <CareerField label="직위 / 직책">
                  <Input
                    {...register(`careers.${index}.position`)}
                    onBlur={onBlurSave}
                    placeholder="백엔드 엔지니어"
                  />
                </CareerField>
                <CareerField label="기간">
                  <Input
                    {...register(`careers.${index}.period`)}
                    onBlur={onBlurSave}
                    placeholder="2022.03 - 2024.06"
                  />
                </CareerField>
              </div>

              <CareerField label="담당 업무 / 성과">
                <TextArea
                  {...register(`careers.${index}.description`)}
                  onBlur={onBlurSave}
                />
              </CareerField>
            </div>
          </SortableItem>
        ))}

        {fields.length < 10 ? (
          <Button
            type="button"
            variant="outline"
            onClick={() => append(defaultCareerItem())}
          >
            경력 추가
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}

function CareerField({
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

function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      rows={4}
      className="w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
    />
  );
}

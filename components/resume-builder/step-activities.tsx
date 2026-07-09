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
  defaultActivityItem,
  type ResumeFormValues,
} from "@/lib/resume/schema";

interface StepActivitiesProps {
  onBlurSave: () => void;
}

export function StepActivities({ onBlurSave }: StepActivitiesProps) {
  const {
    control,
    register,
    formState: { errors },
  } = useFormContext<ResumeFormValues>();

  const { fields, append, remove, move } = useFieldArray({
    control,
    name: "activities",
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>경험 / 활동 / 교육</CardTitle>
        <CardDescription>
          인턴, 동아리, 봉사, 교육 과정 등 경력 외 활동을 입력하세요. 드래그하여
          표시 순서를 변경할 수 있습니다. (선택)
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
                <h3 className="font-medium">활동 {index + 1}</h3>
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
                label="활동명"
                error={errors.activities?.[index]?.title?.message}
              >
                <Input
                  {...register(`activities.${index}.title`)}
                  onBlur={onBlurSave}
                  placeholder="오픈소스 컨트리뷰터 / 해커톤 우승"
                />
              </ItemField>

              <div className="grid gap-4 sm:grid-cols-2">
                <ItemField label="기관 / 단체">
                  <Input
                    {...register(`activities.${index}.organization`)}
                    onBlur={onBlurSave}
                    placeholder="클론컴퍼니 / 클론대학교 동아리"
                  />
                </ItemField>
                <ItemField label="기간">
                  <Input
                    {...register(`activities.${index}.period`)}
                    onBlur={onBlurSave}
                    placeholder="2023.06 - 2023.08"
                  />
                </ItemField>
              </div>

              <ItemField label="설명">
                <TextArea
                  {...register(`activities.${index}.description`)}
                  onBlur={onBlurSave}
                  placeholder="담당 역할, 성과, 배운 점 등"
                />
              </ItemField>
            </div>
          </SortableItem>
        ))}

        {fields.length < 20 ? (
          <Button
            type="button"
            variant="outline"
            onClick={() => append(defaultActivityItem())}
          >
            활동 추가
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

function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      rows={3}
      className="w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
    />
  );
}

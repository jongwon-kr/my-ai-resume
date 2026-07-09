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
import {
  defaultCoverLetterItem,
  type ResumeFormValues,
} from "@/lib/resume/schema";

interface StepCoverLetterProps {
  onBlurSave: () => void;
}

export function StepCoverLetter({ onBlurSave }: StepCoverLetterProps) {
  const {
    control,
    register,
    watch,
    formState: { errors },
  } = useFormContext<ResumeFormValues>();

  const { fields, append, remove } = useFieldArray({
    control,
    name: "cover_letters",
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>자기소개서</CardTitle>
        <CardDescription>
          항목별 제목과 내용을 입력하세요. (선택)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {fields.map((field, index) => (
          <div key={field.id} className="space-y-4 rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">자기소개서 {index + 1}</h3>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => remove(index)}
              >
                삭제
              </Button>
            </div>

            <CoverLetterField
              label="제목"
              error={errors.cover_letters?.[index]?.title?.message}
            >
              <Input
                {...register(`cover_letters.${index}.title`)}
                onBlur={onBlurSave}
                placeholder="지원 동기"
              />
            </CoverLetterField>

            <CoverLetterField label="내용">
              <TextArea
                {...register(`cover_letters.${index}.content`)}
                onBlur={onBlurSave}
              />
              <CharCount
                value={watch(`cover_letters.${index}.content`)}
                max={2000}
              />
            </CoverLetterField>
          </div>
        ))}

        {fields.length < 10 ? (
          <Button
            type="button"
            variant="outline"
            onClick={() => append(defaultCoverLetterItem())}
          >
            자기소개서 추가
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}

function CoverLetterField({
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
      rows={6}
      className="w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
    />
  );
}

function CharCount({ value, max }: { value?: string; max: number }) {
  return (
    <p className="text-right text-xs text-muted-foreground">
      {value?.length ?? 0}/{max}
    </p>
  );
}

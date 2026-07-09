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
import { defaultFaqItem, type ResumeFormValues } from "@/lib/resume/schema";

interface StepOwnerFaqProps {
  onBlurSave: () => void;
}

export function StepOwnerFaq({ onBlurSave }: StepOwnerFaqProps) {
  const {
    control,
    register,
    formState: { errors },
  } = useFormContext<ResumeFormValues>();

  const { fields, append, remove } = useFieldArray({
    control,
    name: "owner_faqs",
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>예상 질문 답변</CardTitle>
        <CardDescription>
          면접관이 물어볼 만한 질문과, AI 클론이 우선적으로 사용할 답변을 미리
          작성하세요. 공개 페이지에는 노출되지 않고 챗봇 답변에만 사용됩니다.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {fields.map((field, index) => (
          <div key={field.id} className="space-y-4 rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Q&A {index + 1}</h3>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => remove(index)}
              >
                삭제
              </Button>
            </div>

            <FaqField
              label="예상 질문"
              error={errors.owner_faqs?.[index]?.question?.message}
            >
              <Input
                {...register(`owner_faqs.${index}.question`)}
                onBlur={onBlurSave}
                placeholder="이 직무에 지원한 이유가 무엇인가요?"
              />
            </FaqField>

            <FaqField
              label="준비한 답변"
              error={errors.owner_faqs?.[index]?.answer?.message}
            >
              <TextArea
                {...register(`owner_faqs.${index}.answer`)}
                onBlur={onBlurSave}
              />
            </FaqField>
          </div>
        ))}

        {fields.length < 20 ? (
          <Button
            type="button"
            variant="outline"
            onClick={() => append(defaultFaqItem())}
          >
            질문 추가
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}

function FaqField({
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

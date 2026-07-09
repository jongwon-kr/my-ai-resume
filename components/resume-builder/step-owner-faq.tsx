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
import { ChatPreviewPanel } from "@/components/resume-builder/chat-preview-panel";
import { defaultFaqItem, type ResumeFormValues } from "@/lib/resume/schema";
import { useResumeBuilderStore } from "@/stores/resume-builder-store";

interface StepOwnerFaqProps {
  onBlurSave: () => void;
}

export function StepOwnerFaq({ onBlurSave }: StepOwnerFaqProps) {
  const profileId = useResumeBuilderStore((state) => state.profileId);
  const {
    control,
    register,
    watch,
    formState: { errors },
  } = useFormContext<ResumeFormValues>();

  const profileName = watch("name") || "지원자";

  const { fields, append, remove, move } = useFieldArray({
    control,
    name: "owner_faqs",
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>예상 질문 답변</CardTitle>
        <CardDescription>
          면접관이 물어볼 만한 질문과 AI 클론이 우선 사용할 답변을 미리
          작성하세요. 질문 문장이 조금 달라도(예: &quot;지원 이유&quot; ↔
          &quot;왜 지원했어요&quot;) 의미가 같으면 매칭됩니다. 공개 페이지에는
          노출되지 않고 챗봇 답변에만 사용됩니다.
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
          </SortableItem>
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

        {profileId ? (
          <ChatPreviewPanel profileId={profileId} profileName={profileName} />
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

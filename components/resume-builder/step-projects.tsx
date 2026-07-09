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
import { defaultProjectItem, type ResumeFormValues } from "@/lib/resume/schema";

interface StepProjectsProps {
  onBlurSave: () => void;
}

export function StepProjects({ onBlurSave }: StepProjectsProps) {
  const {
    control,
    register,
    watch,
    formState: { errors },
  } = useFormContext<ResumeFormValues>();

  const { fields, append, remove, move } = useFieldArray({
    control,
    name: "projects",
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>프로젝트</CardTitle>
        <CardDescription>
          최대 3개까지 STAR + 트러블슈팅 구조로 입력하세요. 드래그하여 표시
          순서를 변경할 수 있습니다.
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
                <h3 className="font-medium">프로젝트 {index + 1}</h3>
                {fields.length > 1 ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => remove(index)}
                  >
                    삭제
                  </Button>
                ) : null}
              </div>

            <ProjectField
              label="프로젝트명"
              error={errors.projects?.[index]?.title?.message}
            >
              <Input
                {...register(`projects.${index}.title`)}
                onBlur={onBlurSave}
              />
            </ProjectField>

            <div className="grid gap-4 sm:grid-cols-2">
              <ProjectField
                label="기간"
                error={errors.projects?.[index]?.period?.message}
              >
                <Input
                  {...register(`projects.${index}.period`)}
                  onBlur={onBlurSave}
                  placeholder="2024.01 - 2024.06"
                />
              </ProjectField>
              <ProjectField
                label="역할"
                error={errors.projects?.[index]?.role?.message}
              >
                <Input
                  {...register(`projects.${index}.role`)}
                  onBlur={onBlurSave}
                  placeholder="프론트엔드 리드"
                />
              </ProjectField>
            </div>

            <ProjectField
              label="사용 기술"
              error={errors.projects?.[index]?.tech_stack?.message}
            >
              <Input
                {...register(`projects.${index}.tech_stack`)}
                onBlur={onBlurSave}
                placeholder="Next.js, TypeScript, Supabase"
              />
            </ProjectField>

            <ProjectField
              label="상황 / 과제"
              error={errors.projects?.[index]?.situation?.message}
            >
              <TextArea
                {...register(`projects.${index}.situation`)}
                onBlur={onBlurSave}
              />
              <CharCount
                value={watch(`projects.${index}.situation`)}
                max={1000}
              />
            </ProjectField>

            <ProjectField
              label="수행 내용"
              error={errors.projects?.[index]?.actions?.message}
            >
              <TextArea
                {...register(`projects.${index}.actions`)}
                onBlur={onBlurSave}
              />
              <CharCount
                value={watch(`projects.${index}.actions`)}
                max={1000}
              />
            </ProjectField>

            <ProjectField
              label="성과"
              error={errors.projects?.[index]?.results?.message}
            >
              <TextArea
                {...register(`projects.${index}.results`)}
                onBlur={onBlurSave}
              />
              <CharCount
                value={watch(`projects.${index}.results`)}
                max={1000}
              />
            </ProjectField>

            <ProjectField
              label="트러블슈팅 (문제 → 원인 → 해결 → 결과)"
              error={errors.projects?.[index]?.troubleshooting?.message}
            >
              <TextArea
                {...register(`projects.${index}.troubleshooting`)}
                onBlur={onBlurSave}
              />
              <CharCount
                value={watch(`projects.${index}.troubleshooting`)}
                max={1000}
              />
            </ProjectField>
            </div>
          </SortableItem>
        ))}

        {errors.projects?.message ? (
          <p className="text-xs text-destructive">
            {errors.projects.message as string}
          </p>
        ) : null}

        {fields.length < 3 ? (
          <Button
            type="button"
            variant="outline"
            onClick={() => append(defaultProjectItem())}
          >
            프로젝트 추가
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}

function ProjectField({
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

function CharCount({ value, max }: { value: string; max: number }) {
  return (
    <p className="text-right text-xs text-muted-foreground">
      {value?.length ?? 0}/{max}
    </p>
  );
}

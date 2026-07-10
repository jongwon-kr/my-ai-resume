"use client";

import { useFormContext } from "react-hook-form";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SkillTagInput } from "@/components/resume-builder/skill-tag-input";
import type { ResumeFormValues } from "@/lib/resume/schema";

interface StepSkillsProps {
  onBlurSave: () => void;
}

export function StepSkills({ onBlurSave }: StepSkillsProps) {
  const {
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<ResumeFormValues>();

  const skills = watch("skills");

  return (
    <Card>
      <CardHeader>
        <CardTitle>기술 스택</CardTitle>
        <CardDescription>
          태그 형태로 추가하고 숙련도를 선택하세요. 기술 2개 이상일 때 왼쪽 ⋮⋮
          핸들로 표시 순서를 변경할 수 있습니다.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <SkillTagInput
          skills={skills}
          onChange={(nextSkills) =>
            setValue("skills", nextSkills, { shouldDirty: true })
          }
          onBlur={onBlurSave}
        />
        {((errors.skills?.root?.message as string | undefined) ??
        (errors.skills?.message as string | undefined)) ? (
          <p className="mt-2 text-xs text-destructive">
            {(errors.skills?.root?.message as string | undefined) ??
              (errors.skills?.message as string | undefined)}
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}

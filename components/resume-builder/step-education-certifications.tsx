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
  defaultCertificationItem,
  defaultEducationItem,
  type ResumeFormValues,
} from "@/lib/resume/schema";

interface StepEducationCertificationsProps {
  onBlurSave: () => void;
}

export function StepEducationCertifications({
  onBlurSave,
}: StepEducationCertificationsProps) {
  const {
    control,
    register,
    formState: { errors },
  } = useFormContext<ResumeFormValues>();

  const education = useFieldArray({ control, name: "education" });
  const certifications = useFieldArray({ control, name: "certifications" });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>학력</CardTitle>
          <CardDescription>
            학교, 전공, 학위, 상태, 기간을 입력하세요. (선택)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {education.fields.map((field, index) => (
            <div key={field.id} className="space-y-4 rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">학력 {index + 1}</h3>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => education.remove(index)}
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
          ))}

          {education.fields.length < 10 ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => education.append(defaultEducationItem())}
            >
              학력 추가
            </Button>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>자격증</CardTitle>
          <CardDescription>
            자격증명, 발급기관, 취득일을 입력하세요. (선택)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {certifications.fields.map((field, index) => (
            <div key={field.id} className="space-y-4 rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">자격증 {index + 1}</h3>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => certifications.remove(index)}
                >
                  삭제
                </Button>
              </div>

              <ItemField
                label="자격증명"
                error={errors.certifications?.[index]?.name?.message}
              >
                <Input
                  {...register(`certifications.${index}.name`)}
                  onBlur={onBlurSave}
                  placeholder="정보처리기사"
                />
              </ItemField>

              <div className="grid gap-4 sm:grid-cols-2">
                <ItemField label="발급기관">
                  <Input
                    {...register(`certifications.${index}.issuer`)}
                    onBlur={onBlurSave}
                    placeholder="한국산업인력공단"
                  />
                </ItemField>
                <ItemField label="취득일">
                  <Input
                    {...register(`certifications.${index}.acquired_date`)}
                    onBlur={onBlurSave}
                    placeholder="2021.08"
                  />
                </ItemField>
              </div>
            </div>
          ))}

          {certifications.fields.length < 20 ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => certifications.append(defaultCertificationItem())}
            >
              자격증 추가
            </Button>
          ) : null}
        </CardContent>
      </Card>
    </div>
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

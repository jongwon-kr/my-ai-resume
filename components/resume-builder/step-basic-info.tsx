"use client";

import { useFormContext } from "react-hook-form";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { ResumeFormValues } from "@/lib/resume/schema";
import { uploadAvatar } from "@/lib/resume/persistence";
import { createClient } from "@/lib/supabase/client";
import { useResumeBuilderStore } from "@/stores/resume-builder-store";

interface StepBasicInfoProps {
  onBlurSave: () => void;
}

export function StepBasicInfo({ onBlurSave }: StepBasicInfoProps) {
  const profileId = useResumeBuilderStore((state) => state.profileId);
  const {
    register,
    setValue,
    watch,
    formState: { errors },
  } = useFormContext<ResumeFormValues>();

  const avatarUrl = watch("avatar_url");

  async function handleAvatarChange(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0];
    if (!file || !profileId) {
      return;
    }

    try {
      const supabase = createClient();
      const publicUrl = await uploadAvatar(supabase, profileId, file);
      setValue("avatar_url", publicUrl, { shouldDirty: true });
      onBlurSave();
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>기본 정보</CardTitle>
        <CardDescription>이름, 직무, 한줄소개, 프로필 사진</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Field label="이름" error={errors.name?.message}>
          <Input
            {...register("name")}
            onBlur={onBlurSave}
            placeholder="홍길동"
          />
        </Field>

        <Field label="직무" error={errors.role_title?.message}>
          <Input
            {...register("role_title")}
            onBlur={onBlurSave}
            placeholder="프론트엔드 개발자"
          />
        </Field>

        <Field label="한줄소개" error={errors.intro?.message}>
          <textarea
            {...register("intro")}
            onBlur={onBlurSave}
            rows={3}
            placeholder="3년차 React/Next.js 개발자입니다."
            className="w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          />
          <CharCount value={watch("intro")} max={200} />
        </Field>

        <Field label="프로필 사진 (선택)">
          <Input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={handleAvatarChange}
          />
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={avatarUrl}
              alt="프로필 미리보기"
              className="mt-2 size-20 rounded-full object-cover"
            />
          ) : null}
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="출생연도 (선택)" error={errors.birth_year?.message}>
            <Input
              type="number"
              {...register("birth_year", {
                setValueAs: (value) =>
                  value === "" || value === null || value === undefined
                    ? undefined
                    : Number(value),
              })}
              onBlur={onBlurSave}
              placeholder="1995"
            />
          </Field>
          <Field label="연락처 (선택)" error={errors.phone?.message}>
            <Input
              {...register("phone")}
              onBlur={onBlurSave}
              placeholder="010-1234-5678"
            />
          </Field>
          <Field
            label="공개 이메일 (선택)"
            error={errors.public_email?.message}
          >
            <Input
              {...register("public_email")}
              onBlur={onBlurSave}
              placeholder="me@example.com"
            />
          </Field>
          <Field label="지역 (선택)" error={errors.location?.message}>
            <Input
              {...register("location")}
              onBlur={onBlurSave}
              placeholder="서울"
            />
          </Field>
        </div>

        <Field label="GitHub (선택)" error={errors.github_url?.message}>
          <Input
            {...register("github_url")}
            onBlur={onBlurSave}
            placeholder="https://github.com/username"
          />
        </Field>
        <Field label="LinkedIn (선택)" error={errors.linkedin_url?.message}>
          <Input
            {...register("linkedin_url")}
            onBlur={onBlurSave}
            placeholder="https://linkedin.com/in/username"
          />
        </Field>
        <Field label="블로그 (선택)" error={errors.blog_url?.message}>
          <Input
            {...register("blog_url")}
            onBlur={onBlurSave}
            placeholder="https://blog.example.com"
          />
        </Field>
      </CardContent>
    </Card>
  );
}

function Field({
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

function CharCount({ value, max }: { value: string; max: number }) {
  return (
    <p className="text-right text-xs text-muted-foreground">
      {value?.length ?? 0}/{max}
    </p>
  );
}

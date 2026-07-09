"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useFormContext } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { ResumeFormValues } from "@/lib/resume/schema";
import { generateSystemPrompt } from "@/lib/resume/publish";
import { useResumeBuilderStore } from "@/stores/resume-builder-store";

interface StepPreviewProps {
  persistDraft: (values: ResumeFormValues) => Promise<void>;
}

export function StepPreview({ persistDraft }: StepPreviewProps) {
  const router = useRouter();
  const { getValues } = useFormContext<ResumeFormValues>();
  const profileId = useResumeBuilderStore((state) => state.profileId);
  const slug = useResumeBuilderStore((state) => state.slug);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const values = getValues();

  async function handlePublish() {
    if (!profileId) {
      return;
    }

    setPublishing(true);
    setError(null);

    try {
      await persistDraft(values);
      await generateSystemPrompt(profileId);
      router.push("/dashboard");
      router.refresh();
    } catch (publishError) {
      setError(
        publishError instanceof Error
          ? publishError.message
          : "발행에 실패했습니다.",
      );
      setPublishing(false);
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>미리보기</CardTitle>
          <CardDescription>
            발행 전 입력 내용을 확인하세요. 공개 URL: @{slug}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <section className="space-y-2">
            <h3 className="text-lg font-semibold">{values.name}</h3>
            <p className="text-sm text-muted-foreground">{values.role_title}</p>
            <p>{values.intro}</p>
            {values.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={values.avatar_url}
                alt={values.name}
                className="size-16 rounded-full object-cover"
              />
            ) : null}
          </section>

          <section>
            <h4 className="mb-2 font-medium">기술 스택</h4>
            <div className="flex flex-wrap gap-2">
              {values.skills
                .filter((skill) => skill.name.trim())
                .map((skill) => (
                  <span
                    key={skill.name}
                    className="rounded-full bg-secondary px-3 py-1 text-sm"
                  >
                    {skill.name}
                    {skill.proficiency ? ` · ${skill.proficiency}` : ""}
                  </span>
                ))}
            </div>
          </section>

          <section className="space-y-4">
            <h4 className="font-medium">프로젝트</h4>
            {values.projects
              .filter((project) => project.title.trim())
              .map((project, index) => (
                <div
                  key={`${project.title}-${index}`}
                  className="rounded-lg border p-4"
                >
                  <p className="font-medium">{project.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {project.period} · {project.role}
                  </p>
                  <p className="mt-2 text-sm">{project.tech_stack}</p>
                  <dl className="mt-3 space-y-2 text-sm">
                    <PreviewItem label="상황/과제" value={project.situation} />
                    <PreviewItem label="수행" value={project.actions} />
                    <PreviewItem label="성과" value={project.results} />
                    <PreviewItem
                      label="트러블슈팅"
                      value={project.troubleshooting}
                    />
                  </dl>
                </div>
              ))}
          </section>
        </CardContent>
      </Card>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <Button
        type="button"
        className="w-full"
        disabled={publishing}
        onClick={handlePublish}
      >
        {publishing ? "발행 중..." : "발행하기"}
      </Button>
    </div>
  );
}

function PreviewItem({ label, value }: { label: string; value: string }) {
  if (!value?.trim()) {
    return null;
  }

  return (
    <div>
      <dt className="font-medium text-muted-foreground">{label}</dt>
      <dd className="mt-1 whitespace-pre-wrap">{value}</dd>
    </div>
  );
}

import { redirect } from "next/navigation";

import { PageBreadcrumb } from "@/components/layout/page-breadcrumb";
import { ResumeBuilderClient } from "@/components/resume-builder/resume-builder-client";
import { isPendingSlug } from "@/lib/auth/constants";
import { assertProfileOwner } from "@/lib/profile/ownership";
import {
  defaultResumeFormValues,
  type ResumeFormValues,
} from "@/lib/resume/schema";
import { loadResumeFormData } from "@/lib/resume/persistence";
import { createClient } from "@/lib/supabase/server";
import type { ProfileStatus } from "@/types/database";

interface DashboardEditPageProps {
  params: Promise<{ profileId: string }>;
}

export default async function DashboardEditPage({
  params,
}: DashboardEditPageProps) {
  const { profileId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  try {
    await assertProfileOwner(supabase, profileId, user.id);
  } catch {
    redirect("/dashboard");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("slug, status")
    .eq("id", profileId)
    .single();

  if (!profile || isPendingSlug(profile.slug)) {
    redirect("/onboarding");
  }

  const loaded = await loadResumeFormData(supabase, profileId);
  const initialValues: ResumeFormValues = loaded ?? defaultResumeFormValues;

  return (
    <div className="mx-auto w-full max-w-5xl flex-1 p-6">
      <PageBreadcrumb
        items={[
          { label: "홈", href: "/" },
          { label: "대시보드", href: `/dashboard?profile=${profileId}` },
          { label: "프로필 편집" },
        ]}
      />
      <div className="mb-8">
        <h1 className="text-2xl font-semibold">프로필 편집</h1>
        <p className="text-muted-foreground">
          섹션별로 이력서 정보를 입력하고 발행하세요.
        </p>
      </div>

      <ResumeBuilderClient
        profileId={profileId}
        slug={profile.slug}
        profileStatus={profile.status as ProfileStatus}
        initialValues={initialValues}
      />
    </div>
  );
}

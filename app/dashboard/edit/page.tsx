import { redirect } from "next/navigation";

import { ResumeBuilderClient } from "@/components/resume-builder/resume-builder-client";
import { isPendingSlug } from "@/lib/auth/constants";
import {
  defaultResumeFormValues,
  type ResumeFormValues,
} from "@/lib/resume/schema";
import { loadResumeFormData } from "@/lib/resume/persistence";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardEditPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("slug")
    .eq("id", user.id)
    .single();

  if (!profile || isPendingSlug(profile.slug)) {
    redirect("/onboarding");
  }

  const loaded = await loadResumeFormData(supabase, user.id);
  const initialValues: ResumeFormValues = loaded ?? defaultResumeFormValues;

  return (
    <div className="mx-auto w-full max-w-3xl flex-1 p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold">프로필 편집</h1>
        <p className="text-muted-foreground">
          4단계 멀티스텝 폼으로 이력서 정보를 입력하세요.
        </p>
      </div>

      <ResumeBuilderClient
        profileId={user.id}
        slug={profile.slug}
        initialValues={initialValues}
      />
    </div>
  );
}

import { redirect } from "next/navigation";

import { DashboardTabs } from "@/components/dashboard/dashboard-tabs";
import { PageBreadcrumb } from "@/components/layout/page-breadcrumb";
import { isPendingSlug } from "@/lib/auth/constants";
import { loadDashboardData } from "@/lib/dashboard/queries";
import { getResumeCompletion } from "@/lib/resume/completion";
import { defaultResumeFormValues } from "@/lib/resume/schema";
import { loadResumeFormData } from "@/lib/resume/persistence";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
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

  const [dashboardData, resumeValues] = await Promise.all([
    loadDashboardData(supabase, user.id),
    loadResumeFormData(supabase, user.id),
  ]);

  const completion = getResumeCompletion(
    resumeValues ?? defaultResumeFormValues,
  );

  return (
    <div className="mx-auto w-full max-w-5xl flex-1 p-6">
      <PageBreadcrumb
        items={[{ label: "홈", href: "/" }, { label: "대시보드" }]}
      />
      <div className="mb-8">
        <h1 className="text-2xl font-semibold">대시보드</h1>
        <p className="text-muted-foreground">
          프로필 관리, 방문자 대화, 통계를 확인하세요.
        </p>
      </div>

      <DashboardTabs data={{ ...dashboardData, completion }} />
    </div>
  );
}

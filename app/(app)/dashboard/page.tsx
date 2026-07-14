import { redirect } from "next/navigation";

import { DashboardTabs } from "@/components/dashboard/dashboard-tabs";
import { ProfileSwitcher } from "@/components/dashboard/profile-switcher";
import { PageBreadcrumb } from "@/components/layout/page-breadcrumb";
import { loadDashboardData } from "@/lib/dashboard/queries";
import {
  canCreateProfile,
  listUserProfiles,
  resolveDashboardProfileId,
  userNeedsOnboarding,
} from "@/lib/profile/queries";
import { getResumeCompletion } from "@/lib/resume/completion";
import { defaultResumeFormValues } from "@/lib/resume/schema";
import { loadResumeFormData } from "@/lib/resume/persistence";
import { createClient } from "@/lib/supabase/server";

interface DashboardPageProps {
  searchParams: Promise<{ profile?: string }>;
}

export default async function DashboardPage({
  searchParams,
}: DashboardPageProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  if (await userNeedsOnboarding(supabase, user.id)) {
    redirect("/onboarding");
  }

  const { profile: profileParam } = await searchParams;
  const profiles = await listUserProfiles(supabase, user.id);
  const activeProfileId = await resolveDashboardProfileId(
    supabase,
    user.id,
    profileParam,
  );

  if (!activeProfileId) {
    redirect("/onboarding");
  }

  const [dashboardData, resumeValues] = await Promise.all([
    loadDashboardData(supabase, activeProfileId),
    loadResumeFormData(supabase, activeProfileId),
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

      <ProfileSwitcher
        profiles={profiles}
        activeProfileId={activeProfileId}
        canCreate={canCreateProfile(profiles.length)}
      />

      <DashboardTabs data={{ ...dashboardData, completion }} />
    </div>
  );
}

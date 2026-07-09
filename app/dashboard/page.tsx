import { redirect } from "next/navigation";

import { DashboardTabs } from "@/components/dashboard/dashboard-tabs";
import { isPendingSlug } from "@/lib/auth/constants";
import { loadDashboardData } from "@/lib/dashboard/queries";
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

  const dashboardData = await loadDashboardData(supabase, user.id);

  return (
    <div className="mx-auto w-full max-w-5xl flex-1 p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold">대시보드</h1>
        <p className="text-muted-foreground">
          프로필 관리, 방문자 대화, 통계를 확인하세요.
        </p>
      </div>

      <DashboardTabs data={dashboardData} />
    </div>
  );
}

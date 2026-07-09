import { redirect } from "next/navigation";

import { AdminReportsPanel } from "@/components/admin/admin-reports-panel";
import { isAdminUser } from "@/lib/auth/admin";
import { loadAdminReports } from "@/lib/admin/queries";
import { createClient } from "@/lib/supabase/server";

export default async function AdminPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  if (!isAdminUser(user)) {
    redirect("/dashboard");
  }

  const reports = await loadAdminReports(supabase);

  return (
    <div className="mx-auto w-full max-w-4xl flex-1 p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold">관리자 모더레이션</h1>
        <p className="text-muted-foreground">
          신고 목록을 확인하고 프로필을 강제 비공개 처리할 수 있습니다.
        </p>
      </div>

      <AdminReportsPanel initialReports={reports} />
    </div>
  );
}

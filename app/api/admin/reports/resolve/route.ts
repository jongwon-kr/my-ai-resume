import { isAdminUser } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";

export async function PATCH(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user || !isAdminUser(user)) {
      return Response.json({ error: "관리자 권한이 필요합니다." }, { status: 403 });
    }

    const body = (await request.json().catch(() => null)) as {
      reportId?: string;
    } | null;

    if (!body?.reportId) {
      return Response.json(
        { error: "신고 ID가 필요합니다." },
        { status: 400 },
      );
    }

    const { data, error } = await supabase
      .from("reports")
      .update({
        status: "resolved",
        resolved_at: new Date().toISOString(),
        resolved_by: user.id,
      })
      .eq("id", body.reportId)
      .select("id, status, resolved_at")
      .single();

    if (error || !data) {
      return Response.json(
        { error: "신고 처리 상태 변경에 실패했습니다." },
        { status: 500 },
      );
    }

    return Response.json({
      success: true,
      reportId: data.id,
      status: data.status,
      resolvedAt: data.resolved_at,
    });
  } catch (error) {
    console.error("[admin/reports/resolve] failed", error);
    return Response.json(
      { error: "요청 처리 중 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}

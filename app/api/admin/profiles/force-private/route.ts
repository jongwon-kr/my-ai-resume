import { isAdminUser } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";

export async function PATCH(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user || !isAdminUser(user)) {
      return Response.json(
        { error: "관리자 권한이 필요합니다." },
        { status: 403 },
      );
    }

    const body = (await request.json().catch(() => null)) as {
      profileId?: string;
    } | null;

    if (!body?.profileId) {
      return Response.json(
        { error: "프로필 ID가 필요합니다." },
        { status: 400 },
      );
    }

    const { data, error } = await supabase
      .from("profiles")
      .update({ is_private: true })
      .eq("id", body.profileId)
      .select("id, slug, is_private")
      .single();

    if (error || !data) {
      return Response.json(
        { error: "프로필 비공개 처리에 실패했습니다." },
        { status: 500 },
      );
    }

    return Response.json({
      success: true,
      profileId: data.id,
      slug: data.slug,
      isPrivate: data.is_private,
    });
  } catch (error) {
    console.error("[admin/force-private] failed", error);
    return Response.json(
      { error: "요청 처리 중 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}

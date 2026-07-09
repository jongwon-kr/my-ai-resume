import { API_ERROR_MESSAGE, parseJsonBody } from "@/lib/api/response";
import { createClient } from "@/lib/supabase/server";

export async function PATCH(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return Response.json({ error: "로그인이 필요합니다." }, { status: 401 });
    }

    const body = await parseJsonBody<{ isPrivate?: boolean }>(request);

    if (typeof body?.isPrivate !== "boolean") {
      return Response.json(
        { error: "요청 형식이 올바르지 않습니다." },
        { status: 400 },
      );
    }

    const { data, error } = await supabase
      .from("profiles")
      .update({ is_private: body.isPrivate })
      .eq("id", user.id)
      .select("is_private")
      .single();

    if (error || !data) {
      return Response.json(
        { error: "프로필 공개 설정 변경에 실패했습니다." },
        { status: 500 },
      );
    }

    return Response.json({ isPrivate: data.is_private });
  } catch (error) {
    console.error("[profile/privacy] failed", error);
    return Response.json({ error: API_ERROR_MESSAGE }, { status: 500 });
  }
}

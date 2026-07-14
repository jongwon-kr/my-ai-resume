import { API_ERROR_MESSAGE, parseJsonBody } from "@/lib/api/response";
import { normalizeProfileLabel } from "@/lib/profile/display";
import { assertProfileOwner } from "@/lib/profile/ownership";
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

    const body = await parseJsonBody<{
      profileId?: string;
      label?: string;
    }>(request);

    if (!body?.profileId || typeof body.label !== "string") {
      return Response.json(
        { error: "요청 형식이 올바르지 않습니다." },
        { status: 400 },
      );
    }

    await assertProfileOwner(supabase, body.profileId, user.id);

    const label = normalizeProfileLabel(body.label);

    const { data, error } = await supabase
      .from("profiles")
      .update({ label: label || null })
      .eq("id", body.profileId)
      .select("label")
      .single();

    if (error || !data) {
      return Response.json(
        { error: "프로필 라벨 저장에 실패했습니다." },
        { status: 500 },
      );
    }

    return Response.json({ label: data.label ?? "" });
  } catch (error) {
    if (error instanceof Error && error.name === "ProfileOwnershipError") {
      return Response.json(
        { error: "프로필에 접근할 수 없습니다." },
        { status: 403 },
      );
    }

    console.error("[profile/label] failed", error);
    return Response.json({ error: API_ERROR_MESSAGE }, { status: 500 });
  }
}

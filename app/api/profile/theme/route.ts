import { API_ERROR_MESSAGE, parseJsonBody } from "@/lib/api/response";
import { assertProfileOwner } from "@/lib/profile/ownership";
import { createClient } from "@/lib/supabase/server";
import { parseThemeConfig } from "@/lib/types/profile";
import type { Json } from "@/types/database";

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
      themeConfig?: unknown;
    }>(request);

    if (!body?.profileId) {
      return Response.json(
        { error: "요청 형식이 올바르지 않습니다." },
        { status: 400 },
      );
    }

    await assertProfileOwner(supabase, body.profileId, user.id);

    // Normalized rather than trusted: whatever the client sends is coerced back
    // onto the known union, so the column can only ever hold a valid config.
    const themeConfig = parseThemeConfig(body.themeConfig);

    const { error } = await supabase
      .from("profiles")
      .update({ theme_config: themeConfig as unknown as Json })
      .eq("id", body.profileId);

    if (error) {
      return Response.json(
        { error: "디자인 설정 저장에 실패했습니다." },
        { status: 500 },
      );
    }

    return Response.json({ themeConfig });
  } catch (error) {
    if (error instanceof Error && error.name === "ProfileOwnershipError") {
      return Response.json(
        { error: "프로필에 접근할 수 없습니다." },
        { status: 403 },
      );
    }

    console.error("[profile/theme] failed", error);
    return Response.json({ error: API_ERROR_MESSAGE }, { status: 500 });
  }
}

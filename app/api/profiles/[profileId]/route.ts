import { NextResponse } from "next/server";

import { API_ERROR_MESSAGE } from "@/lib/api/response";
import { assertProfileOwner } from "@/lib/profile/ownership";
import { listUserProfiles } from "@/lib/profile/queries";
import { createClient } from "@/lib/supabase/server";

interface RouteParams {
  params: Promise<{ profileId: string }>;
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  try {
    const { profileId } = await params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
    }

    await assertProfileOwner(supabase, profileId, user.id);

    const profiles = await listUserProfiles(supabase, user.id);

    if (profiles.length <= 1) {
      return NextResponse.json(
        { error: "마지막 프로필은 삭제할 수 없습니다." },
        { status: 400 },
      );
    }

    const { error } = await supabase.from("profiles").delete().eq("id", profileId);

    if (error) {
      return NextResponse.json(
        { error: error.message ?? "프로필 삭제에 실패했습니다." },
        { status: 500 },
      );
    }

    const remaining = profiles.filter((profile) => profile.id !== profileId);
    const nextProfileId = remaining[0]?.id ?? null;

    return NextResponse.json({ success: true, nextProfileId });
  } catch (error) {
    if (error instanceof Error && error.name === "ProfileOwnershipError") {
      return NextResponse.json({ error: "프로필에 접근할 수 없습니다." }, { status: 403 });
    }

    console.error("[profiles/DELETE] failed", error);
    return NextResponse.json({ error: API_ERROR_MESSAGE }, { status: 500 });
  }
}

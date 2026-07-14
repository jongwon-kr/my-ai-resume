import { NextResponse } from "next/server";

import { API_ERROR_MESSAGE } from "@/lib/api/response";
import { canCreateProfile, listUserProfiles } from "@/lib/profile/queries";
import { normalizeProfileLabel } from "@/lib/profile/display";
import { validateSlugFormat } from "@/lib/slug/validation";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "로그인이 필요합니다." },
        { status: 401 },
      );
    }

    const profiles = await listUserProfiles(supabase, user.id);

    return NextResponse.json({ profiles });
  } catch (error) {
    console.error("[profiles/GET] failed", error);
    return NextResponse.json({ error: API_ERROR_MESSAGE }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "로그인이 필요합니다." },
        { status: 401 },
      );
    }

    const body = (await request.json().catch(() => null)) as {
      slug?: string;
      label?: string;
    } | null;

    const slug = body?.slug?.trim().toLowerCase() ?? "";
    const label = body?.label ? normalizeProfileLabel(body.label) : null;
    const validation = validateSlugFormat(slug);

    if (!validation.valid) {
      return NextResponse.json({ error: validation.message }, { status: 400 });
    }

    const existingProfiles = await listUserProfiles(supabase, user.id);

    if (!canCreateProfile(existingProfiles.length)) {
      return NextResponse.json(
        { error: "계정당 최대 3개의 프로필만 만들 수 있습니다." },
        { status: 400 },
      );
    }

    const { data: slugTaken } = await supabase
      .from("profiles")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();

    if (slugTaken) {
      return NextResponse.json(
        { error: "이미 사용 중인 슬러그입니다." },
        { status: 400 },
      );
    }

    const { data: profile, error } = await supabase
      .from("profiles")
      .insert({
        owner_id: user.id,
        slug,
        name: "",
        label,
      })
      .select("id, slug, name, label, status, created_at")
      .single();

    if (error || !profile) {
      return NextResponse.json(
        { error: error?.message ?? "프로필 생성에 실패했습니다." },
        { status: 500 },
      );
    }

    return NextResponse.json({ profile }, { status: 201 });
  } catch (error) {
    console.error("[profiles/POST] failed", error);
    return NextResponse.json({ error: API_ERROR_MESSAGE }, { status: 500 });
  }
}

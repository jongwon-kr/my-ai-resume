import { NextResponse } from "next/server";

import { API_ERROR_MESSAGE } from "@/lib/api/response";
import { createClient } from "@/lib/supabase/server";
import {
  suggestSlugAlternatives,
  validateSlugFormat,
} from "@/lib/slug/validation";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug")?.trim().toLowerCase() ?? "";
    const profileId = searchParams.get("profileId")?.trim() ?? null;

    const validation = validateSlugFormat(slug);
    if (!validation.valid) {
      return NextResponse.json({
        available: false,
        reason: validation.code,
        message: validation.message,
        suggestions:
          validation.code === "reserved" ? suggestSlugAlternatives(slug) : [],
      });
    }

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

    const { data: existing, error } = await supabase
      .from("profiles")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();

    if (error) {
      throw error;
    }

    const takenByOther = existing && existing.id !== profileId;

    if (takenByOther) {
      return NextResponse.json({
        available: false,
        reason: "taken",
        message: "이미 사용 중인 슬러그입니다.",
        suggestions: suggestSlugAlternatives(slug),
      });
    }

    return NextResponse.json({
      available: true,
      reason: "valid",
      message: validation.message,
      suggestions: [],
    });
  } catch (error) {
    console.error("[slug/check] failed", error);
    return NextResponse.json({ error: API_ERROR_MESSAGE }, { status: 500 });
  }
}

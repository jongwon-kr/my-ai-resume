import { NextResponse } from "next/server";

import { generateAndStoreSystemPrompt } from "@/lib/prompt/generate-system-prompt";
import { assertProfileOwner } from "@/lib/profile/ownership";
import { createClient } from "@/lib/supabase/server";

interface FaqFromChatBody {
  profileId?: string;
  question?: string;
  answer?: string;
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request
    .json()
    .catch(() => null)) as FaqFromChatBody | null;

  if (!body?.profileId || !body.question?.trim() || !body.answer?.trim()) {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 },
    );
  }

  try {
    await assertProfileOwner(supabase, body.profileId, user.id);
  } catch {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const { data: existing } = await supabase
    .from("owner_faqs")
    .select("sort_order")
    .eq("profile_id", body.profileId)
    .order("sort_order", { ascending: false })
    .limit(1);

  const nextSortOrder = (existing?.[0]?.sort_order ?? -1) + 1;

  const { error } = await supabase.from("owner_faqs").insert({
    profile_id: body.profileId,
    question: body.question.trim(),
    answer: body.answer.trim(),
    match_mode: "semantic",
    sort_order: nextSortOrder,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  try {
    await generateAndStoreSystemPrompt(supabase, body.profileId);
  } catch (promptError) {
    console.error("[faq/from-chat] prompt regenerate failed", promptError);
  }

  return NextResponse.json({ success: true });
}

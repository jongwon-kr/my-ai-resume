import { NextResponse } from "next/server";

import {
  generateAndStoreSystemPrompt,
  PromptGenerateError,
} from "@/lib/prompt/generate-system-prompt";
import { createClient } from "@/lib/supabase/server";

/**
 * POST /api/prompt/generate
 * Builds system prompt server-side, stores a new version, publishes profile.
 * Never returns prompt content to the client.
 */
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as {
    profileId?: string;
  } | null;

  if (!body?.profileId || body.profileId !== user.id) {
    return NextResponse.json({ error: "Invalid profileId" }, { status: 400 });
  }

  try {
    const { version } = await generateAndStoreSystemPrompt(supabase, user.id);

    return NextResponse.json({ success: true, version });
  } catch (error) {
    if (error instanceof PromptGenerateError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status },
      );
    }

    console.error("[prompt/generate]", error);
    return NextResponse.json(
      { error: "프롬프트 생성에 실패했습니다." },
      { status: 500 },
    );
  }
}

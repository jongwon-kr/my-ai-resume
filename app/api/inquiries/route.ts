import { NextResponse } from "next/server";

import { createAdminClient } from "@/lib/supabase/admin";

interface InquiryBody {
  profileId?: string;
  sessionId?: string | null;
  visitorName?: string;
  visitorEmail?: string;
  question?: string;
}

async function notifyOwnerByEmail(input: {
  ownerEmail: string;
  ownerName: string;
  visitorEmail: string;
  visitorName?: string;
  question: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.INQUIRY_FROM_EMAIL;

  if (!apiKey || !from) {
    return;
  }

  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: input.ownerEmail,
      subject: `[CloneCV] ${input.visitorName ?? "방문자"}님의 문의`,
      text: `안녕하세요 ${input.ownerName}님,\n\nCloneCV 프로필에 새 문의가 도착했습니다.\n\n보낸 사람: ${input.visitorName ?? "(이름 없음)"} <${input.visitorEmail}>\n\n질문:\n${input.question}\n`,
    }),
  });
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as InquiryBody | null;

  if (!body?.profileId || !body.visitorEmail?.trim() || !body.question?.trim()) {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, name, public_email, status, is_private")
    .eq("id", body.profileId)
    .maybeSingle();

  if (
    !profile ||
    profile.is_private ||
    profile.status !== "published"
  ) {
    return NextResponse.json({ error: "Profile not available." }, { status: 404 });
  }

  const { error } = await supabase.from("inquiries").insert({
    profile_id: body.profileId,
    chat_session_id: body.sessionId ?? null,
    visitor_name: body.visitorName?.trim() || null,
    visitor_email: body.visitorEmail.trim(),
    question: body.question.trim(),
  });

  if (error) {
    console.error("[inquiries]", error);
    return NextResponse.json({ error: "Failed to save inquiry." }, { status: 500 });
  }

  if (profile.public_email) {
    try {
      await notifyOwnerByEmail({
        ownerEmail: profile.public_email,
        ownerName: profile.name,
        visitorEmail: body.visitorEmail.trim(),
        visitorName: body.visitorName?.trim(),
        question: body.question.trim(),
      });
    } catch (emailError) {
      console.error("[inquiries] email failed", emailError);
    }
  }

  return NextResponse.json({ success: true });
}

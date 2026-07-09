import { getClientIp } from "@/lib/chat/request";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  REPORT_REASONS,
  type ReportReason,
} from "@/lib/reports/constants";
import {
  assertReportRateLimit,
  RateLimitError,
} from "@/lib/reports/rate-limit";

export const runtime = "nodejs";

interface ReportRequestBody {
  profileId?: string;
  reason?: string;
  detail?: string;
}

const VALID_REASONS = new Set<string>(REPORT_REASONS.map((item) => item.value));

export async function POST(request: Request) {
  let body: ReportRequestBody | null = null;

  try {
    body = (await request.json()) as ReportRequestBody;
  } catch {
    return Response.json(
      { error: "요청 형식이 올바르지 않습니다." },
      { status: 400 },
    );
  }

  if (!body?.profileId || !body.reason) {
    return Response.json(
      { error: "프로필 ID와 신고 사유를 입력해 주세요." },
      { status: 400 },
    );
  }

  if (!VALID_REASONS.has(body.reason)) {
    return Response.json(
      { error: "유효하지 않은 신고 사유입니다." },
      { status: 400 },
    );
  }

  const ip = getClientIp(request);

  try {
    await assertReportRateLimit(ip);
  } catch (error) {
    if (error instanceof RateLimitError) {
      return Response.json(
        { error: "신고 요청이 너무 많습니다. 잠시 후 다시 시도해 주세요." },
        { status: 429 },
      );
    }

    console.error("[reports] rate limit check failed", error);
    return Response.json(
      { error: "신고 접수에 실패했습니다. 잠시 후 다시 시도해 주세요." },
      { status: 500 },
    );
  }

  const detail = body.detail?.trim().slice(0, 500) ?? null;

  try {
    const supabase = createAdminClient();

    const { data: profile } = await supabase
      .from("profiles")
      .select("id, status, is_private")
      .eq("id", body.profileId)
      .maybeSingle();

    if (!profile || profile.is_private || profile.status !== "published") {
      return Response.json(
        { error: "신고할 수 없는 프로필입니다." },
        { status: 404 },
      );
    }

    const { error } = await supabase.from("reports").insert({
      profile_id: body.profileId,
      reason: body.reason as ReportReason,
      detail,
      status: "pending",
    });

    if (error) {
      throw error;
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error("[reports] insert failed", error);
    return Response.json(
      { error: "신고 접수에 실패했습니다. 잠시 후 다시 시도해 주세요." },
      { status: 500 },
    );
  }
}

import { cookies } from "next/headers";

import { isExampleProfileId } from "@/lib/example/demo-profile";
import { API_ERROR_MESSAGE, parseJsonBody } from "@/lib/api/response";
import { recordProfileView } from "@/lib/analytics/record-profile-view";
import { getProfileViewCookieName } from "@/lib/analytics/view-cookie";

export const runtime = "nodejs";

interface ViewRequestBody {
  profileId?: string;
}

export async function POST(request: Request) {
  try {
    const body = await parseJsonBody<ViewRequestBody>(request);

    if (!body?.profileId) {
      return Response.json(
        { error: "요청 형식이 올바르지 않습니다." },
        { status: 400 },
      );
    }

    if (isExampleProfileId(body.profileId)) {
      return Response.json({ counted: false });
    }

    const cookieStore = await cookies();
    const cookieName = getProfileViewCookieName(body.profileId);

    if (cookieStore.get(cookieName)) {
      return Response.json({ counted: false });
    }

    await recordProfileView(body.profileId);

    cookieStore.set(cookieName, "1", {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 12,
    });

    return Response.json({ counted: true });
  } catch (error) {
    console.error("[profile/view] failed", error);
    return Response.json({ error: API_ERROR_MESSAGE }, { status: 500 });
  }
}

import { API_ERROR_MESSAGE } from "@/lib/api/response";
import { assertProfileOwner } from "@/lib/profile/ownership";
import { generateResumePdf } from "@/lib/resume/pdf/generate-resume-pdf";
import { loadResumeFormData } from "@/lib/resume/persistence";
import { createClient } from "@/lib/supabase/server";

function buildPdfFilename(slug: string) {
  return `${slug}-resume.pdf`;
}

function contentDisposition(filename: string) {
  const encoded = encodeURIComponent(filename);
  return `attachment; filename="${filename}"; filename*=UTF-8''${encoded}`;
}

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return Response.json({ error: "로그인이 필요합니다." }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const profileId = searchParams.get("profileId");

    if (!profileId) {
      return Response.json(
        { error: "profileId가 필요합니다." },
        { status: 400 },
      );
    }

    await assertProfileOwner(supabase, profileId, user.id);

    const [{ data: profile, error: profileError }, resumeValues] =
      await Promise.all([
        supabase.from("profiles").select("slug").eq("id", profileId).single(),
        loadResumeFormData(supabase, profileId),
      ]);

    if (profileError || !profile) {
      return Response.json(
        { error: "프로필을 찾을 수 없습니다." },
        { status: 404 },
      );
    }

    if (!resumeValues) {
      return Response.json(
        { error: "이력서 데이터를 불러올 수 없습니다." },
        { status: 404 },
      );
    }

    const pdfBuffer = await generateResumePdf({
      slug: profile.slug,
      values: resumeValues,
    });

    const filename = buildPdfFilename(profile.slug);

    return new Response(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": contentDisposition(filename),
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    if (error instanceof Error && error.name === "ProfileOwnershipError") {
      return Response.json(
        { error: "프로필에 접근할 수 없습니다." },
        { status: 403 },
      );
    }

    console.error("[resume/export-pdf] failed", error);
    return Response.json({ error: API_ERROR_MESSAGE }, { status: 500 });
  }
}

import {
  RESUME_IMPORT_ACCEPT,
  RESUME_IMPORT_ERROR_MESSAGE,
  RESUME_IMPORT_MAX_BYTES,
  RESUME_IMPORT_RATE_LIMIT_MESSAGE,
} from "@/lib/resume/import/constants";
import { createClient } from "@/lib/supabase/server";
import { extractResumeFromPdf } from "@/lib/resume/import/extract-resume-from-pdf";
import {
  buildImportSummary,
  normalizeImportedResume,
} from "@/lib/resume/import/normalize-import";
import {
  assertResumeImportRateLimit,
  RateLimitError,
} from "@/lib/resume/import/rate-limit";

function isPdfFile(file: File, buffer: Buffer) {
  if (file.type && file.type !== RESUME_IMPORT_ACCEPT) {
    return false;
  }

  return buffer.subarray(0, 4).toString("utf8") === "%PDF";
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return Response.json({ error: "로그인이 필요합니다." }, { status: 401 });
    }

    try {
      await assertResumeImportRateLimit(user.id);
    } catch (error) {
      if (error instanceof RateLimitError) {
        return Response.json(
          { error: RESUME_IMPORT_RATE_LIMIT_MESSAGE },
          { status: 429 },
        );
      }

      throw error;
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return Response.json(
        { error: "PDF 파일을 선택해 주세요." },
        { status: 400 },
      );
    }

    if (file.size > RESUME_IMPORT_MAX_BYTES) {
      return Response.json(
        { error: "PDF 파일은 5MB 이하만 업로드할 수 있습니다." },
        { status: 400 },
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    if (!isPdfFile(file, buffer)) {
      return Response.json(
        { error: "PDF 파일만 업로드할 수 있습니다." },
        { status: 400 },
      );
    }

    const extracted = await extractResumeFromPdf(buffer);
    const imported = normalizeImportedResume(extracted);

    const hasContent =
      imported.name ||
      imported.role_title ||
      (imported.careers?.length ?? 0) > 0 ||
      imported.skills.some((skill) => skill.name.trim()) ||
      imported.projects.some((project) => project.title.trim());

    if (!hasContent) {
      return Response.json(
        { error: RESUME_IMPORT_ERROR_MESSAGE },
        { status: 422 },
      );
    }

    return Response.json({
      imported,
      needsReview: extracted.needs_review,
      summary: buildImportSummary(imported),
    });
  } catch (error) {
    console.error("[resume/import-pdf] failed", error);

    const message =
      error instanceof Error && error.message.includes("한도")
        ? error.message
        : RESUME_IMPORT_ERROR_MESSAGE;

    return Response.json({ error: message }, { status: 500 });
  }
}

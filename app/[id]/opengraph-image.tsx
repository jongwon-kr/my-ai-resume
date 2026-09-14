import { ImageResponse } from "next/og";
import { notFound } from "next/navigation";

import { isExampleProfileSlug } from "@/lib/example/demo-profile";
import { getPublicProfileBySlug } from "@/lib/public-profile/queries";
import { RESERVED_SLUGS } from "@/lib/slug/constants";

export const runtime = "edge";
export const alt = "CloneCV AI Profile";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

interface OpenGraphImageProps {
  params: Promise<{ id: string }>;
}

export default async function OpenGraphImage({ params }: OpenGraphImageProps) {
  const { id: slug } = await params;

  if (!isExampleProfileSlug(slug) && RESERVED_SLUGS.has(slug)) {
    notFound();
  }

  const result = await getPublicProfileBySlug(slug);

  if (result.kind !== "public") {
    notFound();
  }

  const { profile, skills, projects, portfolioItems } = result.data;
  const skillPreview = skills
    .slice(0, 3)
    .map((skill) => skill.name)
    .join(" · ");

  const counts = [
    projects.length > 0 ? `프로젝트 ${projects.length}` : null,
    portfolioItems.length > 0 ? `포트폴리오 ${portfolioItems.length}` : null,
  ].filter(Boolean) as string[];

  const initial = profile.name.trim().charAt(0) || "?";

  // 아름다운 한글 렌더링을 위해 Pretendard 폰트(Medium, Bold)를 CDN에서 로드
  const pretendardMediumUrl =
    "https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/packages/pretendard/dist/public/static/Pretendard-Medium.otf";
  const pretendardBoldUrl =
    "https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/packages/pretendard/dist/public/static/Pretendard-Bold.otf";

  // A failed fetch must not take the whole image down: a 404 body would be
  // parsed as font data and throw. Fall back to the system font instead.
  async function loadFont(url: string) {
    try {
      const res = await fetch(url);
      return res.ok ? await res.arrayBuffer() : null;
    } catch {
      return null;
    }
  }

  const [fontMedium, fontBold] = await Promise.all([
    loadFont(pretendardMediumUrl),
    loadFont(pretendardBoldUrl),
  ]);

  const fonts = [
    fontMedium
      ? {
          name: "Pretendard",
          data: fontMedium,
          style: "normal" as const,
          weight: 500 as const,
        }
      : null,
    fontBold
      ? {
          name: "Pretendard",
          data: fontBold,
          style: "normal" as const,
          weight: 700 as const,
        }
      : null,
  ].filter((font) => font !== null);

  return new ImageResponse(
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        width: "100%",
        height: "100%",
        padding: "64px",
        background: "linear-gradient(135deg, #0f172a 0%, #1d4ed8 100%)", // 세련된 다크 블루 그라데이션
        color: "white",
        fontFamily: '"Pretendard"', // 폰트 적용
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
          {profile.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.avatar_url}
              alt=""
              width={140}
              height={140}
              style={{
                width: 140,
                height: 140,
                borderRadius: 9999,
                objectFit: "cover",
                border: "4px solid rgba(255,255,255,0.35)",
              }}
            />
          ) : (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 140,
                height: 140,
                borderRadius: 9999,
                background: "rgba(255,255,255,0.15)",
                border: "4px solid rgba(255,255,255,0.35)",
                fontSize: 64,
                fontWeight: 700,
              }}
            >
              {initial}
            </div>
          )}
          <div style={{ fontSize: 28, opacity: 0.85 }}>
            {`${profile.name}님의 대화하는 AI 이력서`}
          </div>
        </div>
        <div style={{ fontSize: 72, fontWeight: 700 }}>{profile.name}</div>
        {profile.role_title ? (
          <div style={{ fontSize: 36, opacity: 0.9 }}>{profile.role_title}</div>
        ) : null}
        {profile.intro ? (
          <div
            style={{
              fontSize: 28,
              opacity: 0.8,
              maxWidth: 900,
              lineHeight: 1.4,
            }}
          >
            {profile.intro.slice(0, 120) +
              (profile.intro.length > 120 ? "..." : "")}
          </div>
        ) : null}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {skillPreview ? (
          <div style={{ fontSize: 24, opacity: 0.85 }}>{skillPreview}</div>
        ) : null}
        {counts.length > 0 ? (
          <div style={{ display: "flex", gap: "12px" }}>
            {counts.map((label) => (
              <div
                key={label}
                style={{
                  padding: "6px 16px",
                  borderRadius: 9999,
                  background: "rgba(255,255,255,0.15)",
                  fontSize: 22,
                }}
              >
                {label}
              </div>
            ))}
          </div>
        ) : null}
        <div style={{ fontSize: 28, fontWeight: 600, color: "#60a5fa" }}>
          {`@${profile.slug}`}
        </div>
      </div>
    </div>,
    {
      ...size,
      fonts,
    },
  );
}

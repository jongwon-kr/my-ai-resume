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

  const { profile, skills } = result.data;
  const skillPreview = skills
    .slice(0, 3)
    .map((skill) => skill.name)
    .join(" · ");

  // 아름다운 한글 렌더링을 위해 Pretendard 폰트(Medium, Bold)를 CDN에서 로드
  const pretendardMediumUrl =
    "https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/packages/pretendard/dist/public/static/Pretendard-Medium.ttf";
  const pretendardBoldUrl =
    "https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/packages/pretendard/dist/public/static/Pretendard-Bold.ttf";

  const [fontMedium, fontBold] = await Promise.all([
    fetch(pretendardMediumUrl).then((res) => res.arrayBuffer()),
    fetch(pretendardBoldUrl).then((res) => res.arrayBuffer()),
  ]);

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
        <div style={{ fontSize: 28, opacity: 0.85 }}>
          {profile.name}님의 대화하는 AI 이력서
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
            {profile.intro.slice(0, 120)}
            {profile.intro.length > 120 ? "..." : ""}
          </div>
        ) : null}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {skillPreview ? (
          <div style={{ fontSize: 24, opacity: 0.85 }}>{skillPreview}</div>
        ) : null}
        <div style={{ fontSize: 28, fontWeight: 600, color: "#60a5fa" }}>
          @{profile.slug}
        </div>
      </div>
    </div>,
    {
      ...size,
      fonts: [
        {
          name: "Pretendard",
          data: fontMedium,
          style: "normal",
          weight: 500, // Medium
        },
        {
          name: "Pretendard",
          data: fontBold,
          style: "normal",
          weight: 700, // Bold
        },
      ],
    },
  );
}

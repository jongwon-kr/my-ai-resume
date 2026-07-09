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

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          width: "100%",
          height: "100%",
          padding: "64px",
          background: "linear-gradient(135deg, #0f172a 0%, #1d4ed8 100%)",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ fontSize: 28, opacity: 0.85 }}>
            {profile.name}님의 AI 이력서
          </div>
          <div style={{ fontSize: 72, fontWeight: 700 }}>{profile.name}</div>
          {profile.role_title ? (
            <div style={{ fontSize: 36, opacity: 0.9 }}>{profile.role_title}</div>
          ) : null}
          {profile.intro ? (
            <div style={{ fontSize: 28, opacity: 0.8, maxWidth: 900 }}>
              {profile.intro.slice(0, 120)}
            </div>
          ) : null}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {skillPreview ? (
            <div style={{ fontSize: 24, opacity: 0.85 }}>{skillPreview}</div>
          ) : null}
          <div style={{ fontSize: 28, fontWeight: 600 }}>@{profile.slug}</div>
        </div>
      </div>
    ),
    { ...size },
  );
}

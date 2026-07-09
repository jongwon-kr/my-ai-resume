import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";

import { isExampleProfileSlug } from "@/lib/example/demo-profile";
import { PrivateProfileNotice } from "@/components/public-profile/private-profile-notice";
import { PublicProfileView } from "@/components/public-profile/public-profile-view";
import { PUBLIC_PROFILE_HEADER } from "@/lib/constants";
import { getPublicProfileBySlug } from "@/lib/public-profile/queries";
import { getOpenGraphImageUrl } from "@/lib/site/url";
import { RESERVED_SLUGS } from "@/lib/slug/constants";
import { createClient } from "@/lib/supabase/server";

interface PublicProfilePageProps {
  params: Promise<{ id: string }>;
}

export const revalidate = 60;

async function assertPublicProfileAccess() {
  const headersList = await headers();

  if (headersList.get(PUBLIC_PROFILE_HEADER) !== "1") {
    notFound();
  }
}

export default async function PublicProfilePage({
  params,
}: PublicProfilePageProps) {
  await assertPublicProfileAccess();

  const { id: slug } = await params;

  if (!isExampleProfileSlug(slug) && RESERVED_SLUGS.has(slug)) {
    notFound();
  }

  const result = await getPublicProfileBySlug(slug);

  if (result.kind === "not_found") {
    notFound();
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (result.kind === "private") {
    let isOwner = false;

    if (user) {
      const { data: ownerProfile } = await supabase
        .from("profiles")
        .select("id")
        .eq("slug", slug)
        .maybeSingle();
      isOwner = ownerProfile?.id === user.id;
    }

    return <PrivateProfileNotice slug={result.slug} isOwner={isOwner} />;
  }

  const isOwner =
    !isExampleProfileSlug(slug) && user?.id === result.data.profile.id;

  return (
    <PublicProfileView
      data={result.data}
      isOwner={Boolean(isOwner)}
      isExample={isExampleProfileSlug(slug)}
    />
  );
}

export async function generateMetadata({
  params,
}: PublicProfilePageProps): Promise<Metadata> {
  await assertPublicProfileAccess();

  const { id: slug } = await params;
  const result = await getPublicProfileBySlug(slug);

  if (result.kind !== "public") {
    return {
      title: `@${slug} | CloneCV`,
      description: "AI 이력서 클론 프로필",
    };
  }

  const { profile } = result.data;
  const title = `${profile.name}${profile.role_title ? ` · ${profile.role_title}` : ""} | CloneCV`;
  const description =
    profile.intro ?? `${profile.name}님의 AI 이력서 클론 프로필입니다.`;
  const ogImageUrl = getOpenGraphImageUrl(profile.slug);

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "profile",
      images: [{ url: ogImageUrl, width: 1200, height: 630, alt: `${profile.name}님의 AI 이력서` }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImageUrl],
    },
  };
}

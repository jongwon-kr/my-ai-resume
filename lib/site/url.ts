export function getSiteUrl() {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
    "http://localhost:3000"
  );
}

export function getPublicProfilePath(slug: string) {
  return `/@${slug}`;
}

export function getPublicProfileUrl(slug: string) {
  return `${getSiteUrl()}${getPublicProfilePath(slug)}`;
}

export function getOpenGraphImageUrl(slug: string) {
  return `${getSiteUrl()}/${slug}/opengraph-image`;
}

export function getShareSnippet(input: {
  name: string;
  roleTitle: string | null;
  slug: string;
}) {
  const title = input.roleTitle
    ? `${input.name} · ${input.roleTitle}`
    : input.name;
  const url = getPublicProfileUrl(input.slug);
  return `${title}\n${input.name}님의 AI 이력서 — CloneCV\n${url}`;
}

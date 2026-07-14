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

export function getShareSnippet(slug: string) {
  const url = getPublicProfileUrl(slug);
  return `${url}`;
}

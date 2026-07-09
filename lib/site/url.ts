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

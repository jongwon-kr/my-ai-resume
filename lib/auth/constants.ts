export const AUTH_CALLBACK_PATH = "/auth/callback";

export function getSiteOrigin() {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
    (typeof window !== "undefined"
      ? window.location.origin
      : "http://localhost:3000")
  );
}

export function getAuthCallbackUrl(nextPath: string) {
  const next = encodeURIComponent(nextPath);
  return `${getSiteOrigin()}${AUTH_CALLBACK_PATH}?next=${next}`;
}

export const PENDING_SLUG_PREFIX = "pending_";

export function isPendingSlug(slug: string) {
  return slug.startsWith(PENDING_SLUG_PREFIX);
}

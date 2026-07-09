/**
 * Kakao Share feed requires a publicly accessible http(s) image URL.
 * Empty strings, blob/data URLs, and localhost are rejected by the SDK.
 */
export function resolveKakaoShareImageUrl(
  avatarUrl: string | null | undefined,
): string | undefined {
  const trimmed = avatarUrl?.trim();
  if (!trimmed) {
    return undefined;
  }

  try {
    const url = new URL(trimmed);

    if (url.protocol !== "https:" && url.protocol !== "http:") {
      return undefined;
    }

    if (
      url.hostname === "localhost" ||
      url.hostname === "127.0.0.1" ||
      url.hostname.endsWith(".local")
    ) {
      return undefined;
    }

    return url.toString();
  } catch {
    return undefined;
  }
}

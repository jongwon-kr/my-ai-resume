const DEFAULT_PATH = "/dashboard";

/** Allow only same-origin relative paths (no protocol-relative or external URLs). */
export function resolveSafeRedirectPath(next: string | null | undefined) {
  if (!next) {
    return DEFAULT_PATH;
  }

  const trimmed = next.trim();

  if (
    !trimmed.startsWith("/") ||
    trimmed.startsWith("//") ||
    trimmed.includes("://") ||
    trimmed.includes("\\")
  ) {
    return DEFAULT_PATH;
  }

  return trimmed;
}

function toTags(items: unknown[]): string[] {
  return items
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean);
}

/**
 * Raw `projects.tech_stack` reads come in three shapes: a jsonb array, a JSON
 * array serialized into the pre-migration text column, or a legacy
 * comma-separated string.
 */
export function normalizeTechStack(value: unknown): string[] {
  if (Array.isArray(value)) {
    return toTags(value);
  }

  if (typeof value !== "string") {
    return [];
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return [];
  }

  if (trimmed.startsWith("[")) {
    try {
      const parsed: unknown = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return toTags(parsed);
      }
    } catch {
      // Not JSON after all, so fall through to the comma-separated path.
    }
  }

  return trimmed
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

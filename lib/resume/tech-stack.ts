/**
 * Rows written before the jsonb migration still hold a comma-separated string,
 * so every raw `projects.tech_stack` read goes through here.
 */
export function normalizeTechStack(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter(
      (item): item is string => typeof item === "string" && item.trim() !== "",
    );
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

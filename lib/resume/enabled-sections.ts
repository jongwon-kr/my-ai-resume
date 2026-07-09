import {
  OPTIONAL_SECTION_KEYS,
  type OptionalSectionKey,
} from "@/lib/resume/schema";

const LEGACY_EDUCATION_KEY = "education_certifications";

export function normalizeEnabledSections(
  raw: readonly string[] | null | undefined,
): OptionalSectionKey[] {
  const result = new Set<OptionalSectionKey>();

  for (const key of raw ?? []) {
    if (key === LEGACY_EDUCATION_KEY) {
      result.add("education");
      result.add("certifications");
      continue;
    }

    if ((OPTIONAL_SECTION_KEYS as readonly string[]).includes(key)) {
      result.add(key as OptionalSectionKey);
    }
  }

  if (result.size === 0) {
    return ["careers", "education", "certifications", "cover_letters"];
  }

  return [...result];
}

export function isSectionEnabled(
  raw: readonly string[],
  key: OptionalSectionKey,
): boolean {
  return normalizeEnabledSections(raw).includes(key);
}

import { isExampleProfileSlug } from "@/lib/example/demo-profile";
import {
  RESERVED_SLUGS,
  SLUG_MAX_LENGTH,
  SLUG_MIN_LENGTH,
  SLUG_PATTERN,
} from "@/lib/slug/constants";

export type SlugValidationCode =
  "valid" | "too_short" | "too_long" | "invalid_format" | "reserved";

export interface SlugValidationResult {
  valid: boolean;
  code: SlugValidationCode;
  message: string;
}

export function normalizeSlugInput(value: string) {
  return value.trim().toLowerCase();
}

export function validateSlugFormat(slug: string): SlugValidationResult {
  if (slug.length < SLUG_MIN_LENGTH) {
    return {
      valid: false,
      code: "too_short",
      message: `슬러그는 ${SLUG_MIN_LENGTH}자 이상이어야 합니다.`,
    };
  }

  if (slug.length > SLUG_MAX_LENGTH) {
    return {
      valid: false,
      code: "too_long",
      message: `슬러그는 ${SLUG_MAX_LENGTH}자 이하여야 합니다.`,
    };
  }

  if (!SLUG_PATTERN.test(slug)) {
    return {
      valid: false,
      code: "invalid_format",
      message: "영문 소문자, 숫자, 하이픈(-)만 사용할 수 있습니다.",
    };
  }

  if (RESERVED_SLUGS.has(slug) || isExampleProfileSlug(slug)) {
    return {
      valid: false,
      code: "reserved",
      message: "예약된 슬러그는 사용할 수 없습니다.",
    };
  }

  return { valid: true, code: "valid", message: "사용 가능한 슬러그입니다." };
}

export function suggestSlugAlternatives(baseSlug: string, count = 3) {
  const normalized = normalizeSlugInput(baseSlug).replace(/[^a-z0-9-]/g, "");
  const root = normalized.slice(0, SLUG_MAX_LENGTH - 2) || "profile";
  const suggestions: string[] = [];

  for (let i = 1; suggestions.length < count && i < 100; i++) {
    const candidate = `${root}-${i}`.slice(0, SLUG_MAX_LENGTH);
    if (!RESERVED_SLUGS.has(candidate) && SLUG_PATTERN.test(candidate)) {
      suggestions.push(candidate);
    }
  }

  while (suggestions.length < count) {
    const suffix = Math.floor(Math.random() * 9000 + 1000).toString();
    const candidate = `${root}-${suffix}`.slice(0, SLUG_MAX_LENGTH);
    if (!suggestions.includes(candidate) && !RESERVED_SLUGS.has(candidate)) {
      suggestions.push(candidate);
    }
  }

  return suggestions;
}

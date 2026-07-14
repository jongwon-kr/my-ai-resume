export interface ProfileLabelSource {
  label?: string | null;
  name?: string | null;
  slug: string;
}

/** Label shown in dashboard switcher and management UI. */
export function getProfileDisplayLabel(profile: ProfileLabelSource): string {
  const label = profile.label?.trim();
  if (label) {
    return label;
  }

  const name = profile.name?.trim();
  if (name) {
    return name;
  }

  return `@${profile.slug}`;
}

/** Secondary line under the display label when a custom label is set. */
export function getProfileLabelSubtitle(
  profile: ProfileLabelSource,
): string | null {
  const label = profile.label?.trim();
  if (!label) {
    return null;
  }

  const name = profile.name?.trim();
  if (name) {
    return `${name} · @${profile.slug}`;
  }

  return `@${profile.slug}`;
}

export const PROFILE_LABEL_MAX_LENGTH = 40;

export function normalizeProfileLabel(value: string): string {
  return value.trim().slice(0, PROFILE_LABEL_MAX_LENGTH);
}

import { z } from "zod";

/**
 * Appearance of a public profile, stored as `profiles.theme_config` (jsonb).
 *
 * Section order is not here: `profiles.section_order` already owns it.
 */

export const THEME_PRESETS = [
  "modern-slate",
  "dark-developer",
  "warm-minimal",
  "creative-bold",
  "executive-classic",
] as const;
export type ThemePreset = (typeof THEME_PRESETS)[number];

export const THEME_FONTS = ["pretendard", "plex-sans", "myeongjo"] as const;
export type ThemeFontKey = (typeof THEME_FONTS)[number];

export const AVATAR_SHAPES = ["circle", "rounded", "square"] as const;
export type AvatarShape = (typeof AVATAR_SHAPES)[number];

export const CARD_STYLES = ["bordered", "elevated", "flat"] as const;
export type CardStyle = (typeof CARD_STYLES)[number];

export const HEADER_STYLES = ["compact", "spacious"] as const;
export type HeaderStyle = (typeof HEADER_STYLES)[number];

export interface ThemeConfig {
  preset: ThemePreset;
  /** `#RRGGBB`. Overrides the preset's primary. */
  accentColor: string;
  fontFamily: ThemeFontKey;
  avatarShape: AvatarShape;
  cardStyle: CardStyle;
  headerStyle: HeaderStyle;
}

export const DEFAULT_THEME_CONFIG: ThemeConfig = {
  preset: "modern-slate",
  accentColor: "#2563EB",
  fontFamily: "pretendard",
  avatarShape: "circle",
  cardStyle: "bordered",
  headerStyle: "compact",
};

const HEX_COLOR = /^#[0-9a-f]{6}$/i;

const accentColorSchema = z
  .string()
  .trim()
  .refine((value) => HEX_COLOR.test(value))
  .catch(DEFAULT_THEME_CONFIG.accentColor);

/**
 * Loose by design.
 *
 * The value comes from jsonb, so it can be null, a partial object written by an
 * older release, or something hand-edited. Every field falls back to the
 * default rather than throwing — a bad colour must never take the profile page
 * down. Same idiom as `geminiResumeImportResponseSchema`.
 */
const themeConfigSchema = z.object({
  preset: z.enum(THEME_PRESETS).catch(DEFAULT_THEME_CONFIG.preset),
  accentColor: accentColorSchema,
  fontFamily: z.enum(THEME_FONTS).catch(DEFAULT_THEME_CONFIG.fontFamily),
  avatarShape: z.enum(AVATAR_SHAPES).catch(DEFAULT_THEME_CONFIG.avatarShape),
  cardStyle: z.enum(CARD_STYLES).catch(DEFAULT_THEME_CONFIG.cardStyle),
  headerStyle: z.enum(HEADER_STYLES).catch(DEFAULT_THEME_CONFIG.headerStyle),
});

export function parseThemeConfig(value: unknown): ThemeConfig {
  if (typeof value !== "object" || value === null) {
    return DEFAULT_THEME_CONFIG;
  }

  const source = value as Record<string, unknown>;

  return themeConfigSchema.parse({
    preset: source.preset ?? DEFAULT_THEME_CONFIG.preset,
    accentColor: source.accentColor ?? DEFAULT_THEME_CONFIG.accentColor,
    fontFamily: source.fontFamily ?? DEFAULT_THEME_CONFIG.fontFamily,
    avatarShape: source.avatarShape ?? DEFAULT_THEME_CONFIG.avatarShape,
    cardStyle: source.cardStyle ?? DEFAULT_THEME_CONFIG.cardStyle,
    headerStyle: source.headerStyle ?? DEFAULT_THEME_CONFIG.headerStyle,
  });
}

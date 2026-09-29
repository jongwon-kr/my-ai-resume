import type { CSSProperties } from "react";

import type {
  ThemeConfig,
  ThemeFontKey,
  ThemePreset,
} from "@/lib/types/profile";

/**
 * Theme presets override the very token names `globals.css` defines on `:root`.
 *
 * That is the whole trick: because the names match, every existing component
 * inside the wrapper (`bg-card`, `text-muted-foreground`, `rounded-lg`, …)
 * follows the theme without a single class change.
 *
 * Each preset has a light and a dark palette so the page follows the viewer's
 * dark-mode toggle like the site header and footer around it do. An inline
 * style cannot react to `.dark`, so the wrapper only carries both palettes as
 * `--theme-light-*` / `--theme-dark-*`; `globals.css` picks one per mode.
 */
type ColorTokens = Record<(typeof COLOR_TOKENS)[number], string>;

/** Must match the `[data-theme-preset]` rules in `globals.css`. */
export const COLOR_TOKENS = [
  "background",
  "foreground",
  "card",
  "card-foreground",
  "muted",
  "muted-foreground",
  "border",
] as const;

interface PresetDefinition {
  light: ColorTokens;
  dark: ColorTokens;
  radius: string;
}

export const PRESET_TOKENS: Record<ThemePreset, PresetDefinition> = {
  "modern-slate": {
    light: {
      background: "oklch(1 0 0)",
      foreground: "oklch(0.22 0.02 265)",
      card: "oklch(1 0 0)",
      "card-foreground": "oklch(0.22 0.02 265)",
      muted: "oklch(0.97 0.005 265)",
      "muted-foreground": "oklch(0.52 0.02 265)",
      border: "oklch(0.91 0.01 265)",
    },
    dark: {
      background: "oklch(0.17 0.012 265)",
      foreground: "oklch(0.96 0.005 265)",
      card: "oklch(0.21 0.015 265)",
      "card-foreground": "oklch(0.96 0.005 265)",
      muted: "oklch(0.26 0.015 265)",
      "muted-foreground": "oklch(0.72 0.015 265)",
      border: "oklch(1 0 0 / 10%)",
    },
    radius: "0.625rem",
  },
  "dark-developer": {
    light: {
      background: "oklch(0.97 0.008 265)",
      foreground: "oklch(0.22 0.03 265)",
      card: "oklch(0.995 0.004 265)",
      "card-foreground": "oklch(0.22 0.03 265)",
      muted: "oklch(0.93 0.012 265)",
      "muted-foreground": "oklch(0.5 0.025 265)",
      border: "oklch(0.88 0.015 265)",
    },
    dark: {
      background: "oklch(0.19 0.02 265)",
      foreground: "oklch(0.95 0.01 265)",
      card: "oklch(0.24 0.02 265)",
      "card-foreground": "oklch(0.95 0.01 265)",
      muted: "oklch(0.28 0.02 265)",
      "muted-foreground": "oklch(0.72 0.02 265)",
      border: "oklch(1 0 0 / 12%)",
    },
    radius: "0.5rem",
  },
  "warm-minimal": {
    light: {
      background: "oklch(0.985 0.012 85)",
      foreground: "oklch(0.26 0.02 60)",
      card: "oklch(0.995 0.008 85)",
      "card-foreground": "oklch(0.26 0.02 60)",
      muted: "oklch(0.955 0.018 85)",
      "muted-foreground": "oklch(0.52 0.025 60)",
      border: "oklch(0.9 0.02 75)",
    },
    dark: {
      background: "oklch(0.19 0.012 60)",
      foreground: "oklch(0.95 0.012 85)",
      card: "oklch(0.23 0.014 60)",
      "card-foreground": "oklch(0.95 0.012 85)",
      muted: "oklch(0.28 0.016 60)",
      "muted-foreground": "oklch(0.74 0.02 75)",
      border: "oklch(1 0 0 / 10%)",
    },
    radius: "0.875rem",
  },
  "creative-bold": {
    light: {
      background: "oklch(1 0 0)",
      foreground: "oklch(0.16 0.02 300)",
      card: "oklch(0.985 0.01 300)",
      "card-foreground": "oklch(0.16 0.02 300)",
      muted: "oklch(0.95 0.03 300)",
      "muted-foreground": "oklch(0.45 0.04 300)",
      border: "oklch(0.86 0.04 300)",
    },
    dark: {
      background: "oklch(0.17 0.025 300)",
      foreground: "oklch(0.97 0.01 300)",
      card: "oklch(0.22 0.03 300)",
      "card-foreground": "oklch(0.97 0.01 300)",
      muted: "oklch(0.27 0.04 300)",
      "muted-foreground": "oklch(0.75 0.04 300)",
      border: "oklch(0.4 0.05 300 / 60%)",
    },
    radius: "1.25rem",
  },
  "executive-classic": {
    light: {
      background: "oklch(0.99 0.004 95)",
      foreground: "oklch(0.2 0.015 250)",
      card: "oklch(1 0 0)",
      "card-foreground": "oklch(0.2 0.015 250)",
      muted: "oklch(0.96 0.006 95)",
      "muted-foreground": "oklch(0.48 0.015 250)",
      border: "oklch(0.88 0.01 250)",
    },
    dark: {
      background: "oklch(0.18 0.01 250)",
      foreground: "oklch(0.95 0.006 95)",
      card: "oklch(0.22 0.012 250)",
      "card-foreground": "oklch(0.95 0.006 95)",
      muted: "oklch(0.27 0.012 250)",
      "muted-foreground": "oklch(0.72 0.012 250)",
      border: "oklch(1 0 0 / 12%)",
    },
    radius: "0.25rem",
  },
};

/**
 * Both palettes of a preset as inline custom properties.
 *
 * Put on any element with `data-theme-preset` and `globals.css` resolves the
 * real tokens for the current mode — the swatches in the design customizer use
 * this too, so they cannot drift from the page.
 */
export function presetCssVars(preset: ThemePreset): Record<string, string> {
  const definition = PRESET_TOKENS[preset] ?? PRESET_TOKENS["modern-slate"];
  const vars: Record<string, string> = { "--radius": definition.radius };

  for (const token of COLOR_TOKENS) {
    vars[`--theme-light-${token}`] = definition.light[token];
    vars[`--theme-dark-${token}`] = definition.dark[token];
  }

  return vars;
}

const FONT_VARS: Record<ThemeFontKey, string> = {
  pretendard: "var(--font-pretendard)",
  "plex-sans": "var(--font-plex-sans)",
  myeongjo: "var(--font-myeongjo)",
};

function parseHex(hex: string): [number, number, number] | null {
  const match = /^#([0-9a-f]{6})$/i.exec(hex.trim());
  if (!match) {
    return null;
  }
  const value = Number.parseInt(match[1], 16);
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
}

/** WCAG relative luminance. */
function relativeLuminance([r, g, b]: [number, number, number]) {
  const channel = (raw: number) => {
    const c = raw / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

/**
 * Picks the text colour that stays legible on `hex`.
 *
 * Threshold 0.179 is where white and black cross over at a 4.5:1 contrast
 * ratio, so whichever side this returns clears WCAG AA for body text.
 */
export function readableForeground(hex: string): string {
  const rgb = parseHex(hex);
  if (!rgb) {
    return "#ffffff";
  }
  return relativeLuminance(rgb) > 0.179 ? "#111111" : "#ffffff";
}

/** Inline style for the profile wrapper. */
export function themeToCssVars(config: ThemeConfig): CSSProperties {
  return {
    ...presetCssVars(config.preset),
    "--primary": config.accentColor,
    "--primary-foreground": readableForeground(config.accentColor),
    // The rail and chips read from these; keeping them on the accent means one
    // colour choice moves the whole page.
    "--ring": config.accentColor,
    "--brand-accent": config.accentColor,
    "--font-sans": FONT_VARS[config.fontFamily] ?? FONT_VARS.pretendard,
    backgroundColor: "var(--background)",
    color: "var(--foreground)",
  } as CSSProperties;
}

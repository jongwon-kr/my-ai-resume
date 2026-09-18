import { describe, expect, it } from "vitest";

import {
  PRESET_TOKENS,
  readableForeground,
  themeToCssVars,
} from "@/lib/theme/css-vars";
import {
  DEFAULT_THEME_CONFIG,
  parseThemeConfig,
  THEME_PRESETS,
  type ThemeConfig,
} from "@/lib/types/profile";

function config(overrides: Partial<ThemeConfig> = {}): ThemeConfig {
  return { ...DEFAULT_THEME_CONFIG, ...overrides };
}

describe("readableForeground", () => {
  it("puts dark text on a light accent", () => {
    expect(readableForeground("#FDE047")).toBe("#111111");
    expect(readableForeground("#ffffff")).toBe("#111111");
  });

  it("puts light text on a dark accent", () => {
    expect(readableForeground("#2563EB")).toBe("#ffffff");
    expect(readableForeground("#000000")).toBe("#ffffff");
  });

  it("falls back to white rather than throwing on junk", () => {
    expect(readableForeground("not a colour")).toBe("#ffffff");
    expect(readableForeground("#abc")).toBe("#ffffff");
  });
});

describe("themeToCssVars", () => {
  it("emits the preset tokens", () => {
    const vars = themeToCssVars(config({ preset: "dark-developer" }));

    for (const [token, value] of Object.entries(
      PRESET_TOKENS["dark-developer"],
    )) {
      expect(vars).toHaveProperty(token, value);
    }
  });

  it("lets the accent colour win over the preset primary", () => {
    const vars = themeToCssVars(config({ accentColor: "#FDE047" })) as Record<
      string,
      string
    >;

    expect(vars["--primary"]).toBe("#FDE047");
    expect(vars["--primary-foreground"]).toBe("#111111");
  });

  it("maps every font key to a defined variable", () => {
    for (const fontFamily of ["pretendard", "plex-sans", "myeongjo"] as const) {
      const vars = themeToCssVars(config({ fontFamily })) as Record<
        string,
        string
      >;
      expect(vars["--font-sans"]).toMatch(/^var\(--font-/);
    }
  });

  it("covers every preset in the union", () => {
    for (const preset of THEME_PRESETS) {
      expect(PRESET_TOKENS[preset]).toBeDefined();
      expect(themeToCssVars(config({ preset }))).toHaveProperty("--background");
    }
  });
});

describe("parseThemeConfig", () => {
  it("reads a null column as the default", () => {
    expect(parseThemeConfig(null)).toEqual(DEFAULT_THEME_CONFIG);
    expect(parseThemeConfig(undefined)).toEqual(DEFAULT_THEME_CONFIG);
  });

  it("fills in fields an older release did not write", () => {
    expect(parseThemeConfig({ preset: "warm-minimal" })).toEqual({
      ...DEFAULT_THEME_CONFIG,
      preset: "warm-minimal",
    });
  });

  it("drops unknown values instead of throwing", () => {
    expect(
      parseThemeConfig({
        preset: "neon-disco",
        accentColor: "rgb(1,2,3)",
        avatarShape: 42,
      }),
    ).toEqual(DEFAULT_THEME_CONFIG);
  });

  it("keeps a valid config intact", () => {
    const valid: ThemeConfig = {
      preset: "creative-bold",
      accentColor: "#ff0066",
      fontFamily: "myeongjo",
      avatarShape: "square",
      cardStyle: "flat",
      headerStyle: "spacious",
    };

    expect(parseThemeConfig(valid)).toEqual(valid);
  });
});

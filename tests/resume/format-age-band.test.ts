import { describe, expect, it } from "vitest";

import {
  formatAgeBand,
  formatPublicAgeLabel,
} from "@/lib/resume/format-age-band";

describe("formatAgeBand", () => {
  it("returns decade band label", () => {
    expect(formatAgeBand(1995, new Date("2026-01-01"))).toBe("30대 초반");
  });
});

describe("formatPublicAgeLabel", () => {
  it("hides exact age by default", () => {
    expect(formatPublicAgeLabel(1995, false, new Date("2026-01-01"))).toBe(
      "30대 초반입니다",
    );
  });

  it("shows exact age when enabled", () => {
    expect(formatPublicAgeLabel(1995, true, new Date("2026-01-01"))).toBe(
      "31세 (1995년생)",
    );
  });
});

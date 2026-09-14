import { describe, expect, it } from "vitest";

import { sanitizePublicProfile } from "@/lib/public-profile/sanitize-public-profile";

const BASE = {
  slug: "dev",
  phone: "010-1234-5678",
  birth_year: 1996,
  show_phone: false,
  show_exact_age: false,
};

describe("sanitizePublicProfile", () => {
  it("strips phone when show_phone is false", () => {
    expect(sanitizePublicProfile(BASE).phone).toBeNull();
  });

  it("keeps phone when show_phone is true", () => {
    expect(sanitizePublicProfile({ ...BASE, show_phone: true }).phone).toBe(
      "010-1234-5678",
    );
  });

  it("never leaves a raw birth_year field on the returned object", () => {
    expect(
      "birth_year" in sanitizePublicProfile({ ...BASE, show_exact_age: true }),
    ).toBe(false);
  });

  it("keeps the birth year out of the payload entirely when it is hidden", () => {
    // The whole point of the fix: an opted-out year must not survive anywhere,
    // not merely go unrendered.
    expect(JSON.stringify(sanitizePublicProfile(BASE))).not.toContain("1996");
  });

  it("renders an age band when the exact age is hidden", () => {
    const result = sanitizePublicProfile(BASE);
    expect(result.ageLabel).toMatch(/대 (초반|중반|후반)입니다$/);
  });

  it("renders the exact age when the owner opted in", () => {
    const result = sanitizePublicProfile({ ...BASE, show_exact_age: true });
    expect(result.ageLabel).toContain("1996년생");
  });

  it("returns a null label when no birth year is set", () => {
    expect(
      sanitizePublicProfile({ ...BASE, birth_year: null }).ageLabel,
    ).toBeNull();
  });

  it("passes other fields through untouched", () => {
    expect(sanitizePublicProfile(BASE).slug).toBe("dev");
  });
});

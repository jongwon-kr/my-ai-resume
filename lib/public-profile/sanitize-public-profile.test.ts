import { describe, expect, it } from "vitest";

import { sanitizePublicProfile } from "@/lib/public-profile/sanitize-public-profile";

describe("sanitizePublicProfile", () => {
  it("strips phone when show_phone is false", () => {
    const result = sanitizePublicProfile({
      slug: "dev",
      phone: "010-1234-5678",
      birth_year: 1996,
      show_phone: false,
      show_exact_age: true,
    });

    expect(result.phone).toBeNull();
    expect(result.birth_year).toBe(1996);
  });

  it("strips birth_year when show_exact_age is false", () => {
    const result = sanitizePublicProfile({
      slug: "dev",
      phone: "010-1234-5678",
      birth_year: 1996,
      show_phone: true,
      show_exact_age: false,
    });

    expect(result.phone).toBe("010-1234-5678");
    expect(result.birth_year).toBeNull();
  });
});

import { describe, expect, it } from "vitest";

import { normalizeSlugInput, validateSlugFormat } from "@/lib/slug/validation";

describe("validateSlugFormat", () => {
  it("accepts valid slugs", () => {
    const result = validateSlugFormat("frontend-dev");
    expect(result.valid).toBe(true);
  });

  it("rejects reserved slugs", () => {
    const result = validateSlugFormat("admin");
    expect(result.valid).toBe(false);
    expect(result.code).toBe("reserved");
  });

  it("normalizes input to lowercase", () => {
    expect(normalizeSlugInput("  My-Slug  ")).toBe("my-slug");
  });
});

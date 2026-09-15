import { describe, expect, it } from "vitest";

import { normalizeTechStack } from "@/lib/resume/tech-stack";

describe("normalizeTechStack", () => {
  it("keeps a jsonb array", () => {
    expect(normalizeTechStack(["Next.js", "TypeScript"])).toEqual([
      "Next.js",
      "TypeScript",
    ]);
  });

  it("parses a JSON array serialized into the text column", () => {
    expect(normalizeTechStack('["Next.js","TypeScript"]')).toEqual([
      "Next.js",
      "TypeScript",
    ]);
  });

  it("splits a legacy comma-separated string", () => {
    expect(normalizeTechStack("Next.js, TypeScript , Supabase")).toEqual([
      "Next.js",
      "TypeScript",
      "Supabase",
    ]);
  });

  it("falls back to splitting when a bracketed value is not JSON", () => {
    expect(normalizeTechStack("[프론트] React, TS")).toEqual([
      "[프론트] React",
      "TS",
    ]);
  });

  it("drops empty entries and non-string members", () => {
    expect(normalizeTechStack(["React", "", "  ", 3, null])).toEqual(["React"]);
    expect(normalizeTechStack("React, , ,Vue")).toEqual(["React", "Vue"]);
  });

  it("returns an empty array for null, undefined, and blank strings", () => {
    expect(normalizeTechStack(null)).toEqual([]);
    expect(normalizeTechStack(undefined)).toEqual([]);
    expect(normalizeTechStack("   ")).toEqual([]);
  });
});

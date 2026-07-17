import { describe, expect, it } from "vitest";

import { resolveSafeRedirectPath } from "@/lib/auth/safe-redirect";

describe("resolveSafeRedirectPath", () => {
  it("returns default for missing next", () => {
    expect(resolveSafeRedirectPath(null)).toBe("/dashboard");
  });

  it("allows internal paths", () => {
    expect(resolveSafeRedirectPath("/dashboard/edit/abc")).toBe(
      "/dashboard/edit/abc",
    );
  });

  it("blocks protocol-relative URLs", () => {
    expect(resolveSafeRedirectPath("//evil.com")).toBe("/dashboard");
  });

  it("blocks absolute URLs", () => {
    expect(resolveSafeRedirectPath("https://evil.com")).toBe("/dashboard");
  });
});

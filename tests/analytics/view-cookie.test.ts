import { describe, expect, it } from "vitest";

import { getProfileViewCookieName } from "@/lib/analytics/view-cookie";

describe("getProfileViewCookieName", () => {
  it("returns stable cookie name per profile", () => {
    expect(getProfileViewCookieName("abc-123")).toBe("clonecv_view_abc-123");
  });
});

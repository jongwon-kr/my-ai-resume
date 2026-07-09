import { describe, expect, it } from "vitest";

import { getPublicProfilePath, getPublicProfileUrl } from "@/lib/site/url";

describe("public profile urls", () => {
  it("builds /@slug path", () => {
    expect(getPublicProfilePath("demo")).toBe("/@demo");
  });

  it("builds absolute url with site base", () => {
    const previous = process.env.NEXT_PUBLIC_SITE_URL;
    process.env.NEXT_PUBLIC_SITE_URL = "http://localhost:3000";

    expect(getPublicProfileUrl("demo")).toBe("http://localhost:3000/@demo");

    process.env.NEXT_PUBLIC_SITE_URL = previous;
  });
});

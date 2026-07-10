import { describe, expect, it } from "vitest";

import { resolveKakaoShareImageUrl } from "@/lib/kakao/validate-image-url";

describe("resolveKakaoShareImageUrl", () => {
  it("returns undefined for empty values", () => {
    expect(resolveKakaoShareImageUrl(null)).toBeUndefined();
    expect(resolveKakaoShareImageUrl("")).toBeUndefined();
    expect(resolveKakaoShareImageUrl("   ")).toBeUndefined();
  });

  it("accepts public https urls", () => {
    expect(
      resolveKakaoShareImageUrl(
        "https://example.supabase.co/storage/v1/object/public/avatars/a.png",
      ),
    ).toBe(
      "https://example.supabase.co/storage/v1/object/public/avatars/a.png",
    );
  });

  it("rejects localhost and blob urls", () => {
    expect(
      resolveKakaoShareImageUrl("http://localhost:3000/avatar.png"),
    ).toBeUndefined();
    expect(
      resolveKakaoShareImageUrl("blob:http://localhost/abc"),
    ).toBeUndefined();
  });
});

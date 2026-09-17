import { describe, expect, it } from "vitest";

import {
  AVATAR_MAX_BYTES,
  AVATAR_MAX_SIZE_MESSAGE,
  AVATAR_TYPE_MESSAGE,
} from "@/lib/avatar/constants";
import { validateAvatarFile } from "@/lib/avatar/validate-upload";

describe("validateAvatarFile", () => {
  it("accepts an image within the limit", () => {
    expect(validateAvatarFile({ size: 1024, type: "image/png" })).toBeNull();
  });

  it("accepts every allowed format", () => {
    for (const type of ["image/jpeg", "image/png", "image/webp", "image/gif"]) {
      expect(validateAvatarFile({ size: 1024, type })).toBeNull();
    }
  });

  it("rejects an oversized image", () => {
    expect(
      validateAvatarFile({ size: AVATAR_MAX_BYTES + 1, type: "image/png" }),
    ).toBe(AVATAR_MAX_SIZE_MESSAGE);
  });

  it("accepts a file exactly at the limit", () => {
    expect(
      validateAvatarFile({ size: AVATAR_MAX_BYTES, type: "image/png" }),
    ).toBeNull();
  });

  it("rejects a disallowed type", () => {
    expect(validateAvatarFile({ size: 1024, type: "application/pdf" })).toBe(
      AVATAR_TYPE_MESSAGE,
    );
  });

  it("rejects a file the browser could not type", () => {
    expect(validateAvatarFile({ size: 1024, type: "" })).toBe(
      AVATAR_TYPE_MESSAGE,
    );
  });

  it("reports the type problem before the size problem", () => {
    expect(
      validateAvatarFile({ size: AVATAR_MAX_BYTES + 1, type: "text/plain" }),
    ).toBe(AVATAR_TYPE_MESSAGE);
  });
});

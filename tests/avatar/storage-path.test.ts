import { describe, expect, it } from "vitest";

import { avatarStoragePath } from "@/lib/avatar/storage-path";

const PROFILE = "11111111-2222-4333-8444-555555555555";
const BASE = `https://abc.supabase.co/storage/v1/object/public/avatars/${PROFILE}`;

describe("avatarStoragePath", () => {
  it("extracts the object path from a public URL", () => {
    expect(avatarStoragePath(`${BASE}/abcd.jpg`, PROFILE)).toBe(
      `${PROFILE}/abcd.jpg`,
    );
  });

  it("strips the legacy cache-busting query", () => {
    expect(
      avatarStoragePath(`${BASE}/avatar.png?t=1699999999999`, PROFILE),
    ).toBe(`${PROFILE}/avatar.png`);
  });

  it("refuses a URL pointing at another profile's folder", () => {
    const other = "99999999-8888-4777-8666-555555555555";
    expect(avatarStoragePath(`${BASE}/abcd.jpg`, other)).toBeNull();
  });

  it("refuses a URL from a different bucket", () => {
    expect(
      avatarStoragePath(
        `https://abc.supabase.co/storage/v1/object/public/portfolio-media/${PROFILE}/x.png`,
        PROFILE,
      ),
    ).toBeNull();
  });

  it("returns null when nothing follows the folder", () => {
    expect(avatarStoragePath(`${BASE}/`, PROFILE)).toBeNull();
  });

  it("returns null for an empty url", () => {
    expect(avatarStoragePath("", PROFILE)).toBeNull();
  });
});

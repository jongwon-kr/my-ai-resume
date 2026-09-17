import { describe, expect, it } from "vitest";

import { AVATAR_OUTPUT_WIDTH } from "@/lib/avatar/constants";
import { avatarOutputSize, rotateSize } from "@/lib/avatar/crop-image";

describe("rotateSize", () => {
  it("leaves the box alone at 0 and 180 degrees", () => {
    expect(rotateSize(100, 200, 0)).toEqual({ width: 100, height: 200 });
    expect(rotateSize(100, 200, 180)).toEqual({ width: 100, height: 200 });
  });

  it("swaps the sides at 90 and 270 degrees", () => {
    expect(rotateSize(100, 200, 90)).toEqual({ width: 200, height: 100 });
    expect(rotateSize(100, 200, 270)).toEqual({ width: 200, height: 100 });
  });

  it("grows the bounding box on a diagonal rotation", () => {
    expect(rotateSize(100, 100, 45)).toEqual({ width: 141, height: 141 });
  });
});

describe("avatarOutputSize", () => {
  it("clamps a large crop to the nominal width", () => {
    expect(avatarOutputSize(1200)).toEqual({
      width: AVATAR_OUTPUT_WIDTH,
      height: 800,
    });
  });

  it("never upscales a small crop", () => {
    expect(avatarOutputSize(300)).toEqual({ width: 300, height: 400 });
  });

  it("floors a sub-pixel crop to one pixel", () => {
    expect(avatarOutputSize(0.4)).toEqual({ width: 1, height: 1 });
  });

  it("keeps a 3:4 ratio across the range", () => {
    for (const cropWidth of [60, 150, 333, 599, 600, 4000]) {
      const { width, height } = avatarOutputSize(cropWidth);
      expect(height).toBe(Math.round(width / (3 / 4)));
    }
  });
});

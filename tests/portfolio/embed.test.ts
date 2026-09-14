import { describe, expect, it } from "vitest";

import { parseVideoEmbed } from "@/lib/portfolio/embed";

describe("parseVideoEmbed", () => {
  it("maps a youtube watch URL", () => {
    expect(
      parseVideoEmbed("https://www.youtube.com/watch?v=dQw4w9WgXcQ"),
    ).toEqual({
      provider: "youtube",
      embedUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    });
  });

  it("maps a youtu.be short link", () => {
    expect(parseVideoEmbed("https://youtu.be/dQw4w9WgXcQ")?.embedUrl).toBe(
      "https://www.youtube.com/embed/dQw4w9WgXcQ",
    );
  });

  it("maps a youtube shorts URL", () => {
    expect(
      parseVideoEmbed("https://www.youtube.com/shorts/dQw4w9WgXcQ")?.embedUrl,
    ).toBe("https://www.youtube.com/embed/dQw4w9WgXcQ");
  });

  it("keeps extra query params out of the embed URL", () => {
    expect(
      parseVideoEmbed("https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=42s")
        ?.embedUrl,
    ).toBe("https://www.youtube.com/embed/dQw4w9WgXcQ");
  });

  it("maps a vimeo URL", () => {
    expect(parseVideoEmbed("https://vimeo.com/123456789")).toEqual({
      provider: "vimeo",
      embedUrl: "https://player.vimeo.com/video/123456789",
    });
  });

  it("rejects an unsupported host", () => {
    expect(
      parseVideoEmbed("https://example.com/watch?v=dQw4w9WgXcQ"),
    ).toBeNull();
  });

  it("rejects a youtube URL without a video id", () => {
    expect(parseVideoEmbed("https://www.youtube.com/watch")).toBeNull();
  });

  it("rejects a malformed video id", () => {
    expect(parseVideoEmbed("https://youtu.be/tooshort")).toBeNull();
  });

  it("rejects a non-http protocol", () => {
    expect(parseVideoEmbed("javascript:alert(1)")).toBeNull();
  });

  it("rejects empty and non-URL input", () => {
    expect(parseVideoEmbed("")).toBeNull();
    expect(parseVideoEmbed("   ")).toBeNull();
    expect(parseVideoEmbed("not a url")).toBeNull();
  });
});

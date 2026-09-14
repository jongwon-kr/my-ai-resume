export type EmbedProvider = "youtube" | "vimeo";

export interface VideoEmbed {
  provider: EmbedProvider;
  embedUrl: string;
}

const YOUTUBE_ID = /^[A-Za-z0-9_-]{11}$/;

function parseYouTube(parsed: URL): string | null {
  const host = parsed.hostname.replace(/^www\./, "");

  if (host === "youtu.be") {
    const id = parsed.pathname.slice(1);
    return YOUTUBE_ID.test(id) ? id : null;
  }

  if (host !== "youtube.com" && host !== "m.youtube.com") {
    return null;
  }

  if (parsed.pathname === "/watch") {
    const id = parsed.searchParams.get("v") ?? "";
    return YOUTUBE_ID.test(id) ? id : null;
  }

  const segments = parsed.pathname.split("/").filter(Boolean);
  if (
    segments.length === 2 &&
    (segments[0] === "shorts" || segments[0] === "embed")
  ) {
    return YOUTUBE_ID.test(segments[1]) ? segments[1] : null;
  }

  return null;
}

function parseVimeo(parsed: URL): string | null {
  const host = parsed.hostname.replace(/^www\./, "");
  if (host !== "vimeo.com" && host !== "player.vimeo.com") {
    return null;
  }

  const segments = parsed.pathname.split("/").filter(Boolean);
  const id = segments.at(-1) ?? "";
  return /^\d+$/.test(id) ? id : null;
}

/** Maps a YouTube/Vimeo watch URL to its embed URL, or null if unsupported. */
export function parseVideoEmbed(url: string): VideoEmbed | null {
  const trimmed = url.trim();
  if (!trimmed) {
    return null;
  }

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return null;
  }

  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
    return null;
  }

  const youtubeId = parseYouTube(parsed);
  if (youtubeId) {
    return {
      provider: "youtube",
      embedUrl: `https://www.youtube.com/embed/${youtubeId}`,
    };
  }

  const vimeoId = parseVimeo(parsed);
  if (vimeoId) {
    return {
      provider: "vimeo",
      embedUrl: `https://player.vimeo.com/video/${vimeoId}`,
    };
  }

  return null;
}

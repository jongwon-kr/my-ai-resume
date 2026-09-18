import { describe, expect, it } from "vitest";

import { chatCallCounterKey } from "@/lib/chat/usage-counter";
import { rateLimitBucket, rateLimitKey } from "@/lib/rate-limit/redis";

/**
 * The dashboard reads the keys `assertRateLimit` writes. These assertions pin
 * the exact strings — if the bucket arithmetic drifts, the usage widget would
 * silently read a key nobody writes and report zero forever.
 */
describe("rate limit keys", () => {
  const noon = Date.parse("2026-09-19T12:34:56.000Z");

  it("buckets a day by UTC date", () => {
    expect(rateLimitBucket("day", noon)).toBe("2026-09-19");
  });

  it("buckets a minute by epoch division", () => {
    expect(rateLimitBucket("minute", noon)).toBe(
      String(Math.floor(noon / 60_000)),
    );
  });

  it("rolls the minute bucket at the boundary, not inside it", () => {
    const start = Date.parse("2026-09-19T12:34:00.000Z");
    expect(rateLimitBucket("minute", start + 59_999)).toBe(
      rateLimitBucket("minute", start),
    );
    expect(rateLimitBucket("minute", start + 60_000)).not.toBe(
      rateLimitBucket("minute", start),
    );
  });

  it("builds the owner chat key the dashboard reads", () => {
    expect(rateLimitKey("chat-owner", "profile-1:user-1", "day", noon)).toBe(
      "chat-owner:rl:profile-1:user-1:day:2026-09-19",
    );
  });

  it("keys the call counter by profile and day", () => {
    expect(chatCallCounterKey("profile-1", noon)).toBe(
      "chat:calls:profile-1:2026-09-19",
    );
  });
});

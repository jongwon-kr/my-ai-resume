import { Redis } from "@upstash/redis";

export function getRedisClient() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    return null;
  }

  return new Redis({ url, token });
}

export class RateLimitError extends Error {
  constructor(readonly window: "minute" | "hour" | "day") {
    super("Rate limit exceeded");
    this.name = "RateLimitError";
  }
}

interface AssertRateLimitOptions {
  scope: string;
  identifier: string;
  limits: Array<{
    window: "minute" | "hour" | "day";
    max: number;
    ttlSeconds: number;
  }>;
  skipInDev?: boolean;
}

export async function assertRateLimit({
  scope,
  identifier,
  limits,
  skipInDev = true,
}: AssertRateLimitOptions) {
  const redis = getRedisClient();

  if (!redis) {
    if (skipInDev && process.env.NODE_ENV === "development") {
      console.warn(
        `[rate-limit:${scope}] Upstash env missing — skipped in dev.`,
      );
      return;
    }

    throw new Error("Rate limit service unavailable.");
  }

  const now = Date.now();
  const dayBucket = new Date().toISOString().slice(0, 10);
  const hourBucket = Math.floor(now / 3_600_000);
  const minuteBucket = Math.floor(now / 60_000);

  for (const limit of limits) {
    const bucket =
      limit.window === "day"
        ? dayBucket
        : limit.window === "hour"
          ? hourBucket
          : minuteBucket;
    const key = `${scope}:rl:${identifier}:${limit.window}:${bucket}`;

    let count: number;
    try {
      count = await redis.incr(key);
    } catch (error) {
      // Configured but unreachable (deleted instance, DNS failure, outage).
      // Production still fails closed; in dev this would otherwise surface as
      // a bare "fetch failed" and block every request.
      if (skipInDev && process.env.NODE_ENV === "development") {
        console.warn(
          `[rate-limit:${scope}] Upstash unreachable — skipped in dev.`,
          error instanceof Error ? error.message : error,
        );
        return;
      }

      throw new Error("Rate limit service unavailable.");
    }

    if (count === 1) {
      await redis.expire(key, limit.ttlSeconds).catch(() => {
        // A missed TTL only means the key lives longer than intended; the
        // limit itself already counted, so this must not fail the request.
      });
    }

    if (count > limit.max) {
      throw new RateLimitError(limit.window);
    }
  }
}

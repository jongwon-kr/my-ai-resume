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

export type RateLimitWindow = "minute" | "hour" | "day";

/**
 * Fixed-window bucket id. Shared so the dashboard reads the exact key
 * `assertRateLimit` writes — two copies of this arithmetic would drift apart
 * silently and the widget would just show zero forever.
 */
export function rateLimitBucket(
  window: RateLimitWindow,
  now = Date.now(),
): string {
  if (window === "day") {
    return new Date(now).toISOString().slice(0, 10);
  }
  if (window === "hour") {
    return String(Math.floor(now / 3_600_000));
  }
  return String(Math.floor(now / 60_000));
}

export function rateLimitKey(
  scope: string,
  identifier: string,
  window: RateLimitWindow,
  now = Date.now(),
): string {
  return `${scope}:rl:${identifier}:${window}:${rateLimitBucket(window, now)}`;
}

interface AssertRateLimitOptions {
  scope: string;
  identifier: string;
  limits: Array<{
    window: RateLimitWindow;
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

  for (const limit of limits) {
    const key = rateLimitKey(scope, identifier, limit.window, now);

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

/**
 * Observability counters, deliberately fail-open.
 *
 * `assertRateLimit` fails closed because letting a request through unmetered is
 * an abuse hole. These two are only ever read by the owner's usage widget, so a
 * Redis outage must degrade to "측정 불가" rather than break chat or the
 * dashboard.
 */
export async function incrementCounter(
  key: string,
  by: number,
  ttlSeconds: number,
): Promise<void> {
  const redis = getRedisClient();
  if (!redis || by <= 0) {
    return;
  }

  try {
    const count = await redis.incrby(key, by);
    if (count === by) {
      await redis.expire(key, ttlSeconds);
    }
  } catch (error) {
    console.warn(
      "[rate-limit] counter increment failed",
      error instanceof Error ? error.message : error,
    );
  }
}

/** Returns one entry per key: the count, or null when it could not be read. */
export async function readCounters(
  keys: string[],
): Promise<Array<number | null>> {
  const redis = getRedisClient();
  if (!redis || keys.length === 0) {
    return keys.map(() => null);
  }

  try {
    const values = await redis.mget<Array<number | string | null>>(...keys);
    return values.map((value) => {
      const count = typeof value === "string" ? Number(value) : value;
      return typeof count === "number" && Number.isFinite(count) ? count : 0;
    });
  } catch (error) {
    console.warn(
      "[rate-limit] counter read failed",
      error instanceof Error ? error.message : error,
    );
    return keys.map(() => null);
  }
}

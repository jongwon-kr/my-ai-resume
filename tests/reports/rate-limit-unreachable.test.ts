import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Guards the failure mode that took chat down: Upstash env was set but the
 * instance no longer resolved, so every request died on a bare "fetch failed"
 * before reaching Gemini.
 *
 * The SDK is mocked so this stays offline and fast — a real unreachable host
 * costs ~13s in connection retries.
 */

vi.mock("@upstash/redis", () => ({
  Redis: class {
    incr(): Promise<number> {
      return Promise.reject(new TypeError("fetch failed"));
    }
    expire(): Promise<number> {
      return Promise.reject(new TypeError("fetch failed"));
    }
  },
}));

const OPTIONS = {
  scope: "test",
  identifier: "user-1",
  limits: [{ window: "minute" as const, max: 5, ttlSeconds: 60 }],
};

const ORIGINAL_ENV = { ...process.env };

async function loadAssertRateLimit() {
  vi.resetModules();
  const mod = await import("@/lib/rate-limit/redis");
  return mod.assertRateLimit;
}

beforeEach(() => {
  // Configured, but the instance behind it is gone.
  process.env.UPSTASH_REDIS_REST_URL = "https://gone.upstash.io";
  process.env.UPSTASH_REDIS_REST_TOKEN = "dummy-token";
  vi.spyOn(console, "warn").mockImplementation(() => {});
});

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe("assertRateLimit with an unreachable Upstash instance", () => {
  it("skips the limit in development instead of failing the request", async () => {
    vi.stubEnv("NODE_ENV", "development");
    const assertRateLimit = await loadAssertRateLimit();

    await expect(assertRateLimit(OPTIONS)).resolves.toBeUndefined();
  });

  it("still fails closed in production", async () => {
    vi.stubEnv("NODE_ENV", "production");
    const assertRateLimit = await loadAssertRateLimit();

    await expect(assertRateLimit(OPTIONS)).rejects.toThrow(
      "Rate limit service unavailable.",
    );
  });

  it("never surfaces the raw transport error", async () => {
    vi.stubEnv("NODE_ENV", "production");
    const assertRateLimit = await loadAssertRateLimit();

    await expect(assertRateLimit(OPTIONS)).rejects.not.toThrow("fetch failed");
  });

  it("skips when the env is missing entirely, in development", async () => {
    vi.stubEnv("NODE_ENV", "development");
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
    const assertRateLimit = await loadAssertRateLimit();

    await expect(assertRateLimit(OPTIONS)).resolves.toBeUndefined();
  });
});

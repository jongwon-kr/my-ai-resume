import { assertRateLimit, RateLimitError } from "@/lib/rate-limit/redis";

export const PROFILE_VIEW_RATE_LIMIT_PER_HOUR = 30;

export async function assertProfileViewRateLimit(ip: string) {
  await assertRateLimit({
    scope: "profile-view",
    identifier: ip,
    limits: [
      {
        window: "hour",
        max: PROFILE_VIEW_RATE_LIMIT_PER_HOUR,
        ttlSeconds: 3_600,
      },
    ],
  });
}

export { RateLimitError };

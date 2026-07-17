import { assertRateLimit, RateLimitError } from "@/lib/rate-limit/redis";

import { INQUIRY_RATE_LIMIT_PER_HOUR } from "./constants";

export async function assertInquiryRateLimit(ip: string) {
  await assertRateLimit({
    scope: "inquiry",
    identifier: ip,
    limits: [
      {
        window: "hour",
        max: INQUIRY_RATE_LIMIT_PER_HOUR,
        ttlSeconds: 3_600,
      },
    ],
  });
}

export { RateLimitError };

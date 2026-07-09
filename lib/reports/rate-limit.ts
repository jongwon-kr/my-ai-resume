import { assertRateLimit, RateLimitError } from "@/lib/rate-limit/redis";

export const REPORT_RATE_LIMIT_PER_HOUR = 5;

export async function assertReportRateLimit(ip: string) {
  await assertRateLimit({
    scope: "report",
    identifier: ip,
    limits: [
      {
        window: "hour",
        max: REPORT_RATE_LIMIT_PER_HOUR,
        ttlSeconds: 3_600,
      },
    ],
  });
}

export { RateLimitError };

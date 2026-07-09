import {
  assertRateLimit,
  RateLimitError,
} from "@/lib/rate-limit/redis";
import { RESUME_IMPORT_RATE_LIMIT_PER_HOUR } from "@/lib/resume/import/constants";

export async function assertResumeImportRateLimit(userId: string) {
  await assertRateLimit({
    scope: "resume-import",
    identifier: userId,
    limits: [
      {
        window: "hour",
        max: RESUME_IMPORT_RATE_LIMIT_PER_HOUR,
        ttlSeconds: 3_600,
      },
    ],
  });
}

export { RateLimitError };

import { assertRateLimit, RateLimitError } from "@/lib/rate-limit/redis";
import {
  CHAT_RATE_LIMIT_PER_DAY,
  CHAT_RATE_LIMIT_PER_MINUTE,
} from "@/lib/chat/constants";

export async function assertChatRateLimit(profileId: string, ip: string) {
  await assertRateLimit({
    scope: "chat",
    identifier: `${profileId}:${ip}`,
    limits: [
      {
        window: "minute",
        max: CHAT_RATE_LIMIT_PER_MINUTE,
        ttlSeconds: 60,
      },
      {
        window: "day",
        max: CHAT_RATE_LIMIT_PER_DAY,
        ttlSeconds: 86_400,
      },
    ],
  });
}

export { RateLimitError };

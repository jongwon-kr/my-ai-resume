import { assertRateLimit, RateLimitError } from "@/lib/rate-limit/redis";
import {
  CHAT_RATE_LIMIT_PER_DAY,
  CHAT_RATE_LIMIT_PER_MINUTE,
  OWNER_CHAT_RATE_LIMIT_PER_DAY,
  OWNER_CHAT_RATE_LIMIT_PER_MINUTE,
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

/** Mock-interview / preview modes, keyed by the signed-in owner. */
export async function assertOwnerChatRateLimit(
  profileId: string,
  userId: string,
) {
  await assertRateLimit({
    scope: "chat-owner",
    identifier: `${profileId}:${userId}`,
    limits: [
      {
        window: "minute",
        max: OWNER_CHAT_RATE_LIMIT_PER_MINUTE,
        ttlSeconds: 60,
      },
      {
        window: "day",
        max: OWNER_CHAT_RATE_LIMIT_PER_DAY,
        ttlSeconds: 86_400,
      },
    ],
  });
}

export { RateLimitError };

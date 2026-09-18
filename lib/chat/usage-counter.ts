import {
  incrementCounter,
  rateLimitBucket,
  readCounters,
} from "@/lib/rate-limit/redis";

/** Two days, so "today" survives a timezone-straddling read. */
const CALL_COUNTER_TTL_SECONDS = 172_800;

export function chatCallCounterKey(profileId: string, now = Date.now()) {
  return `chat:calls:${profileId}:${rateLimitBucket("day", now)}`;
}

/**
 * Counts Gemini calls actually issued for a profile today.
 *
 * Not derivable from the rate-limit keys: those are keyed per visitor IP and
 * incremented once per request, while a single turn can issue a retrieval
 * embedding, one or more answer attempts (model fallback) and a follow-up
 * question call.
 */
export async function recordChatCalls(profileId: string, calls: number) {
  await incrementCounter(
    chatCallCounterKey(profileId),
    calls,
    CALL_COUNTER_TTL_SECONDS,
  );
}

export async function readChatCallsToday(
  profileId: string,
): Promise<number | null> {
  const [count] = await readCounters([chatCallCounterKey(profileId)]);
  return count;
}

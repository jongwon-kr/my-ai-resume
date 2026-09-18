import type { SupabaseClient } from "@supabase/supabase-js";

import {
  CHAT_RATE_LIMIT_PER_DAY,
  CHAT_RATE_LIMIT_PER_MINUTE,
  OWNER_CHAT_RATE_LIMIT_PER_DAY,
  OWNER_CHAT_RATE_LIMIT_PER_MINUTE,
} from "@/lib/chat/constants";
import { estimateTokens } from "@/lib/chat/token-budget";
import { chatCallCounterKey } from "@/lib/chat/usage-counter";
import { rateLimitKey, readCounters } from "@/lib/rate-limit/redis";
import type { Database } from "@/types/database";

/** Matches the quota framing: a month is the unit people budget in. */
export const AI_USAGE_WINDOW_DAYS = 30;

export interface TokenTotals {
  turns: number;
  inputTokens: number;
  outputTokens: number;
}

export interface AiUsageSummary {
  windowDays: number;
  /** Reported by Gemini. */
  measured: TokenTotals;
  /** Derived from text length for turns recorded before token capture. */
  estimated: TokenTotals;
  /** Null when Redis is unset or unreachable. */
  callsToday: number | null;
  ownerQuota: {
    minuteUsed: number;
    minuteMax: number;
    dayUsed: number;
    dayMax: number;
  } | null;
  /** Per-visitor policy — the counters are keyed by IP, so usage cannot sum. */
  visitorPolicy: { perMinute: number; perDay: number };
}

export interface UsageMessageRow {
  role: string;
  content: string;
  input_tokens: number | null;
  output_tokens: number | null;
}

const EMPTY_TOTALS: TokenTotals = {
  turns: 0,
  inputTokens: 0,
  outputTokens: 0,
};

/**
 * Splits turns into what Gemini reported and what we can only approximate.
 *
 * Kept separate rather than blended: a single number mixing the two would read
 * as fact. Only assistant rows count as turns — a user row has no reply cost of
 * its own, its text is already billed inside the assistant turn's input.
 */
export function summarizeTokenUsage(
  rows: UsageMessageRow[],
  systemPromptTokens: number,
): { measured: TokenTotals; estimated: TokenTotals } {
  const measured: TokenTotals = { ...EMPTY_TOTALS };
  const estimated: TokenTotals = { ...EMPTY_TOTALS };

  for (const row of rows) {
    if (row.role !== "assistant") {
      continue;
    }

    if (row.input_tokens !== null || row.output_tokens !== null) {
      measured.turns += 1;
      measured.inputTokens += row.input_tokens ?? 0;
      measured.outputTokens += row.output_tokens ?? 0;
      continue;
    }

    estimated.turns += 1;
    // The whole resume prompt is resent every turn, so input is dominated by
    // the system prompt rather than by the visitor's question.
    estimated.inputTokens += systemPromptTokens;
    estimated.outputTokens += estimateTokens(row.content);
  }

  return { measured, estimated };
}

async function loadRedisUsage(profileId: string, userId: string) {
  const now = Date.now();
  const ownerIdentifier = `${profileId}:${userId}`;

  const [callsToday, ownerMinute, ownerDay] = await readCounters([
    chatCallCounterKey(profileId, now),
    rateLimitKey("chat-owner", ownerIdentifier, "minute", now),
    rateLimitKey("chat-owner", ownerIdentifier, "day", now),
  ]);

  return {
    callsToday,
    ownerQuota:
      ownerMinute === null || ownerDay === null
        ? null
        : {
            minuteUsed: ownerMinute,
            minuteMax: OWNER_CHAT_RATE_LIMIT_PER_MINUTE,
            dayUsed: ownerDay,
            dayMax: OWNER_CHAT_RATE_LIMIT_PER_DAY,
          },
  };
}

/**
 * Owner-facing AI consumption for one profile.
 *
 * Runs on the caller's session client, so RLS applies: `chat_messages` is
 * reachable through the `chat_sessions` ownership policy and `system_prompts`
 * through `system_prompts_select_own`.
 */
export async function loadAiUsage(
  supabase: SupabaseClient<Database>,
  { profileId, userId }: { profileId: string; userId: string },
): Promise<AiUsageSummary> {
  const since = new Date(
    Date.now() - AI_USAGE_WINDOW_DAYS * 86_400_000,
  ).toISOString();

  // Every session type is counted: mock interviews and builder previews burn
  // the same Gemini quota as visitor chat, unlike the visitor-only stats tab.
  const [{ data: sessions }, { data: promptRow }, redis] = await Promise.all([
    supabase.from("chat_sessions").select("id").eq("profile_id", profileId),
    supabase
      .from("system_prompts")
      .select("token_estimate")
      .eq("profile_id", profileId)
      .order("version", { ascending: false })
      .limit(1)
      .maybeSingle(),
    loadRedisUsage(profileId, userId),
  ]);

  const sessionIds = (sessions ?? []).map((session) => session.id);

  let rows: UsageMessageRow[] = [];
  if (sessionIds.length > 0) {
    const { data } = await supabase
      .from("chat_messages")
      .select("role, content, input_tokens, output_tokens")
      .in("session_id", sessionIds)
      .gte("created_at", since);

    rows = (data ?? []) as UsageMessageRow[];
  }

  const { measured, estimated } = summarizeTokenUsage(
    rows,
    promptRow?.token_estimate ?? 0,
  );

  return {
    windowDays: AI_USAGE_WINDOW_DAYS,
    measured,
    estimated,
    callsToday: redis.callsToday,
    ownerQuota: redis.ownerQuota,
    visitorPolicy: {
      perMinute: CHAT_RATE_LIMIT_PER_MINUTE,
      perDay: CHAT_RATE_LIMIT_PER_DAY,
    },
  };
}

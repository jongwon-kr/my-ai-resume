import type { DashboardMessage } from "@/lib/dashboard/types";

export interface TopQuestion {
  question: string;
  count: number;
}

/** A chat message carrying the quality columns added for answer tracking. */
export type ChatQualityMessage = DashboardMessage & {
  answer_status?: string | null;
};

const DEFAULT_TOP_N = 5;

function normalizeQuestion(content: string) {
  return content.trim().toLowerCase().replace(/\s+/g, " ");
}

function rank(counts: Map<string, TopQuestion>, limit: number) {
  return [...counts.values()]
    .sort((a, b) => b.count - a.count || a.question.localeCompare(b.question))
    .slice(0, limit);
}

/** Aggregates user-role chat messages into a frequency-ranked question list. */
export function getTopUserQuestions(
  messages: DashboardMessage[],
  limit = DEFAULT_TOP_N,
): TopQuestion[] {
  const counts = new Map<string, TopQuestion>();

  for (const message of messages) {
    if (message.role !== "user") {
      continue;
    }

    const trimmed = message.content.trim();
    if (!trimmed) {
      continue;
    }

    const key = normalizeQuestion(trimmed);
    const existing = counts.get(key);

    if (existing) {
      existing.count += 1;
    } else {
      counts.set(key, { question: trimmed, count: 1 });
    }
  }

  return rank(counts, limit);
}

/**
 * Pairs each question with the reply it got, then counts the ones matching
 * `wanted`. Rows without `answer_status` predate the instrumentation and are
 * skipped rather than guessed at.
 */
function countByAnswerStatus(
  messages: ChatQualityMessage[],
  wanted: (status: string) => boolean,
  limit: number,
): TopQuestion[] {
  const bySession = new Map<string, ChatQualityMessage[]>();
  for (const message of messages) {
    const bucket = bySession.get(message.session_id) ?? [];
    bucket.push(message);
    bySession.set(message.session_id, bucket);
  }

  const counts = new Map<string, TopQuestion>();

  for (const bucket of bySession.values()) {
    const ordered = [...bucket].sort((a, b) =>
      a.created_at.localeCompare(b.created_at),
    );

    for (let index = 0; index < ordered.length - 1; index += 1) {
      const question = ordered[index];
      const reply = ordered[index + 1];
      if (question.role !== "user" || reply.role !== "assistant") {
        continue;
      }

      const status = reply.answer_status;
      if (!status || !wanted(status)) {
        continue;
      }

      const trimmed = question.content.trim();
      if (!trimmed) {
        continue;
      }

      const key = normalizeQuestion(trimmed);
      const existing = counts.get(key);
      if (existing) {
        existing.count += 1;
      } else {
        counts.set(key, { question: trimmed, count: 1 });
      }
    }
  }

  return rank(counts, limit);
}

/** Questions the clone answered — the only ones safe to replay as chips. */
export function getAnsweredUserQuestions(
  messages: ChatQualityMessage[],
  limit = DEFAULT_TOP_N,
): TopQuestion[] {
  return countByAnswerStatus(
    messages,
    (status) => status === "answered",
    limit,
  );
}

/** Questions the clone refused — the owner's FAQ backlog. */
export function getUnansweredQuestions(
  messages: ChatQualityMessage[],
  limit = DEFAULT_TOP_N,
): TopQuestion[] {
  return countByAnswerStatus(
    messages,
    (status) => status !== "answered",
    limit,
  );
}

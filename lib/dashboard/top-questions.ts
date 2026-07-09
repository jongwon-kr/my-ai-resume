import type { DashboardMessage } from "@/lib/dashboard/types";

export interface TopQuestion {
  question: string;
  count: number;
}

const DEFAULT_TOP_N = 5;

function normalizeQuestion(content: string) {
  return content.trim().toLowerCase().replace(/\s+/g, " ");
}

/** Aggregates user-role chat messages into a frequency-ranked question list. */
export function getTopUserQuestions(
  messages: DashboardMessage[],
  limit = DEFAULT_TOP_N,
): TopQuestion[] {
  const counts = new Map<string, { question: string; count: number }>();

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

  return [...counts.values()]
    .sort((a, b) => b.count - a.count || a.question.localeCompare(b.question))
    .slice(0, limit);
}

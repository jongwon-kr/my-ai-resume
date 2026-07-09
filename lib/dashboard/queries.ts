import type { SupabaseClient } from "@supabase/supabase-js";

import type {
  DailyTrendPoint,
  DashboardData,
  DashboardMessage,
  DashboardSession,
  DashboardStats,
  OwnerProfile,
} from "@/lib/dashboard/types";
import type { Database } from "@/types/database";

function buildLast7DayKeys() {
  const keys: string[] = [];

  for (let offset = 6; offset >= 0; offset -= 1) {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - offset);
    keys.push(date.toISOString().slice(0, 10));
  }

  return keys;
}

function formatDayLabel(dateKey: string) {
  const [, month, day] = dateKey.split("-");
  return `${Number(month)}/${Number(day)}`;
}

function groupSessionsByDay(
  sessions: Array<{ created_at: string }>,
  dayKeys: string[],
) {
  const counts = new Map(dayKeys.map((key) => [key, 0]));

  for (const session of sessions) {
    const key = session.created_at.slice(0, 10);
    if (counts.has(key)) {
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
  }

  return counts;
}

export async function loadDashboardData(
  supabase: SupabaseClient<Database>,
  profileId: string,
): Promise<DashboardData> {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const [
    { data: profile, error: profileError },
    { data: sessions, error: sessionsError },
    { data: dailyViews, error: dailyViewsError },
    { data: recentSessions, error: recentSessionsError },
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select(
        "id, slug, name, role_title, status, is_private, view_count",
      )
      .eq("id", profileId)
      .single(),
    supabase
      .from("chat_sessions")
      .select("id, created_at")
      .eq("profile_id", profileId)
      .order("created_at", { ascending: false }),
    supabase
      .from("profile_daily_stats")
      .select("stat_date, views")
      .eq("profile_id", profileId)
      .gte("stat_date", sevenDaysAgo.toISOString().slice(0, 10)),
    supabase
      .from("chat_sessions")
      .select("created_at")
      .eq("profile_id", profileId)
      .gte("created_at", sevenDaysAgo.toISOString()),
  ]);

  if (profileError || !profile) {
    throw new Error(profileError?.message ?? "Profile not found.");
  }

  if (sessionsError) {
    throw new Error(sessionsError.message);
  }

  if (dailyViewsError) {
    throw new Error(dailyViewsError.message);
  }

  if (recentSessionsError) {
    throw new Error(recentSessionsError.message);
  }

  const sessionRows = sessions ?? [];
  const sessionIds = sessionRows.map((session) => session.id);

  let messages: DashboardMessage[] = [];

  if (sessionIds.length > 0) {
    const { data: messageRows, error: messagesError } = await supabase
      .from("chat_messages")
      .select("id, session_id, role, content, created_at")
      .in("session_id", sessionIds)
      .order("created_at", { ascending: true });

    if (messagesError) {
      throw new Error(messagesError.message);
    }

    messages = messageRows ?? [];
  }

  const messagesBySession = new Map<string, DashboardMessage[]>();
  for (const message of messages) {
    const bucket = messagesBySession.get(message.session_id) ?? [];
    bucket.push(message);
    messagesBySession.set(message.session_id, bucket);
  }

  const dashboardSessions: DashboardSession[] = sessionRows.map((session) => {
    const sessionMessages = messagesBySession.get(session.id) ?? [];
    const firstUserMessage = sessionMessages.find(
      (message) => message.role === "user",
    );

    return {
      id: session.id,
      created_at: session.created_at,
      message_count: sessionMessages.length,
      preview: firstUserMessage?.content ?? null,
    };
  });

  const dayKeys = buildLast7DayKeys();
  const viewsByDay = new Map(
    (dailyViews ?? []).map((row) => [row.stat_date, row.views]),
  );
  const sessionsByDay = groupSessionsByDay(recentSessions ?? [], dayKeys);

  const trend: DailyTrendPoint[] = dayKeys.map((date) => ({
    date,
    label: formatDayLabel(date),
    views: viewsByDay.get(date) ?? 0,
    sessions: sessionsByDay.get(date) ?? 0,
  }));

  const stats: DashboardStats = {
    view_count: profile.view_count,
    session_count: sessionRows.length,
    trend,
  };

  return {
    profile: profile as OwnerProfile,
    sessions: dashboardSessions,
    messages,
    stats,
  };
}

export async function getFeaturedPublicSlug(
  supabase: SupabaseClient<Database>,
) {
  const { data } = await supabase
    .from("profiles")
    .select("slug")
    .eq("status", "published")
    .eq("is_private", false)
    .not("slug", "like", "pending_%")
    .order("view_count", { ascending: false })
    .limit(1)
    .maybeSingle();

  return data?.slug ?? null;
}

import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database";

export interface AdminReportRow {
  id: string;
  profile_id: string | null;
  reason: string | null;
  detail: string | null;
  status: string;
  resolved_at: string | null;
  created_at: string;
  profile: {
    slug: string;
    name: string;
    is_private: boolean;
  } | null;
}

export async function loadAdminReports(
  supabase: SupabaseClient<Database>,
): Promise<AdminReportRow[]> {
  const { data, error } = await supabase
    .from("reports")
    .select(
      "id, profile_id, reason, detail, status, resolved_at, created_at, profiles(slug, name, is_private)",
    )
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((row) => {
    const profile = Array.isArray(row.profiles)
      ? (row.profiles[0] ?? null)
      : row.profiles;

    return {
      id: row.id,
      profile_id: row.profile_id,
      reason: row.reason,
      detail: row.detail,
      status: row.status ?? "pending",
      resolved_at: row.resolved_at,
      created_at: row.created_at,
      profile,
    };
  });
}

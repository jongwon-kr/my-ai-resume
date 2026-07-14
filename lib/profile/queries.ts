import type { SupabaseClient } from "@supabase/supabase-js";

import { isPendingSlug } from "@/lib/auth/constants";
import { MAX_PROFILES_PER_USER } from "@/lib/profile/constants";
import type { Database } from "@/types/database";

export interface UserProfileSummary {
  id: string;
  slug: string;
  name: string;
  label: string | null;
  status: string;
  created_at: string;
}

export async function listUserProfiles(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<UserProfileSummary[]> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, slug, name, label, status, created_at")
    .eq("owner_id", userId)
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

export async function getUserProfileCount(
  supabase: SupabaseClient<Database>,
  userId: string,
) {
  const profiles = await listUserProfiles(supabase, userId);
  return profiles.length;
}

export function canCreateProfile(profileCount: number) {
  return profileCount < MAX_PROFILES_PER_USER;
}

export async function getPrimaryProfileForUser(
  supabase: SupabaseClient<Database>,
  userId: string,
) {
  const profiles = await listUserProfiles(supabase, userId);
  return profiles[0] ?? null;
}

export async function getOnboardingProfile(
  supabase: SupabaseClient<Database>,
  userId: string,
) {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, slug")
    .eq("owner_id", userId)
    .like("slug", "pending_%")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function userNeedsOnboarding(
  supabase: SupabaseClient<Database>,
  userId: string,
) {
  const profiles = await listUserProfiles(supabase, userId);

  if (profiles.length === 0) {
    return true;
  }

  return profiles.every((profile) => isPendingSlug(profile.slug));
}

export async function resolveDashboardProfileId(
  supabase: SupabaseClient<Database>,
  userId: string,
  requestedProfileId?: string | null,
) {
  const profiles = await listUserProfiles(supabase, userId);

  if (profiles.length === 0) {
    return null;
  }

  if (requestedProfileId) {
    const match = profiles.find((profile) => profile.id === requestedProfileId);
    if (match) {
      return match.id;
    }
  }

  return profiles[0].id;
}

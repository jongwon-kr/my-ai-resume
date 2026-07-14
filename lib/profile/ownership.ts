import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database";

export class ProfileOwnershipError extends Error {
  constructor(message = "프로필에 접근할 수 없습니다.") {
    super(message);
    this.name = "ProfileOwnershipError";
  }
}

export async function assertProfileOwner(
  supabase: SupabaseClient<Database>,
  profileId: string,
  userId: string,
) {
  const { data, error } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", profileId)
    .eq("owner_id", userId)
    .maybeSingle();

  if (error || !data) {
    throw new ProfileOwnershipError();
  }

  return data;
}

export async function isProfileOwner(
  supabase: SupabaseClient<Database>,
  profileId: string,
  userId: string,
) {
  const { data } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", profileId)
    .eq("owner_id", userId)
    .maybeSingle();

  return Boolean(data);
}

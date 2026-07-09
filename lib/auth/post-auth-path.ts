import type { SupabaseClient } from "@supabase/supabase-js";

import { isPendingSlug } from "@/lib/auth/constants";
import type { Database } from "@/types/database";

export async function getPostAuthPath(
  supabase: SupabaseClient<Database>,
  fallback: string,
) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return "/login";
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("slug")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile || isPendingSlug(profile.slug)) {
    return "/onboarding";
  }

  return fallback;
}

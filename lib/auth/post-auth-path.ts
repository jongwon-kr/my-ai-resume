import type { SupabaseClient } from "@supabase/supabase-js";

import { isPendingSlug } from "@/lib/auth/constants";
import { getPrimaryProfileForUser } from "@/lib/profile/queries";
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

  const profile = await getPrimaryProfileForUser(supabase, user.id);

  if (!profile || isPendingSlug(profile.slug)) {
    return "/onboarding";
  }

  return fallback;
}

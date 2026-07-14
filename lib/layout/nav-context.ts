import { createClient } from "@/lib/supabase/server";
import { getPrimaryProfileForUser } from "@/lib/profile/queries";
import type { ProfileStatus } from "@/types/database";

export interface NavProfile {
  id: string;
  slug: string;
  status: ProfileStatus;
  is_private: boolean;
}

export interface NavContext {
  isAuthenticated: boolean;
  profile: NavProfile | null;
}

export async function getNavContext(): Promise<NavContext> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { isAuthenticated: false, profile: null };
  }

  const primaryProfile = await getPrimaryProfileForUser(supabase, user.id);

  if (!primaryProfile) {
    return { isAuthenticated: true, profile: null };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, slug, status, is_private")
    .eq("id", primaryProfile.id)
    .maybeSingle();

  return {
    isAuthenticated: true,
    profile: (profile as NavProfile | null) ?? null,
  };
}

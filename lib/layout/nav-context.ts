import { createClient } from "@/lib/supabase/server";
import type { ProfileStatus } from "@/types/database";

export interface NavProfile {
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

  const { data: profile } = await supabase
    .from("profiles")
    .select("slug, status, is_private")
    .eq("id", user.id)
    .maybeSingle();

  return {
    isAuthenticated: true,
    profile: profile ?? null,
  };
}

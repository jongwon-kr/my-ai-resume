import { createAdminClient } from "@/lib/supabase/admin";

export async function recordProfileView(profileId: string) {
  const supabase = createAdminClient();

  const { error } = await supabase.rpc("increment_profile_view", {
    p_profile_id: profileId,
  });

  if (error) {
    throw new Error(error.message);
  }
}

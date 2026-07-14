import { redirect } from "next/navigation";

import { getPrimaryProfileForUser } from "@/lib/profile/queries";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardEditRedirectPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const profile = await getPrimaryProfileForUser(supabase, user.id);

  if (!profile) {
    redirect("/onboarding");
  }

  redirect(`/dashboard/edit/${profile.id}`);
}

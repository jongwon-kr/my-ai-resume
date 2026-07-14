import { redirect } from "next/navigation";

import { PageBreadcrumb } from "@/components/layout/page-breadcrumb";
import { OnboardingSlugForm } from "@/components/onboarding/onboarding-slug-form";
import {
  getOnboardingProfile,
  getPrimaryProfileForUser,
} from "@/lib/profile/queries";
import { createClient } from "@/lib/supabase/server";

export default async function OnboardingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const onboardingProfile = await getOnboardingProfile(supabase, user.id);
  const primaryProfile = await getPrimaryProfileForUser(supabase, user.id);

  if (!onboardingProfile && primaryProfile) {
    redirect(`/dashboard/edit/${primaryProfile.id}`);
  }

  return (
    <div className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center p-6">
      <PageBreadcrumb
        items={[{ label: "홈", href: "/" }, { label: "온보딩" }]}
      />
      <OnboardingSlugForm profileId={onboardingProfile?.id ?? null} />
    </div>
  );
}

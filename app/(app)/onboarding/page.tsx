import { redirect } from "next/navigation";

import { PageBreadcrumb } from "@/components/layout/page-breadcrumb";
import { OnboardingSlugForm } from "@/components/onboarding/onboarding-slug-form";
import { isPendingSlug } from "@/lib/auth/constants";
import { createClient } from "@/lib/supabase/server";

export default async function OnboardingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("slug")
    .eq("id", user.id)
    .single();

  if (profile && !isPendingSlug(profile.slug)) {
    redirect("/dashboard/edit");
  }

  return (
    <div className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center p-6">
      <PageBreadcrumb
        items={[
          { label: "홈", href: "/" },
          { label: "온보딩" },
        ]}
      />
      <OnboardingSlugForm />
    </div>
  );
}

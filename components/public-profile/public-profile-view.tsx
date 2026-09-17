import { SiteHeader } from "@/components/layout/site-header";
import { ChatLauncher } from "@/components/public-profile/chat-launcher";
import { ProfileHero } from "@/components/public-profile/profile-hero";
import { ProfileViewTracker } from "@/components/public-profile/profile-view-tracker";
import { ResumePanel } from "@/components/public-profile/resume-panel";
import { SectionNav } from "@/components/public-profile/section-nav";
import { WatermarkCta } from "@/components/public-profile/watermark-cta";
import { getVisiblePublicSections } from "@/lib/public-profile/sections";
import type { PublicProfileData } from "@/lib/public-profile/types";
import { cn } from "@/lib/utils";

interface PublicProfileViewProps {
  data: PublicProfileData;
  isOwner?: boolean;
  isExample?: boolean;
}

export function PublicProfileView({
  data,
  isOwner = false,
  isExample = false,
}: PublicProfileViewProps) {
  // Computed once so the rail can never list a section the body does not render.
  const sections = getVisiblePublicSections(data);
  const hasRail = sections.length > 1;

  return (
    <>
      {!isExample ? <ProfileViewTracker profileId={data.profile.id} /> : null}

      <SiteHeader variant="public-profile" isProfileOwner={isOwner} />

      <main className="flex-1">
        <ProfileHero profile={data.profile} profileLinks={data.profileLinks} />

        <div
          className={cn(
            "mx-auto grid w-full max-w-6xl gap-10 px-4 py-10 sm:px-6 lg:py-14",
            hasRail && "lg:grid-cols-[minmax(0,1fr)_14rem]",
          )}
        >
          {/* min-w-0 keeps pre-wrapped prose from blowing out the grid track. */}
          <div className="min-w-0 space-y-12">
            <ResumePanel data={data} sections={sections} />
          </div>
          {hasRail ? <SectionNav sections={sections} /> : null}
        </div>
      </main>

      {/* Reserves room so the floating launcher never covers the CTA. */}
      <div className="pb-24 sm:pb-28">
        <WatermarkCta />
      </div>

      <ChatLauncher
        profileId={data.profile.id}
        profileName={data.profile.name}
        suggestedQuestions={data.suggestedQuestions}
        welcomeMessage={data.welcomeMessage}
      />
    </>
  );
}

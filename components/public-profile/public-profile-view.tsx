import { SiteHeader } from "@/components/layout/site-header";
import { ChatLauncher } from "@/components/public-profile/chat-launcher";
import { ProfileViewTracker } from "@/components/public-profile/profile-view-tracker";
import { PublicProfileBody } from "@/components/public-profile/public-profile-body";
import { WatermarkCta } from "@/components/public-profile/watermark-cta";
import type { PublicProfileData } from "@/lib/public-profile/types";

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
  return (
    <>
      {!isExample ? <ProfileViewTracker profileId={data.profile.id} /> : null}

      <SiteHeader variant="public-profile" isProfileOwner={isOwner} />

      <main className="flex-1">
        <PublicProfileBody data={data} />
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

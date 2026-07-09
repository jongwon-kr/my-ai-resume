"use client";

import { useMemo, useState } from "react";

import { SiteHeader } from "@/components/layout/site-header";
import { ChatPanel } from "@/components/public-profile/chat-panel";
import { ProfileViewTracker } from "@/components/public-profile/profile-view-tracker";
import { ReportButton } from "@/components/public-profile/report-button";
import { ResumePanel } from "@/components/public-profile/resume-panel";
import { ShareButtons } from "@/components/public-profile/share-buttons";
import { WatermarkCta } from "@/components/public-profile/watermark-cta";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { PublicProfileData } from "@/lib/public-profile/types";

interface PublicProfileViewProps {
  data: PublicProfileData;
  isOwner?: boolean;
}

export function PublicProfileView({
  data,
  isOwner = false,
}: PublicProfileViewProps) {
  const [mobileTab, setMobileTab] = useState("resume");

  const profileHeader = useMemo(
    () => (
      <div className="shrink-0 border-b px-4 py-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm text-muted-foreground">CloneCV AI Profile</p>
            <p className="font-medium">@{data.profile.slug}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <ShareButtons
              slug={data.profile.slug}
              name={data.profile.name}
              roleTitle={data.profile.role_title}
              intro={data.profile.intro}
              avatarUrl={data.profile.avatar_url}
            />
            <ReportButton profileId={data.profile.id} />
          </div>
        </div>
      </div>
    ),
    [data.profile],
  );

  return (
    <>
      <ProfileViewTracker profileId={data.profile.id} />

      {/* Desktop: fixed-height split. Résumé scrolls independently; chat stays pinned. */}
      <div className="hidden h-screen flex-col overflow-hidden lg:flex">
        <SiteHeader variant="public-profile" isProfileOwner={isOwner} />
        {profileHeader}
        <div className="flex min-h-0 flex-1">
          <div className="min-h-0 w-1/2 overflow-y-auto border-r">
            <div className="p-6">
              <ResumePanel data={data} />
            </div>
            <WatermarkCta />
          </div>
          <div className="flex min-h-0 w-1/2 flex-col p-4">
            <ChatPanel
              profileId={data.profile.id}
              profileName={data.profile.name}
              suggestedQuestions={data.suggestedQuestions}
            />
          </div>
        </div>
      </div>

      {/* Mobile: tabbed view. */}
      <div className="flex min-h-full flex-col lg:hidden">
        <SiteHeader variant="public-profile" isProfileOwner={isOwner} />
        {profileHeader}
        <Tabs value={mobileTab} onValueChange={setMobileTab}>
          <TabsList className="mx-4 mt-4 grid w-auto grid-cols-2">
            <TabsTrigger value="resume">이력서</TabsTrigger>
            <TabsTrigger value="chat">채팅</TabsTrigger>
          </TabsList>
          <TabsContent value="resume" className="p-4">
            <ResumePanel data={data} />
          </TabsContent>
          <TabsContent value="chat" className="flex min-h-[520px] flex-col p-4">
            <ChatPanel
              profileId={data.profile.id}
              profileName={data.profile.name}
              suggestedQuestions={data.suggestedQuestions}
            />
          </TabsContent>
        </Tabs>
        <WatermarkCta />
      </div>
    </>
  );
}

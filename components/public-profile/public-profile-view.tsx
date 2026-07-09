"use client";

import { useMemo, useState } from "react";

import { ChatPanel } from "@/components/public-profile/chat-panel";
import { ProfileViewTracker } from "@/components/public-profile/profile-view-tracker";
import { ReportButton } from "@/components/public-profile/report-button";
import { ResumePanel } from "@/components/public-profile/resume-panel";
import { ShareButtons } from "@/components/public-profile/share-buttons";
import { WatermarkCta } from "@/components/public-profile/watermark-cta";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import type { PublicProfileData } from "@/lib/public-profile/types";

export function PublicProfileView({ data }: { data: PublicProfileData }) {
  const [mobileTab, setMobileTab] = useState("resume");

  const header = useMemo(
    () => (
      <div className="border-b px-4 py-3">
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
    <div className="flex min-h-full flex-col">
      <ProfileViewTracker profileId={data.profile.id} />
      {header}

      <div className="hidden flex-1 lg:grid lg:grid-cols-2 lg:gap-0">
        <div className="border-r p-6">
          <ResumePanel data={data} />
        </div>
        <div className="flex min-h-[640px] flex-col p-4">
          <ChatPanel
            profileId={data.profile.id}
            profileName={data.profile.name}
            suggestedQuestions={data.suggestedQuestions}
          />
        </div>
      </div>

      <div className="flex flex-1 flex-col lg:hidden">
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
      </div>

      <WatermarkCta />
    </div>
  );
}

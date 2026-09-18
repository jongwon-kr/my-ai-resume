"use client";

import { useState } from "react";

import { ChatLogsTab } from "@/components/dashboard/chat-logs-tab";
import {
  DashboardOverview,
  type DashboardTabValue,
} from "@/components/dashboard/dashboard-overview";
import { InquiriesTab } from "@/components/dashboard/inquiries-tab";
import { ProfileManagementTab } from "@/components/dashboard/profile-management-tab";
import { ProfilePublishBar } from "@/components/dashboard/profile-publish-bar";
import { StatsTab } from "@/components/dashboard/stats-tab";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { DashboardData } from "@/lib/dashboard/types";

/** One source for both the desktop tab list and the mobile select. */
const TABS: Array<{ value: DashboardTabValue; label: string }> = [
  { value: "profile", label: "프로필 관리" },
  { value: "logs", label: "대화 로그" },
  { value: "inquiries", label: "받은 질문" },
  { value: "stats", label: "통계" },
];

export function DashboardTabs({
  data,
  profileCount = 1,
  demoMode = false,
  defaultTab = "profile",
}: {
  data: DashboardData;
  /** How many profiles the account owns — gates profile deletion. */
  profileCount?: number;
  demoMode?: boolean;
  defaultTab?: DashboardTabValue;
}) {
  // Controlled so the overview tiles can jump straight to the right tab.
  const [tab, setTab] = useState<DashboardTabValue>(defaultTab);

  return (
    <div className="space-y-4">
      <ProfilePublishBar
        profileId={data.profile.id}
        slug={data.profile.slug}
        status={data.profile.status}
        initialIsPrivate={data.profile.is_private}
        demoMode={demoMode}
      />

      <DashboardOverview
        completion={data.completion}
        coverageGaps={data.coverageGaps}
        sessions={data.sessions}
        unansweredQuestions={data.stats.unanswered_questions}
        onNavigate={setTab}
      />

      <Tabs
        value={tab}
        onValueChange={(value) => setTab(value as DashboardTabValue)}
        className="space-y-4"
      >
        {/* Below sm the four tabs do not fit; a select keeps every option
            reachable instead of pushing some off-screen. */}
        <div className="sm:hidden">
          <Select
            value={tab}
            onValueChange={(value) => {
              if (value !== null) setTab(value as DashboardTabValue);
            }}
          >
            <SelectTrigger className="w-full" aria-label="대시보드 탭 선택">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TABS.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <TabsList variant="line" className="hidden sm:inline-flex">
          {TABS.map((item) => (
            <TabsTrigger key={item.value} value={item.value}>
              {item.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="profile">
          <ProfileManagementTab
            profile={data.profile}
            completion={data.completion}
            coverageGaps={data.coverageGaps}
            profileCount={profileCount}
            demoMode={demoMode}
          />
        </TabsContent>

        <TabsContent value="logs">
          <ChatLogsTab
            profileId={data.profile.id}
            sessions={data.sessions}
            messages={data.messages}
          />
        </TabsContent>

        <TabsContent value="inquiries">
          <InquiriesTab inquiries={data.inquiries} />
        </TabsContent>

        <TabsContent value="stats">
          <StatsTab
            stats={data.stats}
            aiUsage={data.aiUsage}
            profileId={data.profile.id}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

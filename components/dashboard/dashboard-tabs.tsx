"use client";

import { ChatLogsTab } from "@/components/dashboard/chat-logs-tab";
import { ProfileManagementTab } from "@/components/dashboard/profile-management-tab";
import { StatsTab } from "@/components/dashboard/stats-tab";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { DashboardData } from "@/lib/dashboard/types";

export function DashboardTabs({ data }: { data: DashboardData }) {
  return (
    <Tabs defaultValue="profile" className="space-y-4">
      <TabsList>
        <TabsTrigger value="profile">프로필 관리</TabsTrigger>
        <TabsTrigger value="logs">대화 로그</TabsTrigger>
        <TabsTrigger value="stats">통계</TabsTrigger>
      </TabsList>

      <TabsContent value="profile">
        <ProfileManagementTab
          profile={data.profile}
          completion={data.completion}
        />
      </TabsContent>

      <TabsContent value="logs">
        <ChatLogsTab sessions={data.sessions} messages={data.messages} />
      </TabsContent>

      <TabsContent value="stats">
        <StatsTab stats={data.stats} />
      </TabsContent>
    </Tabs>
  );
}

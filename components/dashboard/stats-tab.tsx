"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { DashboardStats } from "@/lib/dashboard/types";

interface StatsTabProps {
  stats: DashboardStats;
}

export function StatsTab({ stats }: StatsTabProps) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>총 조회수</CardTitle>
            <CardDescription>퍼블릭 프로필 방문 수</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">
              {stats.view_count.toLocaleString("ko-KR")}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>대화 세션</CardTitle>
            <CardDescription>누적 AI 채팅 세션 수</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">
              {stats.session_count.toLocaleString("ko-KR")}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>최근 7일 추이</CardTitle>
          <CardDescription>일별 조회수와 대화 세션 수</CardDescription>
        </CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats.trend}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="label" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Bar
                dataKey="views"
                name="조회수"
                fill="#2563eb"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="sessions"
                name="세션"
                fill="#94a3b8"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

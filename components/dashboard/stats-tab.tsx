"use client";

import { useState } from "react";
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

import { Button } from "@/components/ui/button";

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
  profileId: string;
}

export function StatsTab({ stats, profileId }: StatsTabProps) {
  const [faqStatus, setFaqStatus] = useState<string | null>(null);

  async function addQuestionToFaq(question: string) {
    setFaqStatus(null);
    const response = await fetch("/api/faq/from-chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        profileId,
        question,
        answer: "답변을 편집 페이지에서 작성해 주세요.",
      }),
    });

    if (!response.ok) {
      setFaqStatus("FAQ 추가에 실패했습니다.");
      return;
    }

    setFaqStatus(`"${question}" 질문을 FAQ 초안으로 추가했습니다.`);
  }

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
          <CardTitle>많이 묻는 질문</CardTitle>
          <CardDescription>
            방문자가 AI 클론에 보낸 질문 상위 5개
          </CardDescription>
        </CardHeader>
        <CardContent>
          {faqStatus ? (
            <p className="mb-3 text-xs text-muted-foreground">{faqStatus}</p>
          ) : null}
          {stats.top_questions.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              아직 집계할 방문자 질문이 없습니다.
            </p>
          ) : (
            <ol className="space-y-3">
              {stats.top_questions.map((item, index) => (
                <li
                  key={`${item.question}-${index}`}
                  className="flex items-start justify-between gap-4 rounded-lg border p-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-muted-foreground">
                      #{index + 1}
                    </p>
                    <p className="mt-1 text-sm">{item.question}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className="shrink-0 rounded-full bg-muted px-2.5 py-1 text-xs font-medium">
                      {item.count}회
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => void addQuestionToFaq(item.question)}
                    >
                      FAQ에 추가
                    </Button>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </CardContent>
      </Card>

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

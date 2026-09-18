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

import { AiUsageCard } from "@/components/dashboard/ai-usage-card";
import { Button } from "@/components/ui/button";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { AiUsageSummary } from "@/lib/dashboard/ai-usage";
import type { TopQuestion } from "@/lib/dashboard/top-questions";
import type { DashboardStats } from "@/lib/dashboard/types";

interface StatsTabProps {
  stats: DashboardStats;
  aiUsage: AiUsageSummary;
  profileId: string;
}

function QuestionList({
  questions,
  emptyText,
  actionLabel,
  onAction,
}: {
  questions: TopQuestion[];
  emptyText: string;
  actionLabel: string;
  onAction: (question: string) => void;
}) {
  if (questions.length === 0) {
    return <p className="text-sm text-muted-foreground">{emptyText}</p>;
  }

  return (
    <ol className="space-y-3">
      {questions.map((item, index) => (
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
              onClick={() => onAction(item.question)}
            >
              {actionLabel}
            </Button>
          </div>
        </li>
      ))}
    </ol>
  );
}

export function StatsTab({ stats, aiUsage, profileId }: StatsTabProps) {
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
            <CardDescription>공개 프로필 방문 수</CardDescription>
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

      <AiUsageCard usage={aiUsage} />

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
          <QuestionList
            questions={stats.top_questions}
            emptyText="아직 집계할 방문자 질문이 없습니다."
            actionLabel="FAQ에 추가"
            onAction={(question) => void addQuestionToFaq(question)}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>답변하지 못한 질문</CardTitle>
          <CardDescription>
            AI 클론이 이력서 근거를 찾지 못해 답하지 못한 질문입니다. FAQ로
            답변을 작성하면 다음부터 바로 답할 수 있습니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <QuestionList
            questions={stats.unanswered_questions}
            emptyText="답하지 못한 질문이 없습니다."
            actionLabel="FAQ로 답변 작성"
            onAction={(question) => void addQuestionToFaq(question)}
          />
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

"use client";

import {
  CheckCircle2,
  FileText,
  MessageSquare,
  Sparkles,
  TriangleAlert,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { CoverageGap } from "@/lib/chat/question-coverage";
import { getAnswerReadiness } from "@/lib/dashboard/readiness";
import type { TopQuestion } from "@/lib/dashboard/top-questions";
import type { DashboardSession } from "@/lib/dashboard/types";
import type { ResumeCompletionResult } from "@/lib/resume/completion";
import { cn } from "@/lib/utils";

export type DashboardTabValue = "profile" | "logs" | "inquiries" | "stats";

interface DashboardOverviewProps {
  completion: ResumeCompletionResult;
  coverageGaps: CoverageGap[];
  sessions: DashboardSession[];
  unansweredQuestions: TopQuestion[];
  onNavigate: (tab: DashboardTabValue) => void;
}

const RECENT_SESSION_LIMIT = 3;

function formatSessionDate(value: string) {
  return new Date(value).toLocaleDateString("ko-KR", {
    month: "long",
    day: "numeric",
  });
}

function ScoreTile({
  icon: Icon,
  label,
  percent,
  caption,
  actionLabel,
  onAction,
}: {
  icon: typeof FileText;
  label: string;
  percent: number;
  caption: string;
  actionLabel: string;
  onAction: () => void;
}) {
  return (
    <div className="flex flex-col rounded-lg border p-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Icon className="size-4" />
        {label}
      </div>

      <p className="mt-2 text-3xl font-semibold">{percent}%</p>

      <div
        className="mt-2 h-2 overflow-hidden rounded-full bg-primary/15"
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
      >
        <div
          className="h-full rounded-full bg-primary transition-[width] duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>

      <p className="mt-2 flex-1 text-xs text-muted-foreground">{caption}</p>

      <Button
        type="button"
        variant="outline"
        size="sm"
        className="mt-3 self-start"
        onClick={onAction}
      >
        {actionLabel}
      </Button>
    </div>
  );
}

/**
 * The answer to "what should I do next?" on arrival.
 *
 * Everything here comes from data the dashboard already loads — no extra
 * queries — and every tile links into the tab that acts on it.
 */
export function DashboardOverview({
  completion,
  coverageGaps,
  sessions,
  unansweredQuestions,
  onNavigate,
}: DashboardOverviewProps) {
  const readiness = getAnswerReadiness(coverageGaps);
  const recentSessions = sessions.slice(0, RECENT_SESSION_LIMIT);
  const hasUnanswered = unansweredQuestions.length > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>한눈에 보기</CardTitle>
        <CardDescription>
          지금 무엇을 보완하면 좋을지 먼저 확인하세요.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <ScoreTile
          icon={FileText}
          label="이력서 완성도"
          percent={completion.percent}
          caption={
            completion.incompleteItems[0]
              ? `다음: ${completion.incompleteItems[0].label}`
              : "모든 항목을 작성했습니다."
          }
          actionLabel="프로필 관리"
          onAction={() => onNavigate("profile")}
        />

        <ScoreTile
          icon={Sparkles}
          label="AI 답변 준비율"
          percent={readiness.percent}
          caption={
            readiness.remaining > 0
              ? `근거가 없는 질문 유형 ${readiness.remaining}개`
              : "주요 질문에 답할 근거가 모두 있습니다."
          }
          actionLabel="보완할 항목 보기"
          onAction={() => onNavigate("profile")}
        />

        <div className="flex flex-col rounded-lg border p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MessageSquare className="size-4" />
            최근 방문자 대화
          </div>

          {recentSessions.length === 0 ? (
            <p className="mt-2 flex-1 text-sm text-muted-foreground">
              아직 방문자 대화가 없습니다.
            </p>
          ) : (
            <ul className="mt-2 flex-1 space-y-2">
              {recentSessions.map((session) => (
                <li key={session.id} className="text-xs">
                  <p className="truncate text-foreground">
                    {session.preview ?? "내용 없음"}
                  </p>
                  <p className="text-muted-foreground">
                    {formatSessionDate(session.created_at)} ·{" "}
                    {session.message_count}개 메시지
                  </p>
                </li>
              ))}
            </ul>
          )}

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-3 self-start"
            onClick={() => onNavigate("logs")}
          >
            대화 로그 보기
          </Button>
        </div>

        <div
          className={cn(
            "flex flex-col rounded-lg border p-4",
            hasUnanswered && "border-amber-500/40 bg-amber-500/5",
          )}
        >
          {/* Icon + wording carry the state, not colour alone. */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {hasUnanswered ? (
              <TriangleAlert className="size-4 text-amber-600" />
            ) : (
              <CheckCircle2 className="size-4 text-emerald-600" />
            )}
            답변하지 못한 질문
          </div>

          <p className="mt-2 text-3xl font-semibold">
            {unansweredQuestions.length}
          </p>

          <p className="mt-2 flex-1 text-xs text-muted-foreground">
            {!hasUnanswered
              ? "클론이 모든 질문에 답했습니다."
              : unansweredQuestions.length === 1
                ? `"${unansweredQuestions[0].question}"`
                : `"${unansweredQuestions[0].question}" 외 ${unansweredQuestions.length - 1}건`}
          </p>

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-3 self-start"
            onClick={() => onNavigate("stats")}
          >
            통계에서 확인
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

"use client";

import { useMemo, useState } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type {
  DashboardMessage,
  DashboardSession,
} from "@/lib/dashboard/types";
import { cn } from "@/lib/utils";

interface ChatLogsTabProps {
  sessions: DashboardSession[];
  messages: DashboardMessage[];
}

function formatSessionDate(value: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function ChatLogsTab({ sessions, messages }: ChatLogsTabProps) {
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(
    sessions[0]?.id ?? null,
  );

  const selectedMessages = useMemo(() => {
    if (!selectedSessionId) {
      return [];
    }

    return messages.filter((message) => message.session_id === selectedSessionId);
  }, [messages, selectedSessionId]);

  if (sessions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>대화 로그</CardTitle>
          <CardDescription>아직 방문자 대화가 없습니다.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
      <Card className="h-fit">
        <CardHeader>
          <CardTitle>세션 목록</CardTitle>
          <CardDescription>최근 대화부터 표시됩니다.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {sessions.map((session) => (
            <button
              key={session.id}
              type="button"
              onClick={() => setSelectedSessionId(session.id)}
              className={cn(
                "w-full rounded-lg border p-3 text-left transition-colors hover:bg-muted/50",
                selectedSessionId === session.id && "border-primary bg-muted/50",
              )}
            >
              <p className="text-sm font-medium">
                {formatSessionDate(session.created_at)}
              </p>
              <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                {session.preview ?? "대화 미리보기 없음"}
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                메시지 {session.message_count}개
              </p>
            </button>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>대화 내용</CardTitle>
          <CardDescription>
            방문자 식별 정보는 저장되지 않습니다.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {selectedMessages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "max-w-[85%] rounded-2xl px-4 py-2 text-sm whitespace-pre-wrap",
                message.role === "user"
                  ? "ml-auto bg-primary text-primary-foreground"
                  : "bg-muted",
              )}
            >
              {message.content}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

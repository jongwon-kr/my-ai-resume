"use client";

import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
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
  profileId: string;
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

export function ChatLogsTab({
  profileId,
  sessions,
  messages,
}: ChatLogsTabProps) {
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(
    sessions[0]?.id ?? null,
  );
  const [faqStatus, setFaqStatus] = useState<string | null>(null);

  const selectedMessages = useMemo(() => {
    if (!selectedSessionId) {
      return [];
    }

    return messages.filter((message) => message.session_id === selectedSessionId);
  }, [messages, selectedSessionId]);

  async function saveAsFaq(userQuestion: string, assistantAnswer: string) {
    setFaqStatus(null);
    const response = await fetch("/api/faq/from-chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        profileId,
        question: userQuestion,
        answer: assistantAnswer,
      }),
    });

    if (!response.ok) {
      setFaqStatus("FAQ 저장에 실패했습니다.");
      return;
    }

    setFaqStatus("FAQ로 저장하고 프롬프트를 갱신했습니다.");
  }

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
            assistant 답변 옆 FAQ 저장으로 예상 질문에 추가할 수 있습니다.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {faqStatus ? (
            <p className="text-xs text-muted-foreground">{faqStatus}</p>
          ) : null}
          {selectedMessages.map((message, index) => {
            const prevUser =
              message.role === "assistant"
                ? selectedMessages
                    .slice(0, index)
                    .reverse()
                    .find((item) => item.role === "user")
                : null;

            return (
              <div key={message.id} className="space-y-2">
                <div
                  className={cn(
                    "max-w-[85%] rounded-2xl px-4 py-2 text-sm whitespace-pre-wrap",
                    message.role === "user"
                      ? "ml-auto bg-primary text-primary-foreground"
                      : "bg-muted",
                  )}
                >
                  {message.content}
                </div>
                {message.role === "assistant" && prevUser ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      void saveAsFaq(prevUser.content, message.content)
                    }
                  >
                    FAQ로 저장
                  </Button>
                ) : null}
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}

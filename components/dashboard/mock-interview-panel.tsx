"use client";

import { useState } from "react";

import { ChatPanel } from "@/components/public-profile/chat-panel";
import { Button } from "@/components/ui/button";
import type { MockInterviewStyle } from "@/lib/prompt/build-mock-interview-prompt";

const STYLES: Array<{ id: MockInterviewStyle; label: string }> = [
  { id: "general", label: "일반" },
  { id: "pressure", label: "압박" },
  { id: "technical", label: "기술 Deep-dive" },
  { id: "cover_letter", label: "자기소개서 검증" },
];

interface MockInterviewPanelProps {
  profileId: string;
  profileName: string;
}

export function MockInterviewPanel({
  profileId,
  profileName,
}: MockInterviewPanelProps) {
  const [style, setStyle] = useState<MockInterviewStyle>("general");
  const [started, setStarted] = useState(false);

  if (!started) {
    return (
      <div className="space-y-4 rounded-lg border p-4">
        <div>
          <p className="font-medium">모의 면접 연습</p>
          <p className="mt-1 text-sm text-muted-foreground">
            AI가 면접관 역할로 이력서 기반 질문을 던집니다. 답변 연습에
            활용하세요.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {STYLES.map((item) => (
            <Button
              key={item.id}
              type="button"
              size="sm"
              variant={style === item.id ? "default" : "outline"}
              onClick={() => setStyle(item.id)}
            >
              {item.label}
            </Button>
          ))}
        </div>
        <Button type="button" onClick={() => setStarted(true)}>
          면접 시작
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">모의 면접 — {STYLES.find((s) => s.id === style)?.label}</p>
        <Button type="button" variant="ghost" size="sm" onClick={() => setStarted(false)}>
          종료
        </Button>
      </div>
      <ChatPanel
        profileId={profileId}
        profileName={profileName}
        suggestedQuestions={[]}
        welcomeMessage={`${profileName}님, 모의 면접을 시작합니다. 면접관이 질문을 던지면 답변해 주세요.`}
        mode="mock_interview"
        interviewStyle={style}
      />
    </div>
  );
}

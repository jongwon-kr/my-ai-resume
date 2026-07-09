"use client";

import { ChatPanel } from "@/components/public-profile/chat-panel";

interface ChatPreviewPanelProps {
  profileId: string;
  profileName: string;
}

export function ChatPreviewPanel({
  profileId,
  profileName,
}: ChatPreviewPanelProps) {
  return (
    <div className="space-y-2 rounded-lg border p-4">
      <p className="text-sm font-medium">챗봇 미리보기</p>
      <p className="text-xs text-muted-foreground">
        발행 전 현재 이력서 데이터로 AI가 어떻게 답하는지 테스트합니다.
      </p>
      <ChatPanel
        profileId={profileId}
        profileName={profileName}
        suggestedQuestions={[
          "지원 동기가 어떻게 되나요?",
          "가장 어려웠던 프로젝트는?",
          "팀에서 어떤 역할을 맡았나요?",
        ]}
        welcomeMessage={`${profileName}님, 미리보기 모드입니다. 면접관 질문을 입력해 보세요.`}
        mode="preview"
      />
    </div>
  );
}

"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface InquiryFormProps {
  profileId: string;
  sessionId: string | null;
  ownerName: string;
  onClose: () => void;
}

export function InquiryForm({
  profileId,
  sessionId,
  ownerName,
  onClose,
}: InquiryFormProps) {
  const [visitorName, setVisitorName] = useState("");
  const [visitorEmail, setVisitorEmail] = useState("");
  const [question, setQuestion] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle",
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setStatus("loading");
    setErrorMessage(null);

    try {
      const response = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profileId,
          sessionId,
          visitorName: visitorName.trim() || undefined,
          visitorEmail: visitorEmail.trim(),
          question: question.trim(),
        }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(payload?.error ?? "문의 전송에 실패했습니다.");
      }

      setStatus("success");
    } catch (error) {
      setStatus("error");
      setErrorMessage(
        error instanceof Error ? error.message : "문의 전송에 실패했습니다.",
      );
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-lg border bg-muted/40 p-3 text-sm">
        <p className="font-medium">문의가 전달되었습니다.</p>
        <p className="mt-1 text-muted-foreground">
          {ownerName}님이 확인 후 이메일로 답변드릴 예정입니다.
        </p>
        <Button type="button" variant="ghost" size="sm" className="mt-2" onClick={onClose}>
          닫기
        </Button>
      </div>
    );
  }

  return (
    <form
      className="space-y-2 rounded-lg border bg-muted/30 p-3"
      onSubmit={(event) => void handleSubmit(event)}
    >
      <p className="text-sm font-medium">직접 문의하기</p>
      <p className="text-xs text-muted-foreground">
        AI가 답변하기 어려운 내용은 {ownerName}님께 전달됩니다.
      </p>
      <Input
        value={visitorName}
        onChange={(event) => setVisitorName(event.target.value)}
        placeholder="이름 (선택)"
        disabled={status === "loading"}
      />
      <Input
        type="email"
        required
        value={visitorEmail}
        onChange={(event) => setVisitorEmail(event.target.value)}
        placeholder="이메일"
        disabled={status === "loading"}
      />
      <textarea
        required
        value={question}
        onChange={(event) => setQuestion(event.target.value)}
        placeholder="질문 내용"
        rows={3}
        disabled={status === "loading"}
        className="w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
      />
      {errorMessage ? (
        <p className="text-xs text-destructive" role="alert">
          {errorMessage}
        </p>
      ) : null}
      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={status === "loading"}>
          {status === "loading" ? "전송 중..." : "전달하기"}
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={onClose}>
          닫기
        </Button>
      </div>
    </form>
  );
}

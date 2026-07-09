"use client";

import { useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CHAT_ERROR_MESSAGE } from "@/lib/chat/constants";
import { cn } from "@/lib/utils";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

/** Renders `**bold**` as <strong>; other text is left as-is (pre-wrap keeps line breaks). */
function renderMessageContent(content: string) {
  return content.split(/(\*\*.+?\*\*)/g).map((part, index) => {
    if (part.length > 4 && part.startsWith("**") && part.endsWith("**")) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }

    return <span key={index}>{part}</span>;
  });
}

interface ChatPanelProps {
  profileId: string;
  profileName: string;
  suggestedQuestions: string[];
}

export function ChatPanel({
  profileId,
  profileName,
  suggestedQuestions,
}: ChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content: `안녕하세요. ${profileName}의 AI 클론입니다. 궁금한 점을 편하게 물어보세요.`,
    },
  ]);
  const [questions, setQuestions] = useState<string[]>(suggestedQuestions);
  const [input, setInput] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  async function sendMessage(rawMessage: string) {
    const message = rawMessage.trim();
    if (!message || isStreaming) {
      return;
    }

    setError(null);
    setIsStreaming(true);
    setInput("");

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: message,
    };
    const assistantId = crypto.randomUUID();

    setMessages((prev) => [
      ...prev,
      userMessage,
      { id: assistantId, role: "assistant", content: "" },
    ]);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileId, sessionId, message }),
      });

      if (response.status === 429) {
        throw new Error("요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.");
      }

      if (!response.ok || !response.body) {
        throw new Error(CHAT_ERROR_MESSAGE);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const events = buffer.split("\n\n");
        buffer = events.pop() ?? "";

        for (const event of events) {
          const line = event.trim();
          if (!line.startsWith("data: ")) {
            continue;
          }

          const payload = JSON.parse(line.slice(6)) as {
            type: string;
            sessionId?: string;
            text?: string;
            message?: string;
            questions?: string[];
          };

          if (payload.type === "session" && payload.sessionId) {
            setSessionId(payload.sessionId);
          }

          if (
            payload.type === "suggestions" &&
            Array.isArray(payload.questions) &&
            payload.questions.length > 0
          ) {
            setQuestions(payload.questions);
          }

          if (payload.type === "delta" && payload.text) {
            setMessages((prev) =>
              prev.map((item) =>
                item.id === assistantId
                  ? { ...item, content: item.content + payload.text }
                  : item,
              ),
            );
          }

          if (payload.type === "replace" && payload.text) {
            setMessages((prev) =>
              prev.map((item) =>
                item.id === assistantId
                  ? { ...item, content: payload.text ?? "" }
                  : item,
              ),
            );
          }

          if (payload.type === "error") {
            throw new Error(payload.message ?? CHAT_ERROR_MESSAGE);
          }
        }
      }
    } catch (sendError) {
      setError(
        sendError instanceof Error ? sendError.message : CHAT_ERROR_MESSAGE,
      );
      setMessages((prev) => prev.filter((item) => item.id !== assistantId));
    } finally {
      setIsStreaming(false);
      listRef.current?.scrollTo({
        top: listRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }

  return (
    <div className="flex h-full min-h-[520px] flex-col rounded-xl border bg-background">
      <div
        ref={listRef}
        className="flex-1 space-y-3 overflow-y-auto p-4"
        aria-live="polite"
        aria-busy={isStreaming}
      >
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "max-w-[85%] rounded-2xl px-4 py-2 text-sm whitespace-pre-wrap",
              message.role === "user"
                ? "ml-auto bg-primary text-primary-foreground"
                : "bg-muted text-foreground",
            )}
          >
            {message.content
              ? renderMessageContent(message.content)
              : isStreaming
                ? "..."
                : ""}
          </div>
        ))}
      </div>

      <div className="border-t p-4">
        <div className="mb-3 flex flex-wrap gap-2">
          {questions.map((question) => (
            <button
              key={question}
              type="button"
              disabled={isStreaming}
              aria-label={`추천 질문: ${question}`}
              className="rounded-full border px-3 py-1 text-xs hover:bg-muted disabled:opacity-50"
              onClick={() => sendMessage(question)}
            >
              {question}
            </button>
          ))}
        </div>

        {error ? (
          <p className="mb-2 text-xs text-destructive" role="alert">
            {error}
          </p>
        ) : null}

        <form
          className="flex gap-2"
          aria-busy={isStreaming}
          onSubmit={(event) => {
            event.preventDefault();
            void sendMessage(input);
          }}
        >
          <Input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="질문을 입력하세요"
            disabled={isStreaming}
            aria-label="채팅 메시지 입력"
          />
          <Button
            type="submit"
            disabled={isStreaming || !input.trim()}
            aria-label="메시지 전송"
          >
            {isStreaming ? "전송 중..." : "전송"}
          </Button>
        </form>
      </div>
    </div>
  );
}

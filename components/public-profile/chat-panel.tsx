"use client";

import { useEffect, useRef, useState } from "react";
import { Bot, ChevronDown, Lightbulb } from "lucide-react";

import { InquiryForm } from "@/components/public-profile/inquiry-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CHAT_ERROR_MESSAGE,
  CHAT_MAX_MESSAGE_CHARS,
  formatGeminiModelLabel,
  GEMINI_MODEL,
  GEMINI_MODELS,
} from "@/lib/chat/constants";
import type { MockInterviewStyle } from "@/lib/prompt/build-mock-interview-prompt";
import { cn } from "@/lib/utils";

/** Visitors see a short prompt list; more than this crowds the window. */
const SUGGESTED_QUESTION_LIMIT = 3;

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

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
  welcomeMessage: string;
  mode?: "visitor" | "mock_interview" | "preview";
  interviewStyle?: MockInterviewStyle;
  /** Lets an outer container own the panel's size and chrome. */
  className?: string;
  /** Slot at the right of the header, e.g. window controls. */
  headerActions?: React.ReactNode;
  /** Lets the floating window focus the composer on open. */
  inputRef?: React.Ref<HTMLInputElement>;
}

export function ChatPanel({
  profileId,
  profileName,
  suggestedQuestions,
  welcomeMessage,
  mode = "visitor",
  interviewStyle = "general",
  className,
  headerActions,
  inputRef,
}: ChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content: welcomeMessage,
    },
  ]);
  const [questions, setQuestions] = useState<string[]>(suggestedQuestions);
  const [input, setInput] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFailedMessage, setLastFailedMessage] = useState<string | null>(
    null,
  );
  const [showInquiryForm, setShowInquiryForm] = useState(false);
  const [showQuestions, setShowQuestions] = useState(false);

  const [selectedModel, setSelectedModel] = useState<string>(GEMINI_MODEL);
  const listRef = useRef<HTMLDivElement>(null);
  /** False once the reader scrolls up, so streaming never yanks the view. */
  const pinnedRef = useRef(true);

  // Runs after commit, so each streamed delta re-pins the view to the bottom.
  useEffect(() => {
    const list = listRef.current;
    if (!list || !pinnedRef.current) {
      return;
    }
    list.scrollTop = list.scrollHeight;
  }, [messages, showInquiryForm, showQuestions]);

  async function sendMessage(rawMessage: string) {
    const message = rawMessage.trim();
    if (!message || isStreaming) return;

    setError(null);
    setLastFailedMessage(null);
    setShowInquiryForm(false);
    setIsStreaming(true);
    setInput("");
    pinnedRef.current = true;

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
        body: JSON.stringify({
          profileId,
          sessionId,
          message,
          mode,
          interviewStyle,
          model: selectedModel,
        }),
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
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const events = buffer.split("\n\n");
        buffer = events.pop() ?? "";

        for (const event of events) {
          const line = event.trim();
          if (!line.startsWith("data: ")) continue;

          const payload = JSON.parse(line.slice(6)) as {
            type: string;
            sessionId?: string;
            text?: string;
            message?: string;
            questions?: string[];
            model?: string;
          };

          if (payload.type === "session" && payload.sessionId) {
            setSessionId(payload.sessionId);
          }

          if (payload.type === "model_used" && payload.model) {
            console.log("응답에 사용된 모델:", payload.model);
          }

          if (
            payload.type === "suggestions" &&
            Array.isArray(payload.questions) &&
            payload.questions.length > 0
          ) {
            setQuestions(payload.questions);
          }

          if (payload.type === "inquiry_offer") {
            setShowInquiryForm(true);
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
      setLastFailedMessage(message);
      setMessages((prev) => prev.filter((item) => item.id !== assistantId));
    } finally {
      setIsStreaming(false);
    }
  }

  return (
    <div
      className={cn(
        "flex h-full min-h-[520px] flex-col rounded-xl border bg-background",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-3 border-b p-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm">
            <Bot className="size-6" />
          </div>
          <div className="flex min-w-0 flex-col">
            <h3 className="truncate text-base font-bold text-foreground">
              {profileName}님의 AI 챗봇
            </h3>
            <p className="text-xs text-muted-foreground">
              궁금한 점을 직접 물어보세요
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          {headerActions}
          {/* Visitors do not pick the model: it drives cost and quota (docs/07 §6-1-4). */}
          {mode !== "visitor" ? (
            <Select
              value={selectedModel}
              onValueChange={(value) => {
                if (value !== null) setSelectedModel(value);
              }}
              disabled={isStreaming}
            >
              <SelectTrigger className="h-9 w-[165px] bg-muted/50 text-xs">
                <SelectValue placeholder="모델 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="auto">
                  <span className="font-semibold text-primary">auto(자동)</span>
                </SelectItem>
                {GEMINI_MODELS.map((modelId) => (
                  <SelectItem key={modelId} value={modelId}>
                    {formatGeminiModelLabel(modelId)}
                    {modelId === GEMINI_MODEL ? " (기본)" : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : null}
        </div>
      </div>

      <div
        ref={listRef}
        data-chat-log=""
        onScroll={(event) => {
          const list = event.currentTarget;
          pinnedRef.current =
            list.scrollHeight - list.scrollTop - list.clientHeight < 48;
        }}
        className="flex-1 space-y-3 overflow-y-auto p-4"
        aria-live="polite"
        aria-busy={isStreaming}
      >
        {messages.map((message) => (
          <div
            key={message.id}
            data-message-role={message.role}
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

        {showInquiryForm && mode === "visitor" ? (
          <InquiryForm
            profileId={profileId}
            sessionId={sessionId}
            ownerName={profileName}
            onClose={() => setShowInquiryForm(false)}
          />
        ) : null}
      </div>

      <div className="border-t p-4">
        {mode === "visitor" && questions.length > 0 ? (
          <div className="mb-3">
            <button
              type="button"
              aria-expanded={showQuestions}
              aria-controls="chat-suggested-questions"
              onClick={() => setShowQuestions((previous) => !previous)}
              className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs text-muted-foreground hover:bg-muted"
            >
              <Lightbulb aria-hidden className="size-3" />
              추천 질문
              <ChevronDown
                aria-hidden
                className={cn(
                  "size-3 transition-transform",
                  showQuestions && "rotate-180",
                )}
              />
            </button>
            {showQuestions ? (
              <div
                id="chat-suggested-questions"
                className="mt-2 flex flex-wrap gap-2"
              >
                {questions
                  .slice(0, SUGGESTED_QUESTION_LIMIT)
                  .map((question) => (
                    <button
                      key={question}
                      type="button"
                      disabled={isStreaming}
                      aria-label={`추천 질문: ${question}`}
                      className="max-w-full rounded-full border px-3 py-1 text-xs break-words hover:bg-muted disabled:opacity-50"
                      onClick={() => sendMessage(question)}
                    >
                      {question}
                    </button>
                  ))}
              </div>
            ) : null}
          </div>
        ) : null}

        {error ? (
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <p className="text-xs text-destructive" role="alert">
              {error}
            </p>
            {lastFailedMessage ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => void sendMessage(lastFailedMessage)}
              >
                다시 시도
              </Button>
            ) : null}
          </div>
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
            ref={inputRef}
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder={
              mode === "mock_interview"
                ? "면접 답변을 입력하세요"
                : "질문을 입력하세요"
            }
            disabled={isStreaming}
            maxLength={CHAT_MAX_MESSAGE_CHARS}
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

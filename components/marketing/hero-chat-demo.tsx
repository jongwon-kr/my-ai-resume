"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { ArrowRight, Bot } from "lucide-react";

import { EXAMPLE_PROFILE_SLUG } from "@/lib/example/demo-profile";
import { getPublicProfilePath } from "@/lib/site/url";
import { cn } from "@/lib/utils";

interface DemoTurn {
  role: "user" | "assistant";
  text: string;
}

/**
 * Scripted, not live.
 *
 * The visitor chat endpoint is rate limited per IP (5/min, 50/day) and spends
 * real Gemini quota, which the landing page — the highest-traffic page — must
 * not do on every pageview. Every answer below is one the @kimdev demo resume
 * actually contains, so the CTA leads somewhere that behaves the same way.
 */
const SCRIPT: DemoTurn[] = [
  { role: "user", text: "가장 어려웠던 문제는 어떻게 해결하셨나요?" },
  {
    role: "assistant",
    text: "실시간 대시보드에서 지표 갱신이 4초까지 밀렸습니다. WebSocket 스트리밍으로 교체하고 구독 해제를 정리해 0.5초로 줄였습니다.",
  },
  { role: "user", text: "React 경험은 어느 정도인가요?" },
  {
    role: "assistant",
    text: "3년간 B2B SaaS 제품을 React와 TypeScript로 개발했습니다. 디자인 시스템 도입과 성능 개선을 주도했습니다.",
  },
];

const TYPING_MS_PER_CHAR = 18;
const USER_TURN_PAUSE_MS = 700;
const LOOP_RESTART_MS = 3200;

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

/**
 * Subscribed rather than read in an effect, so the value is available on the
 * first client render and updates if the OS setting changes mid-session.
 */
function usePrefersReducedMotion() {
  return useSyncExternalStore(
    (onChange) => {
      const query = window.matchMedia(REDUCED_MOTION_QUERY);
      query.addEventListener("change", onChange);
      return () => query.removeEventListener("change", onChange);
    },
    () => window.matchMedia(REDUCED_MOTION_QUERY).matches,
    () => false,
  );
}

export function HeroChatDemo() {
  // How many turns are fully shown, plus how much of the turn in progress.
  const [turnIndex, setTurnIndex] = useState(0);
  const [typedLength, setTypedLength] = useState(0);
  const isStatic = usePrefersReducedMotion();
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isStatic) {
      return;
    }

    let timer: number | undefined;

    const schedule = (callback: () => void, delay: number) => {
      timer = window.setTimeout(callback, delay);
    };

    const current = SCRIPT[turnIndex];

    if (!current) {
      schedule(() => {
        setTurnIndex(0);
        setTypedLength(0);
      }, LOOP_RESTART_MS);
    } else if (current.role === "user") {
      schedule(() => setTurnIndex((index) => index + 1), USER_TURN_PAUSE_MS);
    } else if (typedLength < current.text.length) {
      schedule(
        () => setTypedLength((length) => length + 1),
        TYPING_MS_PER_CHAR,
      );
    } else {
      schedule(() => {
        setTurnIndex((index) => index + 1);
        setTypedLength(0);
      }, USER_TURN_PAUSE_MS);
    }

    return () => window.clearTimeout(timer);
  }, [turnIndex, typedLength, isStatic]);

  // Keeps the newest bubble in view as the panel fills up.
  useEffect(() => {
    const list = listRef.current;
    if (list) {
      list.scrollTop = list.scrollHeight;
    }
  }, [turnIndex, typedLength, isStatic]);

  const visible = isStatic
    ? SCRIPT
    : SCRIPT.slice(0, turnIndex + 1).map((turn, index) =>
        index === turnIndex && turn.role === "assistant"
          ? { ...turn, text: turn.text.slice(0, typedLength) }
          : turn,
      );

  return (
    <div className="mx-auto w-full max-w-md rounded-2xl border bg-card p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-2 border-b pb-3">
        <span className="inline-flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Bot className="size-4" />
        </span>
        <div className="text-sm">
          <p className="font-medium">김개발 AI 클론</p>
          <p className="text-xs text-muted-foreground">예시 대화 미리보기</p>
        </div>
      </div>

      <div
        ref={listRef}
        aria-live="off"
        className="flex h-64 flex-col gap-3 overflow-y-auto pr-1"
      >
        {visible.map((turn, index) => (
          <div
            key={`${index}-${turn.role}`}
            className={cn(
              "max-w-[90%] rounded-2xl px-4 py-2 text-sm",
              "animate-in fade-in-0 slide-in-from-bottom-1 duration-300",
              turn.role === "user"
                ? "ml-auto bg-primary text-primary-foreground"
                : "bg-muted",
            )}
          >
            {turn.text}
            {!isStatic &&
            turn.role === "assistant" &&
            index === turnIndex &&
            turn.text.length < SCRIPT[index].text.length ? (
              <span className="ml-0.5 inline-block w-1 animate-pulse">▍</span>
            ) : null}
          </div>
        ))}
      </div>

      <Link
        href={getPublicProfilePath(EXAMPLE_PROFILE_SLUG)}
        className="mt-4 inline-flex items-center gap-1 border-t pt-3 text-sm font-medium text-primary hover:underline"
      >
        직접 대화해 보기
        <ArrowRight className="size-4" />
      </Link>
    </div>
  );
}

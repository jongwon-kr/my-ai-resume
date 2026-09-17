"use client";

import { useEffect, useRef, useState } from "react";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { Bot, Maximize2, Minimize2, X } from "lucide-react";

import { ChatPanel } from "@/components/public-profile/chat-panel";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "clonecv:chat-window";

const MIN_W = 320;
const MAX_W = 560;
const MIN_H = 420;
/** Mirrors `sm:max-w-[calc(100vw-3rem)]`. */
const W_RESERVE = 48;
/** Mirrors `sm:max-h-[calc(100dvh-8rem)]`. */
const H_RESERVE = 128;

interface WindowState {
  w: number;
  h: number;
  expanded: boolean;
}

const DEFAULT_STATE: WindowState = { w: 400, h: 600, expanded: false };

function clampSize(w: number, h: number) {
  const maxW = Math.min(MAX_W, Math.max(MIN_W, window.innerWidth - W_RESERVE));
  const maxH = Math.max(MIN_H, window.innerHeight - H_RESERVE);

  return {
    w: Math.round(Math.min(Math.max(w, MIN_W), maxW)),
    h: Math.round(Math.min(Math.max(h, MIN_H), maxH)),
  };
}

function readStored(): WindowState | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as Partial<WindowState>;
    if (typeof parsed.w !== "number" || typeof parsed.h !== "number") {
      return null;
    }

    return {
      ...clampSize(parsed.w, parsed.h),
      expanded: parsed.expanded === true,
    };
  } catch {
    // Private mode or a corrupted value: fall back to the default size.
    return null;
  }
}

function writeStored(state: WindowState) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage is unavailable; the size just won't persist.
  }
}

interface ChatLauncherProps {
  profileId: string;
  profileName: string;
  suggestedQuestions: string[];
  welcomeMessage: string;
}

export function ChatLauncher({
  profileId,
  profileName,
  suggestedQuestions,
  welcomeMessage,
}: ChatLauncherProps) {
  const [open, setOpen] = useState(false);
  const [seen, setSeen] = useState(false);
  const [win, setWin] = useState<WindowState>(DEFAULT_STATE);

  const inputRef = useRef<HTMLInputElement>(null);
  /** Mirrors `win` so pointerup never reads a stale closure. */
  const winRef = useRef(win);
  const dragRef = useRef<{
    x: number;
    y: number;
    w: number;
    h: number;
  } | null>(null);

  // localStorage is not available during render, and reading it there would
  // desync server and client markup. The extra render is invisible: the popup
  // stays hidden until the first open.
  useEffect(() => {
    const stored = readStored();
    if (stored) {
      winRef.current = stored;
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setWin(stored);
    }
  }, []);

  function commit(next: WindowState) {
    winRef.current = next;
    setWin(next);
  }

  function toggleExpanded() {
    const next = { ...winRef.current, expanded: !winRef.current.expanded };
    commit(next);
    writeStored(next);
  }

  function handleResizePointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if (event.pointerType === "touch" || win.expanded) {
      return;
    }

    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = {
      x: event.clientX,
      y: event.clientY,
      w: win.w,
      h: win.h,
    };
  }

  function handleResizePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    const start = dragRef.current;
    if (!start) {
      return;
    }

    // Anchored bottom-right, so dragging up and left grows the window.
    commit({
      ...clampSize(
        start.w - (event.clientX - start.x),
        start.h - (event.clientY - start.y),
      ),
      expanded: false,
    });
  }

  function handleResizePointerUp(event: React.PointerEvent<HTMLDivElement>) {
    if (!dragRef.current) {
      return;
    }

    dragRef.current = null;
    event.currentTarget.releasePointerCapture(event.pointerId);
    writeStored(winRef.current);
  }

  return (
    <DialogPrimitive.Root
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) {
          setSeen(true);
        }
      }}
      // Keeps page scroll, drops the focus trap, and leaves the portfolio
      // readable to screen readers while the bot is open.
      modal={false}
      // Without this, clicking the portfolio would dismiss the window.
      disablePointerDismissal
    >
      <DialogPrimitive.Trigger
        aria-label={open ? "AI 챗봇 닫기" : `${profileName}님의 AI 챗봇 열기`}
        render={
          // `fixed` also anchors the absolutely positioned unread dot, so no
          // `relative` here — twMerge would drop `fixed` as a position conflict.
          <Button className="fixed right-4 bottom-4 z-40 size-14 rounded-full p-0 shadow-lg ring-1 ring-foreground/10 animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-2 duration-300 sm:right-6 sm:bottom-6" />
        }
      >
        {open ? <X className="size-6" /> : <Bot className="size-6" />}
        {!seen && !open ? (
          <span
            aria-hidden
            className="absolute top-1 right-1 size-3 rounded-full bg-brand-accent ring-2 ring-background"
          />
        ) : null}
      </DialogPrimitive.Trigger>

      {/* keepMounted preserves the transcript and sessionId across Escape,
          which Base UI does not let us disable. */}
      <DialogPrimitive.Portal keepMounted>
        <DialogPrimitive.Popup
          aria-label={`${profileName}님의 AI 챗봇`}
          initialFocus={(openType) =>
            openType === "touch" ? true : inputRef.current
          }
          style={
            {
              "--chat-w": `${win.w}px`,
              "--chat-h": `${win.h}px`,
            } as React.CSSProperties
          }
          className={cn(
            "fixed z-50 flex flex-col overflow-hidden bg-background text-foreground shadow-2xl ring-1 ring-foreground/10 outline-none",
            // `[hidden]{display:none}` is a UA rule and loses to our `flex`.
            // `invisible` (not `hidden`) keeps the transcript's scroll position.
            "[&[hidden]]:pointer-events-none [&[hidden]]:invisible",
            // Mobile: full-screen sheet. dvh so the URL bar can't clip the composer.
            "inset-0 h-[100dvh] w-full pb-[env(safe-area-inset-bottom)]",
            // Desktop: anchored just above the launcher.
            "sm:inset-auto sm:right-6 sm:bottom-[5.75rem] sm:h-(--chat-h) sm:w-(--chat-w) sm:rounded-2xl sm:pb-0",
            // CSS re-clamps a stored size on every viewport change, listener-free.
            "sm:min-h-[420px] sm:min-w-[320px] sm:max-h-[calc(100dvh-8rem)] sm:max-w-[calc(100vw-3rem)]",
            "origin-bottom-right duration-200 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-open:slide-in-from-bottom-2 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
            win.expanded &&
              "sm:h-[calc(100dvh-8rem)] sm:w-[min(48rem,calc(100vw-3rem))]",
          )}
        >
          {/* Pointer-only enhancement; the expand toggle is the accessible path. */}
          <div
            aria-hidden
            onPointerDown={handleResizePointerDown}
            onPointerMove={handleResizePointerMove}
            onPointerUp={handleResizePointerUp}
            onPointerCancel={handleResizePointerUp}
            className={cn(
              "absolute top-0 left-0 z-10 hidden size-5 touch-none rounded-tl-2xl sm:block",
              win.expanded ? "cursor-default" : "cursor-nwse-resize",
            )}
          >
            {!win.expanded ? (
              <span className="pointer-events-none absolute top-1.5 left-1.5 size-2 rounded-tl-[3px] border-t-2 border-l-2 border-muted-foreground/40" />
            ) : null}
          </div>

          <ChatPanel
            profileId={profileId}
            profileName={profileName}
            suggestedQuestions={suggestedQuestions}
            welcomeMessage={welcomeMessage}
            className="min-h-0 rounded-none border-0 bg-transparent"
            inputRef={inputRef}
            headerActions={
              <>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-pressed={win.expanded}
                  aria-label={win.expanded ? "채팅창 축소" : "채팅창 확대"}
                  onClick={toggleExpanded}
                  className="hidden sm:inline-flex"
                >
                  {win.expanded ? (
                    <Minimize2 className="size-4" />
                  ) : (
                    <Maximize2 className="size-4" />
                  )}
                </Button>
                <DialogPrimitive.Close
                  aria-label="채팅창 닫기"
                  render={<Button variant="ghost" size="icon-sm" />}
                >
                  <X className="size-4" />
                </DialogPrimitive.Close>
              </>
            }
          />
        </DialogPrimitive.Popup>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

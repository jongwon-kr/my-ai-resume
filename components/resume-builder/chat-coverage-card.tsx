"use client";

import type { CoverageGap } from "@/lib/chat/question-coverage";
import { cn } from "@/lib/utils";

interface ChatCoverageCardProps {
  gaps: CoverageGap[];
  onNavigate?: (stepId: number) => void;
  className?: string;
}

/**
 * Sits next to the completion card but answers a different question: not "is
 * the resume filled in" but "which questions will the chatbot have to refuse".
 * A section can be complete and still leave the clone speechless — a project
 * with no troubleshooting cannot answer what went wrong.
 */
export function ChatCoverageCard({
  gaps,
  onNavigate,
  className,
}: ChatCoverageCardProps) {
  return (
    <div className={cn("space-y-3 rounded-lg border p-4", className)}>
      <p className="text-sm font-medium">챗봇이 답하기 어려운 영역</p>

      {gaps.length === 0 ? (
        <p className="text-xs text-muted-foreground">
          주요 면접 질문에 답할 근거가 모두 준비되어 있습니다.
        </p>
      ) : (
        <>
          <p className="text-xs text-muted-foreground">
            아래 항목을 채우면 그만큼 추천 질문이 늘어납니다.
          </p>
          <ul className="space-y-2 border-t pt-3">
            {gaps.map((gap) => (
              <li key={gap.basis} className="text-xs">
                {onNavigate ? (
                  <button
                    type="button"
                    onClick={() => onNavigate(gap.stepId)}
                    className="w-full rounded-md px-2 py-1.5 text-left hover:bg-muted"
                  >
                    <span className="font-medium text-foreground">
                      {gap.label}
                    </span>
                    <span className="mt-0.5 block text-muted-foreground">
                      {gap.hint}
                    </span>
                  </button>
                ) : (
                  <>
                    <span className="font-medium text-foreground">
                      {gap.label}
                    </span>
                    <span className="mt-0.5 block text-muted-foreground">
                      {gap.hint}
                    </span>
                  </>
                )}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

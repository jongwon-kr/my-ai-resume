"use client";

import type { ResumeCompletionResult } from "@/lib/resume/completion";
import { cn } from "@/lib/utils";

interface ResumeCompletionCardProps {
  completion: ResumeCompletionResult;
  onNavigate?: (stepId: number) => void;
  className?: string;
}

export function ResumeCompletionCard({
  completion,
  onNavigate,
  className,
}: ResumeCompletionCardProps) {
  const { percent, completedCount, totalCount, incompleteItems } = completion;

  return (
    <div className={cn("space-y-3 rounded-lg border p-4", className)}>
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-medium">이력서 완성도</p>
        <span className="text-sm font-semibold text-primary">{percent}%</span>
      </div>

      <div
        className="h-2 overflow-hidden rounded-full bg-muted"
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="이력서 완성도"
      >
        <div
          className="h-full rounded-full bg-primary transition-[width] duration-300"
          style={{ width: `${percent}%` }}
        />
      </div>

      <p className="text-xs text-muted-foreground">
        {completedCount}/{totalCount} 항목 완료
      </p>

      {incompleteItems.length > 0 ? (
        <ul className="space-y-2 border-t pt-3">
          {incompleteItems.map((item) => (
            <li key={item.id} className="text-xs">
              {onNavigate ? (
                <button
                  type="button"
                  onClick={() => onNavigate(item.stepId)}
                  className="w-full rounded-md px-2 py-1.5 text-left hover:bg-muted"
                >
                  <span className="font-medium text-foreground">
                    {item.label}
                  </span>
                  <span className="mt-0.5 block text-muted-foreground">
                    {item.hint}
                  </span>
                </button>
              ) : (
                <>
                  <span className="font-medium text-foreground">
                    {item.label}
                  </span>
                  <span className="mt-0.5 block text-muted-foreground">
                    {item.hint}
                  </span>
                </>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p className="border-t pt-3 text-xs text-muted-foreground">
          모든 항목이 작성되었습니다.
        </p>
      )}
    </div>
  );
}

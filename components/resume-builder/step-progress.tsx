"use client";

import {
  RESUME_BUILDER_STEPS,
  getResumeProgressPercent,
} from "@/lib/resume/schema";
import { useResumeBuilderStore } from "@/stores/resume-builder-store";
import { cn } from "@/lib/utils";

export function StepProgress() {
  const currentStep = useResumeBuilderStore((state) => state.currentStep);
  const percent = getResumeProgressPercent(currentStep);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">
          Step {currentStep} / {RESUME_BUILDER_STEPS.length}
        </span>
        <span className="text-muted-foreground">{percent}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full bg-primary transition-all duration-300"
          style={{ width: `${percent}%` }}
        />
      </div>
      <ol className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {RESUME_BUILDER_STEPS.map((step) => {
          const active = step.id === currentStep;
          const completed = step.id < currentStep;

          return (
            <li
              key={step.id}
              className={cn(
                "rounded-lg border px-3 py-2 text-center text-xs sm:text-sm",
                active && "border-primary bg-primary/5 font-medium",
                completed && "border-green-600/30 bg-green-50 text-green-800",
                !active && !completed && "text-muted-foreground",
              )}
            >
              {step.label}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

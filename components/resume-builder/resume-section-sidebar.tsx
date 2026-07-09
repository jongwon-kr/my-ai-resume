"use client";

import { Button } from "@/components/ui/button";
import {
  OPTIONAL_SECTIONS,
  RESUME_BUILDER_STEPS,
  type OptionalSectionKey,
} from "@/lib/resume/schema";
import { cn } from "@/lib/utils";

interface ResumeSectionSidebarProps {
  currentStep: number;
  enabledSections: OptionalSectionKey[];
  onNavigate: (stepId: number) => void;
  onToggleSection: (key: OptionalSectionKey) => void;
}

export function ResumeSectionSidebar({
  currentStep,
  enabledSections,
  onNavigate,
  onToggleSection,
}: ResumeSectionSidebarProps) {
  const visibleSteps = RESUME_BUILDER_STEPS.filter(
    (step) =>
      !("optionalKey" in step) || enabledSections.includes(step.optionalKey),
  );

  const excludedSections = OPTIONAL_SECTIONS.filter(
    (section) => !enabledSections.includes(section.key),
  );

  return (
    <nav className="space-y-4 rounded-lg border p-4">
      <div className="space-y-1">
        <p className="text-sm font-medium">이력서 항목</p>
        <p className="text-xs text-muted-foreground">클릭해서 이동하세요.</p>
      </div>

      <ul className="space-y-1">
        {visibleSteps.map((step) => {
          const optionalKey =
            "optionalKey" in step ? step.optionalKey : undefined;
          const active = step.id === currentStep;

          return (
            <li key={step.id} className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => onNavigate(step.id)}
                className={cn(
                  "flex-1 rounded-md px-3 py-2 text-left text-sm transition-colors",
                  active
                    ? "bg-primary/10 font-medium text-primary"
                    : "hover:bg-muted",
                )}
              >
                {step.label}
              </button>
              {optionalKey ? (
                <button
                  type="button"
                  onClick={() => onToggleSection(optionalKey)}
                  aria-label={`${step.label} 제외`}
                  className="rounded-md px-2 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-destructive"
                >
                  ×
                </button>
              ) : null}
            </li>
          );
        })}
      </ul>

      {excludedSections.length > 0 ? (
        <div className="space-y-2 border-t pt-4">
          <p className="text-xs font-medium text-muted-foreground">
            추가할 수 있는 항목
          </p>
          <div className="flex flex-col gap-2">
            {excludedSections.map((section) => (
              <Button
                key={section.key}
                type="button"
                variant="outline"
                size="sm"
                className="justify-start"
                onClick={() => onToggleSection(section.key)}
              >
                + {section.label}
              </Button>
            ))}
          </div>
        </div>
      ) : null}
    </nav>
  );
}

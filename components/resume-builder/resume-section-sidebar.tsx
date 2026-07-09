"use client";

import { GripVertical } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  endSortableDrag,
  handleSortableDragOver,
  readSortableDragIndex,
  startSortableDrag,
} from "@/components/resume-builder/sortable-drag";
import {
  OPTIONAL_SECTIONS,
  type OptionalSectionKey,
} from "@/lib/resume/schema";
import {
  getStepsInOrder,
  type ResumeBuilderStep,
} from "@/lib/resume/section-order";
import { cn } from "@/lib/utils";

const DRAG_INDEX_MIME = "application/x-clonecv-nav-sort-index";

interface ResumeSectionSidebarProps {
  currentStep: number;
  enabledSections: OptionalSectionKey[];
  sectionOrder: number[];
  onNavigate: (stepId: number) => void;
  onToggleSection: (key: OptionalSectionKey) => void;
  onReorderSection: (from: number, to: number) => void;
}

export function ResumeSectionSidebar({
  currentStep,
  enabledSections,
  sectionOrder,
  onNavigate,
  onToggleSection,
  onReorderSection,
}: ResumeSectionSidebarProps) {
  const visibleSteps = getStepsInOrder(sectionOrder, enabledSections);
  const canReorder = visibleSteps.length >= 2;

  const excludedSections = OPTIONAL_SECTIONS.filter(
    (section) => !enabledSections.includes(section.key),
  );

  return (
    <nav className="space-y-4 rounded-lg border p-4">
      <div className="space-y-1">
        <p className="text-sm font-medium">이력서 항목</p>
        <p className="text-xs text-muted-foreground">
          클릭해서 이동하세요. ⋮⋮ 핸들을 드래그하면 항목 순서가 바뀌고 공개
          프로필에 반영됩니다.
        </p>
      </div>

      <ul
        className="space-y-1"
        onDragEnter={canReorder ? handleSortableDragOver : undefined}
        onDragOver={canReorder ? handleSortableDragOver : undefined}
      >
        {visibleSteps.map((step, index) => (
          <SidebarNavItem
            key={step.id}
            step={step}
            index={index}
            active={step.id === currentStep}
            canReorder={canReorder}
            onNavigate={onNavigate}
            onToggleSection={onToggleSection}
            onMove={onReorderSection}
          />
        ))}
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

function SidebarNavItem({
  step,
  index,
  active,
  canReorder,
  onNavigate,
  onToggleSection,
  onMove,
}: {
  step: ResumeBuilderStep;
  index: number;
  active: boolean;
  canReorder: boolean;
  onNavigate: (stepId: number) => void;
  onToggleSection: (key: OptionalSectionKey) => void;
  onMove: (from: number, to: number) => void;
}) {
  const [dragOver, setDragOver] = useState(false);
  const optionalKey = "optionalKey" in step ? step.optionalKey : undefined;

  return (
    <li
      className={cn(
        "flex items-center gap-1 rounded-md transition-colors select-none",
        dragOver && "bg-primary/5",
      )}
      onDragEnter={canReorder ? handleSortableDragOver : undefined}
      onDragOver={(event) => {
        if (!canReorder) {
          return;
        }
        handleSortableDragOver(event);
        setDragOver(true);
      }}
      onDragLeave={(event) => {
        if (event.currentTarget.contains(event.relatedTarget as Node)) {
          return;
        }
        setDragOver(false);
      }}
      onDrop={(event) => {
        if (!canReorder) {
          return;
        }
        event.preventDefault();
        event.stopPropagation();
        setDragOver(false);
        endSortableDrag();
        const from = readSortableDragIndex(event, DRAG_INDEX_MIME);
        if (!Number.isNaN(from) && from !== index) {
          onMove(from, index);
        }
      }}
    >
      {canReorder ? (
        <div
          draggable
          role="button"
          tabIndex={0}
          aria-label={`${step.label} 순서 변경`}
          title="드래그하여 순서 변경"
          className="flex size-8 shrink-0 cursor-grab items-center justify-center rounded text-muted-foreground select-none touch-none hover:bg-muted active:cursor-grabbing"
          onDragStart={(event) => {
            event.dataTransfer.setData(DRAG_INDEX_MIME, String(index));
            event.dataTransfer.effectAllowed = "move";
            startSortableDrag();
          }}
          onDragEnd={() => {
            endSortableDrag();
            setDragOver(false);
          }}
        >
          <GripVertical className="size-4 pointer-events-none" />
        </div>
      ) : (
        <span className="size-8 shrink-0" />
      )}

      <button
        type="button"
        onClick={() => onNavigate(step.id)}
        className={cn(
          "flex-1 rounded-md px-3 py-2 text-left text-sm transition-colors select-none",
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
          className="rounded-md px-2 py-2 text-sm text-muted-foreground select-none hover:bg-muted hover:text-destructive"
        >
          ×
        </button>
      ) : null}
    </li>
  );
}

"use client";

import { GripVertical } from "lucide-react";
import { useState } from "react";

import {
  endSortableDrag,
  handleSortableDragOver,
  readSortableDragIndex,
  startSortableDrag,
} from "@/components/resume-builder/sortable-drag";
import { cn } from "@/lib/utils";

const DRAG_INDEX_MIME = "application/x-clonecv-sort-index";

interface SortableItemProps {
  index: number;
  onMove: (from: number, to: number) => void;
  disabled?: boolean;
  className?: string;
  children: React.ReactNode;
}

export function SortableItem({
  index,
  onMove,
  disabled = false,
  className,
  children,
}: SortableItemProps) {
  const [dragging, setDragging] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  if (disabled) {
    return (
      <div className={cn("rounded-lg border", className)}>
        <div className="p-4">{children}</div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex overflow-hidden rounded-lg border transition-colors",
        dragOver && "border-primary bg-primary/5",
        dragging && "opacity-70",
        className,
      )}
      onDragEnter={handleSortableDragOver}
      onDragOver={(event) => {
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
      <div
        draggable
        role="button"
        tabIndex={0}
        aria-label="드래그하여 순서 변경"
        title="드래그하여 순서 변경"
        className={cn(
          "flex w-11 shrink-0 cursor-grab flex-col items-center justify-center gap-0.5",
          "border-r bg-muted/70 text-muted-foreground select-none touch-none",
          "hover:bg-muted active:cursor-grabbing",
        )}
        onDragStart={(event) => {
          event.dataTransfer.setData(DRAG_INDEX_MIME, String(index));
          event.dataTransfer.effectAllowed = "move";
          startSortableDrag();
          setDragging(true);
        }}
        onDragEnd={() => {
          endSortableDrag();
          setDragging(false);
          setDragOver(false);
        }}
      >
        <GripVertical className="size-5 pointer-events-none" />
        <span className="pointer-events-none text-[10px] font-semibold leading-none">
          순서
        </span>
      </div>
      <div className="min-w-0 flex-1 p-4">{children}</div>
    </div>
  );
}

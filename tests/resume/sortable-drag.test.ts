import { describe, expect, it } from "vitest";

import {
  isFileDrag,
  readSortableDragIndex,
} from "@/components/resume-builder/sortable-drag";

const MIME = "application/x-clonecv-sort-index";

/** Minimal stand-in for the parts of React.DragEvent these helpers touch. */
function dragEvent(data: Record<string, string>, types: string[] = []) {
  return {
    dataTransfer: {
      types,
      getData: (mimeType: string) => data[mimeType] ?? "",
    },
  } as unknown as React.DragEvent;
}

describe("readSortableDragIndex", () => {
  it("reads the index from the sortable mime type", () => {
    expect(readSortableDragIndex(dragEvent({ [MIME]: "3" }), MIME)).toBe(3);
  });

  it("falls back to text/plain", () => {
    expect(readSortableDragIndex(dragEvent({ "text/plain": "2" }), MIME)).toBe(
      2,
    );
  });

  it("reads index 0 as a real index", () => {
    expect(readSortableDragIndex(dragEvent({ [MIME]: "0" }), MIME)).toBe(0);
  });

  // Regression: an empty payload used to read as 0 and reorder the list.
  it("returns NaN when the drag carries no index", () => {
    expect(readSortableDragIndex(dragEvent({}), MIME)).toBeNaN();
  });

  it("returns NaN for a whitespace-only payload", () => {
    expect(readSortableDragIndex(dragEvent({ [MIME]: "  " }), MIME)).toBeNaN();
  });
});

describe("isFileDrag", () => {
  it("detects a file drag from the OS", () => {
    expect(isFileDrag(dragEvent({}, ["Files"]))).toBe(true);
  });

  it("does not flag a sortable row drag", () => {
    expect(isFileDrag(dragEvent({ [MIME]: "1" }, [MIME, "text/plain"]))).toBe(
      false,
    );
  });
});

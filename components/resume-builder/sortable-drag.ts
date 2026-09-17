const DRAG_BODY_CLASS = "clonecv-sortable-dragging";

function blockDragDefaults(event: DragEvent) {
  event.preventDefault();
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = "move";
  }
}

export function startSortableDrag() {
  document.body.classList.add(DRAG_BODY_CLASS);
  document.addEventListener("dragover", blockDragDefaults, true);
}

export function endSortableDrag() {
  document.body.classList.remove(DRAG_BODY_CLASS);
  document.removeEventListener("dragover", blockDragDefaults, true);
}

export function handleSortableDragOver(event: React.DragEvent) {
  event.preventDefault();
  event.stopPropagation();
  event.dataTransfer.dropEffect = "move";
}

/** True when the drag carries files from the OS rather than a sortable row. */
export function isFileDrag(event: React.DragEvent) {
  return Array.from(event.dataTransfer.types).includes("Files");
}

/**
 * Index of the dragged row, or NaN when the drag is not a sortable one.
 *
 * `Number("")` is 0, not NaN, so an empty payload used to read as "row 0" and
 * reorder the list on any stray drop — a file drop included.
 */
export function readSortableDragIndex(
  event: React.DragEvent,
  mimeType: string,
) {
  const raw =
    event.dataTransfer.getData(mimeType) ||
    event.dataTransfer.getData("text/plain");

  if (!raw.trim()) {
    return Number.NaN;
  }

  return Number(raw);
}

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

export function readSortableDragIndex(
  event: React.DragEvent,
  mimeType: string,
) {
  return Number(
    event.dataTransfer.getData(mimeType) ||
      event.dataTransfer.getData("text/plain"),
  );
}

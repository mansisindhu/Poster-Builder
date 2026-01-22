// Hooks
export { useCanvas } from "./useCanvas";
export { useCanvasHistory, cloneState, pushToHistory, updatePresent } from "./useCanvasHistory";
export type { HistoryState } from "./useCanvasHistory";
export { useProjectStorage } from "./useProjectStorage";
export { useCanvasElements } from "./useCanvasElements";
export { useKeyboardShortcuts, createResizeHandler } from "./useKeyboardShortcuts";
export type { KeyboardShortcutActions, KeyboardShortcutState } from "./useKeyboardShortcuts";

// Utilities
export { exportCanvasToImage, wrapText, drawShape, drawTextElement, drawImageElement, drawGroupElement } from "./canvasExport";
export { loadImageFile, isImageFile, getImageDimensions } from "./imageUtils";
export { getShapeIcon, getElementDisplayName, getElementBounds } from "./elementUtils";
export { cn } from "./utils";

// Constants
export {
  MAX_HISTORY_SIZE,
  PROJECTS_STORAGE_KEY,
  SNAP_THRESHOLD,
  SHAPE_LABELS,
  SHAPE_ICONS,
} from "./constants";

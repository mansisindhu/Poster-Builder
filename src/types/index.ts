// Types
export type {
  Position,
  Size,
  BaseElement,
  TextElement,
  ImageElement,
  ShapeElement,
  GroupElement,
  CanvasElement,
  ShapeType,
  Point,
  ShapeFormData,
  TextFormData,
  CanvasSize,
  CanvasSettings,
  CanvasState,
  Project,
} from "./canvas";

// Constants
export { CANVAS_PRESETS, DEFAULT_CANVAS_SIZE } from "./canvas";

// Type guards
export {
  isTextElement,
  isImageElement,
  isShapeElement,
  isGroupElement,
  hasSizeProperty,
} from "./guards";

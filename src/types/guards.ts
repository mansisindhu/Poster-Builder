import { CanvasElement, TextElement, ImageElement, ShapeElement, GroupElement } from "./canvas";

/**
 * Type guard to check if an element is a TextElement
 */
export function isTextElement(element: CanvasElement | null | undefined): element is TextElement {
  return element?.type === "text";
}

/**
 * Type guard to check if an element is an ImageElement
 */
export function isImageElement(element: CanvasElement | null | undefined): element is ImageElement {
  return element?.type === "image";
}

/**
 * Type guard to check if an element is a ShapeElement
 */
export function isShapeElement(element: CanvasElement | null | undefined): element is ShapeElement {
  return element?.type === "shape";
}

/**
 * Type guard to check if an element is a GroupElement
 */
export function isGroupElement(element: CanvasElement | null | undefined): element is GroupElement {
  return element?.type === "group";
}

/**
 * Type guard to check if an element has a size property (Image, Shape, or Group)
 */
export function hasSizeProperty(
  element: CanvasElement | null | undefined
): element is ImageElement | ShapeElement | GroupElement {
  return element?.type === "image" || element?.type === "shape" || element?.type === "group";
}

import React from "react";
import { CanvasElement, ShapeType } from "@/types/canvas";
import { Square, Circle, Triangle, Minus, Pentagon } from "lucide-react";
import { SHAPE_LABELS } from "./constants";

/**
 * Get the appropriate icon for a shape type
 * @param shapeType - The type of shape
 * @param className - Optional className to apply to the icon (default: "w-4 h-4 text-muted-foreground")
 */
export function getShapeIcon(shapeType: ShapeType, className: string = "w-4 h-4 text-muted-foreground"): React.ReactNode {
  switch (shapeType) {
    case "rectangle":
      return React.createElement(Square, { className });
    case "circle":
      return React.createElement(Circle, { className });
    case "ellipse":
      return React.createElement(Circle, { className: `${className} scale-x-125` });
    case "line":
      return React.createElement(Minus, { className });
    case "triangle":
      return React.createElement(Triangle, { className });
    case "polygon":
      return React.createElement(Pentagon, { className });
    default:
      return React.createElement(Square, { className });
  }
}

/**
 * Get a display name for a canvas element
 * @param element - The canvas element
 * @param maxLength - Maximum length for text content truncation (default: 20)
 */
export function getElementDisplayName(element: CanvasElement, maxLength: number = 20): string {
  switch (element.type) {
    case "text":
      const text = element.content.substring(0, maxLength);
      return text + (element.content.length > maxLength ? "..." : "");
    case "image":
      return element.name;
    case "shape":
      return SHAPE_LABELS[element.shapeType] || "Shape";
    case "group":
      return `Group (${element.childIds.length} items)`;
    default:
      return "Element";
  }
}

/**
 * Get the bounding box of a canvas element
 * @param element - The canvas element
 * @returns An object with x, y, width, and height
 */
export function getElementBounds(element: CanvasElement): { x: number; y: number; width: number; height: number } {
  let width = 0;
  let height = 0;
  
  if (element.type === "text") {
    width = element.width;
    // Calculate height based on content and line wrapping
    const lines = element.content.split("\n");
    height = lines.length * element.fontSize * 1.2 + 16; // line height + padding
  } else if (element.type === "image" || element.type === "shape") {
    width = element.size.width;
    height = element.size.height;
  } else if (element.type === "group") {
    width = element.size.width;
    height = element.size.height;
  }
  
  return {
    x: element.position.x,
    y: element.position.y,
    width,
    height,
  };
}

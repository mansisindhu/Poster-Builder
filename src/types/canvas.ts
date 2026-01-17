export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface BaseElement {
  id: string;
  type: "text" | "image";
  position: Position;
  zIndex: number;
}

export interface TextElement extends BaseElement {
  type: "text";
  content: string;
  fontSize: number;
  fontFamily: string;
  fontWeight: "normal" | "bold";
  color: string;
}

export interface ImageElement extends BaseElement {
  type: "image";
  src: string;
  name: string;
  size: Size;
}

export type CanvasElement = TextElement | ImageElement;

export interface TextFormData {
  content: string;
  fontSize: number;
  fontFamily: string;
  fontWeight: "normal" | "bold";
  color: string;
}

export interface CanvasSettings {
  backgroundColor: string;
}
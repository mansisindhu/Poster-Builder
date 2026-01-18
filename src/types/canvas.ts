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
  rotation: number;
}

export interface TextElement extends BaseElement {
  type: "text";
  content: string;
  fontSize: number;
  fontFamily: string;
  fontWeight: "normal" | "bold";
  fontStyle: "normal" | "italic";
  textAlign: "left" | "center" | "right";
  color: string;
  width: number; // Width for text wrapping
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
  fontStyle: "normal" | "italic";
  textAlign: "left" | "center" | "right";
  color: string;
}

export interface CanvasSize {
  width: number;
  height: number;
  name: string;
  category: string;
}

export interface CanvasSettings {
  backgroundColor: string;
  canvasSize: CanvasSize;
}

export interface CanvasState {
  elements: CanvasElement[];
  canvasSettings: CanvasSettings;
}

// Project for save/load
export interface Project {
  id: string;
  name: string;
  state: CanvasState;
  createdAt: number;
  updatedAt: number;
  thumbnail?: string;
}

// Canvas size presets
export const CANVAS_PRESETS: CanvasSize[] = [
  // General
  { width: 800, height: 600, name: "Default", category: "General" },
  { width: 1200, height: 1800, name: "Poster (Portrait)", category: "Print" },
  { width: 1800, height: 1200, name: "Poster (Landscape)", category: "Print" },
  { width: 2480, height: 3508, name: "A4 Portrait", category: "Print" },
  { width: 3508, height: 2480, name: "A4 Landscape", category: "Print" },
  
  // Social Media - Square
  { width: 1080, height: 1080, name: "Instagram Post", category: "Social Media" },
  { width: 1200, height: 1200, name: "Facebook Post", category: "Social Media" },
  
  // Social Media - Stories/Vertical
  { width: 1080, height: 1920, name: "Instagram Story", category: "Social Media" },
  { width: 1080, height: 1920, name: "TikTok Video", category: "Social Media" },
  
  // Social Media - Banners
  { width: 1500, height: 500, name: "Twitter Header", category: "Social Media" },
  { width: 1584, height: 396, name: "LinkedIn Banner", category: "Social Media" },
  { width: 820, height: 312, name: "Facebook Cover", category: "Social Media" },
  { width: 2560, height: 1440, name: "YouTube Banner", category: "Social Media" },
  
  // Web
  { width: 1920, height: 1080, name: "Full HD (16:9)", category: "Web" },
  { width: 1280, height: 720, name: "HD (16:9)", category: "Web" },
  { width: 728, height: 90, name: "Leaderboard Ad", category: "Web" },
  { width: 300, height: 250, name: "Medium Rectangle Ad", category: "Web" },
];

export const DEFAULT_CANVAS_SIZE = CANVAS_PRESETS[0];

import { ShapeType, GradientBackground } from "@/types/canvas";
import React from "react";
import { Square, Circle, Triangle, Minus, Pentagon } from "lucide-react";

// History and storage constants
export const MAX_HISTORY_SIZE = 50;
export const PROJECTS_STORAGE_KEY = "poster-builder-projects";

// Canvas interaction constants
export const SNAP_THRESHOLD = 10; // Pixels within which to snap and show guides

// Shape labels - used across multiple components
export const SHAPE_LABELS: Record<ShapeType, string> = {
  rectangle: "Rectangle",
  circle: "Circle",
  ellipse: "Ellipse",
  line: "Line",
  triangle: "Triangle",
  polygon: "Polygon",
};

// Shape icons - used in toolbar, layers panel, mobile panel
export const SHAPE_ICONS: Record<ShapeType, React.ReactNode> = {
  rectangle: React.createElement(Square, { className: "w-4 h-4" }),
  circle: React.createElement(Circle, { className: "w-4 h-4" }),
  ellipse: React.createElement(Circle, { className: "w-4 h-4 scale-x-125" }),
  line: React.createElement(Minus, { className: "w-4 h-4" }),
  triangle: React.createElement(Triangle, { className: "w-4 h-4" }),
  polygon: React.createElement(Pentagon, { className: "w-4 h-4" }),
};

// Preset gradients for quick selection
export const PRESET_GRADIENTS: (GradientBackground & { name: string })[] = [
  {
    name: "Sunset",
    startColor: "#ff6b35",
    endColor: "#f7931e",
    direction: "horizontal"
  },
  {
    name: "Ocean",
    startColor: "#667eea",
    endColor: "#764ba2",
    direction: "vertical"
  },
  {
    name: "Forest",
    startColor: "#134e5e",
    endColor: "#71b280",
    direction: "diagonal"
  },
  {
    name: "Purple Dream",
    startColor: "#a8edea",
    endColor: "#fed6e3",
    direction: "horizontal"
  },
  {
    name: "Fire",
    startColor: "#ff9a9e",
    endColor: "#fecfef",
    direction: "vertical"
  },
  {
    name: "Cool Blues",
    startColor: "#667eea",
    endColor: "#764ba2",
    direction: "diagonal"
  }
];

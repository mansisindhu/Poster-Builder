"use client";

import React from "react";
import { GridSettings, CanvasSize } from "@/types/canvas";

interface GridOverlayProps {
  grid: GridSettings;
  canvasSize: CanvasSize;
  scale: number;
}

export function GridOverlay({ grid, canvasSize, scale }: GridOverlayProps) {
  if (!grid.enabled) return null;

  const { size, width, height } = { size: grid.size, width: canvasSize.width, height: canvasSize.height };

  // Create grid lines
  const verticalLines = [];
  const horizontalLines = [];

  // Calculate scaled grid size
  const scaledSize = size * scale;

  // Only show grid if it would be visible (not too dense)
  if (scaledSize < 10) return null;

  // Vertical lines
  for (let x = 0; x <= width; x += size) {
    verticalLines.push(
      <line
        key={`v-${x}`}
        x1={x}
        y1={0}
        x2={x}
        y2={height}
        stroke="currentColor"
        strokeWidth="0.5"
        opacity="0.2"
        className="pointer-events-none"
      />
    );
  }

  // Horizontal lines
  for (let y = 0; y <= height; y += size) {
    horizontalLines.push(
      <line
        key={`h-${y}`}
        x1={0}
        y1={y}
        x2={width}
        y2={y}
        stroke="currentColor"
        strokeWidth="0.5"
        opacity="0.2"
        className="pointer-events-none"
      />
    );
  }

  return (
    <svg
      className="absolute inset-0 pointer-events-none"
      width={width}
      height={height}
      style={{ zIndex: -1 }}
    >
      {verticalLines}
      {horizontalLines}
    </svg>
  );
}
"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, RotateCcw } from "lucide-react";

interface ZoomControlsProps {
  zoomPercent: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
}

export function ZoomControls({ zoomPercent, onZoomIn, onZoomOut, onResetZoom }: ZoomControlsProps) {
  return (
    <div className="flex items-center gap-2 bg-background/80 backdrop-blur-sm border rounded-lg px-3 py-2 shadow-sm">
      <Button
        variant="ghost"
        size="sm"
        onClick={onZoomOut}
        disabled={zoomPercent <= 25}
        className="h-8 w-8 p-0"
        title="Zoom Out (Ctrl+-)"
      >
        <ZoomOut className="h-4 w-4" />
      </Button>

      <div className="flex items-center gap-2 min-w-[60px]">
        <span className="text-sm font-medium">{zoomPercent}%</span>
      </div>

      <Button
        variant="ghost"
        size="sm"
        onClick={onZoomIn}
        disabled={zoomPercent >= 200}
        className="h-8 w-8 p-0"
        title="Zoom In (Ctrl++)"
      >
        <ZoomIn className="h-4 w-4" />
      </Button>

      <div className="w-px h-6 bg-border mx-1" />

      <Button
        variant="ghost"
        size="sm"
        onClick={onResetZoom}
        className="h-8 w-8 p-0"
        title="Fit to Screen (Ctrl+0)"
      >
        <RotateCcw className="h-4 w-4" />
      </Button>
    </div>
  );
}
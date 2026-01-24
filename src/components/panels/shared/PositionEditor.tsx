"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface PositionEditorProps {
  x: number;
  y: number;
  onPositionChange: (axis: "x" | "y", value: string) => void;
  /** Compact mode for mobile - uses horizontal layout */
  compact?: boolean;
}

export function PositionEditor({
  x,
  y,
  onPositionChange,
  compact = false,
}: PositionEditorProps) {
  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <Label className="text-xs text-muted-foreground w-12">Pos</Label>
        <div className="flex gap-2 flex-1">
          <div className="flex items-center gap-1 flex-1">
            <span className="text-xs text-muted-foreground">X</span>
            <Input
              type="number"
              value={Math.round(x)}
              onChange={(e) => onPositionChange("x", e.target.value)}
              className="h-8"
            />
          </div>
          <div className="flex items-center gap-1 flex-1">
            <span className="text-xs text-muted-foreground">Y</span>
            <Input
              type="number"
              value={Math.round(y)}
              onChange={(e) => onPositionChange("y", e.target.value)}
              className="h-8"
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label className="text-xs text-muted-foreground uppercase">
        Position
      </Label>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label className="text-xs text-muted-foreground">X</Label>
          <Input
            type="number"
            value={Math.round(x)}
            onChange={(e) => onPositionChange("x", e.target.value)}
            className="h-8"
          />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Y</Label>
          <Input
            type="number"
            value={Math.round(y)}
            onChange={(e) => onPositionChange("y", e.target.value)}
            className="h-8"
          />
        </div>
      </div>
    </div>
  );
}

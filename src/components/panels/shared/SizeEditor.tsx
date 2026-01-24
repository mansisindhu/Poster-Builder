"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface SizeEditorProps {
  width: number;
  height: number;
  onSizeChange: (dimension: "width" | "height", value: string) => void;
  /** Compact mode for mobile - uses horizontal layout */
  compact?: boolean;
}

export function SizeEditor({
  width,
  height,
  onSizeChange,
  compact = false,
}: SizeEditorProps) {
  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <Label className="text-xs text-muted-foreground w-12">Size</Label>
        <div className="flex gap-2 flex-1">
          <div className="flex items-center gap-1 flex-1">
            <span className="text-xs text-muted-foreground">W</span>
            <Input
              type="number"
              value={Math.round(width)}
              onChange={(e) => onSizeChange("width", e.target.value)}
              className="h-8"
            />
          </div>
          <div className="flex items-center gap-1 flex-1">
            <span className="text-xs text-muted-foreground">H</span>
            <Input
              type="number"
              value={Math.round(height)}
              onChange={(e) => onSizeChange("height", e.target.value)}
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
        Size
      </Label>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label className="text-xs text-muted-foreground">Width</Label>
          <Input
            type="number"
            value={Math.round(width)}
            onChange={(e) => onSizeChange("width", e.target.value)}
            className="h-8"
          />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Height</Label>
          <Input
            type="number"
            value={Math.round(height)}
            onChange={(e) => onSizeChange("height", e.target.value)}
            className="h-8"
          />
        </div>
      </div>
    </div>
  );
}

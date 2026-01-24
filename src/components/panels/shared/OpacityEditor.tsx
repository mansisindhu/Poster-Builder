"use client";

import React from "react";
import { Label } from "@/components/ui/label";

interface OpacityEditorProps {
  opacity: number;
  onOpacityChange: (value: string) => void;
}

export function OpacityEditor({ opacity, onOpacityChange }: OpacityEditorProps) {
  const percentage = Math.round(opacity * 100);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const percent = parseInt(e.target.value);
    const normalized = percent / 100;
    onOpacityChange(normalized.toString());
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const percent = parseInt(e.target.value);
    const clamped = Math.max(0, Math.min(100, percent));
    const normalized = clamped / 100;
    onOpacityChange(normalized.toString());
  };

  return (
    <div className="space-y-2">
      <Label className="text-xs text-muted-foreground uppercase">
        Opacity
      </Label>
      <div className="flex items-center gap-2">
        <input
          type="range"
          min="0"
          max="100"
          step="1"
          value={percentage}
          onChange={handleSliderChange}
          className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
        />
        <div className="flex items-center gap-1">
          <input
            type="number"
            min="0"
            max="100"
            value={percentage}
            onChange={handleInputChange}
            className="w-14 h-8 text-sm border rounded px-1"
          />
          <span className="text-xs text-muted-foreground">%</span>
        </div>
      </div>
    </div>
  );
}
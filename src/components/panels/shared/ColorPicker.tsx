"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ColorPickerProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  /** Compact mode for mobile - uses horizontal layout */
  compact?: boolean;
  /** Label width for compact mode alignment */
  labelWidth?: string;
}

export function ColorPicker({
  label,
  value,
  onChange,
  compact = false,
  labelWidth = "w-12",
}: ColorPickerProps) {
  if (compact) {
    return (
      <div className="flex items-center gap-2">
        {label && (
          <Label className={`text-xs text-muted-foreground ${labelWidth}`}>
            {label}
          </Label>
        )}
        <Input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-8 w-12 p-1 cursor-pointer"
        />
        <Input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-8 flex-1 font-mono text-xs"
        />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {label && (
        <Label className="text-xs text-muted-foreground uppercase">
          {label}
        </Label>
      )}
      <div className="flex gap-2">
        <Input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-8 w-14 p-1 cursor-pointer"
        />
        <Input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-8 flex-1 font-mono text-xs"
        />
      </div>
    </div>
  );
}

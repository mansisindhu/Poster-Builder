"use client";

import React from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Type } from "lucide-react";

interface TextShadowEditorProps {
  shadowEnabled: boolean;
  shadowColor: string;
  shadowBlur: number;
  shadowOffsetX: number;
  shadowOffsetY: number;
  onToggleShadow: () => void;
  onShadowColorChange: (value: string) => void;
  onShadowBlurChange: (value: string) => void;
  onShadowOffsetChange: (axis: "x" | "y", value: string) => void;
}

export function TextShadowEditor({
  shadowEnabled,
  shadowColor,
  shadowBlur,
  shadowOffsetX,
  shadowOffsetY,
  onToggleShadow,
  onShadowColorChange,
  onShadowBlurChange,
  onShadowOffsetChange,
}: TextShadowEditorProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-xs text-muted-foreground uppercase flex items-center gap-2">
          <Type className="w-3 h-3" />
          Text Shadow
        </Label>
        <Button
          variant={shadowEnabled ? "default" : "outline"}
          size="sm"
          onClick={onToggleShadow}
          className="h-6 px-2 text-xs"
        >
          {shadowEnabled ? "On" : "Off"}
        </Button>
      </div>

      {shadowEnabled && (
        <div className="space-y-3 pl-2 border-l-2 border-muted">
          {/* Shadow Color */}
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Color</Label>
            <div className="flex gap-2">
              <input
                type="color"
                value={shadowColor}
                onChange={(e) => onShadowColorChange(e.target.value)}
                className="h-8 w-8 p-1 cursor-pointer border rounded"
              />
              <input
                type="text"
                value={shadowColor}
                onChange={(e) => onShadowColorChange(e.target.value)}
                className="h-8 flex-1 font-mono text-sm border rounded px-2"
                placeholder="#000000"
              />
            </div>
          </div>

          {/* Shadow Blur */}
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Blur (0-20px)</Label>
            <Input
              type="number"
              min="0"
              max="20"
              value={shadowBlur}
              onChange={(e) => onShadowBlurChange(e.target.value)}
              className="h-8"
            />
          </div>

          {/* Shadow Offset X and Y */}
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Offset X (-20 to 20)</Label>
              <Input
                type="number"
                min="-20"
                max="20"
                value={shadowOffsetX}
                onChange={(e) => onShadowOffsetChange("x", e.target.value)}
                className="h-8"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Offset Y (-20 to 20)</Label>
              <Input
                type="number"
                min="-20"
                max="20"
                value={shadowOffsetY}
                onChange={(e) => onShadowOffsetChange("y", e.target.value)}
                className="h-8"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
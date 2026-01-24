"use client";

import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ImageIcon } from "lucide-react";

interface ImageFiltersEditorProps {
  grayscale: number;
  brightness: number;
  contrast: number;
  blur: number;
  onGrayscaleChange: (value: string) => void;
  onBrightnessChange: (value: string) => void;
  onContrastChange: (value: string) => void;
  onBlurChange: (value: string) => void;
}

export function ImageFiltersEditor({
  grayscale,
  brightness,
  contrast,
  blur,
  onGrayscaleChange,
  onBrightnessChange,
  onContrastChange,
  onBlurChange,
}: ImageFiltersEditorProps) {
  return (
    <div className="space-y-3">
      <Label className="text-xs text-muted-foreground uppercase flex items-center gap-2">
        <ImageIcon className="w-3 h-3" />
        Image Filters
      </Label>

      <div className="space-y-3 pl-2 border-l-2 border-muted">
        {/* Grayscale */}
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Grayscale (0-100%)</Label>
          <div className="flex gap-2 items-center">
            <input
              type="range"
              min="0"
              max="100"
              value={grayscale}
              onChange={(e) => onGrayscaleChange(e.target.value)}
              className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
            <Input
              type="number"
              min="0"
              max="100"
              value={grayscale}
              onChange={(e) => onGrayscaleChange(e.target.value)}
              className="w-16 h-8 text-sm"
            />
            <span className="text-xs text-muted-foreground">%</span>
          </div>
        </div>

        {/* Brightness */}
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Brightness (50-150%)</Label>
          <div className="flex gap-2 items-center">
            <input
              type="range"
              min="50"
              max="150"
              value={brightness}
              onChange={(e) => onBrightnessChange(e.target.value)}
              className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
            <Input
              type="number"
              min="50"
              max="150"
              value={brightness}
              onChange={(e) => onBrightnessChange(e.target.value)}
              className="w-16 h-8 text-sm"
            />
            <span className="text-xs text-muted-foreground">%</span>
          </div>
        </div>

        {/* Contrast */}
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Contrast (50-150%)</Label>
          <div className="flex gap-2 items-center">
            <input
              type="range"
              min="50"
              max="150"
              value={contrast}
              onChange={(e) => onContrastChange(e.target.value)}
              className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
            <Input
              type="number"
              min="50"
              max="150"
              value={contrast}
              onChange={(e) => onContrastChange(e.target.value)}
              className="w-16 h-8 text-sm"
            />
            <span className="text-xs text-muted-foreground">%</span>
          </div>
        </div>

        {/* Blur */}
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Blur (0-10px)</Label>
          <div className="flex gap-2 items-center">
            <input
              type="range"
              min="0"
              max="10"
              step="0.1"
              value={blur}
              onChange={(e) => onBlurChange(e.target.value)}
              className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
            <Input
              type="number"
              min="0"
              max="10"
              step="0.1"
              value={blur}
              onChange={(e) => onBlurChange(e.target.value)}
              className="w-16 h-8 text-sm"
            />
            <span className="text-xs text-muted-foreground">px</span>
          </div>
        </div>
      </div>
    </div>
  );
}
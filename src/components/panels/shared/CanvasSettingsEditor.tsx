"use client";

import React from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PRESET_GRADIENTS } from "@/lib/constants";
import { CanvasSettings, BackgroundType, GradientDirection } from "@/types/canvas";
import { Grid3X3 } from "lucide-react";

interface CanvasSettingsEditorProps {
  canvasSettings: CanvasSettings;
  onUpdateCanvasSettings: (updates: Partial<CanvasSettings>) => void;
}

export function CanvasSettingsEditor({ canvasSettings, onUpdateCanvasSettings }: CanvasSettingsEditorProps) {
  const handleBackgroundTypeChange = (type: BackgroundType) => {
    onUpdateCanvasSettings({ backgroundType: type });
  };

  const handleSolidColorChange = (color: string) => {
    onUpdateCanvasSettings({ backgroundColor: color });
  };

  const handleGradientChange = (updates: Partial<CanvasSettings['backgroundGradient']>) => {
    const currentGradient = canvasSettings.backgroundGradient || {
      startColor: "#ffffff",
      endColor: "#000000",
      direction: "horizontal" as GradientDirection
    };
    onUpdateCanvasSettings({
      backgroundGradient: { ...currentGradient, ...updates }
    });
  };

  const applyPresetGradient = (preset: typeof PRESET_GRADIENTS[0]) => {
    onUpdateCanvasSettings({
      backgroundType: "gradient",
      backgroundGradient: {
        startColor: preset.startColor,
        endColor: preset.endColor,
        direction: preset.direction
      }
    });
  };

  const handleGridToggle = () => {
    onUpdateCanvasSettings({
      grid: {
        ...canvasSettings.grid,
        enabled: !canvasSettings.grid.enabled,
      },
    });
  };

  const handleGridSizeChange = (size: string) => {
    onUpdateCanvasSettings({
      grid: {
        ...canvasSettings.grid,
        size: parseInt(size),
      },
    });
  };

  return (
    <div className="space-y-4">
      {/* Background Type Toggle */}
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground uppercase">
          Background Type
        </Label>
        <div className="flex gap-2">
          <Button
            variant={canvasSettings.backgroundType === "solid" ? "default" : "outline"}
            size="sm"
            onClick={() => handleBackgroundTypeChange("solid")}
            className="flex-1"
          >
            Solid Color
          </Button>
          <Button
            variant={canvasSettings.backgroundType === "gradient" ? "default" : "outline"}
            size="sm"
            onClick={() => handleBackgroundTypeChange("gradient")}
            className="flex-1"
          >
            Gradient
          </Button>
        </div>
      </div>

      {/* Solid Color Controls */}
      {canvasSettings.backgroundType === "solid" && (
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground uppercase">
            Background Color
          </Label>
          <div className="flex gap-2">
            <input
              type="color"
              value={canvasSettings.backgroundColor}
              onChange={(e) => handleSolidColorChange(e.target.value)}
              className="h-10 w-14 p-1 cursor-pointer border rounded"
            />
            <input
              type="text"
              value={canvasSettings.backgroundColor}
              onChange={(e) => handleSolidColorChange(e.target.value)}
              className="h-10 flex-1 font-mono text-sm border rounded px-2"
              placeholder="#ffffff"
            />
          </div>
        </div>
      )}

      {/* Gradient Controls */}
      {canvasSettings.backgroundType === "gradient" && (
        <>
          {/* Preset Gradients */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground uppercase">
              Preset Gradients
            </Label>
            <div className="grid grid-cols-2 gap-2">
              {PRESET_GRADIENTS.map((preset, index) => (
                <button
                  key={index}
                  onClick={() => applyPresetGradient(preset)}
                  className="h-8 rounded border-2 border-muted hover:border-primary transition-colors"
                  style={{
                    background: `linear-gradient(${
                      preset.direction === "horizontal" ? "90deg" :
                      preset.direction === "vertical" ? "180deg" : "135deg"
                    }, ${preset.startColor}, ${preset.endColor})`
                  }}
                  title={preset.name}
                />
              ))}
            </div>
          </div>

          {/* Custom Gradient */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground uppercase">
              Custom Gradient
            </Label>

            {/* Direction */}
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Direction</Label>
              <Select
                value={canvasSettings.backgroundGradient?.direction || "horizontal"}
                onValueChange={(value: GradientDirection) => handleGradientChange({ direction: value })}
              >
                <SelectTrigger className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="horizontal">Horizontal</SelectItem>
                  <SelectItem value="vertical">Vertical</SelectItem>
                  <SelectItem value="diagonal">Diagonal</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Start Color */}
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Start Color</Label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={canvasSettings.backgroundGradient?.startColor || "#ffffff"}
                  onChange={(e) => handleGradientChange({ startColor: e.target.value })}
                  className="h-8 w-12 p-1 cursor-pointer border rounded"
                />
                <input
                  type="text"
                  value={canvasSettings.backgroundGradient?.startColor || "#ffffff"}
                  onChange={(e) => handleGradientChange({ startColor: e.target.value })}
                  className="h-8 flex-1 font-mono text-sm border rounded px-2"
                  placeholder="#ffffff"
                />
              </div>
            </div>

            {/* End Color */}
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">End Color</Label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={canvasSettings.backgroundGradient?.endColor || "#000000"}
                  onChange={(e) => handleGradientChange({ endColor: e.target.value })}
                  className="h-8 w-12 p-1 cursor-pointer border rounded"
                />
                <input
                  type="text"
                  value={canvasSettings.backgroundGradient?.endColor || "#000000"}
                  onChange={(e) => handleGradientChange({ endColor: e.target.value })}
                  className="h-8 flex-1 font-mono text-sm border rounded px-2"
                  placeholder="#000000"
                />
              </div>
            </div>
          </div>
        </>
      )}

      {/* Grid Settings */}
      <div className="space-y-3 pt-4 border-t">
        <Label className="text-xs text-muted-foreground uppercase flex items-center gap-2">
          <Grid3X3 className="w-3 h-3" />
          Snap to Grid
        </Label>

        <div className="flex items-center gap-2">
          <Button
            variant={canvasSettings.grid.enabled ? "default" : "outline"}
            size="sm"
            onClick={handleGridToggle}
            className="flex-1"
          >
            {canvasSettings.grid.enabled ? "Grid On" : "Grid Off"}
          </Button>

          {canvasSettings.grid.enabled && (
            <Select
              value={canvasSettings.grid.size.toString()}
              onValueChange={handleGridSizeChange}
            >
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10px</SelectItem>
                <SelectItem value="20">20px</SelectItem>
                <SelectItem value="50">50px</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>
      </div>
    </div>
  );
}
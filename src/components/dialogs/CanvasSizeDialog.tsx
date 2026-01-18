"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CanvasSize, CANVAS_PRESETS } from "@/types/canvas";
import { cn } from "@/lib/utils";
import { Monitor, Smartphone, FileImage, Globe } from "lucide-react";

interface CanvasSizeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentSize: CanvasSize;
  onSizeChange: (size: CanvasSize) => void;
}

const categoryIcons: Record<string, React.ReactNode> = {
  "General": <Monitor className="w-4 h-4" />,
  "Print": <FileImage className="w-4 h-4" />,
  "Social Media": <Smartphone className="w-4 h-4" />,
  "Web": <Globe className="w-4 h-4" />,
};

export function CanvasSizeDialog({
  open,
  onOpenChange,
  currentSize,
  onSizeChange,
}: CanvasSizeDialogProps) {
  const [selectedSize, setSelectedSize] = useState<CanvasSize>(currentSize);
  const [customWidth, setCustomWidth] = useState(currentSize.width.toString());
  const [customHeight, setCustomHeight] = useState(currentSize.height.toString());
  const [isCustom, setIsCustom] = useState(false);

  // Group presets by category
  const groupedPresets = CANVAS_PRESETS.reduce((acc, preset) => {
    if (!acc[preset.category]) {
      acc[preset.category] = [];
    }
    acc[preset.category].push(preset);
    return acc;
  }, {} as Record<string, CanvasSize[]>);

  const handlePresetSelect = (size: CanvasSize) => {
    setSelectedSize(size);
    setIsCustom(false);
    setCustomWidth(size.width.toString());
    setCustomHeight(size.height.toString());
  };

  const handleCustomChange = () => {
    const width = parseInt(customWidth) || 800;
    const height = parseInt(customHeight) || 600;
    const customSize: CanvasSize = {
      width: Math.max(100, Math.min(4000, width)),
      height: Math.max(100, Math.min(4000, height)),
      name: "Custom",
      category: "Custom",
    };
    setSelectedSize(customSize);
    setIsCustom(true);
  };

  const handleApply = () => {
    onSizeChange(selectedSize);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-[600px] max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Canvas Size</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto py-4 space-y-6">
          {/* Custom size inputs */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Custom Size</Label>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 flex-1">
                <Label className="text-xs text-muted-foreground w-8">W</Label>
                <Input
                  type="number"
                  min={100}
                  max={4000}
                  value={customWidth}
                  onChange={(e) => {
                    setCustomWidth(e.target.value);
                    setIsCustom(true);
                  }}
                  onBlur={handleCustomChange}
                  className="h-9"
                />
              </div>
              <span className="text-muted-foreground">×</span>
              <div className="flex items-center gap-2 flex-1">
                <Label className="text-xs text-muted-foreground w-8">H</Label>
                <Input
                  type="number"
                  min={100}
                  max={4000}
                  value={customHeight}
                  onChange={(e) => {
                    setCustomHeight(e.target.value);
                    setIsCustom(true);
                  }}
                  onBlur={handleCustomChange}
                  className="h-9"
                />
              </div>
              <span className="text-xs text-muted-foreground">px</span>
            </div>
          </div>

          {/* Presets by category */}
          {Object.entries(groupedPresets).map(([category, presets]) => (
            <div key={category} className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                {categoryIcons[category]}
                {category}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {presets.map((preset) => {
                  const isSelected = !isCustom && 
                    selectedSize.width === preset.width && 
                    selectedSize.height === preset.height &&
                    selectedSize.name === preset.name;
                  
                  return (
                    <button
                      key={`${preset.name}-${preset.width}-${preset.height}`}
                      className={cn(
                        "flex flex-col items-start p-3 rounded-md border text-left transition-colors",
                        "hover:bg-muted",
                        isSelected && "border-primary bg-primary/5"
                      )}
                      onClick={() => handlePresetSelect(preset)}
                    >
                      <span className="text-sm font-medium truncate w-full">
                        {preset.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {preset.width} × {preset.height}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Preview */}
        <div className="border-t pt-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Selected:</span>
            <span className="font-medium">
              {selectedSize.name} ({selectedSize.width} × {selectedSize.height} px)
            </span>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2 mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto">
            Cancel
          </Button>
          <Button onClick={handleApply} className="w-full sm:w-auto">
            Apply Size
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

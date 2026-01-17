"use client";

import React from "react";
import { CanvasElement, TextElement, ImageElement, CanvasSettings } from "@/types/canvas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface PropertiesPanelProps {
  element: CanvasElement | null;
  canvasSettings: CanvasSettings;
  onUpdate: (id: string, updates: Partial<CanvasElement>) => void;
  onUpdateCanvasSettings: (updates: Partial<CanvasSettings>) => void;
  onEditText: (element: TextElement) => void;
}

export function PropertiesPanel({
  element,
  canvasSettings,
  onUpdate,
  onUpdateCanvasSettings,
  onEditText,
}: PropertiesPanelProps) {
  if (!element) {
    return (
      <aside className="w-60 bg-background border-r flex flex-col">
        <div className="px-4 py-3 border-b">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Canvas Settings
          </h2>
        </div>
        <div className="flex-1 p-4 space-y-4">
          <div className="space-y-2">
            <Label
              htmlFor="bgColor"
              className="text-xs text-muted-foreground uppercase"
            >
              Background Color
            </Label>
            <div className="flex gap-2">
              <Input
                id="bgColor"
                type="color"
                value={canvasSettings.backgroundColor}
                onChange={(e) =>
                  onUpdateCanvasSettings({ backgroundColor: e.target.value })
                }
                className="h-10 w-14 p-1 cursor-pointer"
              />
              <Input
                type="text"
                value={canvasSettings.backgroundColor}
                onChange={(e) =>
                  onUpdateCanvasSettings({ backgroundColor: e.target.value })
                }
                className="h-10 flex-1 font-mono text-sm"
                placeholder="#ffffff"
              />
            </div>
          </div>
          <p className="text-xs text-muted-foreground text-center pt-4">
            Select an element to edit its properties
          </p>
        </div>
      </aside>
    );
  }

  const handlePositionChange = (axis: "x" | "y", value: string) => {
    const numValue = parseInt(value) || 0;
    onUpdate(element.id, {
      position: {
        ...element.position,
        [axis]: numValue,
      },
    });
  };

  const handleSizeChange = (dimension: "width" | "height", value: string) => {
    if (element.type !== "image") return;
    const numValue = Math.max(50, parseInt(value) || 50);
    onUpdate(element.id, {
      size: {
        ...element.size,
        [dimension]: numValue,
      },
    } as Partial<ImageElement>);
  };

  const handleFontSizeChange = (value: string) => {
    if (element.type !== "text") return;
    onUpdate(element.id, { fontSize: parseInt(value) || 24 } as Partial<TextElement>);
  };

  const handleColorChange = (value: string) => {
    if (element.type !== "text") return;
    onUpdate(element.id, { color: value } as Partial<TextElement>);
  };

  return (
    <aside className="w-60 bg-background border-r flex flex-col">
      <div className="px-4 py-3 border-b">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Properties
        </h2>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Position */}
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground uppercase">
            Position
          </Label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="propX" className="text-xs text-muted-foreground">
                X
              </Label>
              <Input
                id="propX"
                type="number"
                value={Math.round(element.position.x)}
                onChange={(e) => handlePositionChange("x", e.target.value)}
                className="h-8"
              />
            </div>
            <div>
              <Label htmlFor="propY" className="text-xs text-muted-foreground">
                Y
              </Label>
              <Input
                id="propY"
                type="number"
                value={Math.round(element.position.y)}
                onChange={(e) => handlePositionChange("y", e.target.value)}
                className="h-8"
              />
            </div>
          </div>
        </div>

        {/* Size (for images) */}
        {element.type === "image" && (
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground uppercase">
              Size
            </Label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label
                  htmlFor="propWidth"
                  className="text-xs text-muted-foreground"
                >
                  Width
                </Label>
                <Input
                  id="propWidth"
                  type="number"
                  value={Math.round(element.size.width)}
                  onChange={(e) => handleSizeChange("width", e.target.value)}
                  className="h-8"
                />
              </div>
              <div>
                <Label
                  htmlFor="propHeight"
                  className="text-xs text-muted-foreground"
                >
                  Height
                </Label>
                <Input
                  id="propHeight"
                  type="number"
                  value={Math.round(element.size.height)}
                  onChange={(e) => handleSizeChange("height", e.target.value)}
                  className="h-8"
                />
              </div>
            </div>
          </div>
        )}

        {/* Text properties */}
        {element.type === "text" && (
          <>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground uppercase">
                Text
              </Label>
              <Button
                variant="secondary"
                className="w-full"
                onClick={() => onEditText(element)}
              >
                Edit Text
              </Button>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="propFontSize"
                className="text-xs text-muted-foreground uppercase"
              >
                Font Size
              </Label>
              <Input
                id="propFontSize"
                type="number"
                min={8}
                max={200}
                value={element.fontSize}
                onChange={(e) => handleFontSizeChange(e.target.value)}
                className="h-8"
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="propColor"
                className="text-xs text-muted-foreground uppercase"
              >
                Color
              </Label>
              <Input
                id="propColor"
                type="color"
                value={element.color}
                onChange={(e) => handleColorChange(e.target.value)}
                className="h-8 p-1 cursor-pointer"
              />
            </div>
          </>
        )}
      </div>
    </aside>
  );
}
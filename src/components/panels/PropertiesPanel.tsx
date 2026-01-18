"use client";

import React from "react";
import { CanvasElement, TextElement, ImageElement, CanvasSettings } from "@/types/canvas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RotateCw, AlignLeft, AlignCenter, AlignRight, Bold, Italic } from "lucide-react";

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

  const handleRotationChange = (value: string) => {
    let numValue = parseFloat(value) || 0;
    // Normalize to 0-360
    numValue = ((numValue % 360) + 360) % 360;
    onUpdate(element.id, { rotation: numValue });
  };

  const handleResetRotation = () => {
    onUpdate(element.id, { rotation: 0 });
  };

  const toggleBold = () => {
    if (element.type !== "text") return;
    onUpdate(element.id, { 
      fontWeight: element.fontWeight === "bold" ? "normal" : "bold" 
    } as Partial<TextElement>);
  };

  const toggleItalic = () => {
    if (element.type !== "text") return;
    onUpdate(element.id, { 
      fontStyle: element.fontStyle === "italic" ? "normal" : "italic" 
    } as Partial<TextElement>);
  };

  const setAlignment = (align: "left" | "center" | "right") => {
    if (element.type !== "text") return;
    onUpdate(element.id, { textAlign: align } as Partial<TextElement>);
  };

  const handleWidthChange = (value: string) => {
    if (element.type !== "text") return;
    const numValue = Math.max(50, parseInt(value) || 200);
    onUpdate(element.id, { width: numValue } as Partial<TextElement>);
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

        {/* Rotation */}
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground uppercase">
            Rotation
          </Label>
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                id="propRotation"
                type="number"
                min={0}
                max={360}
                step={1}
                value={Math.round(element.rotation)}
                onChange={(e) => handleRotationChange(e.target.value)}
                className="h-8"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              className="h-8 px-2"
              onClick={handleResetRotation}
              title="Reset rotation"
            >
              <RotateCw className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Hold Shift for 15° snapping
          </p>
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

            {/* Text Styling */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground uppercase">
                Style
              </Label>
              <div className="flex gap-1 flex-wrap">
                <Button
                  variant={element.fontWeight === "bold" ? "default" : "outline"}
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={toggleBold}
                  title="Bold"
                >
                  <Bold className="w-4 h-4" />
                </Button>
                <Button
                  variant={element.fontStyle === "italic" ? "default" : "outline"}
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={toggleItalic}
                  title="Italic"
                >
                  <Italic className="w-4 h-4" />
                </Button>
                <div className="w-px bg-border mx-1" />
                <Button
                  variant={element.textAlign === "left" ? "default" : "outline"}
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => setAlignment("left")}
                  title="Align Left"
                >
                  <AlignLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant={element.textAlign === "center" ? "default" : "outline"}
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => setAlignment("center")}
                  title="Align Center"
                >
                  <AlignCenter className="w-4 h-4" />
                </Button>
                <Button
                  variant={element.textAlign === "right" ? "default" : "outline"}
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => setAlignment("right")}
                  title="Align Right"
                >
                  <AlignRight className="w-4 h-4" />
                </Button>
              </div>
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
                htmlFor="propTextWidth"
                className="text-xs text-muted-foreground uppercase"
              >
                Text Width
              </Label>
              <Input
                id="propTextWidth"
                type="number"
                min={50}
                value={element.width}
                onChange={(e) => handleWidthChange(e.target.value)}
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

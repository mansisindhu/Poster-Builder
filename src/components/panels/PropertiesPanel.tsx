"use client";

import React from "react";
import { CanvasElement, TextElement, ImageElement, ShapeElement, GroupElement, CanvasSettings, ShapeType, Point } from "@/types/canvas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RotateCw, AlignLeft, AlignCenter, AlignRight, Bold, Italic, Plus, Minus, Group } from "lucide-react";

interface PropertiesPanelProps {
  element: CanvasElement | null;
  selectedCount: number;
  canvasSettings: CanvasSettings;
  onUpdate: (id: string, updates: Partial<CanvasElement>) => void;
  onUpdateCanvasSettings: (updates: Partial<CanvasSettings>) => void;
  onEditText: (element: TextElement) => void;
  onGroup: () => void;
  onUngroup: () => void;
}

// Shape type labels
const shapeTypeLabels: Record<ShapeType, string> = {
  rectangle: "Rectangle",
  circle: "Circle",
  ellipse: "Ellipse",
  line: "Line",
  triangle: "Triangle",
  polygon: "Polygon",
};

export function PropertiesPanel({
  element,
  selectedCount,
  canvasSettings,
  onUpdate,
  onUpdateCanvasSettings,
  onEditText,
  onGroup,
  onUngroup,
}: PropertiesPanelProps) {
  // Show multi-selection panel if multiple items selected
  if (selectedCount > 1) {
    return (
      <aside className="w-60 bg-background border-r flex flex-col">
        <div className="px-4 py-3 border-b">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Multi-Selection
          </h2>
        </div>
        <div className="flex-1 p-4 space-y-4">
          <div className="flex items-center gap-2 text-sm">
            <Group className="w-4 h-4 text-muted-foreground" />
            <span>{selectedCount} items selected</span>
          </div>
          <Button
            variant="default"
            className="w-full"
            onClick={onGroup}
          >
            <Group className="w-4 h-4 mr-2" />
            Group Elements
          </Button>
          <p className="text-xs text-muted-foreground">
            Shortcut: Ctrl+G
          </p>
        </div>
      </aside>
    );
  }

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
    if (element.type !== "image" && element.type !== "shape" && element.type !== "group") return;
    const numValue = Math.max(50, parseInt(value) || 50);
    onUpdate(element.id, {
      size: {
        ...element.size,
        [dimension]: numValue,
      },
    } as Partial<ImageElement | ShapeElement | GroupElement>);
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

  // Shape-specific handlers
  const handleShapeFillColorChange = (value: string) => {
    if (element.type !== "shape") return;
    onUpdate(element.id, { fillColor: value } as Partial<ShapeElement>);
  };

  const handleShapeStrokeColorChange = (value: string) => {
    if (element.type !== "shape") return;
    onUpdate(element.id, { strokeColor: value } as Partial<ShapeElement>);
  };

  const handleShapeStrokeWidthChange = (value: string) => {
    if (element.type !== "shape") return;
    const numValue = Math.max(0, parseInt(value) || 0);
    onUpdate(element.id, { strokeWidth: numValue } as Partial<ShapeElement>);
  };

  const handleShapeBorderRadiusChange = (value: string) => {
    if (element.type !== "shape") return;
    const numValue = Math.max(0, parseInt(value) || 0);
    onUpdate(element.id, { borderRadius: numValue } as Partial<ShapeElement>);
  };

  const handlePointChange = (index: number, axis: "x" | "y", value: string) => {
    if (element.type !== "shape") return;
    const numValue = parseFloat(value) || 0;
    const newPoints = [...element.points];
    newPoints[index] = { ...newPoints[index], [axis]: numValue };
    onUpdate(element.id, { points: newPoints } as Partial<ShapeElement>);
  };

  const addPolygonPoint = () => {
    if (element.type !== "shape" || element.shapeType !== "polygon") return;
    const newPoints = [...element.points];
    // Add a new point at the center of the shape
    newPoints.push({ x: element.size.width / 2, y: element.size.height / 2 });
    onUpdate(element.id, { points: newPoints } as Partial<ShapeElement>);
  };

  const removePolygonPoint = (index: number) => {
    if (element.type !== "shape" || element.shapeType !== "polygon") return;
    if (element.points.length <= 3) return; // Minimum 3 points for a polygon
    const newPoints = element.points.filter((_, i) => i !== index);
    onUpdate(element.id, { points: newPoints } as Partial<ShapeElement>);
  };

  return (
    <aside className="w-60 bg-background border-r flex flex-col">
      <div className="px-4 py-3 border-b">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Properties
        </h2>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Element Type Badge */}
        {element.type === "shape" && (
          <div className="text-xs text-muted-foreground uppercase bg-muted px-2 py-1 rounded inline-block">
            {shapeTypeLabels[element.shapeType]}
          </div>
        )}

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

        {/* Size (for images, shapes, and groups) */}
        {(element.type === "image" || element.type === "shape" || element.type === "group") && (
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

        {/* Group info */}
        {element.type === "group" && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase bg-muted px-2 py-1 rounded">
              <Group className="w-4 h-4" />
              Group ({element.childIds.length} items)
            </div>
            <Button
              variant="outline"
              className="w-full"
              onClick={onUngroup}
            >
              <Group className="w-4 h-4 mr-2" />
              Ungroup
            </Button>
            <p className="text-xs text-muted-foreground">
              Shortcut: Ctrl+Shift+G
            </p>
          </div>
        )}

        {/* Shape properties */}
        {element.type === "shape" && (
          <>
            {/* Fill Color */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground uppercase">
                Fill Color
              </Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={element.fillColor}
                  onChange={(e) => handleShapeFillColorChange(e.target.value)}
                  className="h-8 w-14 p-1 cursor-pointer"
                />
                <Input
                  type="text"
                  value={element.fillColor}
                  onChange={(e) => handleShapeFillColorChange(e.target.value)}
                  className="h-8 flex-1 font-mono text-xs"
                />
              </div>
            </div>

            {/* Stroke Color */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground uppercase">
                Stroke Color
              </Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={element.strokeColor}
                  onChange={(e) => handleShapeStrokeColorChange(e.target.value)}
                  className="h-8 w-14 p-1 cursor-pointer"
                />
                <Input
                  type="text"
                  value={element.strokeColor}
                  onChange={(e) => handleShapeStrokeColorChange(e.target.value)}
                  className="h-8 flex-1 font-mono text-xs"
                />
              </div>
            </div>

            {/* Stroke Width */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground uppercase">
                Stroke Width
              </Label>
              <Input
                type="number"
                min={0}
                max={50}
                value={element.strokeWidth}
                onChange={(e) => handleShapeStrokeWidthChange(e.target.value)}
                className="h-8"
              />
            </div>

            {/* Border Radius (for rectangles only) */}
            {element.shapeType === "rectangle" && (
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground uppercase">
                  Border Radius
                </Label>
                <Input
                  type="number"
                  min={0}
                  value={element.borderRadius}
                  onChange={(e) => handleShapeBorderRadiusChange(e.target.value)}
                  className="h-8"
                />
              </div>
            )}

            {/* Points for lines */}
            {element.shapeType === "line" && element.points.length >= 2 && (
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground uppercase">
                  Line Points
                </Label>
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs text-muted-foreground">Start X</Label>
                      <Input
                        type="number"
                        value={Math.round(element.points[0].x)}
                        onChange={(e) => handlePointChange(0, "x", e.target.value)}
                        className="h-8"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Start Y</Label>
                      <Input
                        type="number"
                        value={Math.round(element.points[0].y)}
                        onChange={(e) => handlePointChange(0, "y", e.target.value)}
                        className="h-8"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs text-muted-foreground">End X</Label>
                      <Input
                        type="number"
                        value={Math.round(element.points[1].x)}
                        onChange={(e) => handlePointChange(1, "x", e.target.value)}
                        className="h-8"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">End Y</Label>
                      <Input
                        type="number"
                        value={Math.round(element.points[1].y)}
                        onChange={(e) => handlePointChange(1, "y", e.target.value)}
                        className="h-8"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Points for polygons */}
            {element.shapeType === "polygon" && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs text-muted-foreground uppercase">
                    Polygon Points ({element.points.length})
                  </Label>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-6 px-2"
                    onClick={addPolygonPoint}
                    title="Add point"
                  >
                    <Plus className="w-3 h-3" />
                  </Button>
                </div>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {element.points.map((point, index) => (
                    <div key={index} className="flex items-center gap-1">
                      <span className="text-xs text-muted-foreground w-4">{index + 1}</span>
                      <Input
                        type="number"
                        value={Math.round(point.x)}
                        onChange={(e) => handlePointChange(index, "x", e.target.value)}
                        className="h-7 text-xs flex-1"
                        placeholder="X"
                      />
                      <Input
                        type="number"
                        value={Math.round(point.y)}
                        onChange={(e) => handlePointChange(index, "y", e.target.value)}
                        className="h-7 text-xs flex-1"
                        placeholder="Y"
                      />
                      {element.points.length > 3 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0"
                          onClick={() => removePolygonPoint(index)}
                          title="Remove point"
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Points for triangles */}
            {element.shapeType === "triangle" && element.points.length >= 3 && (
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground uppercase">
                  Triangle Points
                </Label>
                <div className="space-y-2">
                  {element.points.slice(0, 3).map((point, index) => (
                    <div key={index} className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs text-muted-foreground">P{index + 1} X</Label>
                        <Input
                          type="number"
                          value={Math.round(point.x)}
                          onChange={(e) => handlePointChange(index, "x", e.target.value)}
                          className="h-8"
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">P{index + 1} Y</Label>
                        <Input
                          type="number"
                          value={Math.round(point.y)}
                          onChange={(e) => handlePointChange(index, "y", e.target.value)}
                          className="h-8"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
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

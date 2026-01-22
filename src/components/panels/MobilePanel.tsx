"use client";

import React, { useState } from "react";
import { CanvasElement, TextElement, ImageElement, ShapeElement, GroupElement, CanvasSettings, ShapeType } from "@/types/canvas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { 
  Type, 
  Image, 
  Layers, 
  Settings, 
  ChevronUp, 
  ChevronDown, 
  ChevronsUp, 
  ChevronsDown,
  RotateCw,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
  Italic,
  Square,
  Circle,
  Triangle,
  Minus,
  Pentagon,
  Group
} from "lucide-react";

interface MobilePanelProps {
  element: CanvasElement | null;
  elements: CanvasElement[];
  selectedId: string | null;
  selectedCount: number;
  canvasSettings: CanvasSettings;
  onUpdate: (id: string, updates: Partial<CanvasElement>) => void;
  onUpdateCanvasSettings: (updates: Partial<CanvasSettings>) => void;
  onEditText: (element: TextElement) => void;
  onSelect: (id: string) => void;
  onBringToFront: (id: string) => void;
  onSendToBack: (id: string) => void;
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
  onGroup: () => void;
  onUngroup: () => void;
}

type TabType = "properties" | "layers";

// Get shape icon based on shape type
function getShapeIcon(shapeType: ShapeType) {
  switch (shapeType) {
    case "rectangle":
      return <Square className="w-3 h-3 text-muted-foreground" />;
    case "circle":
      return <Circle className="w-3 h-3 text-muted-foreground" />;
    case "ellipse":
      return <Circle className="w-3 h-3 text-muted-foreground scale-x-125" />;
    case "line":
      return <Minus className="w-3 h-3 text-muted-foreground" />;
    case "triangle":
      return <Triangle className="w-3 h-3 text-muted-foreground" />;
    case "polygon":
      return <Pentagon className="w-3 h-3 text-muted-foreground" />;
    default:
      return <Square className="w-3 h-3 text-muted-foreground" />;
  }
}

// Get display name for element
function getElementDisplayName(element: CanvasElement): string {
  switch (element.type) {
    case "text":
      const text = element.content.substring(0, 15);
      return text + (element.content.length > 15 ? "..." : "");
    case "image":
      return element.name;
    case "shape":
      const shapeLabels: Record<ShapeType, string> = {
        rectangle: "Rectangle",
        circle: "Circle",
        ellipse: "Ellipse",
        line: "Line",
        triangle: "Triangle",
        polygon: "Polygon",
      };
      return shapeLabels[element.shapeType] || "Shape";
    case "group":
      return `Group (${element.childIds.length})`;
    default:
      return "Element";
  }
}

export function MobilePanel({
  element,
  elements,
  selectedId,
  selectedCount,
  canvasSettings,
  onUpdate,
  onUpdateCanvasSettings,
  onEditText,
  onSelect,
  onBringToFront,
  onSendToBack,
  onMoveUp,
  onMoveDown,
  onGroup,
  onUngroup,
}: MobilePanelProps) {
  const [activeTab, setActiveTab] = useState<TabType>("properties");
  
  // Get IDs of elements that are children of groups (they shouldn't appear as separate layers)
  const groupChildIds = new Set<string>();
  elements.forEach(el => {
    if (el.type === "group") {
      el.childIds.forEach(id => groupChildIds.add(id));
    }
  });
  
  // Filter out group children and sort by zIndex (highest first for display)
  const sortedElements = [...elements]
    .filter(el => !groupChildIds.has(el.id))
    .sort((a, b) => b.zIndex - a.zIndex);

  const handlePositionChange = (axis: "x" | "y", value: string) => {
    if (!element) return;
    const numValue = parseInt(value) || 0;
    onUpdate(element.id, {
      position: {
        ...element.position,
        [axis]: numValue,
      },
    });
  };

  const handleSizeChange = (dimension: "width" | "height", value: string) => {
    if (!element || (element.type !== "image" && element.type !== "shape" && element.type !== "group")) return;
    const numValue = Math.max(50, parseInt(value) || 50);
    onUpdate(element.id, {
      size: {
        ...element.size,
        [dimension]: numValue,
      },
    } as Partial<ImageElement | ShapeElement | GroupElement>);
  };

  const handleFontSizeChange = (value: string) => {
    if (!element || element.type !== "text") return;
    onUpdate(element.id, { fontSize: parseInt(value) || 24 } as Partial<TextElement>);
  };

  const handleColorChange = (value: string) => {
    if (!element || element.type !== "text") return;
    onUpdate(element.id, { color: value } as Partial<TextElement>);
  };

  const handleRotationChange = (value: string) => {
    if (!element) return;
    let numValue = parseFloat(value) || 0;
    numValue = ((numValue % 360) + 360) % 360;
    onUpdate(element.id, { rotation: numValue });
  };

  const toggleBold = () => {
    if (!element || element.type !== "text") return;
    onUpdate(element.id, { 
      fontWeight: element.fontWeight === "bold" ? "normal" : "bold" 
    } as Partial<TextElement>);
  };

  const toggleItalic = () => {
    if (!element || element.type !== "text") return;
    onUpdate(element.id, { 
      fontStyle: element.fontStyle === "italic" ? "normal" : "italic" 
    } as Partial<TextElement>);
  };

  const setAlignment = (align: "left" | "center" | "right") => {
    if (!element || element.type !== "text") return;
    onUpdate(element.id, { textAlign: align } as Partial<TextElement>);
  };

  // Shape handlers
  const handleShapeFillColorChange = (value: string) => {
    if (!element || element.type !== "shape") return;
    onUpdate(element.id, { fillColor: value } as Partial<ShapeElement>);
  };

  const handleShapeStrokeColorChange = (value: string) => {
    if (!element || element.type !== "shape") return;
    onUpdate(element.id, { strokeColor: value } as Partial<ShapeElement>);
  };

  const handleShapeStrokeWidthChange = (value: string) => {
    if (!element || element.type !== "shape") return;
    const numValue = Math.max(0, parseInt(value) || 0);
    onUpdate(element.id, { strokeWidth: numValue } as Partial<ShapeElement>);
  };

  const handleShapeBorderRadiusChange = (value: string) => {
    if (!element || element.type !== "shape") return;
    const numValue = Math.max(0, parseInt(value) || 0);
    onUpdate(element.id, { borderRadius: numValue } as Partial<ShapeElement>);
  };

  return (
    <div className="bg-background border-t flex flex-col max-h-[40vh]">
      {/* Tab buttons */}
      <div className="flex border-b">
        <button
          className={cn(
            "flex-1 py-2 px-4 text-sm font-medium flex items-center justify-center gap-2 transition-colors",
            activeTab === "properties" 
              ? "bg-primary/10 text-primary border-b-2 border-primary" 
              : "text-muted-foreground hover:bg-muted"
          )}
          onClick={() => setActiveTab("properties")}
        >
          <Settings className="w-4 h-4" />
          Properties
        </button>
        <button
          className={cn(
            "flex-1 py-2 px-4 text-sm font-medium flex items-center justify-center gap-2 transition-colors",
            activeTab === "layers" 
              ? "bg-primary/10 text-primary border-b-2 border-primary" 
              : "text-muted-foreground hover:bg-muted"
          )}
          onClick={() => setActiveTab("layers")}
        >
          <Layers className="w-4 h-4" />
          Layers
        </button>
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto p-3">
        {activeTab === "properties" ? (
          <div className="space-y-3">
            {/* Multi-selection group option */}
            {selectedCount > 1 && (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 text-xs text-muted-foreground flex-1">
                  <Group className="w-3 h-3" />
                  {selectedCount} items selected
                </div>
                <Button
                  variant="default"
                  size="sm"
                  onClick={onGroup}
                  className="h-8"
                >
                  <Group className="w-4 h-4 mr-1" />
                  Group
                </Button>
              </div>
            )}

            {/* Canvas background color */}
            <div className="flex items-center gap-3">
              <Label className="text-xs text-muted-foreground whitespace-nowrap">
                Background
              </Label>
              <Input
                type="color"
                value={canvasSettings.backgroundColor}
                onChange={(e) => onUpdateCanvasSettings({ backgroundColor: e.target.value })}
                className="h-8 w-12 p-1 cursor-pointer"
              />
              <Input
                type="text"
                value={canvasSettings.backgroundColor}
                onChange={(e) => onUpdateCanvasSettings({ backgroundColor: e.target.value })}
                className="h-8 flex-1 font-mono text-xs"
              />
            </div>

            {element ? (
              <>
                {/* Position */}
                <div className="flex items-center gap-2">
                  <Label className="text-xs text-muted-foreground w-12">Pos</Label>
                  <div className="flex gap-2 flex-1">
                    <div className="flex items-center gap-1 flex-1">
                      <span className="text-xs text-muted-foreground">X</span>
                      <Input
                        type="number"
                        value={Math.round(element.position.x)}
                        onChange={(e) => handlePositionChange("x", e.target.value)}
                        className="h-8"
                      />
                    </div>
                    <div className="flex items-center gap-1 flex-1">
                      <span className="text-xs text-muted-foreground">Y</span>
                      <Input
                        type="number"
                        value={Math.round(element.position.y)}
                        onChange={(e) => handlePositionChange("y", e.target.value)}
                        className="h-8"
                      />
                    </div>
                  </div>
                </div>

                {/* Rotation */}
                <div className="flex items-center gap-2">
                  <Label className="text-xs text-muted-foreground w-12">Rotate</Label>
                  <div className="flex gap-2 flex-1">
                    <Input
                      type="number"
                      min={0}
                      max={360}
                      value={Math.round(element.rotation)}
                      onChange={(e) => handleRotationChange(e.target.value)}
                      className="h-8 flex-1"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 px-2"
                      onClick={() => onUpdate(element.id, { rotation: 0 })}
                      title="Reset rotation"
                    >
                      <RotateCw className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Size for images, shapes, and groups */}
                {(element.type === "image" || element.type === "shape" || element.type === "group") && (
                  <div className="flex items-center gap-2">
                    <Label className="text-xs text-muted-foreground w-12">Size</Label>
                    <div className="flex gap-2 flex-1">
                      <div className="flex items-center gap-1 flex-1">
                        <span className="text-xs text-muted-foreground">W</span>
                        <Input
                          type="number"
                          value={Math.round(element.size.width)}
                          onChange={(e) => handleSizeChange("width", e.target.value)}
                          className="h-8"
                        />
                      </div>
                      <div className="flex items-center gap-1 flex-1">
                        <span className="text-xs text-muted-foreground">H</span>
                        <Input
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
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted px-2 py-1 rounded flex-1">
                      <Group className="w-3 h-3" />
                      Group ({element.childIds.length} items)
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={onUngroup}
                      className="h-8"
                    >
                      Ungroup
                    </Button>
                  </div>
                )}

                {/* Shape properties */}
                {element.type === "shape" && (
                  <>
                    <div className="flex items-center gap-2">
                      <Label className="text-xs text-muted-foreground w-12">Fill</Label>
                      <Input
                        type="color"
                        value={element.fillColor}
                        onChange={(e) => handleShapeFillColorChange(e.target.value)}
                        className="h-8 w-12 p-1 cursor-pointer"
                      />
                      <Input
                        type="text"
                        value={element.fillColor}
                        onChange={(e) => handleShapeFillColorChange(e.target.value)}
                        className="h-8 flex-1 font-mono text-xs"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <Label className="text-xs text-muted-foreground w-12">Stroke</Label>
                      <Input
                        type="color"
                        value={element.strokeColor}
                        onChange={(e) => handleShapeStrokeColorChange(e.target.value)}
                        className="h-8 w-12 p-1 cursor-pointer"
                      />
                      <Input
                        type="number"
                        min={0}
                        max={50}
                        value={element.strokeWidth}
                        onChange={(e) => handleShapeStrokeWidthChange(e.target.value)}
                        className="h-8 w-16"
                        placeholder="Width"
                      />
                    </div>

                    {element.shapeType === "rectangle" && (
                      <div className="flex items-center gap-2">
                        <Label className="text-xs text-muted-foreground w-12">Radius</Label>
                        <Input
                          type="number"
                          min={0}
                          value={element.borderRadius}
                          onChange={(e) => handleShapeBorderRadiusChange(e.target.value)}
                          className="h-8 flex-1"
                        />
                      </div>
                    )}
                  </>
                )}

                {/* Text properties */}
                {element.type === "text" && (
                  <>
                    {/* Text styling buttons */}
                    <div className="flex items-center gap-2">
                      <Label className="text-xs text-muted-foreground w-12">Style</Label>
                      <div className="flex gap-1 flex-1">
                        <Button
                          variant={element.fontWeight === "bold" ? "default" : "outline"}
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={toggleBold}
                        >
                          <Bold className="w-4 h-4" />
                        </Button>
                        <Button
                          variant={element.fontStyle === "italic" ? "default" : "outline"}
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={toggleItalic}
                        >
                          <Italic className="w-4 h-4" />
                        </Button>
                        <div className="w-px bg-border mx-1" />
                        <Button
                          variant={element.textAlign === "left" ? "default" : "outline"}
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => setAlignment("left")}
                        >
                          <AlignLeft className="w-4 h-4" />
                        </Button>
                        <Button
                          variant={element.textAlign === "center" ? "default" : "outline"}
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => setAlignment("center")}
                        >
                          <AlignCenter className="w-4 h-4" />
                        </Button>
                        <Button
                          variant={element.textAlign === "right" ? "default" : "outline"}
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => setAlignment("right")}
                        >
                          <AlignRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Label className="text-xs text-muted-foreground w-12">Font</Label>
                      <Input
                        type="number"
                        min={8}
                        max={200}
                        value={element.fontSize}
                        onChange={(e) => handleFontSizeChange(e.target.value)}
                        className="h-8 w-20"
                      />
                      <Input
                        type="color"
                        value={element.color}
                        onChange={(e) => handleColorChange(e.target.value)}
                        className="h-8 w-12 p-1 cursor-pointer"
                      />
                      <Button
                        variant="secondary"
                        size="sm"
                        className="flex-1"
                        onClick={() => onEditText(element)}
                      >
                        Edit Text
                      </Button>
                    </div>
                  </>
                )}
              </>
            ) : (
              <p className="text-xs text-muted-foreground text-center py-2">
                Tap an element to edit
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {/* Layer controls */}
            {selectedId && (
              <div className="flex items-center justify-center gap-1 pb-2 border-b">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8"
                  onClick={() => onBringToFront(selectedId)}
                  title="Bring to front"
                >
                  <ChevronsUp className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8"
                  onClick={() => onMoveUp(selectedId)}
                  title="Move up"
                >
                  <ChevronUp className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8"
                  onClick={() => onMoveDown(selectedId)}
                  title="Move down"
                >
                  <ChevronDown className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8"
                  onClick={() => onSendToBack(selectedId)}
                  title="Send to back"
                >
                  <ChevronsDown className="h-4 w-4" />
                </Button>
              </div>
            )}

            {/* Layer list */}
            {elements.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-2">
                No elements yet
              </p>
            ) : (
              <div className="space-y-1">
                {sortedElements.map((el) => (
                  <div
                    key={el.id}
                    className={cn(
                      "flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer transition-colors",
                      "hover:bg-muted",
                      selectedId === el.id && "bg-primary/10 ring-1 ring-primary"
                    )}
                    onClick={() => onSelect(el.id)}
                  >
                    <div className="w-6 h-6 bg-muted rounded flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {el.type === "text" ? (
                        <Type className="w-3 h-3 text-muted-foreground" />
                      ) : el.type === "shape" ? (
                        getShapeIcon(el.shapeType)
                      ) : el.type === "group" ? (
                        <Group className="w-3 h-3 text-muted-foreground" />
                      ) : (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={el.src}
                          alt={el.name}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium truncate">
                        {getElementDisplayName(el)}
                      </div>
                    </div>
                    {el.rotation !== 0 && (
                      <RotateCw className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

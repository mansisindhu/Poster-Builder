"use client";

import React, { useState } from "react";
import { CanvasElement, TextElement, CanvasSettings } from "@/types/canvas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { 
  Type, 
  Layers, 
  Settings, 
  ChevronUp, 
  ChevronDown, 
  ChevronsUp, 
  ChevronsDown,
  RotateCw,
  Group
} from "lucide-react";
import { getShapeIcon, getElementDisplayName } from "@/lib/elementUtils";
import {
  createPropertyHandlers,
  ColorPicker,
  PositionEditor,
  RotationEditor,
  SizeEditor,
  TextStyleEditor,
  ShapeStyleEditor,
} from "./shared";

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
  const handlers = createPropertyHandlers(element, onUpdate);
  
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
            <ColorPicker
              label="Background"
              value={canvasSettings.backgroundColor}
              onChange={(value) => onUpdateCanvasSettings({ backgroundColor: value })}
              compact
            />

            {element ? (
              <>
                {/* Position */}
                <PositionEditor
                  x={element.position.x}
                  y={element.position.y}
                  onPositionChange={handlers.handlePositionChange}
                  compact
                />

                {/* Rotation */}
                <RotationEditor
                  rotation={element.rotation}
                  onRotationChange={handlers.handleRotationChange}
                  onResetRotation={handlers.handleResetRotation}
                  compact
                />

                {/* Size for images, shapes, and groups */}
                {(element.type === "image" || element.type === "shape" || element.type === "group") && (
                  <SizeEditor
                    width={element.size.width}
                    height={element.size.height}
                    onSizeChange={handlers.handleSizeChange}
                    compact
                  />
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
                  <ShapeStyleEditor
                    element={element}
                    onFillColorChange={handlers.handleShapeFillColorChange}
                    onStrokeColorChange={handlers.handleShapeStrokeColorChange}
                    onStrokeWidthChange={handlers.handleShapeStrokeWidthChange}
                    onBorderRadiusChange={handlers.handleShapeBorderRadiusChange}
                    onPointChange={handlers.handlePointChange}
                    onAddPoint={handlers.addPolygonPoint}
                    onRemovePoint={handlers.removePolygonPoint}
                    compact
                  />
                )}

                {/* Text properties */}
                {element.type === "text" && (
                  <>
                    <TextStyleEditor
                      fontWeight={element.fontWeight}
                      fontStyle={element.fontStyle}
                      textAlign={element.textAlign}
                      onToggleBold={handlers.toggleBold}
                      onToggleItalic={handlers.toggleItalic}
                      onSetAlignment={handlers.setAlignment}
                      compact
                    />

                    <div className="flex items-center gap-2">
                      <Label className="text-xs text-muted-foreground w-12">Font</Label>
                      <Input
                        type="number"
                        min={8}
                        max={200}
                        value={element.fontSize}
                        onChange={(e) => handlers.handleFontSizeChange(e.target.value)}
                        className="h-8 w-20"
                      />
                      <Input
                        type="color"
                        value={element.color}
                        onChange={(e) => handlers.handleTextColorChange(e.target.value)}
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
                        getShapeIcon(el.shapeType, "w-3 h-3 text-muted-foreground")
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
                        {getElementDisplayName(el, 15)}
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

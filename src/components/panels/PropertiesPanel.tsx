"use client";

import React from "react";
import { CanvasElement, TextElement, CanvasSettings } from "@/types/canvas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Group } from "lucide-react";
import { SHAPE_LABELS } from "@/lib/constants";
import {
  createPropertyHandlers,
  ColorPicker,
  PositionEditor,
  RotationEditor,
  OpacityEditor,
  LockButton,
  FlipControls,
  CanvasSettingsEditor,
  TextShadowEditor,
  ImageFiltersEditor,
  SizeEditor,
  TextStyleEditor,
  ShapeStyleEditor,
} from "./shared";

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
  const handlers = createPropertyHandlers(element, onUpdate);

  // Show multi-selection panel if multiple items selected
  if (selectedCount > 1) {
    return (
      <aside className="bg-background border-r flex flex-col h-full">
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
      <aside className="bg-background flex flex-col h-full">
        <div className="px-4 py-3 border-b">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Canvas Settings
          </h2>
        </div>
        <div className="flex-1 p-4 space-y-4">
          <CanvasSettingsEditor
            canvasSettings={canvasSettings}
            onUpdateCanvasSettings={onUpdateCanvasSettings}
          />
          <p className="text-xs text-muted-foreground text-center pt-4">
            Select an element to edit its properties
          </p>
        </div>
      </aside>
    );
  }

  return (
    <aside className="bg-background border-r flex flex-col h-full">
      <div className="px-4 py-3 border-b">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Properties
        </h2>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Element Type Badge */}
        {element.type === "shape" && (
          <div className="text-xs text-muted-foreground uppercase bg-muted px-2 py-1 rounded inline-block">
            {SHAPE_LABELS[element.shapeType]}
          </div>
        )}

        {/* Opacity */}
        <OpacityEditor
          opacity={element.opacity}
          onOpacityChange={handlers.handleOpacityChange}
        />

        {/* Lock/Unlock */}
        <div className="space-y-2">
          <LockButton
            locked={element.locked}
            onToggleLock={handlers.toggleLock}
          />
        </div>

        {/* Flip (for images and shapes) */}
        {(element.type === "image" || element.type === "shape") && (
          <FlipControls
            scaleX={element.scaleX}
            scaleY={element.scaleY}
            onFlipHorizontal={handlers.flipHorizontal}
            onFlipVertical={handlers.flipVertical}
          />
        )}

        {/* Image Filters (for images only) */}
        {element.type === "image" && (
          <ImageFiltersEditor
            grayscale={element.grayscale}
            brightness={element.brightness}
            contrast={element.contrast}
            blur={element.blur}
            onGrayscaleChange={handlers.handleImageGrayscaleChange}
            onBrightnessChange={handlers.handleImageBrightnessChange}
            onContrastChange={handlers.handleImageContrastChange}
            onBlurChange={handlers.handleImageBlurChange}
          />
        )}

        {/* Size (for images, shapes, and groups) */}
        {!element.locked && (element.type === "image" || element.type === "shape" || element.type === "group") && (
          <SizeEditor
            width={element.size.width}
            height={element.size.height}
            onSizeChange={handlers.handleSizeChange}
          />
        )}

        {/* Position */}
        {!element.locked && (
          <PositionEditor
            x={element.position.x}
            y={element.position.y}
            onPositionChange={handlers.handlePositionChange}
          />
        )}

        {/* Rotation */}
        {!element.locked && (
          <RotationEditor
            rotation={element.rotation}
            onRotationChange={handlers.handleRotationChange}
            onResetRotation={handlers.handleResetRotation}
            showHint
          />
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
          <ShapeStyleEditor
            element={element}
            onFillColorChange={handlers.handleShapeFillColorChange}
            onStrokeColorChange={handlers.handleShapeStrokeColorChange}
            onStrokeWidthChange={handlers.handleShapeStrokeWidthChange}
            onBorderRadiusChange={handlers.handleShapeBorderRadiusChange}
            onPointChange={handlers.handlePointChange}
            onAddPoint={handlers.addPolygonPoint}
            onRemovePoint={handlers.removePolygonPoint}
          />
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

            <TextStyleEditor
              fontWeight={element.fontWeight}
              fontStyle={element.fontStyle}
              textAlign={element.textAlign}
              onToggleBold={handlers.toggleBold}
              onToggleItalic={handlers.toggleItalic}
              onSetAlignment={handlers.setAlignment}
            />

            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground uppercase">
                Font Size
              </Label>
              <Input
                type="number"
                min={8}
                max={200}
                value={element.fontSize}
                onChange={(e) => handlers.handleFontSizeChange(e.target.value)}
                className="h-8"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground uppercase">
                Text Width
              </Label>
              <Input
                type="number"
                min={50}
                value={element.width}
                onChange={(e) => handlers.handleTextWidthChange(e.target.value)}
                className="h-8"
              />
            </div>

            <ColorPicker
              label="Color"
              value={element.color}
              onChange={handlers.handleTextColorChange}
            />

            <TextShadowEditor
              shadowEnabled={element.shadowEnabled}
              shadowColor={element.shadowColor}
              shadowBlur={element.shadowBlur}
              shadowOffsetX={element.shadowOffsetX}
              shadowOffsetY={element.shadowOffsetY}
              onToggleShadow={handlers.toggleTextShadow}
              onShadowColorChange={handlers.handleTextShadowColorChange}
              onShadowBlurChange={handlers.handleTextShadowBlurChange}
              onShadowOffsetChange={handlers.handleTextShadowOffsetChange}
            />
          </>
        )}
      </div>
    </aside>
  );
}

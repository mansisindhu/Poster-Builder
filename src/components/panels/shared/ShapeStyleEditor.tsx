"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus, Minus } from "lucide-react";
import { ColorPicker } from "./ColorPicker";
import { ShapeElement, Point } from "@/types/canvas";

interface ShapeStyleEditorProps {
  element: ShapeElement;
  onFillColorChange: (value: string) => void;
  onStrokeColorChange: (value: string) => void;
  onStrokeWidthChange: (value: string) => void;
  onBorderRadiusChange: (value: string) => void;
  onPointChange: (index: number, axis: "x" | "y", value: string) => void;
  onAddPoint: () => void;
  onRemovePoint: (index: number) => void;
  /** Compact mode for mobile */
  compact?: boolean;
}

export function ShapeStyleEditor({
  element,
  onFillColorChange,
  onStrokeColorChange,
  onStrokeWidthChange,
  onBorderRadiusChange,
  onPointChange,
  onAddPoint,
  onRemovePoint,
  compact = false,
}: ShapeStyleEditorProps) {
  if (compact) {
    return (
      <>
        <ColorPicker
          label="Fill"
          value={element.fillColor}
          onChange={onFillColorChange}
          compact
        />

        <div className="flex items-center gap-2">
          <Label className="text-xs text-muted-foreground w-12">Stroke</Label>
          <Input
            type="color"
            value={element.strokeColor}
            onChange={(e) => onStrokeColorChange(e.target.value)}
            className="h-8 w-12 p-1 cursor-pointer"
          />
          <Input
            type="number"
            min={0}
            max={50}
            value={element.strokeWidth}
            onChange={(e) => onStrokeWidthChange(e.target.value)}
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
              onChange={(e) => onBorderRadiusChange(e.target.value)}
              className="h-8 flex-1"
            />
          </div>
        )}
      </>
    );
  }

  return (
    <>
      <ColorPicker
        label="Fill Color"
        value={element.fillColor}
        onChange={onFillColorChange}
      />

      <ColorPicker
        label="Stroke Color"
        value={element.strokeColor}
        onChange={onStrokeColorChange}
      />

      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground uppercase">
          Stroke Width
        </Label>
        <Input
          type="number"
          min={0}
          max={50}
          value={element.strokeWidth}
          onChange={(e) => onStrokeWidthChange(e.target.value)}
          className="h-8"
        />
      </div>

      {element.shapeType === "rectangle" && (
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground uppercase">
            Border Radius
          </Label>
          <Input
            type="number"
            min={0}
            value={element.borderRadius}
            onChange={(e) => onBorderRadiusChange(e.target.value)}
            className="h-8"
          />
        </div>
      )}

      {/* Line points */}
      {element.shapeType === "line" && element.points.length >= 2 && (
        <LinePointsEditor
          points={element.points}
          onPointChange={onPointChange}
        />
      )}

      {/* Polygon points */}
      {element.shapeType === "polygon" && (
        <PolygonPointsEditor
          points={element.points}
          onPointChange={onPointChange}
          onAddPoint={onAddPoint}
          onRemovePoint={onRemovePoint}
        />
      )}

      {/* Triangle points */}
      {element.shapeType === "triangle" && element.points.length >= 3 && (
        <TrianglePointsEditor
          points={element.points}
          onPointChange={onPointChange}
        />
      )}
    </>
  );
}

interface LinePointsEditorProps {
  points: Point[];
  onPointChange: (index: number, axis: "x" | "y", value: string) => void;
}

function LinePointsEditor({ points, onPointChange }: LinePointsEditorProps) {
  return (
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
              value={Math.round(points[0].x)}
              onChange={(e) => onPointChange(0, "x", e.target.value)}
              className="h-8"
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Start Y</Label>
            <Input
              type="number"
              value={Math.round(points[0].y)}
              onChange={(e) => onPointChange(0, "y", e.target.value)}
              className="h-8"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label className="text-xs text-muted-foreground">End X</Label>
            <Input
              type="number"
              value={Math.round(points[1].x)}
              onChange={(e) => onPointChange(1, "x", e.target.value)}
              className="h-8"
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">End Y</Label>
            <Input
              type="number"
              value={Math.round(points[1].y)}
              onChange={(e) => onPointChange(1, "y", e.target.value)}
              className="h-8"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

interface PolygonPointsEditorProps {
  points: Point[];
  onPointChange: (index: number, axis: "x" | "y", value: string) => void;
  onAddPoint: () => void;
  onRemovePoint: (index: number) => void;
}

function PolygonPointsEditor({
  points,
  onPointChange,
  onAddPoint,
  onRemovePoint,
}: PolygonPointsEditorProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-xs text-muted-foreground uppercase">
          Polygon Points ({points.length})
        </Label>
        <Button
          variant="outline"
          size="sm"
          className="h-6 px-2"
          onClick={onAddPoint}
          title="Add point"
        >
          <Plus className="w-3 h-3" />
        </Button>
      </div>
      <div className="space-y-2 max-h-40 overflow-y-auto">
        {points.map((point, index) => (
          <div key={index} className="flex items-center gap-1">
            <span className="text-xs text-muted-foreground w-4">{index + 1}</span>
            <Input
              type="number"
              value={Math.round(point.x)}
              onChange={(e) => onPointChange(index, "x", e.target.value)}
              className="h-7 text-xs flex-1"
              placeholder="X"
            />
            <Input
              type="number"
              value={Math.round(point.y)}
              onChange={(e) => onPointChange(index, "y", e.target.value)}
              className="h-7 text-xs flex-1"
              placeholder="Y"
            />
            {points.length > 3 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                onClick={() => onRemovePoint(index)}
                title="Remove point"
              >
                <Minus className="w-3 h-3" />
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

interface TrianglePointsEditorProps {
  points: Point[];
  onPointChange: (index: number, axis: "x" | "y", value: string) => void;
}

function TrianglePointsEditor({ points, onPointChange }: TrianglePointsEditorProps) {
  return (
    <div className="space-y-2">
      <Label className="text-xs text-muted-foreground uppercase">
        Triangle Points
      </Label>
      <div className="space-y-2">
        {points.slice(0, 3).map((point, index) => (
          <div key={index} className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs text-muted-foreground">P{index + 1} X</Label>
              <Input
                type="number"
                value={Math.round(point.x)}
                onChange={(e) => onPointChange(index, "x", e.target.value)}
                className="h-8"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">P{index + 1} Y</Label>
              <Input
                type="number"
                value={Math.round(point.y)}
                onChange={(e) => onPointChange(index, "y", e.target.value)}
                className="h-8"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

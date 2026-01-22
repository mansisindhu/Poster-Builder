"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { RotateCw } from "lucide-react";

interface RotationEditorProps {
  rotation: number;
  onRotationChange: (value: string) => void;
  onResetRotation: () => void;
  /** Compact mode for mobile - uses horizontal layout */
  compact?: boolean;
  /** Show help text about shift snapping */
  showHint?: boolean;
}

export function RotationEditor({
  rotation,
  onRotationChange,
  onResetRotation,
  compact = false,
  showHint = false,
}: RotationEditorProps) {
  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <Label className="text-xs text-muted-foreground w-12">Rotate</Label>
        <div className="flex gap-2 flex-1">
          <Input
            type="number"
            min={0}
            max={360}
            value={Math.round(rotation)}
            onChange={(e) => onRotationChange(e.target.value)}
            className="h-8 flex-1"
          />
          <Button
            variant="outline"
            size="sm"
            className="h-8 px-2"
            onClick={onResetRotation}
            title="Reset rotation"
          >
            <RotateCw className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label className="text-xs text-muted-foreground uppercase">
        Rotation
      </Label>
      <div className="flex gap-2">
        <div className="flex-1">
          <Input
            type="number"
            min={0}
            max={360}
            step={1}
            value={Math.round(rotation)}
            onChange={(e) => onRotationChange(e.target.value)}
            className="h-8"
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          className="h-8 px-2"
          onClick={onResetRotation}
          title="Reset rotation"
        >
          <RotateCw className="w-4 h-4" />
        </Button>
      </div>
      {showHint && (
        <p className="text-xs text-muted-foreground">
          Hold Shift for 15° snapping
        </p>
      )}
    </div>
  );
}

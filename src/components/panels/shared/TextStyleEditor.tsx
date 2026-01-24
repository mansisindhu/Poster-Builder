"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { AlignLeft, AlignCenter, AlignRight, Bold, Italic } from "lucide-react";

interface TextStyleEditorProps {
  fontWeight: "normal" | "bold";
  fontStyle: "normal" | "italic";
  textAlign: "left" | "center" | "right";
  onToggleBold: () => void;
  onToggleItalic: () => void;
  onSetAlignment: (align: "left" | "center" | "right") => void;
  /** Compact mode for mobile - uses horizontal layout */
  compact?: boolean;
}

export function TextStyleEditor({
  fontWeight,
  fontStyle,
  textAlign,
  onToggleBold,
  onToggleItalic,
  onSetAlignment,
  compact = false,
}: TextStyleEditorProps) {
  const buttons = (
    <div className="flex gap-1 flex-wrap">
      <Button
        variant={fontWeight === "bold" ? "default" : "outline"}
        size="sm"
        className="h-8 w-8 p-0"
        onClick={onToggleBold}
        title="Bold"
      >
        <Bold className="w-4 h-4" />
      </Button>
      <Button
        variant={fontStyle === "italic" ? "default" : "outline"}
        size="sm"
        className="h-8 w-8 p-0"
        onClick={onToggleItalic}
        title="Italic"
      >
        <Italic className="w-4 h-4" />
      </Button>
      <div className="w-px bg-border mx-1" />
      <Button
        variant={textAlign === "left" ? "default" : "outline"}
        size="sm"
        className="h-8 w-8 p-0"
        onClick={() => onSetAlignment("left")}
        title="Align Left"
      >
        <AlignLeft className="w-4 h-4" />
      </Button>
      <Button
        variant={textAlign === "center" ? "default" : "outline"}
        size="sm"
        className="h-8 w-8 p-0"
        onClick={() => onSetAlignment("center")}
        title="Align Center"
      >
        <AlignCenter className="w-4 h-4" />
      </Button>
      <Button
        variant={textAlign === "right" ? "default" : "outline"}
        size="sm"
        className="h-8 w-8 p-0"
        onClick={() => onSetAlignment("right")}
        title="Align Right"
      >
        <AlignRight className="w-4 h-4" />
      </Button>
    </div>
  );

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <Label className="text-xs text-muted-foreground w-12">Style</Label>
        <div className="flex gap-1 flex-1">
          {buttons}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label className="text-xs text-muted-foreground uppercase">
        Style
      </Label>
      {buttons}
    </div>
  );
}

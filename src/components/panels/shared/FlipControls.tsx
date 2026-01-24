"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { FlipHorizontal, FlipVertical } from "lucide-react";

interface FlipControlsProps {
  scaleX: number;
  scaleY: number;
  onFlipHorizontal: () => void;
  onFlipVertical: () => void;
}

export function FlipControls({ scaleX, scaleY, onFlipHorizontal, onFlipVertical }: FlipControlsProps) {
  return (
    <div className="space-y-2">
      <div className="text-xs text-muted-foreground uppercase">
        Flip
      </div>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onFlipHorizontal}
          className="flex-1"
          title="Flip Horizontal"
        >
          <FlipHorizontal className="w-4 h-4 mr-2" />
          Horizontal
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onFlipVertical}
          className="flex-1"
          title="Flip Vertical"
        >
          <FlipVertical className="w-4 h-4 mr-2" />
          Vertical
        </Button>
      </div>
    </div>
  );
}
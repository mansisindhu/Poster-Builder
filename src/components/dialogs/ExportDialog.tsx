"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { CanvasSize } from "@/types/canvas";
import { Download, Image } from "lucide-react";
import { cn } from "@/lib/utils";

interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  canvasSize: CanvasSize;
  onExport: (scale: number) => void;
}

const exportOptions = [
  { scale: 1, label: "Standard (1x)", description: "Original size" },
  { scale: 2, label: "High (2x)", description: "Double resolution", recommended: true },
  { scale: 3, label: "Very High (3x)", description: "Triple resolution" },
  { scale: 4, label: "Ultra (4x)", description: "Quadruple resolution" },
];

export function ExportDialog({
  open,
  onOpenChange,
  canvasSize,
  onExport,
}: ExportDialogProps) {
  const [selectedScale, setSelectedScale] = useState(2);

  const handleExport = () => {
    onExport(selectedScale);
    onOpenChange(false);
  };

  const exportWidth = canvasSize.width * selectedScale;
  const exportHeight = canvasSize.height * selectedScale;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="w-5 h-5" />
            Export Image
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Export Quality</Label>
            <div className="grid grid-cols-2 gap-2">
              {exportOptions.map((option) => (
                <button
                  key={option.scale}
                  onClick={() => setSelectedScale(option.scale)}
                  className={cn(
                    "relative flex flex-col items-start p-3 rounded-lg border-2 transition-all text-left",
                    selectedScale === option.scale
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  )}
                >
                  {option.recommended && (
                    <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded-full">
                      Best
                    </span>
                  )}
                  <span className="font-medium text-sm">{option.label}</span>
                  <span className="text-xs text-muted-foreground">
                    {option.description}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Image className="w-4 h-4 text-muted-foreground" />
              <span className="font-medium">Export Details</span>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
              <span className="text-muted-foreground">Original Size:</span>
              <span>{canvasSize.width} × {canvasSize.height} px</span>
              <span className="text-muted-foreground">Export Size:</span>
              <span className="font-medium text-primary">{exportWidth} × {exportHeight} px</span>
              <span className="text-muted-foreground">Format:</span>
              <span>PNG (lossless)</span>
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            Higher quality exports produce larger file sizes but look better when printed or viewed on high-resolution displays.
          </p>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Export ({selectedScale}x)
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
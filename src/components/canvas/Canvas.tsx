"use client";

import React, { useState, useCallback, useEffect } from "react";
import { CanvasElement } from "./CanvasElement";
import { CanvasElement as CanvasElementType, Position } from "@/types/canvas";
import { cn } from "@/lib/utils";

interface CanvasProps {
  elements: CanvasElementType[];
  selectedId: string | null;
  canvasRef: React.RefObject<HTMLDivElement>;
  backgroundColor: string;
  onSelect: (id: string | null) => void;
  onPositionChange: (id: string, position: Position) => void;
  onSizeChange: (id: string, width: number, height: number) => void;
  onDoubleClickText: (element: CanvasElementType) => void;
  onDropImage?: (file: File) => void;
  isMobile?: boolean;
}

// Store scale in a ref that can be accessed by child components
export const CanvasScaleContext = React.createContext<number>(1);

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;

export function Canvas({
  elements,
  selectedId,
  canvasRef,
  backgroundColor,
  onSelect,
  onPositionChange,
  onSizeChange,
  onDoubleClickText,
  onDropImage,
  isMobile = false,
}: CanvasProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [scale, setScale] = useState(1);

  // Calculate scale for mobile
  useEffect(() => {
    if (!isMobile) {
      setScale(1);
      return;
    }

    const updateScale = () => {
      const padding = 32; // 16px on each side
      const availableWidth = window.innerWidth - padding;
      const availableHeight = window.innerHeight - 200; // Account for toolbar and bottom panel
      
      const scaleX = availableWidth / CANVAS_WIDTH;
      const scaleY = availableHeight / CANVAS_HEIGHT;
      const newScale = Math.min(scaleX, scaleY, 1); // Don't scale up, only down
      
      setScale(Math.max(0.3, newScale)); // Minimum scale of 0.3
    };

    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, [isMobile]);

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onSelect(null);
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Check if dragging files
    if (e.dataTransfer.types.includes("Files")) {
      setIsDragOver(true);
    }
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    const imageFiles = files.filter(file => file.type.startsWith("image/"));

    if (imageFiles.length > 0 && onDropImage) {
      // Handle each dropped image
      imageFiles.forEach(file => {
        onDropImage(file);
      });
    }
  }, [onDropImage]);

  return (
    <CanvasScaleContext.Provider value={scale}>
      <div className={cn(
        "flex-1 flex flex-col items-center justify-center bg-muted/50 overflow-auto",
        isMobile ? "p-4" : "p-8"
      )}>
        <div 
          className="shadow-lg rounded-sm"
          style={isMobile ? {
            transform: `scale(${scale})`,
            transformOrigin: "center center",
          } : undefined}
        >
          <div
            ref={canvasRef}
            className={cn(
              "relative overflow-hidden transition-all",
              isDragOver && "ring-4 ring-primary ring-offset-2"
            )}
            style={{ 
              backgroundColor,
              width: CANVAS_WIDTH,
              height: CANVAS_HEIGHT,
            }}
            onClick={handleCanvasClick}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {/* Drop overlay */}
            {isDragOver && (
              <div className="absolute inset-0 bg-primary/10 flex items-center justify-center z-50 pointer-events-none">
                <div className="bg-background/90 px-6 py-4 rounded-lg shadow-lg border-2 border-dashed border-primary">
                  <p className="text-lg font-medium text-primary">Drop image here</p>
                </div>
              </div>
            )}
          {elements.map((element) => (
            <CanvasElement
              key={element.id}
              element={element}
              isSelected={selectedId === element.id}
              onSelect={() => onSelect(element.id)}
              onPositionChange={(pos) => onPositionChange(element.id, pos)}
              onSizeChange={
                element.type === "image"
                  ? (w, h) => onSizeChange(element.id, w, h)
                  : undefined
              }
              onDoubleClick={
                element.type === "text"
                  ? () => onDoubleClickText(element)
                  : undefined
              }
              canvasRef={canvasRef}
            />
          ))}
        </div>
      </div>
      <div className={cn(
        "text-xs text-muted-foreground",
        isMobile ? "mt-2" : "mt-3"
      )}>
        {CANVAS_WIDTH} × {CANVAS_HEIGHT} px {isMobile && scale < 1 && `(${Math.round(scale * 100)}%)`}
      </div>
    </div>
    </CanvasScaleContext.Provider>
  );
}
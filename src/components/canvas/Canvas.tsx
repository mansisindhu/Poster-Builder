"use client";

import React, { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { CanvasElement } from "./CanvasElement";
import { ZoomControls } from "./ZoomControls";
import { GridOverlay } from "./GridOverlay";
import { CanvasElement as CanvasElementType, Position, CanvasSize, CanvasSettings } from "@/types/canvas";
import { cn } from "@/lib/utils";
import { SNAP_THRESHOLD } from "@/lib/constants";

interface CanvasProps {
  elements: CanvasElementType[];
  selectedId: string | null;
  selectedIds: string[];
  canvasSettings: CanvasSettings;
  onSelect: (id: string | null) => void;
  onToggleSelect: (id: string) => void;
  onPositionChange: (id: string, position: Position) => void;
  onRotationChange: (id: string, rotation: number) => void;
  onSizeChange: (id: string, size: { width: number; height: number }, position?: Position) => void;
  onWidthChange: (id: string, width: number) => void;
  onInteractionStart: () => void;
  onInteractionEnd: () => void;
  onDoubleClickText: (element: CanvasElementType) => void;
  onDropImage?: (file: File) => void;
  isMobile?: boolean;
}

// Store scale in a ref that can be accessed by child components
export const CanvasScaleContext = React.createContext<number>(1);

// Alignment guide context
interface AlignmentGuides {
  showVerticalCenter: boolean;
  showHorizontalCenter: boolean;
}

export const AlignmentGuidesContext = React.createContext<{
  guides: AlignmentGuides;
  setGuides: (guides: AlignmentGuides) => void;
}>({
  guides: { showVerticalCenter: false, showHorizontalCenter: false },
  setGuides: () => {},
});

export function Canvas({
  elements,
  selectedId,
  selectedIds,
  canvasSettings,
  onSelect,
  onToggleSelect,
  onPositionChange,
  onRotationChange,
  onSizeChange,
  onWidthChange,
  onInteractionStart,
  onInteractionEnd,
  onDoubleClickText,
  onDropImage,
  isMobile = false,
}: CanvasProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [scale, setScale] = useState(1);
  const [manualZoom, setManualZoom] = useState<number | null>(null); // null = auto-fit, number = manual zoom percentage
  const [alignmentGuides, setAlignmentGuides] = useState<AlignmentGuides>({
    showVerticalCenter: false,
    showHorizontalCenter: false,
  });
  
  const internalCanvasRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Calculate canvas center
  const canvasCenter = useMemo(() => ({
    x: canvasSettings.canvasSize.width / 2,
    y: canvasSettings.canvasSize.height / 2,
  }), [canvasSettings.canvasSize.width, canvasSettings.canvasSize.height]);

  // Calculate scale to fit canvas in viewport (only when in auto-fit mode)
  useEffect(() => {
    if (manualZoom !== null) return; // Skip if manual zoom is active

    const updateScale = () => {
      if (!containerRef.current) return;

      const padding = isMobile ? 32 : 64;
      const containerRect = containerRef.current.getBoundingClientRect();
      const availableWidth = containerRect.width - padding;
      const availableHeight = containerRect.height - padding - 40; // Account for size label

      const scaleX = availableWidth / canvasSettings.canvasSize.width;
      const scaleY = availableHeight / canvasSettings.canvasSize.height;
      const newScale = Math.min(scaleX, scaleY, 1); // Don't scale up, only down

      setScale(Math.max(0.25, newScale)); // Allow down to 25%
    };

    updateScale();
    window.addEventListener("resize", updateScale);

    // Also update when canvas size changes
    const resizeObserver = new ResizeObserver(updateScale);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      window.removeEventListener("resize", updateScale);
      resizeObserver.disconnect();
    };
  }, [canvasSettings.canvasSize.width, canvasSettings.canvasSize.height, isMobile, manualZoom]);

  // Update scale when manual zoom changes
  useEffect(() => {
    if (manualZoom !== null) {
      setScale(Math.max(0.25, Math.min(2.0, manualZoom / 100)));
    }
  }, [manualZoom]);

  // Zoom control functions
  const zoomIn = useCallback(() => {
    setManualZoom(prev => {
      const current = prev ?? (scale * 100);
      return Math.min(200, current + 25);
    });
  }, [scale]);

  const zoomOut = useCallback(() => {
    setManualZoom(prev => {
      const current = prev ?? (scale * 100);
      return Math.max(25, current - 25);
    });
  }, [scale]);

  const resetZoom = useCallback(() => {
    setManualZoom(null); // Reset to auto-fit
  }, []);

  const currentZoomPercent = manualZoom ?? Math.round(scale * 100);

  // Keyboard shortcuts for zoom
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === '=' || e.key === '+') {
          e.preventDefault();
          zoomIn();
        } else if (e.key === '-') {
          e.preventDefault();
          zoomOut();
        } else if (e.key === '0') {
          e.preventDefault();
          resetZoom();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [zoomIn, zoomOut, resetZoom]);

  // Handle position change with alignment guides
  const handlePositionChangeWithGuides = useCallback((id: string, position: Position) => {
    const element = elements.find(el => el.id === id);
    if (!element) {
      onPositionChange(id, position);
      return;
    }

    // Get element dimensions
    let elementWidth = 0;
    let elementHeight = 0;
    
    if (element.type === "image" || element.type === "shape" || element.type === "group") {
      elementWidth = element.size.width;
      elementHeight = element.size.height;
    } else if (element.type === "text") {
      elementWidth = element.width;
      // Estimate text height based on font size and content
      const lines = element.content.split("\n").length;
      elementHeight = element.fontSize * 1.2 * lines + 16; // padding
    }

    // Calculate element center
    const elementCenterX = position.x + elementWidth / 2;
    const elementCenterY = position.y + elementHeight / 2;

    // Check for center alignment
    const isNearVerticalCenter = Math.abs(elementCenterX - canvasCenter.x) < SNAP_THRESHOLD;
    const isNearHorizontalCenter = Math.abs(elementCenterY - canvasCenter.y) < SNAP_THRESHOLD;

    // Update guides
    setAlignmentGuides({
      showVerticalCenter: isNearVerticalCenter,
      showHorizontalCenter: isNearHorizontalCenter,
    });

    // Snap position if near center
    let snappedPosition = { ...position };
    if (isNearVerticalCenter) {
      snappedPosition.x = canvasCenter.x - elementWidth / 2;
    }
    if (isNearHorizontalCenter) {
      snappedPosition.y = canvasCenter.y - elementHeight / 2;
    }

    // Snap to grid if enabled
    if (canvasSettings.grid.enabled) {
      const gridSize = canvasSettings.grid.size;
      const snapThreshold = gridSize * 0.3; // Snap when within 30% of grid size

      // Check X snapping
      const nearestGridX = Math.round(snappedPosition.x / gridSize) * gridSize;
      if (Math.abs(snappedPosition.x - nearestGridX) < snapThreshold) {
        snappedPosition.x = nearestGridX;
      }

      // Check Y snapping
      const nearestGridY = Math.round(snappedPosition.y / gridSize) * gridSize;
      if (Math.abs(snappedPosition.y - nearestGridY) < snapThreshold) {
        snappedPosition.y = nearestGridY;
      }
    }

    onPositionChange(id, snappedPosition);
  }, [elements, canvasCenter, onPositionChange]);

  // Clear guides when interaction ends
  const handleInteractionEnd = useCallback(() => {
    setAlignmentGuides({ showVerticalCenter: false, showHorizontalCenter: false });
    onInteractionEnd();
  }, [onInteractionEnd]);

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onSelect(null);
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
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
      imageFiles.forEach(file => {
        onDropImage(file);
      });
    }
  }, [onDropImage]);

  return (
    <CanvasScaleContext.Provider value={scale}>
      <AlignmentGuidesContext.Provider value={{ guides: alignmentGuides, setGuides: setAlignmentGuides }}>
        <div 
          ref={containerRef}
          className={cn(
            "flex-1 flex flex-col items-center justify-center bg-muted/50 overflow-auto",
            isMobile ? "p-4" : "p-8"
          )}
        >
          <div 
            className="shadow-lg rounded-sm"
            style={{
              transform: `scale(${scale})`,
              transformOrigin: "center center",
            }}
          >
            <div
              ref={internalCanvasRef}
              className={cn(
                "relative transition-colors",
                isDragOver && "ring-4 ring-primary ring-offset-2"
              )}
              style={{
                background: canvasSettings.backgroundType === "gradient" && canvasSettings.backgroundGradient
                  ? `linear-gradient(${
                      canvasSettings.backgroundGradient.direction === "horizontal" ? "90deg" :
                      canvasSettings.backgroundGradient.direction === "vertical" ? "180deg" : "135deg"
                    }, ${canvasSettings.backgroundGradient.startColor}, ${canvasSettings.backgroundGradient.endColor})`
                  : canvasSettings.backgroundColor,
                width: canvasSettings.canvasSize.width,
                height: canvasSettings.canvasSize.height,
              }}
              onClick={handleCanvasClick}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <GridOverlay
                grid={canvasSettings.grid}
                canvasSize={canvasSettings.canvasSize}
                scale={scale}
              />
              {/* Alignment Guides */}
              {alignmentGuides.showVerticalCenter && (
                <div 
                  className="absolute top-0 bottom-0 w-px bg-blue-500 z-[100] pointer-events-none"
                  style={{ left: canvasCenter.x }}
                >
                  <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-xs px-1 rounded whitespace-nowrap">
                    Center
                  </div>
                </div>
              )}
              {alignmentGuides.showHorizontalCenter && (
                <div 
                  className="absolute left-0 right-0 h-px bg-blue-500 z-[100] pointer-events-none"
                  style={{ top: canvasCenter.y }}
                >
                  <div className="absolute left-2 top-1/2 -translate-y-1/2 bg-blue-500 text-white text-xs px-1 rounded whitespace-nowrap">
                    Center
                  </div>
                </div>
              )}

              {isDragOver && (
                <div className="absolute inset-0 bg-primary/10 flex items-center justify-center z-50 pointer-events-none">
                  <div className="bg-background/90 px-6 py-4 rounded-lg shadow-lg border-2 border-dashed border-primary">
                    <p className="text-lg font-medium text-primary">Drop image here</p>
                  </div>
                </div>
              )}
              {elements
                // Filter out elements that are children of groups (they're rendered by the group)
                .filter(element => {
                  const isChildOfGroup = elements.some(
                    el => el.type === "group" && el.childIds.includes(element.id)
                  );
                  return !isChildOfGroup;
                })
                .map((element) => (
                <CanvasElement
                  key={element.id}
                  element={element}
                  allElements={elements}
                  isSelected={selectedIds.includes(element.id)}
                  onSelect={(ctrlKey) => {
                    if (ctrlKey) {
                      onToggleSelect(element.id);
                    } else {
                      onSelect(element.id);
                    }
                  }}
                  onPositionChange={(pos) => handlePositionChangeWithGuides(element.id, pos)}
                  onRotationChange={(rotation) => onRotationChange(element.id, rotation)}
                  onSizeChange={
                    (element.type === "image" || element.type === "shape" || element.type === "group")
                      ? (w, h, pos) => onSizeChange(element.id, { width: w, height: h }, pos)
                      : undefined
                  }
                  onWidthChange={(width) => onWidthChange(element.id, width)}
                  onInteractionStart={onInteractionStart}
                  onInteractionEnd={handleInteractionEnd}
                  onDoubleClick={
                    element.type === "text"
                      ? () => onDoubleClickText(element)
                      : undefined
                  }
                  canvasRef={internalCanvasRef}
                />
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between mt-3">
            <div className="text-xs text-muted-foreground">
              <div>{canvasSettings.canvasSize.name}</div>
              <div>{canvasSettings.canvasSize.width} × {canvasSettings.canvasSize.height} px</div>
            </div>
            <ZoomControls
              zoomPercent={currentZoomPercent}
              onZoomIn={zoomIn}
              onZoomOut={zoomOut}
              onResetZoom={resetZoom}
            />
          </div>
        </div>
      </AlignmentGuidesContext.Provider>
    </CanvasScaleContext.Provider>
  );
}

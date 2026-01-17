"use client";

import React, { useRef, useEffect, useState, useCallback, useContext } from "react";
import { CanvasElement as CanvasElementType, Position } from "@/types/canvas";
import { cn } from "@/lib/utils";
import { CanvasScaleContext } from "./Canvas";

interface CanvasElementProps {
  element: CanvasElementType;
  isSelected: boolean;
  onSelect: () => void;
  onPositionChange: (position: Position) => void;
  onSizeChange?: (width: number, height: number) => void;
  onDoubleClick?: () => void;
  canvasRef: React.RefObject<HTMLDivElement>;
}

const resizeHandles = ["nw", "ne", "sw", "se"] as const;

export function CanvasElement({
  element,
  isSelected,
  onSelect,
  onPositionChange,
  onSizeChange,
  onDoubleClick,
  canvasRef,
}: CanvasElementProps) {
  const elementRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<string | null>(null);
  const dragOffset = useRef({ x: 0, y: 0 });
  const resizeStart = useRef<{
    x: number;
    y: number;
    width: number;
    height: number;
    left: number;
    top: number;
  } | null>(null);
  
  // Get the canvas scale from context
  const scale = useContext(CanvasScaleContext);

  // Get client coordinates from mouse or touch event
  const getClientCoords = (e: MouseEvent | TouchEvent | React.MouseEvent | React.TouchEvent) => {
    if ("touches" in e) {
      return { clientX: e.touches[0]?.clientX ?? 0, clientY: e.touches[0]?.clientY ?? 0 };
    }
    return { clientX: e.clientX, clientY: e.clientY };
  };

  const handlePointerDown = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      e.stopPropagation();
      onSelect();

      const { clientX, clientY } = getClientCoords(e);

      // Check if clicking on resize handle
      const target = e.target as HTMLElement;
      if (target.dataset.resizeHandle) {
        setIsResizing(true);
        setResizeHandle(target.dataset.resizeHandle);
        if (element.type === "image") {
          resizeStart.current = {
            x: clientX,
            y: clientY,
            width: element.size.width,
            height: element.size.height,
            left: element.position.x,
            top: element.position.y,
          };
        }
        return;
      }

      // Start dragging
      setIsDragging(true);
      // Store the offset in canvas coordinates (not scaled)
      // The offset is the click position relative to the element's top-left corner
      const rect = elementRef.current!.getBoundingClientRect();
      dragOffset.current = {
        x: (clientX - rect.left) / scale,
        y: (clientY - rect.top) / scale,
      };
    },
    [element, onSelect, scale]
  );

  // Legacy mouse handler for compatibility
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      handlePointerDown(e);
    },
    [handlePointerDown]
  );

  // Touch handler
  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      handlePointerDown(e);
    },
    [handlePointerDown]
  );

  useEffect(() => {
    if (!isDragging && !isResizing) return;

    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      if (!canvasRef.current) return;
      
      // Prevent scrolling on touch devices while dragging
      if ("touches" in e) {
        e.preventDefault();
      }
      
      const { clientX, clientY } = getClientCoords(e);
      const canvasRect = canvasRef.current.getBoundingClientRect();

      if (isDragging) {
        // Adjust for scale - convert screen coordinates to canvas coordinates
        let newX = (clientX - canvasRect.left) / scale - dragOffset.current.x;
        let newY = (clientY - canvasRect.top) / scale - dragOffset.current.y;

        // Constrain to canvas bounds (use actual canvas dimensions, not scaled)
        const elementWidth = elementRef.current!.offsetWidth;
        const elementHeight = elementRef.current!.offsetHeight;
        const maxX = canvasRef.current.offsetWidth - elementWidth;
        const maxY = canvasRef.current.offsetHeight - elementHeight;

        newX = Math.max(0, Math.min(newX, maxX));
        newY = Math.max(0, Math.min(newY, maxY));

        onPositionChange({ x: newX, y: newY });
      } else if (isResizing && resizeStart.current && element.type === "image") {
        // Adjust deltas for scale
        const dx = (clientX - resizeStart.current.x) / scale;
        const dy = (clientY - resizeStart.current.y) / scale;

        let newWidth = resizeStart.current.width;
        let newHeight = resizeStart.current.height;
        let newLeft = resizeStart.current.left;
        let newTop = resizeStart.current.top;

        switch (resizeHandle) {
          case "se":
            newWidth = Math.max(50, resizeStart.current.width + dx);
            newHeight = Math.max(50, resizeStart.current.height + dy);
            break;
          case "sw":
            newWidth = Math.max(50, resizeStart.current.width - dx);
            newHeight = Math.max(50, resizeStart.current.height + dy);
            newLeft = resizeStart.current.left + (resizeStart.current.width - newWidth);
            break;
          case "ne":
            newWidth = Math.max(50, resizeStart.current.width + dx);
            newHeight = Math.max(50, resizeStart.current.height - dy);
            newTop = resizeStart.current.top + (resizeStart.current.height - newHeight);
            break;
          case "nw":
            newWidth = Math.max(50, resizeStart.current.width - dx);
            newHeight = Math.max(50, resizeStart.current.height - dy);
            newLeft = resizeStart.current.left + (resizeStart.current.width - newWidth);
            newTop = resizeStart.current.top + (resizeStart.current.height - newHeight);
            break;
        }

        onPositionChange({ x: newLeft, y: newTop });
        onSizeChange?.(newWidth, newHeight);
      }
    };

    const handlePointerUp = () => {
      setIsDragging(false);
      setIsResizing(false);
      setResizeHandle(null);
      resizeStart.current = null;
    };

    // Mouse events
    document.addEventListener("mousemove", handlePointerMove);
    document.addEventListener("mouseup", handlePointerUp);
    // Touch events
    document.addEventListener("touchmove", handlePointerMove, { passive: false });
    document.addEventListener("touchend", handlePointerUp);
    document.addEventListener("touchcancel", handlePointerUp);

    return () => {
      document.removeEventListener("mousemove", handlePointerMove);
      document.removeEventListener("mouseup", handlePointerUp);
      document.removeEventListener("touchmove", handlePointerMove);
      document.removeEventListener("touchend", handlePointerUp);
      document.removeEventListener("touchcancel", handlePointerUp);
    };
  }, [isDragging, isResizing, resizeHandle, element, onPositionChange, onSizeChange, canvasRef, scale]);

  return (
    <div
      ref={elementRef}
      className={cn(
        "absolute cursor-move select-none touch-none",
        isSelected && "ring-2 ring-primary ring-offset-2"
      )}
      style={{
        left: element.position.x,
        top: element.position.y,
        zIndex: element.zIndex,
      }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      onDoubleClick={onDoubleClick}
    >
      {element.type === "text" ? (
        <div
          className="px-3 py-2 whitespace-pre-wrap break-words"
          style={{
            fontSize: element.fontSize,
            fontFamily: element.fontFamily,
            fontWeight: element.fontWeight,
            color: element.color,
          }}
        >
          {element.content}
        </div>
      ) : (
        <div
          className="flex items-center justify-center"
          style={{
            width: element.size.width,
            height: element.size.height,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={element.src}
            alt={element.name}
            className="max-w-full max-h-full object-contain pointer-events-none"
            draggable={false}
          />
        </div>
      )}

      {/* Resize handles for images */}
      {isSelected && element.type === "image" && (
        <>
          {resizeHandles.map((handle) => (
            <div
              key={handle}
              data-resize-handle={handle}
              className={cn(
                "absolute w-4 h-4 md:w-3 md:h-3 bg-primary border-2 border-white rounded-sm z-10 touch-none",
                handle === "nw" && "-top-2 -left-2 md:-top-1.5 md:-left-1.5 cursor-nw-resize",
                handle === "ne" && "-top-2 -right-2 md:-top-1.5 md:-right-1.5 cursor-ne-resize",
                handle === "sw" && "-bottom-2 -left-2 md:-bottom-1.5 md:-left-1.5 cursor-sw-resize",
                handle === "se" && "-bottom-2 -right-2 md:-bottom-1.5 md:-right-1.5 cursor-se-resize"
              )}
            />
          ))}
        </>
      )}
    </div>
  );
}
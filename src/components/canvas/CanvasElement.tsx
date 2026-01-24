"use client";

import React, { useRef, useEffect, useState, useCallback, useContext } from "react";
import { CanvasElement as CanvasElementType, Position, ShapeElement, GroupElement } from "@/types/canvas";
import { cn } from "@/lib/utils";
import { CanvasScaleContext } from "./Canvas";
import { RotateCw, GripVertical } from "lucide-react";

interface CanvasElementProps {
  element: CanvasElementType;
  allElements?: CanvasElementType[];
  isSelected: boolean;
  onSelect: (ctrlKey?: boolean) => void;
  onPositionChange: (position: Position) => void;
  onRotationChange: (rotation: number) => void;
  onSizeChange?: (width: number, height: number, position?: Position) => void;
  onWidthChange?: (width: number) => void;
  onInteractionStart: () => void;
  onInteractionEnd: () => void;
  onDoubleClick?: () => void;
  canvasRef: React.RefObject<HTMLDivElement>;
}

const resizeHandles = ["nw", "ne", "sw", "se"] as const;

// Component for rendering shape SVG content
function ShapeRenderer({ shape }: { shape: ShapeElement }) {
  const { size, shapeType, fillColor, strokeColor, strokeWidth, borderRadius, points } = shape;
  const { width, height } = size;
  
  // Adjust for stroke width to prevent clipping
  const padding = strokeWidth;
  const svgWidth = width + padding * 2;
  const svgHeight = height + padding * 2;
  
  // Helper function to scale points to fit current size
  const getScaledPoints = (pts: typeof points) => {
    if (!pts || pts.length === 0) return [];
    
    // Find the bounding box of the original points
    const minX = Math.min(...pts.map(p => p.x));
    const maxX = Math.max(...pts.map(p => p.x));
    const minY = Math.min(...pts.map(p => p.y));
    const maxY = Math.max(...pts.map(p => p.y));
    
    const originalWidth = maxX - minX || 1;
    const originalHeight = maxY - minY || 1;
    
    // Scale points to fit current size
    return pts.map(p => ({
      x: ((p.x - minX) / originalWidth) * width,
      y: ((p.y - minY) / originalHeight) * height
    }));
  };
  
  const renderShape = () => {
    switch (shapeType) {
      case "rectangle":
        return (
          <rect
            x={padding}
            y={padding}
            width={width}
            height={height}
            rx={borderRadius}
            ry={borderRadius}
            fill={fillColor}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
          />
        );
      
      case "circle":
        const radius = Math.min(width, height) / 2;
        return (
          <circle
            cx={padding + width / 2}
            cy={padding + height / 2}
            r={radius}
            fill={fillColor}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
          />
        );
      
      case "ellipse":
        return (
          <ellipse
            cx={padding + width / 2}
            cy={padding + height / 2}
            rx={width / 2}
            ry={height / 2}
            fill={fillColor}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
          />
        );
      
      case "line":
        // For lines, scale the points to current size
        if (points && points.length >= 2) {
          const scaledPts = getScaledPoints(points);
          return (
            <line
              x1={padding + scaledPts[0].x}
              y1={padding + scaledPts[0].y}
              x2={padding + scaledPts[1].x}
              y2={padding + scaledPts[1].y}
              stroke={strokeColor}
              strokeWidth={Math.max(strokeWidth, 2)}
              strokeLinecap="round"
            />
          );
        }
        // Default horizontal line
        return (
          <line
            x1={padding}
            y1={padding + height / 2}
            x2={padding + width}
            y2={padding + height / 2}
            stroke={strokeColor}
            strokeWidth={Math.max(strokeWidth, 2)}
            strokeLinecap="round"
          />
        );
      
      case "triangle":
        // Scale points to fit current size
        if (points && points.length >= 3) {
          const scaledPts = getScaledPoints(points);
          const pointsStr = scaledPts.map(p => `${padding + p.x},${padding + p.y}`).join(" ");
          return (
            <polygon
              points={pointsStr}
              fill={fillColor}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              strokeLinejoin="round"
            />
          );
        }
        // Default equilateral-ish triangle
        const defaultTrianglePoints = `${padding + width / 2},${padding} ${padding},${padding + height} ${padding + width},${padding + height}`;
        return (
          <polygon
            points={defaultTrianglePoints}
            fill={fillColor}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeLinejoin="round"
          />
        );
      
      case "polygon":
        if (points && points.length >= 3) {
          const scaledPts = getScaledPoints(points);
          const pointsStr = scaledPts.map(p => `${padding + p.x},${padding + p.y}`).join(" ");
          return (
            <polygon
              points={pointsStr}
              fill={fillColor}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              strokeLinejoin="round"
            />
          );
        }
        // Default pentagon
        const sides = 5;
        const cx = width / 2;
        const cy = height / 2;
        const r = Math.min(width, height) / 2;
        const defaultPoints = Array.from({ length: sides }, (_, i) => {
          const angle = (i * 2 * Math.PI) / sides - Math.PI / 2;
          return `${padding + cx + r * Math.cos(angle)},${padding + cy + r * Math.sin(angle)}`;
        }).join(" ");
        return (
          <polygon
            points={defaultPoints}
            fill={fillColor}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeLinejoin="round"
          />
        );
      
      default:
        return null;
    }
  };
  
  return (
    <svg
      width={svgWidth}
      height={svgHeight}
      viewBox={`0 0 ${svgWidth} ${svgHeight}`}
      style={{ 
        margin: -padding,
        overflow: "visible",
        display: "block"
      }}
    >
      {renderShape()}
    </svg>
  );
}

export function CanvasElement({
  element,
  allElements = [],
  isSelected,
  onSelect,
  onPositionChange,
  onRotationChange,
  onSizeChange,
  onWidthChange,
  onInteractionStart,
  onInteractionEnd,
  onDoubleClick,
  canvasRef,
}: CanvasElementProps) {
  const elementRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [isResizingTextWidth, setIsResizingTextWidth] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
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
  const textWidthStart = useRef<{
    x: number;
    width: number;
  } | null>(null);
  const rotateStart = useRef<{
    centerX: number;
    centerY: number;
    startAngle: number;
    startRotation: number;
  } | null>(null);
  const hasInteractionStarted = useRef(false);
  
  // Get the canvas scale from context
  const scale = useContext(CanvasScaleContext);

  // Get client coordinates from mouse or touch event
  const getClientCoords = (e: MouseEvent | TouchEvent | React.MouseEvent | React.TouchEvent) => {
    if ("touches" in e) {
      return { clientX: e.touches[0]?.clientX ?? 0, clientY: e.touches[0]?.clientY ?? 0 };
    }
    return { clientX: e.clientX, clientY: e.clientY };
  };

  // Calculate angle between two points relative to center
  const getAngle = (centerX: number, centerY: number, x: number, y: number) => {
    return Math.atan2(y - centerY, x - centerX) * (180 / Math.PI);
  };

  const handlePointerDown = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      e.stopPropagation();

      // If element is locked, only allow selection
      if (element.locked) {
        onSelect('ctrlKey' in e ? (e.ctrlKey || e.metaKey) : false);
        return;
      }

      // Check for Ctrl/Cmd key for multi-selection
      const ctrlKey = 'ctrlKey' in e ? (e.ctrlKey || e.metaKey) : false;
      onSelect(ctrlKey);

      const { clientX, clientY } = getClientCoords(e);

      // Check if clicking on rotation handle
      const target = e.target as HTMLElement;
      if (target.dataset.rotateHandle) {
        // Save snapshot before starting interaction
        onInteractionStart();
        hasInteractionStarted.current = true;
        
        setIsRotating(true);
        const rect = elementRef.current!.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        rotateStart.current = {
          centerX,
          centerY,
          startAngle: getAngle(centerX, centerY, clientX, clientY),
          startRotation: element.rotation,
        };
        return;
      }

      // Check if clicking on text width handle
      if (target.dataset.textWidthHandle) {
        onInteractionStart();
        hasInteractionStarted.current = true;
        
        setIsResizingTextWidth(true);
        if (element.type === "text") {
          textWidthStart.current = {
            x: clientX,
            width: element.width,
          };
        }
        return;
      }

      // Check if clicking on resize handle
      if (target.dataset.resizeHandle) {
        // Save snapshot before starting interaction
        onInteractionStart();
        hasInteractionStarted.current = true;
        
        setIsResizing(true);
        setResizeHandle(target.dataset.resizeHandle);
        if (element.type === "image" || element.type === "shape" || element.type === "group") {
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

      // Start dragging - save snapshot before starting interaction
      onInteractionStart();
      hasInteractionStarted.current = true;
      
      setIsDragging(true);
      const rect = elementRef.current!.getBoundingClientRect();
      dragOffset.current = {
        x: (clientX - rect.left) / scale,
        y: (clientY - rect.top) / scale,
      };
    },
    [element, onSelect, scale, onInteractionStart]
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      handlePointerDown(e);
    },
    [handlePointerDown]
  );

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      handlePointerDown(e);
    },
    [handlePointerDown]
  );

  useEffect(() => {
    if (!isDragging && !isResizing && !isRotating && !isResizingTextWidth) return;

    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      if (!canvasRef.current) return;
      
      if ("touches" in e) {
        e.preventDefault();
      }
      
      const { clientX, clientY } = getClientCoords(e);
      const canvasRect = canvasRef.current.getBoundingClientRect();

      if (isDragging) {
        // Calculate new position WITHOUT boundary clamping - allow elements to go outside canvas
        const newX = (clientX - canvasRect.left) / scale - dragOffset.current.x;
        const newY = (clientY - canvasRect.top) / scale - dragOffset.current.y;

        // No boundary restrictions - allow elements to be positioned anywhere
        onPositionChange({ x: newX, y: newY });
      } else if (isResizingTextWidth && textWidthStart.current && element.type === "text") {
        const dx = (clientX - textWidthStart.current.x) / scale;
        const newWidth = Math.max(50, textWidthStart.current.width + dx);
        onWidthChange?.(newWidth);
      } else if (isResizing && resizeStart.current && (element.type === "image" || element.type === "shape" || element.type === "group")) {
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
        onSizeChange?.(newWidth, newHeight, { x: newLeft, y: newTop });
      } else if (isRotating && rotateStart.current) {
        const currentAngle = getAngle(
          rotateStart.current.centerX,
          rotateStart.current.centerY,
          clientX,
          clientY
        );
        let newRotation = rotateStart.current.startRotation + (currentAngle - rotateStart.current.startAngle);
        
        // Normalize to 0-360
        newRotation = ((newRotation % 360) + 360) % 360;
        
        // Snap to 15 degree increments when shift is held
        if (e instanceof MouseEvent && e.shiftKey) {
          newRotation = Math.round(newRotation / 15) * 15;
        }
        
        onRotationChange(newRotation);
      }
    };

    const handlePointerUp = () => {
      // Commit the interaction to history
      if (hasInteractionStarted.current) {
        onInteractionEnd();
        hasInteractionStarted.current = false;
      }
      
      setIsDragging(false);
      setIsResizing(false);
      setIsResizingTextWidth(false);
      setIsRotating(false);
      setResizeHandle(null);
      resizeStart.current = null;
      textWidthStart.current = null;
      rotateStart.current = null;
    };

    document.addEventListener("mousemove", handlePointerMove);
    document.addEventListener("mouseup", handlePointerUp);
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
  }, [isDragging, isResizing, isResizingTextWidth, isRotating, resizeHandle, element, onPositionChange, onSizeChange, onWidthChange, onRotationChange, onInteractionEnd, canvasRef, scale]);

  return (
    <div
      ref={elementRef}
      className={cn(
        "absolute select-none touch-none",
        element.locked ? "cursor-not-allowed" : "cursor-move",
        isSelected && element.locked && "ring-2 ring-orange-400 ring-offset-2",
        isSelected && !element.locked && "ring-2 ring-primary ring-offset-2"
      )}
      style={{
        left: element.position.x,
        top: element.position.y,
        zIndex: element.zIndex,
        transform: `rotate(${element.rotation}deg) scaleX(${element.scaleX}) scaleY(${element.scaleY})`,
        transformOrigin: "center center",
        opacity: element.opacity,
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
            fontStyle: element.fontStyle,
            textAlign: element.textAlign,
            color: element.color,
            width: element.width,
            minWidth: 50,
            wordWrap: "break-word",
            overflowWrap: "break-word",
            textShadow: element.shadowEnabled
              ? `${element.shadowOffsetX}px ${element.shadowOffsetY}px ${element.shadowBlur}px ${element.shadowColor}`
              : "none",
          }}
        >
          {element.content}
        </div>
      ) : element.type === "shape" ? (
        <div
          style={{
            width: element.size.width,
            height: element.size.height,
          }}
        >
          <ShapeRenderer shape={element} />
        </div>
      ) : element.type === "group" ? (
        <div
          style={{
            width: element.size.width,
            height: element.size.height,
            position: "relative",
          }}
        >
          {/* Render child elements within the group */}
          {element.childIds.map(childId => {
            const childElement = allElements.find(el => el.id === childId);
            if (!childElement) return null;
            
            return (
              <div
                key={childId}
                style={{
                  position: "absolute",
                  left: childElement.position.x,
                  top: childElement.position.y,
                  transform: `rotate(${childElement.rotation}deg)`,
                  transformOrigin: "center center",
                  pointerEvents: "none",
                }}
              >
                {childElement.type === "text" ? (
                  <div
                    className="px-3 py-2 whitespace-pre-wrap break-words"
                    style={{
                      fontSize: childElement.fontSize,
                      fontFamily: childElement.fontFamily,
                      fontWeight: childElement.fontWeight,
                      fontStyle: childElement.fontStyle,
                      textAlign: childElement.textAlign,
                      color: childElement.color,
                      width: childElement.width,
                      minWidth: 50,
                      textShadow: childElement.shadowEnabled
                        ? `${childElement.shadowOffsetX}px ${childElement.shadowOffsetY}px ${childElement.shadowBlur}px ${childElement.shadowColor}`
                        : "none",
                    }}
                  >
                    {childElement.content}
                  </div>
                ) : childElement.type === "shape" ? (
                  <div style={{ width: childElement.size.width, height: childElement.size.height }}>
                    <ShapeRenderer shape={childElement} />
                  </div>
                ) : childElement.type === "image" ? (
                  <div style={{ width: childElement.size.width, height: childElement.size.height }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={childElement.src}
                      alt={childElement.name}
                      className="max-w-full max-h-full object-contain"
                      style={{
                        filter: `grayscale(${childElement.grayscale}%) brightness(${childElement.brightness}%) contrast(${childElement.contrast}%) blur(${childElement.blur}px)`,
                      }}
                      draggable={false}
                    />
                  </div>
                ) : null}
              </div>
            );
          })}
          {/* Group border indicator */}
          {isSelected && (
            <div className="absolute inset-0 border-2 border-dashed border-primary/50 pointer-events-none" />
          )}
        </div>
      ) : element.type === "image" ? (
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
            style={{
              filter: `grayscale(${element.grayscale}%) brightness(${element.brightness}%) contrast(${element.contrast}%) blur(${element.blur}px)`,
            }}
            draggable={false}
          />
        </div>
      ) : null}

      {/* Resize handles for images, shapes, and groups */}
      {isSelected && !element.locked && (element.type === "image" || element.type === "shape" || element.type === "group") && (
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

      {/* Width resize handle for text elements */}
      {isSelected && !element.locked && element.type === "text" && (
        <div
          data-text-width-handle="true"
          className="absolute top-1/2 -right-3 -translate-y-1/2 w-5 h-8 md:w-4 md:h-6 bg-primary border-2 border-white rounded z-10 touch-none cursor-ew-resize flex items-center justify-center"
        >
          <GripVertical className="w-3 h-3 text-white pointer-events-none" />
        </div>
      )}

      {/* Rotation handle */}
      {isSelected && !element.locked && (
        <div
          data-rotate-handle="true"
          className="absolute -top-8 left-1/2 -translate-x-1/2 w-6 h-6 md:w-5 md:h-5 bg-primary border-2 border-white rounded-full z-10 touch-none cursor-grab active:cursor-grabbing flex items-center justify-center"
          style={{ transform: `translateX(-50%) rotate(-${element.rotation}deg)` }}
        >
          <RotateCw className="w-3 h-3 text-white pointer-events-none" />
        </div>
      )}

      {/* Rotation line */}
      {isSelected && !element.locked && (
        <div
          className="absolute left-1/2 -translate-x-1/2 w-px h-6 bg-primary z-10 pointer-events-none"
          style={{ top: "-24px" }}
        />
      )}
    </div>
  );
}

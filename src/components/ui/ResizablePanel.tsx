"use client";

import React, { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface ResizablePanelProps {
  children: React.ReactNode;
  defaultWidth?: number;
  minWidth?: number;
  maxWidth?: number;
  className?: string;
  storageKey?: string;
  onResize?: (width: number) => void;
}

export function ResizablePanel({
  children,
  defaultWidth = 240,
  minWidth = 200,
  maxWidth = 400,
  className,
  storageKey = "properties-panel-width",
  onResize,
}: ResizablePanelProps) {
  const [width, setWidth] = useState(defaultWidth);
  const [isResizing, setIsResizing] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Load width from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      const parsed = parseInt(stored, 10);
      if (!isNaN(parsed) && parsed >= minWidth && parsed <= maxWidth) {
        setWidth(parsed);
      }
    }
  }, [storageKey, minWidth, maxWidth]);

  // Save width to localStorage when it changes
  useEffect(() => {
    localStorage.setItem(storageKey, width.toString());
    onResize?.(width);
  }, [width, storageKey, onResize]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsResizing(true);
    e.preventDefault();
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing || !panelRef.current) return;

      const newWidth = e.clientX - panelRef.current.getBoundingClientRect().left;
      const clampedWidth = Math.max(minWidth, Math.min(maxWidth, newWidth));
      setWidth(clampedWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isResizing, minWidth, maxWidth]);

  return (
    <div className="flex">
      <div
        ref={panelRef}
        className={cn("bg-background border-r flex flex-col", className)}
        style={{ width: `${width}px` }}
      >
        {children}
      </div>

      {/* Resize handle */}
      <div
        className={cn(
          "w-1 bg-border hover:bg-primary cursor-col-resize transition-colors flex-shrink-0 relative",
          isResizing && "bg-primary"
        )}
        onMouseDown={handleMouseDown}
      >
        <div className="absolute inset-y-0 -left-1 -right-1" />
      </div>
    </div>
  );
}
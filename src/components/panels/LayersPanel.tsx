"use client";

import React from "react";
import { CanvasElement } from "@/types/canvas";
import { cn } from "@/lib/utils";
import { Type, ChevronUp, ChevronDown, ChevronsUp, ChevronsDown, RotateCw, Group, Lock, Unlock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getShapeIcon, getElementDisplayName } from "@/lib/elementUtils";

interface LayersPanelProps {
  elements: CanvasElement[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onBringToFront: (id: string) => void;
  onSendToBack: (id: string) => void;
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
  onToggleLock: (id: string) => void;
}

export function LayersPanel({
  elements,
  selectedId,
  onSelect,
  onBringToFront,
  onSendToBack,
  onMoveUp,
  onMoveDown,
  onToggleLock,
}: LayersPanelProps) {
  // Get IDs of elements that are children of groups (they shouldn't appear as separate layers)
  const groupChildIds = new Set<string>();
  elements.forEach(el => {
    if (el.type === "group") {
      el.childIds.forEach(id => groupChildIds.add(id));
    }
  });
  
  // Filter out group children and sort by zIndex (highest first for display)
  const sortedElements = [...elements]
    .filter(el => !groupChildIds.has(el.id))
    .sort((a, b) => b.zIndex - a.zIndex);
  
  return (
    <aside className="w-60 bg-background border-l flex flex-col">
      <div className="px-4 py-3 border-b">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Layers
        </h2>
      </div>
      
      {/* Layer order controls */}
      {selectedId && (
        <div className="px-3 py-2 border-b flex items-center justify-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => onBringToFront(selectedId)}
            title="Bring to Front"
          >
            <ChevronsUp className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => onMoveUp(selectedId)}
            title="Move Up"
          >
            <ChevronUp className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => onMoveDown(selectedId)}
            title="Move Down"
          >
            <ChevronDown className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => onSendToBack(selectedId)}
            title="Send to Back"
          >
            <ChevronsDown className="h-4 w-4" />
          </Button>
        </div>
      )}
      
      <div className="flex-1 overflow-y-auto p-3">
        {elements.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No elements yet
          </p>
        ) : (
          <div className="space-y-1">
            {sortedElements.map((element) => (
              <div
                key={element.id}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer transition-colors",
                  "hover:bg-muted",
                  selectedId === element.id && "bg-primary/10 ring-1 ring-primary"
                )}
                onClick={() => onSelect(element.id)}
              >
                <div className="w-8 h-8 bg-muted rounded flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {element.type === "text" ? (
                    <Type className="w-4 h-4 text-muted-foreground" />
                  ) : element.type === "shape" ? (
                    getShapeIcon(element.shapeType)
                  ) : element.type === "group" ? (
                    <Group className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={element.src}
                      alt={element.name}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">
                    {getElementDisplayName(element)}
                  </div>
                  <div className="text-xs text-muted-foreground capitalize flex items-center gap-1">
                    {element.type === "shape" ? element.shapeType : element.type}
                    {element.rotation !== 0 && (
                      <span className="flex items-center gap-0.5 text-muted-foreground">
                        <RotateCw className="w-3 h-3" />
                        {Math.round(element.rotation)}°
                      </span>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleLock(element.id);
                      }}
                      className="flex items-center gap-0.5 text-muted-foreground hover:text-foreground transition-colors"
                      title={element.locked ? "Unlock element" : "Lock element"}
                    >
                      {element.locked ? (
                        <Lock className="w-3 h-3" />
                      ) : (
                        <Unlock className="w-3 h-3" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}

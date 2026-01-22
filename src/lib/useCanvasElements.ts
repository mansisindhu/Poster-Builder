"use client";

import { useCallback } from "react";
import { 
  CanvasElement, TextElement, ImageElement, ShapeElement, 
  TextFormData, ShapeFormData, Position, ShapeType, Point
} from "@/types/canvas";
import { hasSizeProperty, isTextElement } from "@/types/guards";
import { HistoryState, pushToHistory, updatePresent } from "./useCanvasHistory";

let elementIdCounter = 0;

function generateId(): string {
  return `element-${++elementIdCounter}`;
}

/**
 * Generate default points for shapes that need them (lines, triangles, polygons)
 */
function getDefaultPointsForShape(shapeType: ShapeType, width: number, height: number): Point[] {
  switch (shapeType) {
    case "line":
      return [
        { x: 0, y: height / 2 },
        { x: width, y: height / 2 }
      ];
    case "triangle":
      return [
        { x: width / 2, y: 0 },
        { x: 0, y: height },
        { x: width, y: height }
      ];
    case "polygon":
      // Default to a pentagon
      const sides = 5;
      const centerX = width / 2;
      const centerY = height / 2;
      const radius = Math.min(width, height) / 2;
      const points: Point[] = [];
      for (let i = 0; i < sides; i++) {
        const angle = (i * 2 * Math.PI) / sides - Math.PI / 2;
        points.push({
          x: centerX + radius * Math.cos(angle),
          y: centerY + radius * Math.sin(angle)
        });
      }
      return points;
    default:
      return [];
  }
}

/**
 * Recalculate z-indices for elements after layer reordering
 */
function recalculateZIndices(els: CanvasElement[]): CanvasElement[] {
  return els.map((el, index) => ({ ...el, zIndex: index + 1 }));
}

interface UseCanvasElementsOptions {
  /** Function to update history state */
  setHistoryState: React.Dispatch<React.SetStateAction<HistoryState>>;
  /** Current selected element IDs (for deleteSelected) */
  selectedIds: string[];
  /** Callback when an element is created (to select it) */
  onElementCreated?: (id: string) => void;
  /** Callback when an element is deleted (to update selection) */
  onElementDeleted?: (id: string) => void;
  /** Callback when selection should be cleared */
  onClearSelection?: () => void;
}

/**
 * Hook for managing canvas element operations.
 * 
 * Provides:
 * - Element creation (text, image, shape)
 * - Element updates (properties, position, rotation, size)
 * - Element deletion (single or selected)
 * - Layer ordering (bring to front, send to back, etc.)
 * 
 * @param options - Configuration options including history state setter and callbacks
 * @returns Element manipulation functions
 */
export function useCanvasElements({
  setHistoryState,
  selectedIds,
  onElementCreated,
  onElementDeleted,
  onClearSelection,
}: UseCanvasElementsOptions) {
  
  // ============ Element Creation ============

  /**
   * Add a text element to the canvas
   */
  const addTextElement = useCallback((data: TextFormData) => {
    const id = generateId();
    setHistoryState((prev) => {
      const canvasSize = prev.present.canvasSettings.canvasSize;
      const newElement: TextElement = {
        id,
        type: "text",
        position: { 
          x: Math.min(50 + Math.random() * 200, canvasSize.width - 100), 
          y: Math.min(50 + Math.random() * 200, canvasSize.height - 50)
        },
        zIndex: prev.present.elements.length + 1,
        rotation: 0,
        content: data.content,
        fontSize: data.fontSize,
        fontFamily: data.fontFamily,
        fontWeight: data.fontWeight,
        fontStyle: data.fontStyle,
        textAlign: data.textAlign,
        color: data.color,
        width: 200,
      };
      const newElements = [...prev.present.elements, newElement];
      const newPresent = { ...prev.present, elements: newElements };
      return pushToHistory(prev, newPresent);
    });
    onElementCreated?.(id);
  }, [setHistoryState, onElementCreated]);

  /**
   * Add an image element to the canvas
   */
  const addImageElement = useCallback((src: string, name: string, width: number, height: number) => {
    let w = width;
    let h = height;
    const maxSize = 300;

    if (w > maxSize || h > maxSize) {
      const ratio = Math.min(maxSize / w, maxSize / h);
      w = w * ratio;
      h = h * ratio;
    }

    const id = generateId();
    setHistoryState((prev) => {
      const canvasSize = prev.present.canvasSettings.canvasSize;
      const newElement: ImageElement = {
        id,
        type: "image",
        position: { 
          x: Math.min(50 + Math.random() * 100, canvasSize.width - w), 
          y: Math.min(50 + Math.random() * 100, canvasSize.height - h)
        },
        zIndex: prev.present.elements.length + 1,
        rotation: 0,
        src,
        name: name.length > 20 ? name.substring(0, 17) + "..." : name,
        size: { width: w, height: h },
      };
      const newElements = [...prev.present.elements, newElement];
      const newPresent = { ...prev.present, elements: newElements };
      return pushToHistory(prev, newPresent);
    });
    onElementCreated?.(id);
  }, [setHistoryState, onElementCreated]);

  /**
   * Add a shape element to the canvas
   */
  const addShapeElement = useCallback((shapeType: ShapeType, data?: Partial<ShapeFormData>) => {
    const id = generateId();
    
    // Set default dimensions based on shape type
    let defaultWidth = 150;
    let defaultHeight = 150;
    
    if (shapeType === "line") {
      defaultWidth = 150;
      defaultHeight = 4;
    } else if (shapeType === "ellipse") {
      defaultWidth = 200;
      defaultHeight = 120;
    }
    
    setHistoryState((prev) => {
      const canvasSize = prev.present.canvasSettings.canvasSize;
      const newElement: ShapeElement = {
        id,
        type: "shape",
        shapeType,
        position: { 
          x: Math.min(50 + Math.random() * 200, canvasSize.width - defaultWidth), 
          y: Math.min(50 + Math.random() * 200, canvasSize.height - defaultHeight)
        },
        zIndex: prev.present.elements.length + 1,
        rotation: 0,
        size: { width: defaultWidth, height: defaultHeight },
        fillColor: data?.fillColor ?? "#3b82f6",
        strokeColor: data?.strokeColor ?? data?.fillColor ?? "#3b82f6",
        strokeWidth: data?.strokeWidth ?? 2,
        borderRadius: data?.borderRadius ?? 0,
        points: getDefaultPointsForShape(shapeType, defaultWidth, defaultHeight),
      };
      const newElements = [...prev.present.elements, newElement];
      const newPresent = { ...prev.present, elements: newElements };
      return pushToHistory(prev, newPresent);
    });
    onElementCreated?.(id);
  }, [setHistoryState, onElementCreated]);

  // ============ Element Updates ============

  /**
   * Update an element's properties (pushes to history)
   */
  const updateElement = useCallback((id: string, updates: Partial<CanvasElement>) => {
    setHistoryState((prev) => {
      const newElements = prev.present.elements.map((el) => 
        el.id === id ? { ...el, ...updates } as CanvasElement : el
      );
      const newPresent = { ...prev.present, elements: newElements };
      return pushToHistory(prev, newPresent);
    });
  }, [setHistoryState]);

  /**
   * Update element position (live update, doesn't push to history)
   * Use with saveInteractionSnapshot/commitInteraction for undo support
   */
  const updateElementPosition = useCallback((id: string, position: Position) => {
    setHistoryState((prev) => {
      const newElements = prev.present.elements.map((el) => 
        el.id === id ? { ...el, position } : el
      );
      return updatePresent(prev, { ...prev.present, elements: newElements });
    });
  }, [setHistoryState]);

  /**
   * Update element rotation (live update, doesn't push to history)
   */
  const updateElementRotation = useCallback((id: string, rotation: number) => {
    setHistoryState((prev) => {
      const newElements = prev.present.elements.map((el) => 
        el.id === id ? { ...el, rotation } : el
      );
      return updatePresent(prev, { ...prev.present, elements: newElements });
    });
  }, [setHistoryState]);

  /**
   * Update element size (live update, doesn't push to history)
   */
  const updateElementSize = useCallback((id: string, size: { width: number; height: number }, position?: Position) => {
    setHistoryState((prev) => {
      const newElements = prev.present.elements.map((el) => {
        if (el.id === id && hasSizeProperty(el)) {
          return position ? { ...el, size, position } : { ...el, size };
        }
        return el;
      });
      return updatePresent(prev, { ...prev.present, elements: newElements });
    });
  }, [setHistoryState]);

  /**
   * Update text element width (live update, doesn't push to history)
   */
  const updateElementWidth = useCallback((id: string, width: number) => {
    setHistoryState((prev) => {
      const newElements = prev.present.elements.map((el) => {
        if (el.id === id && isTextElement(el)) {
          return { ...el, width };
        }
        return el;
      });
      return updatePresent(prev, { ...prev.present, elements: newElements });
    });
  }, [setHistoryState]);

  // ============ Element Deletion ============

  /**
   * Delete a single element by ID
   */
  const deleteElement = useCallback((id: string) => {
    setHistoryState((prev) => {
      const newElements = prev.present.elements.filter((el) => el.id !== id);
      const newPresent = { ...prev.present, elements: newElements };
      return pushToHistory(prev, newPresent);
    });
    onElementDeleted?.(id);
  }, [setHistoryState, onElementDeleted]);

  /**
   * Delete all selected elements
   */
  const deleteSelected = useCallback(() => {
    if (selectedIds.length === 0) return;
    
    setHistoryState((prev) => {
      const newElements = prev.present.elements.filter((el) => !selectedIds.includes(el.id));
      const newPresent = { ...prev.present, elements: newElements };
      return pushToHistory(prev, newPresent);
    });
    onClearSelection?.();
  }, [selectedIds, setHistoryState, onClearSelection]);

  // ============ Element Movement ============

  /**
   * Move an element by dx, dy (for keyboard arrow nudging)
   */
  const moveElement = useCallback((id: string, dx: number, dy: number) => {
    setHistoryState((prev) => {
      const newElements = prev.present.elements.map((el) => {
        if (el.id !== id) return el;
        return {
          ...el,
          position: {
            x: el.position.x + dx,
            y: el.position.y + dy,
          },
        };
      });
      const newPresent = { ...prev.present, elements: newElements };
      return pushToHistory(prev, newPresent);
    });
  }, [setHistoryState]);

  // ============ Layer Ordering ============

  /**
   * Bring an element to the front (highest z-index)
   */
  const bringToFront = useCallback((id: string) => {
    setHistoryState((prev) => {
      const elements = prev.present.elements;
      const index = elements.findIndex((el) => el.id === id);
      if (index === -1 || index === elements.length - 1) return prev;
      
      const newElements = [...elements];
      const [element] = newElements.splice(index, 1);
      newElements.push(element);
      const reindexed = recalculateZIndices(newElements);
      
      const newPresent = { ...prev.present, elements: reindexed };
      return pushToHistory(prev, newPresent);
    });
  }, [setHistoryState]);

  /**
   * Send an element to the back (lowest z-index)
   */
  const sendToBack = useCallback((id: string) => {
    setHistoryState((prev) => {
      const elements = prev.present.elements;
      const index = elements.findIndex((el) => el.id === id);
      if (index === -1 || index === 0) return prev;
      
      const newElements = [...elements];
      const [element] = newElements.splice(index, 1);
      newElements.unshift(element);
      const reindexed = recalculateZIndices(newElements);
      
      const newPresent = { ...prev.present, elements: reindexed };
      return pushToHistory(prev, newPresent);
    });
  }, [setHistoryState]);

  /**
   * Move an element up one layer
   */
  const moveLayerUp = useCallback((id: string) => {
    setHistoryState((prev) => {
      const elements = prev.present.elements;
      const index = elements.findIndex((el) => el.id === id);
      if (index === -1 || index === elements.length - 1) return prev;
      
      const newElements = [...elements];
      [newElements[index], newElements[index + 1]] = [newElements[index + 1], newElements[index]];
      const reindexed = recalculateZIndices(newElements);
      
      const newPresent = { ...prev.present, elements: reindexed };
      return pushToHistory(prev, newPresent);
    });
  }, [setHistoryState]);

  /**
   * Move an element down one layer
   */
  const moveLayerDown = useCallback((id: string) => {
    setHistoryState((prev) => {
      const elements = prev.present.elements;
      const index = elements.findIndex((el) => el.id === id);
      if (index === -1 || index === 0) return prev;
      
      const newElements = [...elements];
      [newElements[index], newElements[index - 1]] = [newElements[index - 1], newElements[index]];
      const reindexed = recalculateZIndices(newElements);
      
      const newPresent = { ...prev.present, elements: reindexed };
      return pushToHistory(prev, newPresent);
    });
  }, [setHistoryState]);

  /**
   * Clear all elements from the canvas
   */
  const clearCanvas = useCallback(() => {
    setHistoryState((prev) => {
      const newPresent = { ...prev.present, elements: [] };
      return pushToHistory(prev, newPresent);
    });
    onClearSelection?.();
  }, [setHistoryState, onClearSelection]);

  return {
    // Element creation
    addTextElement,
    addImageElement,
    addShapeElement,
    
    // Element updates
    updateElement,
    updateElementPosition,
    updateElementRotation,
    updateElementSize,
    updateElementWidth,
    
    // Element deletion
    deleteElement,
    deleteSelected,
    clearCanvas,
    
    // Element movement
    moveElement,
    
    // Layer ordering
    bringToFront,
    sendToBack,
    moveLayerUp,
    moveLayerDown,
  };
}

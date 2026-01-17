"use client";

import { useState, useCallback, useRef } from "react";
import { CanvasElement, TextElement, ImageElement, TextFormData, Position, CanvasSettings } from "@/types/canvas";

let elementIdCounter = 0;

function generateId(): string {
  return `element-${++elementIdCounter}`;
}

const defaultSettings: CanvasSettings = {
  backgroundColor: "#ffffff",
};

export function useCanvas() {
  const [elements, setElements] = useState<CanvasElement[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [canvasSettings, setCanvasSettings] = useState<CanvasSettings>(defaultSettings);
  const canvasRef = useRef<HTMLDivElement>(null);

  const selectedElement = elements.find((el) => el.id === selectedId) || null;

  const updateCanvasSettings = useCallback((updates: Partial<CanvasSettings>) => {
    setCanvasSettings((prev) => ({ ...prev, ...updates }));
  }, []);

  const addTextElement = useCallback((data: TextFormData) => {
    const id = generateId();
    setElements((prev) => {
      const newElement: TextElement = {
        id,
        type: "text",
        position: { x: 50 + Math.random() * 200, y: 50 + Math.random() * 200 },
        zIndex: prev.length + 1,
        content: data.content,
        fontSize: data.fontSize,
        fontFamily: data.fontFamily,
        fontWeight: data.fontWeight,
        color: data.color,
      };
      return [...prev, newElement];
    });
    setSelectedId(id);
  }, []);

  const addImageElement = useCallback((src: string, name: string, width: number, height: number) => {
    // Scale image to fit reasonably on canvas
    let w = width;
    let h = height;
    const maxSize = 300;

    if (w > maxSize || h > maxSize) {
      const ratio = Math.min(maxSize / w, maxSize / h);
      w = w * ratio;
      h = h * ratio;
    }

    const id = generateId();
    setElements((prev) => {
      const newElement: ImageElement = {
        id,
        type: "image",
        position: { x: 50 + Math.random() * 100, y: 50 + Math.random() * 100 },
        zIndex: prev.length + 1,
        src,
        name: name.length > 20 ? name.substring(0, 17) + "..." : name,
        size: { width: w, height: h },
      };
      return [...prev, newElement];
    });
    setSelectedId(id);
  }, []);

  const updateElement = useCallback((id: string, updates: Partial<CanvasElement>) => {
    setElements((prev) =>
      prev.map((el) => (el.id === id ? { ...el, ...updates } as CanvasElement : el))
    );
  }, []);

  const updateElementPosition = useCallback((id: string, position: Position) => {
    setElements((prev) =>
      prev.map((el) => (el.id === id ? { ...el, position } : el))
    );
  }, []);

  const deleteElement = useCallback((id: string) => {
    setElements((prev) => prev.filter((el) => el.id !== id));
    setSelectedId((prevSelectedId) => (prevSelectedId === id ? null : prevSelectedId));
  }, []);

  const deleteSelected = useCallback(() => {
    setSelectedId((prevSelectedId) => {
      if (prevSelectedId) {
        setElements((prev) => prev.filter((el) => el.id !== prevSelectedId));
        return null;
      }
      return prevSelectedId;
    });
  }, []);

  const selectElement = useCallback((id: string | null) => {
    setSelectedId(id);
  }, []);

  const clearCanvas = useCallback(() => {
    setElements([]);
    setSelectedId(null);
  }, []);

  const moveElement = useCallback((id: string, dx: number, dy: number) => {
    setElements((prev) =>
      prev.map((el) => {
        if (el.id !== id) return el;
        return {
          ...el,
          position: {
            x: Math.max(0, el.position.x + dx),
            y: Math.max(0, el.position.y + dy),
          },
        };
      })
    );
  }, []);

  // Recalculate z-indices based on array order
  const recalculateZIndices = useCallback((els: CanvasElement[]): CanvasElement[] => {
    return els.map((el, index) => ({ ...el, zIndex: index + 1 }));
  }, []);

  const bringToFront = useCallback((id: string) => {
    setElements((prev) => {
      const index = prev.findIndex((el) => el.id === id);
      if (index === -1 || index === prev.length - 1) return prev;
      const newElements = [...prev];
      const [element] = newElements.splice(index, 1);
      newElements.push(element);
      return recalculateZIndices(newElements);
    });
  }, [recalculateZIndices]);

  const sendToBack = useCallback((id: string) => {
    setElements((prev) => {
      const index = prev.findIndex((el) => el.id === id);
      if (index === -1 || index === 0) return prev;
      const newElements = [...prev];
      const [element] = newElements.splice(index, 1);
      newElements.unshift(element);
      return recalculateZIndices(newElements);
    });
  }, [recalculateZIndices]);

  const moveLayerUp = useCallback((id: string) => {
    setElements((prev) => {
      const index = prev.findIndex((el) => el.id === id);
      if (index === -1 || index === prev.length - 1) return prev;
      const newElements = [...prev];
      [newElements[index], newElements[index + 1]] = [newElements[index + 1], newElements[index]];
      return recalculateZIndices(newElements);
    });
  }, [recalculateZIndices]);

  const moveLayerDown = useCallback((id: string) => {
    setElements((prev) => {
      const index = prev.findIndex((el) => el.id === id);
      if (index === -1 || index === 0) return prev;
      const newElements = [...prev];
      [newElements[index], newElements[index - 1]] = [newElements[index - 1], newElements[index]];
      return recalculateZIndices(newElements);
    });
  }, [recalculateZIndices]);

  return {
    elements,
    selectedElement,
    selectedId,
    canvasRef,
    canvasSettings,
    updateCanvasSettings,
    addTextElement,
    addImageElement,
    updateElement,
    updateElementPosition,
    deleteElement,
    deleteSelected,
    selectElement,
    clearCanvas,
    moveElement,
    bringToFront,
    sendToBack,
    moveLayerUp,
    moveLayerDown,
  };
}
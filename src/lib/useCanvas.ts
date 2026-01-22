"use client";

import { useState, useCallback, useRef, useMemo } from "react";
import { 
  CanvasElement, GroupElement,
  CanvasSettings, CanvasSize
} from "@/types/canvas";
import { getElementBounds as getElementBoundsUtil } from "./elementUtils";
import { useCanvasHistory, pushToHistory } from "./useCanvasHistory";
import { useProjectStorage } from "./useProjectStorage";
import { useCanvasElements } from "./useCanvasElements";

// ID counter for generating unique element IDs
let elementIdCounter = 0;

function generateId(): string {
  return `element-${++elementIdCounter}`;
}

/**
 * Main canvas hook that combines all smaller hooks into a unified API
 * 
 * This is a thin layer that composes:
 * - useCanvasHistory: Undo/redo and state management
 * - useCanvasElements: Element CRUD and layer operations
 * - useProjectStorage: Project save/load persistence
 * 
 * Plus selection, clipboard, grouping, and canvas settings.
 */
export function useCanvas() {
  // ============ History Management ============
  const {
    setHistoryState,
    present,
    canUndo,
    canRedo,
    saveInteractionSnapshot,
    commitInteraction,
    undo,
    redo,
    resetHistory,
    loadState,
  } = useCanvasHistory();

  // ============ Selection State ============
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [hasClipboard, setHasClipboard] = useState(false);
  
  // Clipboard for copy/paste functionality
  const clipboardRef = useRef<CanvasElement | null>(null);

  // Derived state from history (memoized for stable references)
  const elements = useMemo(() => present.elements ?? [], [present.elements]);
  const canvasSettings = present.canvasSettings;
  
  // For backwards compatibility, selectedId is the first selected element
  const selectedId = selectedIds.length > 0 ? selectedIds[0] : null;
  const selectedElement = elements.find((el) => el.id === selectedId) || null;
  const selectedElements = elements.filter((el) => selectedIds.includes(el.id));

  // ============ Selection Operations ============
  const clearSelection = useCallback(() => {
    setSelectedIds([]);
  }, []);

  const selectElement = useCallback((id: string | null) => {
    setSelectedIds(id ? [id] : []);
  }, []);

  const toggleElementSelection = useCallback((id: string) => {
    setSelectedIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(selectedId => selectedId !== id);
      } else {
        return [...prev, id];
      }
    });
  }, []);

  const selectElements = useCallback((ids: string[]) => {
    setSelectedIds(ids);
  }, []);

  // Callbacks for element operations
  const handleElementCreated = useCallback((id: string) => {
    setSelectedIds([id]);
  }, []);

  const handleElementDeleted = useCallback((id: string) => {
    setSelectedIds(prev => prev.filter(selectedId => selectedId !== id));
  }, []);

  // ============ Element Operations (from useCanvasElements) ============
  const {
    addTextElement,
    addImageElement,
    addShapeElement,
    updateElement,
    updateElementPosition,
    updateElementRotation,
    updateElementSize,
    updateElementWidth,
    deleteElement,
    deleteSelected,
    clearCanvas,
    moveElement,
    bringToFront,
    sendToBack,
    moveLayerUp,
    moveLayerDown,
  } = useCanvasElements({
    setHistoryState,
    selectedIds,
    onElementCreated: handleElementCreated,
    onElementDeleted: handleElementDeleted,
    onClearSelection: clearSelection,
  });

  // ============ Project Storage (from useProjectStorage) ============
  const {
    currentProjectId,
    currentProjectName,
    setCurrentProjectName,
    saveProject,
    loadProject,
    getProjects,
    deleteProject,
    newProject,
  } = useProjectStorage({
    currentState: present,
    onLoadState: loadState,
    onResetState: resetHistory,
    onClearSelection: clearSelection,
  });

  // ============ Canvas Settings ============
  const updateCanvasSettings = useCallback((updates: Partial<CanvasSettings>) => {
    setHistoryState((prev) => {
      const newSettings = { ...prev.present.canvasSettings, ...updates };
      const newPresent = { ...prev.present, canvasSettings: newSettings };
      return pushToHistory(prev, newPresent);
    });
  }, [setHistoryState]);

  const setCanvasSize = useCallback((size: CanvasSize) => {
    updateCanvasSettings({ canvasSize: size });
  }, [updateCanvasSettings]);

  // ============ Clipboard Operations ============
  const copyElement = useCallback(() => {
    if (!selectedId) return false;
    
    const elementToCopy = elements.find(el => el.id === selectedId);
    if (elementToCopy) {
      clipboardRef.current = JSON.parse(JSON.stringify(elementToCopy));
      setHasClipboard(true);
      return true;
    }
    return false;
  }, [selectedId, elements]);

  const pasteElement = useCallback(() => {
    const copiedElement = clipboardRef.current;
    if (!copiedElement) return null;

    const newId = generateId();
    const offset = 20;
    
    setHistoryState((prev) => {
      const canvasSize = prev.present.canvasSettings.canvasSize;
      const newElement: CanvasElement = {
        ...JSON.parse(JSON.stringify(copiedElement)),
        id: newId,
        position: {
          x: Math.min(copiedElement.position.x + offset, canvasSize.width - 50),
          y: Math.min(copiedElement.position.y + offset, canvasSize.height - 50),
        },
        zIndex: prev.present.elements.length + 1,
      };
      
      const newElements = [...prev.present.elements, newElement];
      const newPresent = { ...prev.present, elements: newElements };
      return pushToHistory(prev, newPresent);
    });
    
    setSelectedIds([newId]);
    return newId;
  }, [setHistoryState]);

  const duplicateElement = useCallback(() => {
    if (copyElement()) {
      return pasteElement();
    }
    return null;
  }, [copyElement, pasteElement]);

  // ============ Grouping Operations ============
  const getElementBounds = useCallback((element: CanvasElement): { x: number; y: number; width: number; height: number } => {
    return getElementBoundsUtil(element);
  }, []);

  const groupElements = useCallback(() => {
    if (selectedIds.length < 2) return null;
    
    const groupId = generateId();
    
    setHistoryState((prev) => {
      const elementsToGroup = prev.present.elements.filter(el => selectedIds.includes(el.id));
      if (elementsToGroup.length < 2) return prev;
      
      // Calculate bounding box
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      elementsToGroup.forEach(el => {
        const bounds = getElementBounds(el);
        minX = Math.min(minX, bounds.x);
        minY = Math.min(minY, bounds.y);
        maxX = Math.max(maxX, bounds.x + bounds.width);
        maxY = Math.max(maxY, bounds.y + bounds.height);
      });
      
      // Update child positions to be relative to group
      const updatedElements = prev.present.elements.map(el => {
        if (selectedIds.includes(el.id)) {
          return { ...el, position: { x: el.position.x - minX, y: el.position.y - minY } };
        }
        return el;
      });
      
      const groupElement: GroupElement = {
        id: groupId,
        type: "group",
        position: { x: minX, y: minY },
        zIndex: Math.max(...elementsToGroup.map(el => el.zIndex)) + 1,
        rotation: 0,
        childIds: selectedIds,
        size: { width: maxX - minX, height: maxY - minY },
      };
      
      const newElements = [...updatedElements, groupElement];
      const newPresent = { ...prev.present, elements: newElements };
      return pushToHistory(prev, newPresent);
    });
    
    setSelectedIds([groupId]);
    return groupId;
  }, [selectedIds, getElementBounds, setHistoryState]);

  const ungroupElements = useCallback(() => {
    if (selectedIds.length !== 1) return false;
    
    const groupId = selectedIds[0];
    const groupElement = elements.find(el => el.id === groupId);
    if (!groupElement || groupElement.type !== "group") return false;
    
    const childIds = groupElement.childIds;
    const groupPosition = groupElement.position;
    const groupRotation = groupElement.rotation;
    
    setHistoryState((prev) => {
      const updatedElements = prev.present.elements
        .filter(el => el.id !== groupId)
        .map(el => {
          if (childIds.includes(el.id)) {
            return {
              ...el,
              position: { x: el.position.x + groupPosition.x, y: el.position.y + groupPosition.y },
              rotation: ((el.rotation || 0) + groupRotation) % 360,
            };
          }
          return el;
        });
      
      const newPresent = { ...prev.present, elements: updatedElements };
      return pushToHistory(prev, newPresent);
    });
    
    setSelectedIds(childIds);
    return true;
  }, [selectedIds, elements, setHistoryState]);

  // ============ Return API ============
  return {
    // State
    elements,
    selectedElement,
    selectedElements,
    selectedId,
    selectedIds,
    canvasSettings,
    canUndo,
    canRedo,
    currentProjectId,
    currentProjectName,
    hasClipboard,
    
    // History
    undo,
    redo,
    saveInteractionSnapshot,
    commitInteraction,
    
    // Canvas settings
    updateCanvasSettings,
    setCanvasSize,
    
    // Element operations
    addTextElement,
    addImageElement,
    addShapeElement,
    updateElement,
    updateElementPosition,
    updateElementRotation,
    updateElementSize,
    updateElementWidth,
    deleteElement,
    deleteSelected,
    clearCanvas,
    moveElement,
    
    // Layer ordering
    bringToFront,
    sendToBack,
    moveLayerUp,
    moveLayerDown,
    
    // Selection
    selectElement,
    selectElements,
    toggleElementSelection,
    
    // Clipboard
    copyElement,
    pasteElement,
    duplicateElement,
    
    // Grouping
    groupElements,
    ungroupElements,
    getElementBounds,
    
    // Project management
    newProject,
    saveProject,
    loadProject,
    getProjects,
    deleteProject,
    setCurrentProjectName,
  };
}

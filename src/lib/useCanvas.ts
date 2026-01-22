"use client";

import { useState, useCallback, useRef } from "react";
import { 
  CanvasElement, TextElement, ImageElement, ShapeElement, GroupElement, TextFormData, ShapeFormData,
  Position, CanvasSettings, CanvasState, CanvasSize, ShapeType, Point, Size,
  Project, DEFAULT_CANVAS_SIZE 
} from "@/types/canvas";

let elementIdCounter = 0;

function generateId(): string {
  return `element-${++elementIdCounter}`;
}

function generateProjectId(): string {
  return `project-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

const defaultSettings: CanvasSettings = {
  backgroundColor: "#ffffff",
  canvasSize: DEFAULT_CANVAS_SIZE,
};

const MAX_HISTORY_SIZE = 50;
const PROJECTS_STORAGE_KEY = "poster-builder-projects";

interface HistoryState {
  past: CanvasState[];
  present: CanvasState;
  future: CanvasState[];
}

const initialState: CanvasState = {
  elements: [],
  canvasSettings: defaultSettings,
};

const initialHistoryState: HistoryState = {
  past: [],
  present: initialState,
  future: [],
};

// Deep clone helper
function cloneState(state: CanvasState): CanvasState {
  return {
    elements: state.elements.map(el => ({ ...el })),
    canvasSettings: { 
      ...state.canvasSettings,
      canvasSize: { ...state.canvasSettings.canvasSize }
    },
  };
}

export function useCanvas() {
  const [historyState, setHistoryState] = useState<HistoryState>(initialHistoryState);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [currentProjectName, setCurrentProjectName] = useState<string>("Untitled Project");
  const [hasClipboard, setHasClipboard] = useState(false);
  
  // Snapshot of state before an interaction begins
  const interactionSnapshotRef = useRef<CanvasState | null>(null);
  
  // Clipboard for copy/paste functionality
  const clipboardRef = useRef<CanvasElement | null>(null);

  // Derived state from history
  const present = historyState.present ?? initialState;
  const elements = present.elements ?? [];
  const canvasSettings = present.canvasSettings ?? defaultSettings;
  
  // For backwards compatibility, selectedId is the first selected element
  const selectedId = selectedIds.length > 0 ? selectedIds[0] : null;
  const selectedElement = elements.find((el) => el.id === selectedId) || null;
  const selectedElements = elements.filter((el) => selectedIds.includes(el.id));

  // Check if undo/redo is available
  const canUndo = historyState.past.length > 0;
  const canRedo = historyState.future.length > 0;

  // Save a snapshot before starting an interaction
  const saveInteractionSnapshot = useCallback(() => {
    setHistoryState((prev) => {
      interactionSnapshotRef.current = cloneState(prev.present);
      return prev;
    });
  }, []);

  // Commit the interaction
  const commitInteraction = useCallback(() => {
    const snapshot = interactionSnapshotRef.current;
    if (!snapshot) return;
    
    interactionSnapshotRef.current = null;
    
    setHistoryState((prev) => {
      const currentStr = JSON.stringify(prev.present);
      const snapshotStr = JSON.stringify(snapshot);
      
      if (currentStr === snapshotStr) {
        return prev;
      }
      
      const newPast = [...prev.past, snapshot];
      if (newPast.length > MAX_HISTORY_SIZE) {
        newPast.shift();
      }
      return {
        past: newPast,
        present: prev.present,
        future: [],
      };
    });
  }, []);

  // Undo action
  const undo = useCallback(() => {
    setHistoryState((prev) => {
      if (prev.past.length === 0) return prev;

      const newPast = [...prev.past];
      const previousState = newPast.pop();
      
      if (!previousState || !previousState.elements) {
        return prev;
      }

      return {
        past: newPast,
        present: previousState,
        future: [prev.present, ...prev.future],
      };
    });
  }, []);

  // Redo action
  const redo = useCallback(() => {
    setHistoryState((prev) => {
      if (prev.future.length === 0) return prev;

      const newFuture = [...prev.future];
      const nextState = newFuture.shift();
      
      if (!nextState || !nextState.elements) {
        return prev;
      }

      return {
        past: [...prev.past, prev.present],
        present: nextState,
        future: newFuture,
      };
    });
  }, []);

  // Update canvas settings (including size)
  const updateCanvasSettings = useCallback((updates: Partial<CanvasSettings>) => {
    setHistoryState((prev) => {
      const newSettings = { ...prev.present.canvasSettings, ...updates };
      const newPresent = { ...prev.present, canvasSettings: newSettings };
      const newPast = [...prev.past, cloneState(prev.present)];
      if (newPast.length > MAX_HISTORY_SIZE) {
        newPast.shift();
      }
      return {
        past: newPast,
        present: newPresent,
        future: [],
      };
    });
  }, []);

  // Change canvas size
  const setCanvasSize = useCallback((size: CanvasSize) => {
    updateCanvasSettings({ canvasSize: size });
  }, [updateCanvasSettings]);

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
      const newPast = [...prev.past, cloneState(prev.present)];
      if (newPast.length > MAX_HISTORY_SIZE) {
        newPast.shift();
      }
      return {
        past: newPast,
        present: newPresent,
        future: [],
      };
    });
    setSelectedIds([id]);
  }, []);

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
      const newPast = [...prev.past, cloneState(prev.present)];
      if (newPast.length > MAX_HISTORY_SIZE) {
        newPast.shift();
      }
      return {
        past: newPast,
        present: newPresent,
        future: [],
      };
    });
    setSelectedIds([id]);
  }, []);

  // Generate default points for shapes that need them
  const getDefaultPointsForShape = useCallback((shapeType: ShapeType, width: number, height: number): Point[] => {
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
  }, []);

  const addShapeElement = useCallback((shapeType: ShapeType, data?: Partial<ShapeFormData>) => {
    const id = generateId();
    
    // Set default dimensions based on shape type
    let defaultWidth = 150;
    let defaultHeight = 150;
    
    if (shapeType === "line") {
      defaultWidth = 150;
      defaultHeight = 4;
    } else if (shapeType === "ellipse") {
      // Ellipse should have different width/height to distinguish from circle
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
      const newPast = [...prev.past, cloneState(prev.present)];
      if (newPast.length > MAX_HISTORY_SIZE) {
        newPast.shift();
      }
      return {
        past: newPast,
        present: newPresent,
        future: [],
      };
    });
    setSelectedIds([id]);
  }, [getDefaultPointsForShape]);

  const updateElement = useCallback((id: string, updates: Partial<CanvasElement>) => {
    setHistoryState((prev) => {
      const newElements = prev.present.elements.map((el) => 
        el.id === id ? { ...el, ...updates } as CanvasElement : el
      );
      const newPresent = { ...prev.present, elements: newElements };
      const newPast = [...prev.past, cloneState(prev.present)];
      if (newPast.length > MAX_HISTORY_SIZE) {
        newPast.shift();
      }
      return {
        past: newPast,
        present: newPresent,
        future: [],
      };
    });
  }, []);

  const updateElementPosition = useCallback((id: string, position: Position) => {
    setHistoryState((prev) => {
      const newElements = prev.present.elements.map((el) => 
        el.id === id ? { ...el, position } : el
      );
      return {
        ...prev,
        present: { ...prev.present, elements: newElements },
      };
    });
  }, []);

  const updateElementRotation = useCallback((id: string, rotation: number) => {
    setHistoryState((prev) => {
      const newElements = prev.present.elements.map((el) => 
        el.id === id ? { ...el, rotation } : el
      );
      return {
        ...prev,
        present: { ...prev.present, elements: newElements },
      };
    });
  }, []);

  const updateElementSize = useCallback((id: string, size: { width: number; height: number }, position?: Position) => {
    setHistoryState((prev) => {
      const newElements = prev.present.elements.map((el) => {
        if (el.id === id && (el.type === "image" || el.type === "shape" || el.type === "group")) {
          return position ? { ...el, size, position } : { ...el, size };
        }
        return el;
      });
      return {
        ...prev,
        present: { ...prev.present, elements: newElements },
      };
    });
  }, []);

  const updateElementWidth = useCallback((id: string, width: number) => {
    setHistoryState((prev) => {
      const newElements = prev.present.elements.map((el) => {
        if (el.id === id && el.type === "text") {
          return { ...el, width };
        }
        return el;
      });
      return {
        ...prev,
        present: { ...prev.present, elements: newElements },
      };
    });
  }, []);

  const deleteElement = useCallback((id: string) => {
    setHistoryState((prev) => {
      const newElements = prev.present.elements.filter((el) => el.id !== id);
      const newPresent = { ...prev.present, elements: newElements };
      const newPast = [...prev.past, cloneState(prev.present)];
      if (newPast.length > MAX_HISTORY_SIZE) {
        newPast.shift();
      }
      return {
        past: newPast,
        present: newPresent,
        future: [],
      };
    });
    setSelectedIds(prev => prev.filter(selectedId => selectedId !== id));
  }, []);

  const deleteSelected = useCallback(() => {
    if (selectedIds.length === 0) return;
    
    setHistoryState((prev) => {
      const newElements = prev.present.elements.filter((el) => !selectedIds.includes(el.id));
      const newPresent = { ...prev.present, elements: newElements };
      const newPast = [...prev.past, cloneState(prev.present)];
      if (newPast.length > MAX_HISTORY_SIZE) {
        newPast.shift();
      }
      return {
        past: newPast,
        present: newPresent,
        future: [],
      };
    });
    setSelectedIds([]);
  }, [selectedIds]);

  // Copy the currently selected element to clipboard
  const copyElement = useCallback(() => {
    if (!selectedId) return false;
    
    const elementToCopy = elements.find(el => el.id === selectedId);
    if (elementToCopy) {
      // Deep clone the element for the clipboard
      clipboardRef.current = JSON.parse(JSON.stringify(elementToCopy));
      setHasClipboard(true);
      return true;
    }
    return false;
  }, [selectedId, elements]);

  // Paste the copied element onto the canvas
  const pasteElement = useCallback(() => {
    const copiedElement = clipboardRef.current;
    if (!copiedElement) return null;

    const newId = generateId();
    
    // Offset the position slightly so the pasted element is visible
    const offset = 20;
    
    setHistoryState((prev) => {
      const canvasSize = prev.present.canvasSettings.canvasSize;
      
      // Create a new element based on the copied one
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
      const newPast = [...prev.past, cloneState(prev.present)];
      if (newPast.length > MAX_HISTORY_SIZE) {
        newPast.shift();
      }
      return {
        past: newPast,
        present: newPresent,
        future: [],
      };
    });
    
    setSelectedIds([newId]);
    return newId;
  }, []);

  // Duplicate the currently selected element (copy + paste in one action)
  const duplicateElement = useCallback(() => {
    if (copyElement()) {
      return pasteElement();
    }
    return null;
  }, [copyElement, pasteElement]);

  // Helper to get element bounds
  const getElementBounds = useCallback((element: CanvasElement): { x: number; y: number; width: number; height: number } => {
    let width = 0;
    let height = 0;
    
    if (element.type === "text") {
      width = element.width;
      height = element.fontSize * 1.5; // Approximate
    } else if (element.type === "image" || element.type === "shape") {
      width = element.size.width;
      height = element.size.height;
    } else if (element.type === "group") {
      width = element.size.width;
      height = element.size.height;
    }
    
    return {
      x: element.position.x,
      y: element.position.y,
      width,
      height,
    };
  }, []);

  // Group selected elements
  const groupElements = useCallback(() => {
    if (selectedIds.length < 2) return null;
    
    const groupId = generateId();
    
    setHistoryState((prev) => {
      const elementsToGroup = prev.present.elements.filter(el => selectedIds.includes(el.id));
      if (elementsToGroup.length < 2) return prev;
      
      // Calculate bounding box of all selected elements
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      
      elementsToGroup.forEach(el => {
        const bounds = getElementBounds(el);
        minX = Math.min(minX, bounds.x);
        minY = Math.min(minY, bounds.y);
        maxX = Math.max(maxX, bounds.x + bounds.width);
        maxY = Math.max(maxY, bounds.y + bounds.height);
      });
      
      const groupWidth = maxX - minX;
      const groupHeight = maxY - minY;
      
      // Update child elements to have positions relative to group
      const updatedElements = prev.present.elements.map(el => {
        if (selectedIds.includes(el.id)) {
          return {
            ...el,
            position: {
              x: el.position.x - minX,
              y: el.position.y - minY,
            },
          };
        }
        return el;
      });
      
      // Create the group element
      const groupElement: GroupElement = {
        id: groupId,
        type: "group",
        position: { x: minX, y: minY },
        zIndex: Math.max(...elementsToGroup.map(el => el.zIndex)) + 1,
        rotation: 0,
        childIds: selectedIds,
        size: { width: groupWidth, height: groupHeight },
      };
      
      // Add group element and keep child elements (but they won't be rendered directly)
      const newElements = [...updatedElements, groupElement];
      
      const newPresent = { ...prev.present, elements: newElements };
      const newPast = [...prev.past, cloneState(prev.present)];
      if (newPast.length > MAX_HISTORY_SIZE) {
        newPast.shift();
      }
      
      return {
        past: newPast,
        present: newPresent,
        future: [],
      };
    });
    
    setSelectedIds([groupId]);
    return groupId;
  }, [selectedIds, getElementBounds]);

  // Ungroup a group element
  const ungroupElements = useCallback(() => {
    if (selectedIds.length !== 1) return false;
    
    const groupId = selectedIds[0];
    
    // First, check if it's a group and get child IDs
    const groupElement = elements.find(el => el.id === groupId);
    if (!groupElement || groupElement.type !== "group") return false;
    
    const childIds = groupElement.childIds;
    const groupPosition = groupElement.position;
    const groupRotation = groupElement.rotation;
    
    setHistoryState((prev) => {
      // Update child elements to have absolute positions again
      const updatedElements = prev.present.elements
        .filter(el => el.id !== groupId) // Remove the group element
        .map(el => {
          if (childIds.includes(el.id)) {
            // Convert relative position back to absolute
            return {
              ...el,
              position: {
                x: el.position.x + groupPosition.x,
                y: el.position.y + groupPosition.y,
              },
              rotation: ((el.rotation || 0) + groupRotation) % 360,
            };
          }
          return el;
        });
      
      const newPresent = { ...prev.present, elements: updatedElements };
      const newPast = [...prev.past, cloneState(prev.present)];
      if (newPast.length > MAX_HISTORY_SIZE) {
        newPast.shift();
      }
      
      return {
        past: newPast,
        present: newPresent,
        future: [],
      };
    });
    
    setSelectedIds(childIds);
    return true;
  }, [selectedIds, elements]);

  // Select a single element (replaces current selection)
  const selectElement = useCallback((id: string | null) => {
    setSelectedIds(id ? [id] : []);
  }, []);

  // Add an element to the current selection (for Ctrl+Click)
  const toggleElementSelection = useCallback((id: string) => {
    setSelectedIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(selectedId => selectedId !== id);
      } else {
        return [...prev, id];
      }
    });
  }, []);

  // Select multiple elements
  const selectElements = useCallback((ids: string[]) => {
    setSelectedIds(ids);
  }, []);

  const clearCanvas = useCallback(() => {
    setHistoryState((prev) => {
      const newPresent = { ...prev.present, elements: [] };
      const newPast = [...prev.past, cloneState(prev.present)];
      if (newPast.length > MAX_HISTORY_SIZE) {
        newPast.shift();
      }
      return {
        past: newPast,
        present: newPresent,
        future: [],
      };
    });
    setSelectedIds([]);
  }, []);

  const newProject = useCallback(() => {
    setHistoryState(initialHistoryState);
    setSelectedIds([]);
    setCurrentProjectId(null);
    setCurrentProjectName("Untitled Project");
  }, []);

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
      const newPast = [...prev.past, cloneState(prev.present)];
      if (newPast.length > MAX_HISTORY_SIZE) {
        newPast.shift();
      }
      return {
        past: newPast,
        present: newPresent,
        future: [],
      };
    });
  }, []);

  const recalculateZIndices = useCallback((els: CanvasElement[]): CanvasElement[] => {
    return els.map((el, index) => ({ ...el, zIndex: index + 1 }));
  }, []);

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
      const newPast = [...prev.past, cloneState(prev.present)];
      if (newPast.length > MAX_HISTORY_SIZE) {
        newPast.shift();
      }
      return {
        past: newPast,
        present: newPresent,
        future: [],
      };
    });
  }, [recalculateZIndices]);

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
      const newPast = [...prev.past, cloneState(prev.present)];
      if (newPast.length > MAX_HISTORY_SIZE) {
        newPast.shift();
      }
      return {
        past: newPast,
        present: newPresent,
        future: [],
      };
    });
  }, [recalculateZIndices]);

  const moveLayerUp = useCallback((id: string) => {
    setHistoryState((prev) => {
      const elements = prev.present.elements;
      const index = elements.findIndex((el) => el.id === id);
      if (index === -1 || index === elements.length - 1) return prev;
      
      const newElements = [...elements];
      [newElements[index], newElements[index + 1]] = [newElements[index + 1], newElements[index]];
      const reindexed = recalculateZIndices(newElements);
      
      const newPresent = { ...prev.present, elements: reindexed };
      const newPast = [...prev.past, cloneState(prev.present)];
      if (newPast.length > MAX_HISTORY_SIZE) {
        newPast.shift();
      }
      return {
        past: newPast,
        present: newPresent,
        future: [],
      };
    });
  }, [recalculateZIndices]);

  const moveLayerDown = useCallback((id: string) => {
    setHistoryState((prev) => {
      const elements = prev.present.elements;
      const index = elements.findIndex((el) => el.id === id);
      if (index === -1 || index === 0) return prev;
      
      const newElements = [...elements];
      [newElements[index], newElements[index - 1]] = [newElements[index - 1], newElements[index]];
      const reindexed = recalculateZIndices(newElements);
      
      const newPresent = { ...prev.present, elements: reindexed };
      const newPast = [...prev.past, cloneState(prev.present)];
      if (newPast.length > MAX_HISTORY_SIZE) {
        newPast.shift();
      }
      return {
        past: newPast,
        present: newPresent,
        future: [],
      };
    });
  }, [recalculateZIndices]);

  // Save project to localStorage
  const saveProject = useCallback((name?: string) => {
    const projectName = name || currentProjectName;
    const projectId = currentProjectId || generateProjectId();
    
    const project: Project = {
      id: projectId,
      name: projectName,
      state: cloneState(historyState.present),
      createdAt: currentProjectId ? Date.now() : Date.now(),
      updatedAt: Date.now(),
    };

    try {
      const existingProjects = JSON.parse(localStorage.getItem(PROJECTS_STORAGE_KEY) || "[]") as Project[];
      const existingIndex = existingProjects.findIndex(p => p.id === projectId);
      
      if (existingIndex >= 0) {
        existingProjects[existingIndex] = project;
      } else {
        existingProjects.unshift(project);
      }
      
      localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(existingProjects));
      setCurrentProjectId(projectId);
      setCurrentProjectName(projectName);
      return true;
    } catch (error) {
      console.error("Failed to save project:", error);
      return false;
    }
  }, [historyState.present, currentProjectId, currentProjectName]);

  // Load project from localStorage
  const loadProject = useCallback((projectId: string) => {
    try {
      const projects = JSON.parse(localStorage.getItem(PROJECTS_STORAGE_KEY) || "[]") as Project[];
      const project = projects.find(p => p.id === projectId);
      
      if (project) {
        // Ensure the state has the correct structure
        const loadedState: CanvasState = {
          elements: project.state.elements || [],
          canvasSettings: {
            backgroundColor: project.state.canvasSettings?.backgroundColor || "#ffffff",
            canvasSize: project.state.canvasSettings?.canvasSize || DEFAULT_CANVAS_SIZE,
          },
        };
        
        setHistoryState({
          past: [],
          present: loadedState,
          future: [],
        });
        setSelectedIds([]);
        setCurrentProjectId(project.id);
        setCurrentProjectName(project.name);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Failed to load project:", error);
      return false;
    }
  }, []);

  // Get all saved projects
  const getProjects = useCallback((): Project[] => {
    try {
      return JSON.parse(localStorage.getItem(PROJECTS_STORAGE_KEY) || "[]") as Project[];
    } catch {
      return [];
    }
  }, []);

  // Delete a project
  const deleteProject = useCallback((projectId: string) => {
    try {
      const projects = JSON.parse(localStorage.getItem(PROJECTS_STORAGE_KEY) || "[]") as Project[];
      const filtered = projects.filter(p => p.id !== projectId);
      localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(filtered));
      
      if (currentProjectId === projectId) {
        setCurrentProjectId(null);
        setCurrentProjectName("Untitled Project");
      }
      return true;
    } catch {
      return false;
    }
  }, [currentProjectId]);

  return {
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
    undo,
    redo,
    updateCanvasSettings,
    setCanvasSize,
    addTextElement,
    addImageElement,
    addShapeElement,
    updateElement,
    updateElementPosition,
    updateElementRotation,
    updateElementSize,
    updateElementWidth,
    saveInteractionSnapshot,
    commitInteraction,
    deleteElement,
    deleteSelected,
    copyElement,
    pasteElement,
    duplicateElement,
    hasClipboard,
    selectElement,
    selectElements,
    toggleElementSelection,
    groupElements,
    ungroupElements,
    getElementBounds,
    clearCanvas,
    newProject,
    moveElement,
    bringToFront,
    sendToBack,
    moveLayerUp,
    moveLayerDown,
    saveProject,
    loadProject,
    getProjects,
    deleteProject,
    setCurrentProjectName,
  };
}

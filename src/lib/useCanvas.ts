"use client";

import { useState, useCallback, useRef } from "react";
import { 
  CanvasElement, TextElement, ImageElement, TextFormData, 
  Position, CanvasSettings, CanvasState, CanvasSize,
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
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [currentProjectName, setCurrentProjectName] = useState<string>("Untitled Project");
  
  // Snapshot of state before an interaction begins
  const interactionSnapshotRef = useRef<CanvasState | null>(null);

  // Derived state from history
  const present = historyState.present ?? initialState;
  const elements = present.elements ?? [];
  const canvasSettings = present.canvasSettings ?? defaultSettings;
  const selectedElement = elements.find((el) => el.id === selectedId) || null;

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
    setSelectedId(id);
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
    setSelectedId(id);
  }, []);

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
        if (el.id === id && el.type === "image") {
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
    setSelectedId((prevSelectedId) => (prevSelectedId === id ? null : prevSelectedId));
  }, []);

  const deleteSelected = useCallback(() => {
    setSelectedId((prevSelectedId) => {
      if (prevSelectedId) {
        setHistoryState((prev) => {
          const newElements = prev.present.elements.filter((el) => el.id !== prevSelectedId);
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
        return null;
      }
      return prevSelectedId;
    });
  }, []);

  const selectElement = useCallback((id: string | null) => {
    setSelectedId(id);
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
    setSelectedId(null);
  }, []);

  const newProject = useCallback(() => {
    setHistoryState(initialHistoryState);
    setSelectedId(null);
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
        setSelectedId(null);
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
    selectedId,
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
    updateElement,
    updateElementPosition,
    updateElementRotation,
    updateElementSize,
    updateElementWidth,
    saveInteractionSnapshot,
    commitInteraction,
    deleteElement,
    deleteSelected,
    selectElement,
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

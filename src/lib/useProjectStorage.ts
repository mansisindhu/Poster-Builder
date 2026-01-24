"use client";

import { useState, useCallback } from "react";
import { CanvasState, Project, DEFAULT_CANVAS_SIZE } from "@/types/canvas";
import { PROJECTS_STORAGE_KEY } from "./constants";
import { cloneState } from "./useCanvasHistory";

/**
 * Generate a unique project ID
 */
function generateProjectId(): string {
  return `project-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

interface UseProjectStorageOptions {
  /** Current canvas state (for saving) */
  currentState: CanvasState;
  /** Function to load a new state (for loading projects) */
  onLoadState: (state: CanvasState) => void;
  /** Function to reset to initial state (for new project) */
  onResetState: () => void;
  /** Optional callback when selection should be cleared */
  onClearSelection?: () => void;
}

/**
 * Hook for managing project persistence to localStorage.
 * 
 * Provides:
 * - Save/load projects with full canvas state
 * - Project listing and deletion
 * - New project creation
 * 
 * @param options - Configuration options for the hook
 * @returns Project state and management functions
 */
export function useProjectStorage({
  currentState,
  onLoadState,
  onResetState,
  onClearSelection,
}: UseProjectStorageOptions) {
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [currentProjectName, setCurrentProjectName] = useState<string>("Untitled Project");

  /**
   * Save the current project to localStorage
   * @param name - Optional name override (uses currentProjectName if not provided)
   * @returns true if successful, false otherwise
   */
  const saveProject = useCallback((name?: string) => {
    const projectName = name || currentProjectName;
    const projectId = currentProjectId || generateProjectId();
    
    const project: Project = {
      id: projectId,
      name: projectName,
      state: cloneState(currentState),
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
  }, [currentState, currentProjectId, currentProjectName]);

  /**
   * Load a project from localStorage
   * @param projectId - The ID of the project to load
   * @returns true if successful, false otherwise
   */
  const loadProject = useCallback((projectId: string) => {
    try {
      const projects = JSON.parse(localStorage.getItem(PROJECTS_STORAGE_KEY) || "[]") as Project[];
      const project = projects.find(p => p.id === projectId);
      
      if (project) {
        // Ensure the state has the correct structure
        const loadedStateData: CanvasState = {
          elements: project.state.elements || [],
          canvasSettings: {
            backgroundType: project.state.canvasSettings?.backgroundType || "solid",
            backgroundColor: project.state.canvasSettings?.backgroundColor || "#ffffff",
            backgroundGradient: project.state.canvasSettings?.backgroundGradient,
            canvasSize: project.state.canvasSettings?.canvasSize || DEFAULT_CANVAS_SIZE,
            grid: project.state.canvasSettings?.grid || {
              enabled: false,
              size: 20,
            },
          },
        };
        
        onLoadState(loadedStateData);
        onClearSelection?.();
        setCurrentProjectId(project.id);
        setCurrentProjectName(project.name);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Failed to load project:", error);
      return false;
    }
  }, [onLoadState, onClearSelection]);

  /**
   * Get all saved projects from localStorage
   * @returns Array of saved projects
   */
  const getProjects = useCallback((): Project[] => {
    try {
      return JSON.parse(localStorage.getItem(PROJECTS_STORAGE_KEY) || "[]") as Project[];
    } catch {
      return [];
    }
  }, []);

  /**
   * Delete a project from localStorage
   * @param projectId - The ID of the project to delete
   * @returns true if successful, false otherwise
   */
  const deleteProject = useCallback((projectId: string) => {
    try {
      const projects = JSON.parse(localStorage.getItem(PROJECTS_STORAGE_KEY) || "[]") as Project[];
      const filtered = projects.filter(p => p.id !== projectId);
      localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(filtered));
      
      // If we deleted the current project, reset the project info
      if (currentProjectId === projectId) {
        setCurrentProjectId(null);
        setCurrentProjectName("Untitled Project");
      }
      return true;
    } catch {
      return false;
    }
  }, [currentProjectId]);

  /**
   * Create a new project (resets state and project info)
   */
  const newProject = useCallback(() => {
    onResetState();
    onClearSelection?.();
    setCurrentProjectId(null);
    setCurrentProjectName("Untitled Project");
  }, [onResetState, onClearSelection]);

  return {
    // State
    currentProjectId,
    currentProjectName,
    setCurrentProjectName,
    
    // Actions
    saveProject,
    loadProject,
    getProjects,
    deleteProject,
    newProject,
  };
}

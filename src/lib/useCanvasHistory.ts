"use client";

import { useState, useCallback, useRef } from "react";
import { CanvasState, CanvasSettings, DEFAULT_CANVAS_SIZE } from "@/types/canvas";
import { MAX_HISTORY_SIZE } from "./constants";

// Default canvas settings
const defaultSettings: CanvasSettings = {
  backgroundColor: "#ffffff",
  canvasSize: DEFAULT_CANVAS_SIZE,
};

// Initial canvas state
const initialState: CanvasState = {
  elements: [],
  canvasSettings: defaultSettings,
};

// History state structure
export interface HistoryState {
  past: CanvasState[];
  present: CanvasState;
  future: CanvasState[];
}

const initialHistoryState: HistoryState = {
  past: [],
  present: initialState,
  future: [],
};

/**
 * Deep clone a canvas state to prevent mutation issues.
 * 
 * @param state - The canvas state to clone
 * @returns A deep copy of the state
 */
export function cloneState(state: CanvasState): CanvasState {
  return {
    elements: state.elements.map(el => ({ ...el })),
    canvasSettings: { 
      ...state.canvasSettings,
      canvasSize: { ...state.canvasSettings.canvasSize }
    },
  };
}

/**
 * Push a new state to history, clearing the redo stack.
 * Respects MAX_HISTORY_SIZE by dropping oldest entries.
 * 
 * @param prev - Current history state
 * @param newPresent - New present state to set
 * @returns Updated history state with new present
 */
export function pushToHistory(prev: HistoryState, newPresent: CanvasState): HistoryState {
  const newPast = [...prev.past, cloneState(prev.present)];
  if (newPast.length > MAX_HISTORY_SIZE) {
    newPast.shift();
  }
  return {
    past: newPast,
    present: newPresent,
    future: [],
  };
}

/**
 * Update present state without affecting history stacks.
 * Used for live updates during drag/resize operations.
 * 
 * @param prev - Current history state
 * @param newPresent - New present state to set
 * @returns Updated history state (past/future unchanged)
 */
export function updatePresent(prev: HistoryState, newPresent: CanvasState): HistoryState {
  return {
    ...prev,
    present: newPresent,
  };
}

/**
 * Hook for managing canvas history with undo/redo support.
 * 
 * Provides:
 * - Undo/redo with configurable history size
 * - Interaction batching (drag/resize as single undo step)
 * - State loading for projects
 * 
 * @returns History state and management functions
 */
export function useCanvasHistory() {
  const [historyState, setHistoryState] = useState<HistoryState>(initialHistoryState);
  
  // Snapshot of state before an interaction begins
  const interactionSnapshotRef = useRef<CanvasState | null>(null);

  // Check if undo/redo is available
  const canUndo = historyState.past.length > 0;
  const canRedo = historyState.future.length > 0;

  // Get current present state
  const present = historyState.present ?? initialState;

  /**
   * Save a snapshot before starting an interaction (drag, resize, rotate)
   * This allows us to batch multiple small updates into a single undo step
   */
  const saveInteractionSnapshot = useCallback(() => {
    setHistoryState((prev) => {
      interactionSnapshotRef.current = cloneState(prev.present);
      return prev;
    });
  }, []);

  /**
   * Commit the interaction - push the snapshot to history if state changed
   */
  const commitInteraction = useCallback(() => {
    const snapshot = interactionSnapshotRef.current;
    if (!snapshot) return;
    
    interactionSnapshotRef.current = null;
    
    setHistoryState((prev) => {
      const currentStr = JSON.stringify(prev.present);
      const snapshotStr = JSON.stringify(snapshot);
      
      // Only push to history if something actually changed
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

  /**
   * Undo the last action
   */
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

  /**
   * Redo the last undone action
   */
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

  /**
   * Reset history to initial state (for new project)
   */
  const resetHistory = useCallback(() => {
    setHistoryState(initialHistoryState);
  }, []);

  /**
   * Load a state directly (for loading projects)
   */
  const loadState = useCallback((state: CanvasState) => {
    setHistoryState({
      past: [],
      present: state,
      future: [],
    });
  }, []);

  return {
    // State
    historyState,
    setHistoryState,
    present,
    canUndo,
    canRedo,
    
    // Interaction management
    saveInteractionSnapshot,
    commitInteraction,
    
    // Undo/Redo
    undo,
    redo,
    
    // State management
    resetHistory,
    loadState,
  };
}

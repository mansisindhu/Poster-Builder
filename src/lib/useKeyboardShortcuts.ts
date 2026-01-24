"use client";

import { useEffect } from "react";
import { CanvasElement, ImageElement, ShapeElement, GroupElement, TextElement } from "@/types/canvas";

export interface KeyboardShortcutActions {
  // Element actions
  deleteSelected: () => void;
  selectElement: (id: string | null) => void;
  moveElement: (id: string, deltaX: number, deltaY: number) => void;
  copyElement: () => void;
  pasteElement: () => void;
  duplicateElement: () => void;
  groupElements: () => void;
  ungroupElements: () => void;
  
  // History
  undo: () => void;
  redo: () => void;
  
  // Projects
  saveProject: (name?: string) => void;
  openSaveDialog: () => void;
  openLoadDialog: () => void;
  
  // Resize
  resizeElement: (scaleFactor: number) => void;
  
  // Dialogs
  closeAllDialogs: () => boolean; // Returns true if a dialog was closed
}

export interface KeyboardShortcutState {
  selectedId: string | null;
  currentProjectId: string | null;
  hasOpenDialog: boolean;
}

export function useKeyboardShortcuts(
  actions: KeyboardShortcutActions,
  state: KeyboardShortcutState
) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }

      const { selectedId, currentProjectId, hasOpenDialog } = state;

      // Save: Ctrl+S
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        if (currentProjectId) {
          actions.saveProject();
        } else {
          actions.openSaveDialog();
        }
        return;
      }

      // Open: Ctrl+O
      if ((e.ctrlKey || e.metaKey) && e.key === "o") {
        e.preventDefault();
        actions.openLoadDialog();
        return;
      }

      // Copy: Ctrl+C
      if ((e.ctrlKey || e.metaKey) && e.key === "c") {
        e.preventDefault();
        actions.copyElement();
        return;
      }

      // Paste: Ctrl+V
      if ((e.ctrlKey || e.metaKey) && e.key === "v") {
        e.preventDefault();
        actions.pasteElement();
        return;
      }

      // Duplicate: Ctrl+D
      if ((e.ctrlKey || e.metaKey) && e.key === "d") {
        e.preventDefault();
        actions.duplicateElement();
        return;
      }

      // Group: Ctrl+G
      if ((e.ctrlKey || e.metaKey) && e.key === "g" && !e.shiftKey) {
        e.preventDefault();
        actions.groupElements();
        return;
      }

      // Ungroup: Ctrl+Shift+G
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === "G" || e.key === "g")) {
        e.preventDefault();
        actions.ungroupElements();
        return;
      }

      // Undo: Ctrl+Z
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        actions.undo();
        return;
      }

      // Redo: Ctrl+Shift+Z or Ctrl+Y
      if ((e.ctrlKey || e.metaKey) && (e.key === "Z" || e.key === "y" || (e.key === "z" && e.shiftKey))) {
        e.preventDefault();
        actions.redo();
        return;
      }

      // Scale up: Ctrl/Cmd + Plus
      if ((e.ctrlKey || e.metaKey) && (e.key === "+" || e.key === "=")) {
        e.preventDefault();
        if (selectedId) {
          actions.resizeElement(1.1);
        }
        return;
      }

      // Scale down: Ctrl/Cmd + Minus
      if ((e.ctrlKey || e.metaKey) && (e.key === "-" || e.key === "_")) {
        e.preventDefault();
        if (selectedId) {
          actions.resizeElement(0.9);
        }
        return;
      }

      // Delete
      if ((e.key === "Delete" || e.key === "Backspace") && selectedId) {
        e.preventDefault();
        actions.deleteSelected();
        return;
      }

      // Escape
      if (e.key === "Escape") {
        if (hasOpenDialog) {
          actions.closeAllDialogs();
        } else {
          actions.selectElement(null);
        }
        return;
      }

      // Arrow keys
      if (selectedId && ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
        e.preventDefault();
        const step = e.shiftKey ? 10 : 1;
        switch (e.key) {
          case "ArrowUp":
            actions.moveElement(selectedId, 0, -step);
            break;
          case "ArrowDown":
            actions.moveElement(selectedId, 0, step);
            break;
          case "ArrowLeft":
            actions.moveElement(selectedId, -step, 0);
            break;
          case "ArrowRight":
            actions.moveElement(selectedId, step, 0);
            break;
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [actions, state]);
}

// Helper to create resize function for an element
export function createResizeHandler(
  selectedElement: CanvasElement | null,
  updateElement: (id: string, updates: Partial<CanvasElement>) => void
) {
  return (scaleFactor: number) => {
    if (!selectedElement) return;
    
    if (selectedElement.type === "image" || selectedElement.type === "shape" || selectedElement.type === "group") {
      const newWidth = Math.max(50, Math.round(selectedElement.size.width * scaleFactor));
      const newHeight = Math.max(50, Math.round(selectedElement.size.height * scaleFactor));
      updateElement(selectedElement.id, { 
        size: { width: newWidth, height: newHeight } 
      } as Partial<ImageElement | ShapeElement | GroupElement>);
    } else if (selectedElement.type === "text") {
      const newFontSize = Math.max(8, Math.min(200, Math.round(selectedElement.fontSize * scaleFactor)));
      updateElement(selectedElement.id, { fontSize: newFontSize } as Partial<TextElement>);
    }
  };
}

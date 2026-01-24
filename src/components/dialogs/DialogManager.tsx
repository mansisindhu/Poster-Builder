"use client";

import React, { useState, useCallback, useEffect, useMemo } from "react";
import { TextEditDialog } from "./TextEditDialog";
import { ProjectDialog } from "./ProjectDialog";
import { CanvasSizeDialog } from "./CanvasSizeDialog";
import { ExportDialog } from "./ExportDialog";
import { TextElement, TextFormData, CanvasElement, CanvasSize, CanvasSettings, Project } from "@/types/canvas";
import { exportCanvasToImage } from "@/lib/canvasExport";

export interface DialogManagerProps {
  // Canvas state
  elements: CanvasElement[];
  canvasSettings: CanvasSettings;
  currentProjectId: string | null;
  currentProjectName: string;
  
  // Element actions
  addTextElement: (data: TextFormData) => void;
  updateElement: (id: string, updates: Partial<CanvasElement>) => void;
  selectElement: (id: string | null) => void;
  
  // Canvas actions
  setCanvasSize: (size: CanvasSize) => void;
  
  // Project actions
  saveProject: (name?: string) => void;
  loadProject: (id: string) => void;
  deleteProject: (id: string) => void;
  getProjects: () => Project[];
  newProject: () => void;
}

export interface DialogControls {
  openTextDialog: (element?: TextElement) => void;
  openSaveDialog: () => void;
  openLoadDialog: () => void;
  openCanvasSizeDialog: () => void;
  openExportDialog: () => void;
  closeAllDialogs: () => boolean;
  hasOpenDialog: boolean;
}

export function useDialogManager(props: DialogManagerProps): DialogControls {
  const {
    elements,
    canvasSettings,
    currentProjectId,
    currentProjectName,
    addTextElement,
    updateElement,
    selectElement,
    setCanvasSize,
    saveProject,
    loadProject,
    deleteProject,
    getProjects,
    newProject,
  } = props;

  const [textDialogOpen, setTextDialogOpen] = useState(false);
  const [editingTextElement, setEditingTextElement] = useState<TextElement | null>(null);
  const [projectDialogOpen, setProjectDialogOpen] = useState(false);
  const [projectDialogMode, setProjectDialogMode] = useState<"save" | "load">("save");
  const [canvasSizeDialogOpen, setCanvasSizeDialogOpen] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);

  // Refresh projects when dialog opens
  useEffect(() => {
    if (projectDialogOpen) {
      setProjects(getProjects());
    }
  }, [projectDialogOpen, getProjects]);

  const hasOpenDialog = textDialogOpen || projectDialogOpen || canvasSizeDialogOpen || exportDialogOpen;

  const openTextDialog = useCallback((element?: TextElement) => {
    setEditingTextElement(element || null);
    setTextDialogOpen(true);
  }, []);

  const openSaveDialog = useCallback(() => {
    setProjectDialogMode("save");
    setProjectDialogOpen(true);
  }, []);

  const openLoadDialog = useCallback(() => {
    setProjectDialogMode("load");
    setProjectDialogOpen(true);
  }, []);

  const openCanvasSizeDialog = useCallback(() => {
    setCanvasSizeDialogOpen(true);
  }, []);

  const openExportDialog = useCallback(() => {
    setExportDialogOpen(true);
  }, []);

  const closeAllDialogs = useCallback(() => {
    if (textDialogOpen) {
      setTextDialogOpen(false);
      return true;
    }
    if (projectDialogOpen) {
      setProjectDialogOpen(false);
      return true;
    }
    if (canvasSizeDialogOpen) {
      setCanvasSizeDialogOpen(false);
      return true;
    }
    if (exportDialogOpen) {
      setExportDialogOpen(false);
      return true;
    }
    return false;
  }, [textDialogOpen, projectDialogOpen, canvasSizeDialogOpen, exportDialogOpen]);

  // Text dialog handlers
  const handleSaveText = useCallback((data: TextFormData) => {
    if (editingTextElement) {
      updateElement(editingTextElement.id, data);
    } else {
      addTextElement(data);
    }
    setEditingTextElement(null);
  }, [editingTextElement, addTextElement, updateElement]);

  // Project handlers
  const handleProjectSave = useCallback((name: string) => {
    saveProject(name);
    setProjects(getProjects());
  }, [saveProject, getProjects]);

  const handleProjectLoad = useCallback((projectId: string) => {
    loadProject(projectId);
  }, [loadProject]);

  const handleProjectDelete = useCallback((projectId: string) => {
    deleteProject(projectId);
    setProjects(getProjects());
  }, [deleteProject, getProjects]);

  const handleNewProject = useCallback(() => {
    if (elements.length > 0) {
      if (!window.confirm("Create a new project? Unsaved changes will be lost.")) {
        return;
      }
    }
    newProject();
  }, [elements.length, newProject]);

  // Export handler
  const handleExport = useCallback((scale: number = 2) => {
    selectElement(null);
    exportCanvasToImage(elements, canvasSettings, currentProjectName, scale);
  }, [elements, selectElement, canvasSettings, currentProjectName]);

  // Render function for the dialogs
  const DialogComponents = useMemo(() => {
    return function Dialogs() {
      return (
        <>
          <TextEditDialog
            open={textDialogOpen}
            onOpenChange={setTextDialogOpen}
            editingElement={editingTextElement}
            onSave={handleSaveText}
          />

          <ProjectDialog
            open={projectDialogOpen}
            onOpenChange={setProjectDialogOpen}
            mode={projectDialogMode}
            currentProjectName={currentProjectName}
            projects={projects}
            onSave={handleProjectSave}
            onLoad={handleProjectLoad}
            onDelete={handleProjectDelete}
            onNew={handleNewProject}
          />

          <CanvasSizeDialog
            open={canvasSizeDialogOpen}
            onOpenChange={setCanvasSizeDialogOpen}
            currentSize={canvasSettings.canvasSize}
            onSizeChange={setCanvasSize}
          />

          <ExportDialog
            open={exportDialogOpen}
            onOpenChange={setExportDialogOpen}
            canvasSize={canvasSettings.canvasSize}
            onExport={handleExport}
          />
        </>
      );
    };
  }, [
    textDialogOpen, editingTextElement, handleSaveText,
    projectDialogOpen, projectDialogMode, currentProjectName, projects,
    handleProjectSave, handleProjectLoad, handleProjectDelete, handleNewProject,
    canvasSizeDialogOpen, canvasSettings.canvasSize, setCanvasSize,
    exportDialogOpen, handleExport
  ]);

  // Store dialogs component on the controls object
  (openTextDialog as any).Dialogs = DialogComponents;

  return {
    openTextDialog,
    openSaveDialog,
    openLoadDialog,
    openCanvasSizeDialog,
    openExportDialog,
    closeAllDialogs,
    hasOpenDialog,
  };
}

// Component that renders all dialogs
export function DialogRenderer({ controls }: { controls: DialogControls & { openTextDialog: { Dialogs?: React.ComponentType } } }) {
  const Dialogs = (controls.openTextDialog as any).Dialogs;
  return Dialogs ? <Dialogs /> : null;
}

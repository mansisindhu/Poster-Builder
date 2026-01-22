"use client";

import React, { useMemo } from "react";
import { useCanvas } from "@/lib/useCanvas";
import { useKeyboardShortcuts, createResizeHandler } from "@/lib/useKeyboardShortcuts";
import { loadImageFile } from "@/lib/imageUtils";
import { Toolbar } from "./toolbar/Toolbar";
import { Canvas } from "./canvas/Canvas";
import { PropertiesPanel } from "./panels/PropertiesPanel";
import { LayersPanel } from "./panels/LayersPanel";
import { MobilePanel } from "./panels/MobilePanel";
import { useDialogManager, DialogRenderer } from "./dialogs/DialogManager";
import { CanvasElement, ShapeType } from "@/types/canvas";

export function PosterBuilder() {
  const canvas = useCanvas();
  const {
    elements,
    selectedElement,
    selectedId,
    selectedIds,
    canvasSettings,
    canUndo,
    canRedo,
    currentProjectId,
    currentProjectName,
    hasClipboard,
  } = canvas;

  // Dialog management
  const dialogs = useDialogManager({
    elements,
    canvasSettings,
    currentProjectId,
    currentProjectName,
    addTextElement: canvas.addTextElement,
    updateElement: canvas.updateElement,
    selectElement: canvas.selectElement,
    setCanvasSize: canvas.setCanvasSize,
    saveProject: canvas.saveProject,
    loadProject: canvas.loadProject,
    deleteProject: canvas.deleteProject,
    getProjects: canvas.getProjects,
    newProject: canvas.newProject,
  });

  // Image handling
  const addImage = (file: File) => {
    loadImageFile(file, canvas.addImageElement);
  };

  // Shape handling
  const addShape = (shapeType: ShapeType) => {
    canvas.addShapeElement(shapeType);
  };

  // Text double-click handling
  const handleTextDoubleClick = (element: CanvasElement) => {
    if (element.type === "text") {
      dialogs.openTextDialog(element);
    }
  };

  // Clear with confirmation
  const clearCanvas = () => {
    if (elements.length === 0) return;
    if (window.confirm("Are you sure you want to clear the canvas?")) {
      canvas.clearCanvas();
    }
  };

  // Resize handler for keyboard shortcuts
  const resizeElement = useMemo(
    () => createResizeHandler(selectedElement, canvas.updateElement),
    [selectedElement, canvas.updateElement]
  );

  // Keyboard shortcuts
  useKeyboardShortcuts(
    {
      deleteSelected: canvas.deleteSelected,
      selectElement: canvas.selectElement,
      moveElement: canvas.moveElement,
      copyElement: canvas.copyElement,
      pasteElement: canvas.pasteElement,
      duplicateElement: canvas.duplicateElement,
      groupElements: canvas.groupElements,
      ungroupElements: canvas.ungroupElements,
      undo: canvas.undo,
      redo: canvas.redo,
      saveProject: canvas.saveProject,
      openSaveDialog: dialogs.openSaveDialog,
      openLoadDialog: dialogs.openLoadDialog,
      resizeElement,
      closeAllDialogs: dialogs.closeAllDialogs,
    },
    {
      selectedId,
      currentProjectId,
      hasOpenDialog: dialogs.hasOpenDialog,
    }
  );

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Toolbar
        hasSelection={!!selectedId}
        selectedCount={selectedIds.length}
        isGroupSelected={selectedElement?.type === "group"}
        canUndo={canUndo}
        canRedo={canRedo}
        canPaste={hasClipboard}
        currentSize={canvasSettings.canvasSize}
        projectName={currentProjectName}
        onAddText={() => dialogs.openTextDialog()}
        onAddImage={addImage}
        onAddShape={addShape}
        onCopy={canvas.copyElement}
        onPaste={canvas.pasteElement}
        onDelete={canvas.deleteSelected}
        onGroup={canvas.groupElements}
        onUngroup={canvas.ungroupElements}
        onClearCanvas={clearCanvas}
        onExport={dialogs.openExportDialog}
        onUndo={canvas.undo}
        onRedo={canvas.redo}
        onSaveProject={dialogs.openSaveDialog}
        onLoadProject={dialogs.openLoadDialog}
        onCanvasSize={dialogs.openCanvasSizeDialog}
      />

      {/* Desktop Layout */}
      <div className="flex-1 hidden md:flex overflow-hidden">
        <PropertiesPanel
          element={selectedElement}
          selectedCount={selectedIds.length}
          canvasSettings={canvasSettings}
          onUpdate={canvas.updateElement}
          onUpdateCanvasSettings={canvas.updateCanvasSettings}
          onEditText={dialogs.openTextDialog}
          onGroup={canvas.groupElements}
          onUngroup={canvas.ungroupElements}
        />

        <Canvas
          elements={elements}
          selectedId={selectedId}
          selectedIds={selectedIds}
          backgroundColor={canvasSettings.backgroundColor}
          canvasSize={canvasSettings.canvasSize}
          onSelect={canvas.selectElement}
          onToggleSelect={canvas.toggleElementSelection}
          onPositionChange={canvas.updateElementPosition}
          onRotationChange={canvas.updateElementRotation}
          onSizeChange={canvas.updateElementSize}
          onWidthChange={canvas.updateElementWidth}
          onInteractionStart={canvas.saveInteractionSnapshot}
          onInteractionEnd={canvas.commitInteraction}
          onDoubleClickText={handleTextDoubleClick}
          onDropImage={addImage}
        />

        <LayersPanel
          elements={elements}
          selectedId={selectedId}
          onSelect={canvas.selectElement}
          onBringToFront={canvas.bringToFront}
          onSendToBack={canvas.sendToBack}
          onMoveUp={canvas.moveLayerUp}
          onMoveDown={canvas.moveLayerDown}
        />
      </div>

      {/* Mobile Layout */}
      <div className="flex-1 flex flex-col md:hidden overflow-hidden">
        <Canvas
          elements={elements}
          selectedId={selectedId}
          selectedIds={selectedIds}
          backgroundColor={canvasSettings.backgroundColor}
          canvasSize={canvasSettings.canvasSize}
          onSelect={canvas.selectElement}
          onToggleSelect={canvas.toggleElementSelection}
          onPositionChange={canvas.updateElementPosition}
          onRotationChange={canvas.updateElementRotation}
          onSizeChange={canvas.updateElementSize}
          onWidthChange={canvas.updateElementWidth}
          onInteractionStart={canvas.saveInteractionSnapshot}
          onInteractionEnd={canvas.commitInteraction}
          onDoubleClickText={handleTextDoubleClick}
          onDropImage={addImage}
          isMobile
        />

        <MobilePanel
          element={selectedElement}
          elements={elements}
          selectedId={selectedId}
          selectedCount={selectedIds.length}
          canvasSettings={canvasSettings}
          onUpdate={canvas.updateElement}
          onUpdateCanvasSettings={canvas.updateCanvasSettings}
          onEditText={dialogs.openTextDialog}
          onSelect={canvas.selectElement}
          onBringToFront={canvas.bringToFront}
          onSendToBack={canvas.sendToBack}
          onMoveUp={canvas.moveLayerUp}
          onMoveDown={canvas.moveLayerDown}
          onGroup={canvas.groupElements}
          onUngroup={canvas.ungroupElements}
        />
      </div>

      <DialogRenderer controls={dialogs} />
    </div>
  );
}

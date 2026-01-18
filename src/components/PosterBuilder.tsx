"use client";

import React, { useState, useCallback, useEffect } from "react";
import { useCanvas } from "@/lib/useCanvas";
import { Toolbar } from "./toolbar/Toolbar";
import { Canvas } from "./canvas/Canvas";
import { PropertiesPanel } from "./panels/PropertiesPanel";
import { LayersPanel } from "./panels/LayersPanel";
import { TextEditDialog } from "./dialogs/TextEditDialog";
import { ProjectDialog } from "./dialogs/ProjectDialog";
import { CanvasSizeDialog } from "./dialogs/CanvasSizeDialog";
import { MobilePanel } from "./panels/MobilePanel";
import { TextElement, TextFormData, CanvasElement, ImageElement, CanvasSize } from "@/types/canvas";

export function PosterBuilder() {
  const {
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
  } = useCanvas();

  const [textDialogOpen, setTextDialogOpen] = useState(false);
  const [editingTextElement, setEditingTextElement] = useState<TextElement | null>(null);
  const [projectDialogOpen, setProjectDialogOpen] = useState(false);
  const [projectDialogMode, setProjectDialogMode] = useState<"save" | "load">("save");
  const [canvasSizeDialogOpen, setCanvasSizeDialogOpen] = useState(false);
  const [projects, setProjects] = useState(getProjects());

  // Refresh projects when dialog opens
  useEffect(() => {
    if (projectDialogOpen) {
      setProjects(getProjects());
    }
  }, [projectDialogOpen, getProjects]);

  const handleAddText = useCallback(() => {
    setEditingTextElement(null);
    setTextDialogOpen(true);
  }, []);

  const handleEditText = useCallback((element: TextElement) => {
    setEditingTextElement(element);
    setTextDialogOpen(true);
  }, []);

  const handleSaveText = useCallback(
    (data: TextFormData) => {
      if (editingTextElement) {
        updateElement(editingTextElement.id, data);
      } else {
        addTextElement(data);
      }
      setEditingTextElement(null);
    },
    [editingTextElement, addTextElement, updateElement]
  );

  const handleAddImage = useCallback(
    (file: File) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const src = event.target?.result as string;
        const img = new Image();
        img.onload = () => {
          addImageElement(src, file.name, img.width, img.height);
        };
        img.src = src;
      };
      reader.readAsDataURL(file);
    },
    [addImageElement]
  );

  const handleClearCanvas = useCallback(() => {
    if (elements.length === 0) return;
    if (window.confirm("Are you sure you want to clear the canvas?")) {
      clearCanvas();
    }
  }, [elements.length, clearCanvas]);

  const handleExport = useCallback(() => {
    selectElement(null);

    const { width, height } = canvasSettings.canvasSize;
    const exportCanvas = document.createElement("canvas");
    exportCanvas.width = width;
    exportCanvas.height = height;
    const ctx = exportCanvas.getContext("2d")!;

    ctx.fillStyle = canvasSettings.backgroundColor;
    ctx.fillRect(0, 0, width, height);

    const sortedElements = [...elements].sort((a, b) => a.zIndex - b.zIndex);
    const imageElements = sortedElements.filter((el) => el.type === "image");
    
    const loadImages = async () => {
      const imageMap = new Map<string, HTMLImageElement>();
      
      await Promise.all(
        imageElements.map((element) => {
          return new Promise<void>((resolve) => {
            if (element.type !== "image") {
              resolve();
              return;
            }
            const img = new window.Image();
            img.crossOrigin = "anonymous";
            img.onload = () => {
              imageMap.set(element.id, img);
              resolve();
            };
            img.onerror = () => resolve();
            img.src = element.src;
          });
        })
      );

      // Helper function to wrap text based on width
      const wrapText = (text: string, maxWidth: number): string[] => {
        const words = text.split(' ');
        const lines: string[] = [];
        let currentLine = '';

        words.forEach((word) => {
          const testLine = currentLine ? `${currentLine} ${word}` : word;
          const metrics = ctx.measureText(testLine);
          if (metrics.width > maxWidth && currentLine) {
            lines.push(currentLine);
            currentLine = word;
          } else {
            currentLine = testLine;
          }
        });
        if (currentLine) {
          lines.push(currentLine);
        }
        return lines;
      };

      sortedElements.forEach((element) => {
        ctx.save();
        
        if (element.type === "text") {
          // Build font string with style (italic) and weight
          const fontStyle = element.fontStyle || "normal";
          ctx.font = `${fontStyle} ${element.fontWeight} ${element.fontSize}px ${element.fontFamily}`;
          
          // Use element width for wrapping (minus padding)
          const textWidth = element.width - 24; // Account for px-3 padding (12px each side)
          
          // Split by newlines first, then wrap each line
          const paragraphs = element.content.split("\n");
          const allLines: string[] = [];
          paragraphs.forEach((para) => {
            if (para === '') {
              allLines.push('');
            } else {
              const wrapped = wrapText(para, textWidth);
              allLines.push(...wrapped);
            }
          });
          
          const lineHeight = element.fontSize * 1.2;
          const textHeight = allLines.length * lineHeight;

          const centerX = element.position.x + element.width / 2;
          const centerY = element.position.y + 8 + textHeight / 2;

          ctx.translate(centerX, centerY);
          ctx.rotate((element.rotation * Math.PI) / 180);
          ctx.translate(-centerX, -centerY);

          ctx.fillStyle = element.color;
          ctx.textBaseline = "top";
          
          // Calculate x position based on text alignment
          const textAlign = element.textAlign || "left";
          let y = element.position.y + 8;
          allLines.forEach((line) => {
            let x = element.position.x + 12; // Left padding
            if (textAlign === "center") {
              const lineWidth = ctx.measureText(line).width;
              x = element.position.x + (element.width - lineWidth) / 2;
            } else if (textAlign === "right") {
              const lineWidth = ctx.measureText(line).width;
              x = element.position.x + element.width - lineWidth - 12; // Right padding
            }
            ctx.fillText(line, x, y);
            y += lineHeight;
          });
        } else if (element.type === "image") {
          const img = imageMap.get(element.id);
          if (img) {
            const centerX = element.position.x + element.size.width / 2;
            const centerY = element.position.y + element.size.height / 2;

            ctx.translate(centerX, centerY);
            ctx.rotate((element.rotation * Math.PI) / 180);
            ctx.translate(-centerX, -centerY);

            ctx.drawImage(
              img,
              element.position.x,
              element.position.y,
              element.size.width,
              element.size.height
            );
          }
        }

        ctx.restore();
      });

      const link = document.createElement("a");
      link.download = `${currentProjectName.replace(/[^a-z0-9]/gi, '_')}.png`;
      link.href = exportCanvas.toDataURL("image/png");
      link.click();
    };

    loadImages();
  }, [elements, selectElement, canvasSettings, currentProjectName]);

  const handleDoubleClickText = useCallback(
    (element: CanvasElement) => {
      if (element.type === "text") {
        handleEditText(element);
      }
    },
    [handleEditText]
  );

  const resizeSelectedElement = useCallback((scaleFactor: number) => {
    if (!selectedElement) return;
    
    if (selectedElement.type === "image") {
      const newWidth = Math.max(50, Math.round(selectedElement.size.width * scaleFactor));
      const newHeight = Math.max(50, Math.round(selectedElement.size.height * scaleFactor));
      updateElement(selectedElement.id, { 
        size: { width: newWidth, height: newHeight } 
      } as Partial<ImageElement>);
    } else if (selectedElement.type === "text") {
      const newFontSize = Math.max(8, Math.min(200, Math.round(selectedElement.fontSize * scaleFactor)));
      updateElement(selectedElement.id, { fontSize: newFontSize } as Partial<TextElement>);
    }
  }, [selectedElement, updateElement]);

  // Open save dialog
  const handleSaveProjectClick = useCallback(() => {
    setProjectDialogMode("save");
    setProjectDialogOpen(true);
  }, []);

  // Open load dialog
  const handleLoadProjectClick = useCallback(() => {
    setProjectDialogMode("load");
    setProjectDialogOpen(true);
  }, []);

  // Handle save from dialog
  const handleProjectSave = useCallback((name: string) => {
    saveProject(name);
    setProjects(getProjects());
  }, [saveProject, getProjects]);

  // Handle load from dialog
  const handleProjectLoad = useCallback((projectId: string) => {
    loadProject(projectId);
  }, [loadProject]);

  // Handle delete from dialog
  const handleProjectDelete = useCallback((projectId: string) => {
    deleteProject(projectId);
    setProjects(getProjects());
  }, [deleteProject, getProjects]);

  // Handle new project
  const handleNewProject = useCallback(() => {
    if (elements.length > 0) {
      if (!window.confirm("Create a new project? Unsaved changes will be lost.")) {
        return;
      }
    }
    newProject();
  }, [elements.length, newProject]);

  // Handle canvas size change
  const handleCanvasSizeChange = useCallback((size: CanvasSize) => {
    setCanvasSize(size);
  }, [setCanvasSize]);

  // Keyboard shortcuts
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

      // Save: Ctrl+S
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        if (currentProjectId) {
          saveProject();
        } else {
          handleSaveProjectClick();
        }
        return;
      }

      // Open: Ctrl+O
      if ((e.ctrlKey || e.metaKey) && e.key === "o") {
        e.preventDefault();
        handleLoadProjectClick();
        return;
      }

      // Undo: Ctrl+Z
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        undo();
        return;
      }

      // Redo: Ctrl+Shift+Z or Ctrl+Y
      if ((e.ctrlKey || e.metaKey) && (e.key === "Z" || e.key === "y" || (e.key === "z" && e.shiftKey))) {
        e.preventDefault();
        redo();
        return;
      }

      // Scale up: Ctrl/Cmd + Plus
      if ((e.ctrlKey || e.metaKey) && (e.key === "+" || e.key === "=")) {
        e.preventDefault();
        if (selectedId) {
          resizeSelectedElement(1.1);
        }
        return;
      }

      // Scale down: Ctrl/Cmd + Minus
      if ((e.ctrlKey || e.metaKey) && (e.key === "-" || e.key === "_")) {
        e.preventDefault();
        if (selectedId) {
          resizeSelectedElement(0.9);
        }
        return;
      }

      if ((e.key === "Delete" || e.key === "Backspace") && selectedId) {
        e.preventDefault();
        deleteSelected();
      }

      if (e.key === "Escape") {
        if (textDialogOpen) {
          setTextDialogOpen(false);
        } else if (projectDialogOpen) {
          setProjectDialogOpen(false);
        } else if (canvasSizeDialogOpen) {
          setCanvasSizeDialogOpen(false);
        } else {
          selectElement(null);
        }
      }

      if (selectedId && ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
        e.preventDefault();
        const step = e.shiftKey ? 10 : 1;
        switch (e.key) {
          case "ArrowUp":
            moveElement(selectedId, 0, -step);
            break;
          case "ArrowDown":
            moveElement(selectedId, 0, step);
            break;
          case "ArrowLeft":
            moveElement(selectedId, -step, 0);
            break;
          case "ArrowRight":
            moveElement(selectedId, step, 0);
            break;
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [
    selectedId, deleteSelected, selectElement, moveElement, 
    textDialogOpen, projectDialogOpen, canvasSizeDialogOpen,
    undo, redo, resizeSelectedElement, saveProject, currentProjectId,
    handleSaveProjectClick, handleLoadProjectClick
  ]);

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Toolbar
        hasSelection={!!selectedId}
        canUndo={canUndo}
        canRedo={canRedo}
        currentSize={canvasSettings.canvasSize}
        projectName={currentProjectName}
        onAddText={handleAddText}
        onAddImage={handleAddImage}
        onDelete={deleteSelected}
        onClearCanvas={handleClearCanvas}
        onExport={handleExport}
        onUndo={undo}
        onRedo={redo}
        onSaveProject={handleSaveProjectClick}
        onLoadProject={handleLoadProjectClick}
        onCanvasSize={() => setCanvasSizeDialogOpen(true)}
      />

      {/* Desktop Layout */}
      <div className="flex-1 hidden md:flex overflow-hidden">
        <PropertiesPanel
          element={selectedElement}
          canvasSettings={canvasSettings}
          onUpdate={updateElement}
          onUpdateCanvasSettings={updateCanvasSettings}
          onEditText={handleEditText}
        />

        <Canvas
          elements={elements}
          selectedId={selectedId}
          backgroundColor={canvasSettings.backgroundColor}
          canvasSize={canvasSettings.canvasSize}
          onSelect={selectElement}
          onPositionChange={updateElementPosition}
          onRotationChange={updateElementRotation}
          onSizeChange={updateElementSize}
          onWidthChange={updateElementWidth}
          onInteractionStart={saveInteractionSnapshot}
          onInteractionEnd={commitInteraction}
          onDoubleClickText={handleDoubleClickText}
          onDropImage={handleAddImage}
        />

        <LayersPanel
          elements={elements}
          selectedId={selectedId}
          onSelect={selectElement}
          onBringToFront={bringToFront}
          onSendToBack={sendToBack}
          onMoveUp={moveLayerUp}
          onMoveDown={moveLayerDown}
        />
      </div>

      {/* Mobile Layout */}
      <div className="flex-1 flex flex-col md:hidden overflow-hidden">
        <Canvas
          elements={elements}
          selectedId={selectedId}
          backgroundColor={canvasSettings.backgroundColor}
          canvasSize={canvasSettings.canvasSize}
          onSelect={selectElement}
          onPositionChange={updateElementPosition}
          onRotationChange={updateElementRotation}
          onSizeChange={updateElementSize}
          onWidthChange={updateElementWidth}
          onInteractionStart={saveInteractionSnapshot}
          onInteractionEnd={commitInteraction}
          onDoubleClickText={handleDoubleClickText}
          onDropImage={handleAddImage}
          isMobile={true}
        />

        <MobilePanel
          element={selectedElement}
          elements={elements}
          selectedId={selectedId}
          canvasSettings={canvasSettings}
          onUpdate={updateElement}
          onUpdateCanvasSettings={updateCanvasSettings}
          onEditText={handleEditText}
          onSelect={selectElement}
          onBringToFront={bringToFront}
          onSendToBack={sendToBack}
          onMoveUp={moveLayerUp}
          onMoveDown={moveLayerDown}
        />
      </div>

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
        onSizeChange={handleCanvasSizeChange}
      />
    </div>
  );
}

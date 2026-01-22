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
import { ExportDialog } from "./dialogs/ExportDialog";
import { MobilePanel } from "./panels/MobilePanel";
import { TextElement, TextFormData, CanvasElement, ImageElement, ShapeElement, GroupElement, CanvasSize, ShapeType } from "@/types/canvas";

export function PosterBuilder() {
  const {
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
    deleteSelected,
    copyElement,
    pasteElement,
    duplicateElement,
    hasClipboard,
    selectElement,
    toggleElementSelection,
    groupElements,
    ungroupElements,
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
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
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

  const handleAddShape = useCallback(
    (shapeType: ShapeType) => {
      addShapeElement(shapeType);
    },
    [addShapeElement]
  );

  const handleClearCanvas = useCallback(() => {
    if (elements.length === 0) return;
    if (window.confirm("Are you sure you want to clear the canvas?")) {
      clearCanvas();
    }
  }, [elements.length, clearCanvas]);

  const handleExport = useCallback((scale: number = 2) => {
    selectElement(null);

    const { width, height } = canvasSettings.canvasSize;
    const exportCanvas = document.createElement("canvas");
    
    // Create high-resolution canvas
    exportCanvas.width = width * scale;
    exportCanvas.height = height * scale;
    const ctx = exportCanvas.getContext("2d")!;
    
    // Scale the context to draw at higher resolution
    ctx.scale(scale, scale);
    
    // Enable high-quality image rendering
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    ctx.fillStyle = canvasSettings.backgroundColor;
    ctx.fillRect(0, 0, width, height);

    // Get IDs of elements that are children of groups
    const groupChildIds = new Set<string>();
    elements.forEach(el => {
      if (el.type === "group") {
        el.childIds.forEach(id => groupChildIds.add(id));
      }
    });

    // Filter out group children from top-level rendering and sort by zIndex
    const sortedElements = [...elements]
      .filter(el => !groupChildIds.has(el.id))
      .sort((a, b) => a.zIndex - b.zIndex);
    
    // Collect all image elements (including those inside groups) for preloading
    const allImageElements = elements.filter((el) => el.type === "image");
    
    const loadImages = async () => {
      const imageMap = new Map<string, HTMLImageElement>();
      
      await Promise.all(
        allImageElements.map((element) => {
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

      // Helper function to draw shapes
      const drawShape = (element: ShapeElement) => {
        const { size, shapeType, fillColor, strokeColor, strokeWidth, borderRadius, points, position } = element;
        const { width: shapeWidth, height: shapeHeight } = size;

        ctx.fillStyle = fillColor;
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = strokeWidth;
        ctx.lineJoin = "round";
        ctx.lineCap = "round";

        // Helper function to scale points to fit current size
        const getScaledPoints = (pts: typeof points) => {
          if (!pts || pts.length === 0) return [];
          
          // Find the bounding box of the original points
          const minX = Math.min(...pts.map(p => p.x));
          const maxX = Math.max(...pts.map(p => p.x));
          const minY = Math.min(...pts.map(p => p.y));
          const maxY = Math.max(...pts.map(p => p.y));
          
          const originalWidth = maxX - minX || 1;
          const originalHeight = maxY - minY || 1;
          
          // Scale points to fit current size
          return pts.map(p => ({
            x: ((p.x - minX) / originalWidth) * shapeWidth,
            y: ((p.y - minY) / originalHeight) * shapeHeight
          }));
        };

        switch (shapeType) {
          case "rectangle":
            if (borderRadius > 0) {
              // Draw rounded rectangle
              const r = Math.min(borderRadius, shapeWidth / 2, shapeHeight / 2);
              ctx.beginPath();
              ctx.moveTo(position.x + r, position.y);
              ctx.lineTo(position.x + shapeWidth - r, position.y);
              ctx.quadraticCurveTo(position.x + shapeWidth, position.y, position.x + shapeWidth, position.y + r);
              ctx.lineTo(position.x + shapeWidth, position.y + shapeHeight - r);
              ctx.quadraticCurveTo(position.x + shapeWidth, position.y + shapeHeight, position.x + shapeWidth - r, position.y + shapeHeight);
              ctx.lineTo(position.x + r, position.y + shapeHeight);
              ctx.quadraticCurveTo(position.x, position.y + shapeHeight, position.x, position.y + shapeHeight - r);
              ctx.lineTo(position.x, position.y + r);
              ctx.quadraticCurveTo(position.x, position.y, position.x + r, position.y);
              ctx.closePath();
              ctx.fill();
              if (strokeWidth > 0) ctx.stroke();
            } else {
              ctx.fillRect(position.x, position.y, shapeWidth, shapeHeight);
              if (strokeWidth > 0) ctx.strokeRect(position.x, position.y, shapeWidth, shapeHeight);
            }
            break;

          case "circle":
            const radius = Math.min(shapeWidth, shapeHeight) / 2;
            ctx.beginPath();
            ctx.arc(position.x + shapeWidth / 2, position.y + shapeHeight / 2, radius, 0, Math.PI * 2);
            ctx.fill();
            if (strokeWidth > 0) ctx.stroke();
            break;

          case "ellipse":
            ctx.beginPath();
            ctx.ellipse(
              position.x + shapeWidth / 2,
              position.y + shapeHeight / 2,
              shapeWidth / 2,
              shapeHeight / 2,
              0,
              0,
              Math.PI * 2
            );
            ctx.fill();
            if (strokeWidth > 0) ctx.stroke();
            break;

          case "line":
            ctx.beginPath();
            if (points && points.length >= 2) {
              const scaledPts = getScaledPoints(points);
              ctx.moveTo(position.x + scaledPts[0].x, position.y + scaledPts[0].y);
              ctx.lineTo(position.x + scaledPts[1].x, position.y + scaledPts[1].y);
            } else {
              ctx.moveTo(position.x, position.y + shapeHeight / 2);
              ctx.lineTo(position.x + shapeWidth, position.y + shapeHeight / 2);
            }
            ctx.lineWidth = Math.max(strokeWidth, 2);
            ctx.stroke();
            break;

          case "triangle":
            ctx.beginPath();
            if (points && points.length >= 3) {
              const scaledPts = getScaledPoints(points);
              ctx.moveTo(position.x + scaledPts[0].x, position.y + scaledPts[0].y);
              ctx.lineTo(position.x + scaledPts[1].x, position.y + scaledPts[1].y);
              ctx.lineTo(position.x + scaledPts[2].x, position.y + scaledPts[2].y);
            } else {
              ctx.moveTo(position.x + shapeWidth / 2, position.y);
              ctx.lineTo(position.x, position.y + shapeHeight);
              ctx.lineTo(position.x + shapeWidth, position.y + shapeHeight);
            }
            ctx.closePath();
            ctx.fill();
            if (strokeWidth > 0) ctx.stroke();
            break;

          case "polygon":
            if (points && points.length >= 3) {
              const scaledPts = getScaledPoints(points);
              ctx.beginPath();
              ctx.moveTo(position.x + scaledPts[0].x, position.y + scaledPts[0].y);
              for (let i = 1; i < scaledPts.length; i++) {
                ctx.lineTo(position.x + scaledPts[i].x, position.y + scaledPts[i].y);
              }
              ctx.closePath();
              ctx.fill();
              if (strokeWidth > 0) ctx.stroke();
            } else {
              // Default pentagon
              const sides = 5;
              const cx = shapeWidth / 2;
              const cy = shapeHeight / 2;
              const r = Math.min(shapeWidth, shapeHeight) / 2;
              ctx.beginPath();
              for (let i = 0; i < sides; i++) {
                const angle = (i * 2 * Math.PI) / sides - Math.PI / 2;
                const px = position.x + cx + r * Math.cos(angle);
                const py = position.y + cy + r * Math.sin(angle);
                if (i === 0) ctx.moveTo(px, py);
                else ctx.lineTo(px, py);
              }
              ctx.closePath();
              ctx.fill();
              if (strokeWidth > 0) ctx.stroke();
            }
            break;
        }
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
        } else if (element.type === "shape") {
          const centerX = element.position.x + element.size.width / 2;
          const centerY = element.position.y + element.size.height / 2;

          ctx.translate(centerX, centerY);
          ctx.rotate((element.rotation * Math.PI) / 180);
          ctx.translate(-centerX, -centerY);

          drawShape(element);
        } else if (element.type === "group") {
          // Draw group: apply group transform and then draw each child
          const groupCenterX = element.position.x + element.size.width / 2;
          const groupCenterY = element.position.y + element.size.height / 2;

          ctx.translate(groupCenterX, groupCenterY);
          ctx.rotate((element.rotation * Math.PI) / 180);
          ctx.translate(-groupCenterX, -groupCenterY);

          // Draw each child element within the group
          element.childIds.forEach(childId => {
            const childElement = elements.find(el => el.id === childId);
            if (!childElement) return;

            ctx.save();
            
            // Child position is relative to group position
            const childAbsX = element.position.x + childElement.position.x;
            const childAbsY = element.position.y + childElement.position.y;

            if (childElement.type === "text") {
              const fontStyle = childElement.fontStyle || "normal";
              ctx.font = `${fontStyle} ${childElement.fontWeight} ${childElement.fontSize}px ${childElement.fontFamily}`;
              
              const textWidth = childElement.width - 24;
              const paragraphs = childElement.content.split("\n");
              const allLines: string[] = [];
              paragraphs.forEach((para) => {
                if (para === '') {
                  allLines.push('');
                } else {
                  const wrapped = wrapText(para, textWidth);
                  allLines.push(...wrapped);
                }
              });
              
              const lineHeight = childElement.fontSize * 1.2;
              const textHeight = allLines.length * lineHeight;
              const centerX = childAbsX + childElement.width / 2;
              const centerY = childAbsY + 8 + textHeight / 2;

              ctx.translate(centerX, centerY);
              ctx.rotate((childElement.rotation * Math.PI) / 180);
              ctx.translate(-centerX, -centerY);

              ctx.fillStyle = childElement.color;
              ctx.textBaseline = "top";
              
              const textAlign = childElement.textAlign || "left";
              let y = childAbsY + 8;
              allLines.forEach((line) => {
                let x = childAbsX + 12;
                if (textAlign === "center") {
                  const lineWidth = ctx.measureText(line).width;
                  x = childAbsX + (childElement.width - lineWidth) / 2;
                } else if (textAlign === "right") {
                  const lineWidth = ctx.measureText(line).width;
                  x = childAbsX + childElement.width - lineWidth - 12;
                }
                ctx.fillText(line, x, y);
                y += lineHeight;
              });
            } else if (childElement.type === "image") {
              const img = imageMap.get(childElement.id);
              if (img) {
                const centerX = childAbsX + childElement.size.width / 2;
                const centerY = childAbsY + childElement.size.height / 2;

                ctx.translate(centerX, centerY);
                ctx.rotate((childElement.rotation * Math.PI) / 180);
                ctx.translate(-centerX, -centerY);

                ctx.drawImage(
                  img,
                  childAbsX,
                  childAbsY,
                  childElement.size.width,
                  childElement.size.height
                );
              }
            } else if (childElement.type === "shape") {
              const centerX = childAbsX + childElement.size.width / 2;
              const centerY = childAbsY + childElement.size.height / 2;

              ctx.translate(centerX, centerY);
              ctx.rotate((childElement.rotation * Math.PI) / 180);
              ctx.translate(-centerX, -centerY);

              // Draw shape at absolute position
              const shapeWithAbsPos = {
                ...childElement,
                position: { x: childAbsX, y: childAbsY }
              };
              drawShape(shapeWithAbsPos);
            }
            
            ctx.restore();
          });
        }

        ctx.restore();
      });

      const link = document.createElement("a");
      const resolution = scale > 1 ? `_${width * scale}x${height * scale}` : '';
      link.download = `${currentProjectName.replace(/[^a-z0-9]/gi, '_')}${resolution}.png`;
      link.href = exportCanvas.toDataURL("image/png", 1.0);
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

      // Copy: Ctrl+C
      if ((e.ctrlKey || e.metaKey) && e.key === "c") {
        e.preventDefault();
        copyElement();
        return;
      }

      // Paste: Ctrl+V
      if ((e.ctrlKey || e.metaKey) && e.key === "v") {
        e.preventDefault();
        pasteElement();
        return;
      }

      // Duplicate: Ctrl+D
      if ((e.ctrlKey || e.metaKey) && e.key === "d") {
        e.preventDefault();
        duplicateElement();
        return;
      }

      // Group: Ctrl+G
      if ((e.ctrlKey || e.metaKey) && e.key === "g" && !e.shiftKey) {
        e.preventDefault();
        groupElements();
        return;
      }

      // Ungroup: Ctrl+Shift+G
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === "G" || e.key === "g")) {
        e.preventDefault();
        ungroupElements();
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
        } else if (exportDialogOpen) {
          setExportDialogOpen(false);
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
    selectedId, selectedIds, deleteSelected, selectElement, moveElement, 
    textDialogOpen, projectDialogOpen, canvasSizeDialogOpen, exportDialogOpen,
    undo, redo, resizeSelectedElement, saveProject, currentProjectId,
    handleSaveProjectClick, handleLoadProjectClick,
    copyElement, pasteElement, duplicateElement, groupElements, ungroupElements
  ]);

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
        onAddText={handleAddText}
        onAddImage={handleAddImage}
        onAddShape={handleAddShape}
        onCopy={copyElement}
        onPaste={pasteElement}
        onDelete={deleteSelected}
        onGroup={groupElements}
        onUngroup={ungroupElements}
        onClearCanvas={handleClearCanvas}
        onExport={() => setExportDialogOpen(true)}
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
          selectedCount={selectedIds.length}
          canvasSettings={canvasSettings}
          onUpdate={updateElement}
          onUpdateCanvasSettings={updateCanvasSettings}
          onEditText={handleEditText}
          onGroup={groupElements}
          onUngroup={ungroupElements}
        />

        <Canvas
          elements={elements}
          selectedId={selectedId}
          selectedIds={selectedIds}
          backgroundColor={canvasSettings.backgroundColor}
          canvasSize={canvasSettings.canvasSize}
          onSelect={selectElement}
          onToggleSelect={toggleElementSelection}
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
          selectedIds={selectedIds}
          backgroundColor={canvasSettings.backgroundColor}
          canvasSize={canvasSettings.canvasSize}
          onSelect={selectElement}
          onToggleSelect={toggleElementSelection}
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
          selectedCount={selectedIds.length}
          canvasSettings={canvasSettings}
          onUpdate={updateElement}
          onUpdateCanvasSettings={updateCanvasSettings}
          onEditText={handleEditText}
          onSelect={selectElement}
          onBringToFront={bringToFront}
          onSendToBack={sendToBack}
          onMoveUp={moveLayerUp}
          onMoveDown={moveLayerDown}
          onGroup={groupElements}
          onUngroup={ungroupElements}
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

      <ExportDialog
        open={exportDialogOpen}
        onOpenChange={setExportDialogOpen}
        canvasSize={canvasSettings.canvasSize}
        onExport={handleExport}
      />
    </div>
  );
}

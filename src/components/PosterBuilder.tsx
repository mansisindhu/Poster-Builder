"use client";

import React, { useState, useCallback, useEffect } from "react";
import { useCanvas } from "@/lib/useCanvas";
import { Toolbar } from "./toolbar/Toolbar";
import { Canvas } from "./canvas/Canvas";
import { PropertiesPanel } from "./panels/PropertiesPanel";
import { LayersPanel } from "./panels/LayersPanel";
import { TextEditDialog } from "./dialogs/TextEditDialog";
import { MobilePanel } from "./panels/MobilePanel";
import { TextElement, TextFormData, CanvasElement, ImageElement } from "@/types/canvas";

export function PosterBuilder() {
  const {
    elements,
    selectedElement,
    selectedId,
    canvasRef,
    canvasSettings,
    updateCanvasSettings,
    addTextElement,
    addImageElement,
    updateElement,
    updateElementPosition,
    deleteSelected,
    selectElement,
    clearCanvas,
    moveElement,
    bringToFront,
    sendToBack,
    moveLayerUp,
    moveLayerDown,
  } = useCanvas();

  const [textDialogOpen, setTextDialogOpen] = useState(false);
  const [editingTextElement, setEditingTextElement] = useState<TextElement | null>(null);

  // Handle adding a new text element
  const handleAddText = useCallback(() => {
    setEditingTextElement(null);
    setTextDialogOpen(true);
  }, []);

  // Handle editing existing text element
  const handleEditText = useCallback((element: TextElement) => {
    setEditingTextElement(element);
    setTextDialogOpen(true);
  }, []);

  // Handle saving text from dialog
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

  // Handle image upload
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

  // Handle clearing canvas with confirmation
  const handleClearCanvas = useCallback(() => {
    if (elements.length === 0) return;
    if (window.confirm("Are you sure you want to clear the canvas?")) {
      clearCanvas();
    }
  }, [elements.length, clearCanvas]);

  // Handle export
  const handleExport = useCallback(() => {
    selectElement(null); // Deselect to hide selection outlines

    const exportCanvas = document.createElement("canvas");
    exportCanvas.width = 800;
    exportCanvas.height = 600;
    const ctx = exportCanvas.getContext("2d")!;

    // Fill background with canvas background color
    ctx.fillStyle = canvasSettings.backgroundColor;
    ctx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);

    // Sort elements by zIndex for correct rendering order
    const sortedElements = [...elements].sort((a, b) => a.zIndex - b.zIndex);
    const imageElements = sortedElements.filter((el) => el.type === "image");
    
    // Load all images first, then draw everything in order
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

      // Draw all elements in z-index order
      sortedElements.forEach((element) => {
        if (element.type === "text") {
          ctx.font = `${element.fontWeight} ${element.fontSize}px ${element.fontFamily}`;
          ctx.fillStyle = element.color;
          ctx.textBaseline = "top";

          const lines = element.content.split("\n");
          let y = element.position.y + 8;
          lines.forEach((line) => {
            ctx.fillText(line, element.position.x + 12, y);
            y += element.fontSize * 1.2;
          });
        } else if (element.type === "image") {
          const img = imageMap.get(element.id);
          if (img) {
            ctx.drawImage(
              img,
              element.position.x,
              element.position.y,
              element.size.width,
              element.size.height
            );
          }
        }
      });

      const link = document.createElement("a");
      link.download = "poster.png";
      link.href = exportCanvas.toDataURL("image/png");
      link.click();
    };

    loadImages();
  }, [elements, selectElement, canvasSettings.backgroundColor]);

  // Handle size change for images
  const handleSizeChange = useCallback(
    (id: string, width: number, height: number) => {
      updateElement(id, { size: { width, height } } as Partial<ImageElement>);
    },
    [updateElement]
  );

  // Handle double click on text elements
  const handleDoubleClickText = useCallback(
    (element: CanvasElement) => {
      if (element.type === "text") {
        handleEditText(element);
      }
    },
    [handleEditText]
  );

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

      if ((e.key === "Delete" || e.key === "Backspace") && selectedId) {
        e.preventDefault();
        deleteSelected();
      }

      if (e.key === "Escape") {
        if (textDialogOpen) {
          setTextDialogOpen(false);
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
  }, [selectedId, deleteSelected, selectElement, moveElement, textDialogOpen]);

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Toolbar
        hasSelection={!!selectedId}
        onAddText={handleAddText}
        onAddImage={handleAddImage}
        onDelete={deleteSelected}
        onClearCanvas={handleClearCanvas}
        onExport={handleExport}
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
          canvasRef={canvasRef as React.RefObject<HTMLDivElement>}
          backgroundColor={canvasSettings.backgroundColor}
          onSelect={selectElement}
          onPositionChange={updateElementPosition}
          onSizeChange={handleSizeChange}
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
          canvasRef={canvasRef as React.RefObject<HTMLDivElement>}
          backgroundColor={canvasSettings.backgroundColor}
          onSelect={selectElement}
          onPositionChange={updateElementPosition}
          onSizeChange={handleSizeChange}
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
    </div>
  );
}
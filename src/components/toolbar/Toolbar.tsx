"use client";

import React, { useRef } from "react";
import { Button } from "@/components/ui/button";
import { 
  Type, Image, Trash2, Download, RefreshCw, Undo2, Redo2, 
  Save, FolderOpen, FileImage, Settings2 
} from "lucide-react";
import { CanvasSize } from "@/types/canvas";

interface ToolbarProps {
  hasSelection: boolean;
  canUndo: boolean;
  canRedo: boolean;
  currentSize: CanvasSize;
  projectName: string;
  onAddText: () => void;
  onAddImage: (file: File) => void;
  onDelete: () => void;
  onClearCanvas: () => void;
  onExport: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onSaveProject: () => void;
  onLoadProject: () => void;
  onCanvasSize: () => void;
}

export function Toolbar({
  hasSelection,
  canUndo,
  canRedo,
  currentSize,
  projectName,
  onAddText,
  onAddImage,
  onDelete,
  onClearCanvas,
  onExport,
  onUndo,
  onRedo,
  onSaveProject,
  onLoadProject,
  onCanvasSize,
}: ToolbarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onAddImage(file);
      e.target.value = "";
    }
  };

  return (
    <header className="flex items-center justify-between px-2 md:px-4 py-2 bg-background border-b gap-1 md:gap-2 flex-wrap">
      {/* Logo and project name */}
      <div className="hidden sm:flex items-center gap-2 flex-shrink-0 min-w-0">
        <h1 className="text-lg font-bold text-primary whitespace-nowrap">Poster Builder</h1>
        <span className="text-muted-foreground hidden lg:inline">|</span>
        <span className="text-sm text-muted-foreground truncate max-w-[150px] hidden lg:inline" title={projectName}>
          {projectName}
        </span>
      </div>

      {/* File actions */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={onLoadProject}
          className="px-2"
          title="Open Project"
        >
          <FolderOpen className="w-4 h-4" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={onSaveProject}
          className="px-2"
          title="Save Project (Ctrl+S)"
        >
          <Save className="w-4 h-4" />
        </Button>

        <div className="w-px h-5 bg-border mx-1 hidden sm:block" />

        {/* Undo/Redo */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onUndo}
          disabled={!canUndo}
          className="px-2"
          title="Undo (Ctrl+Z)"
        >
          <Undo2 className="w-4 h-4" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={onRedo}
          disabled={!canRedo}
          className="px-2"
          title="Redo (Ctrl+Shift+Z)"
        >
          <Redo2 className="w-4 h-4" />
        </Button>
      </div>

      {/* Main actions */}
      <div className="flex items-center gap-1">
        <div className="w-px h-5 bg-border mx-1 hidden sm:block" />

        <Button variant="outline" size="sm" onClick={onAddText} className="px-2 md:px-3">
          <Type className="w-4 h-4 md:mr-2" />
          <span className="hidden md:inline">Text</span>
        </Button>

        <Button variant="outline" size="sm" onClick={handleImageClick} className="px-2 md:px-3">
          <Image className="w-4 h-4 md:mr-2" />
          <span className="hidden md:inline">Image</span>
        </Button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />

        <Button
          variant="outline"
          size="sm"
          onClick={onDelete}
          disabled={!hasSelection}
          className="px-2 md:px-3"
          title="Delete (Del)"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>

      {/* Canvas and export */}
      <div className="flex items-center gap-1">
        <div className="w-px h-5 bg-border mx-1 hidden sm:block" />

        <Button
          variant="ghost"
          size="sm"
          onClick={onCanvasSize}
          className="px-2 text-xs"
          title="Change Canvas Size"
        >
          <Settings2 className="w-4 h-4 md:mr-1" />
          <span className="hidden md:inline">{currentSize.width}×{currentSize.height}</span>
        </Button>

        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onClearCanvas} 
          className="px-2"
          title="Clear Canvas"
        >
          <RefreshCw className="w-4 h-4" />
        </Button>

        <Button size="sm" onClick={onExport} className="px-2 md:px-3">
          <Download className="w-4 h-4 md:mr-2" />
          <span className="hidden sm:inline">Export</span>
        </Button>
      </div>
    </header>
  );
}

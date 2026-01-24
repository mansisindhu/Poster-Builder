"use client";

import React, { useRef, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Type, Image as ImageIcon, Trash2, Download, RefreshCw, Undo2, Redo2,
  Save, FolderOpen, FileImage, Settings2,
  Shapes, ChevronDown,
  Copy, Clipboard, Group, Ungroup, HelpCircle
} from "lucide-react";
import { CanvasSize, ShapeType } from "@/types/canvas";
import { cn } from "@/lib/utils";
import { SHAPE_LABELS, SHAPE_ICONS } from "@/lib/constants";

interface ToolbarProps {
  hasSelection: boolean;
  selectedCount: number;
  isGroupSelected: boolean;
  canUndo: boolean;
  canRedo: boolean;
  canPaste: boolean;
  currentSize: CanvasSize;
  projectName: string;
  onAddText: () => void;
  onAddImage: (file: File) => void;
  onAddShape: (shapeType: ShapeType) => void;
  onCopy: () => void;
  onPaste: () => void;
  onDelete: () => void;
  onGroup: () => void;
  onUngroup: () => void;
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
  selectedCount,
  isGroupSelected,
  canUndo,
  canRedo,
  canPaste,
  currentSize,
  projectName,
  onAddText,
  onAddImage,
  onAddShape,
  onCopy,
  onPaste,
  onDelete,
  onGroup,
  onUngroup,
  onClearCanvas,
  onExport,
  onUndo,
  onRedo,
  onSaveProject,
  onLoadProject,
  onCanvasSize,
}: ToolbarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [shapeMenuOpen, setShapeMenuOpen] = useState(false);

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

  const handleAddShape = (shapeType: ShapeType) => {
    onAddShape(shapeType);
    setShapeMenuOpen(false);
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
          <ImageIcon className="w-4 h-4 md:mr-2" />
          <span className="hidden md:inline">Image</span>
        </Button>

        {/* Shape dropdown */}
        <div className="relative">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShapeMenuOpen(!shapeMenuOpen)}
            className="px-2 md:px-3"
          >
            <Shapes className="w-4 h-4 md:mr-2" />
            <span className="hidden md:inline">Shape</span>
            <ChevronDown className="w-3 h-3 ml-1" />
          </Button>
          
          {shapeMenuOpen && (
            <>
              {/* Backdrop */}
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setShapeMenuOpen(false)}
              />
              
              {/* Dropdown menu */}
              <div className="absolute top-full left-0 mt-1 bg-background border rounded-md shadow-lg z-50 min-w-[140px] py-1">
                {(Object.keys(SHAPE_LABELS) as ShapeType[]).map((shapeType) => (
                  <button
                    key={shapeType}
                    className={cn(
                      "flex items-center gap-2 w-full px-3 py-2 text-sm text-left",
                      "hover:bg-muted transition-colors"
                    )}
                    onClick={() => handleAddShape(shapeType)}
                  >
                    {SHAPE_ICONS[shapeType]}
                    {SHAPE_LABELS[shapeType]}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

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
          onClick={onCopy}
          disabled={!hasSelection}
          className="px-2"
          title="Copy (Ctrl+C)"
        >
          <Copy className="w-4 h-4" />
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={onPaste}
          disabled={!canPaste}
          className="px-2"
          title="Paste (Ctrl+V)"
        >
          <Clipboard className="w-4 h-4" />
        </Button>

        {/* Group/Ungroup buttons */}
        {selectedCount >= 2 && (
          <Button
            variant="outline"
            size="sm"
            onClick={onGroup}
            className="px-2 md:px-3"
            title="Group (Ctrl+G)"
          >
            <Group className="w-4 h-4 md:mr-2" />
            <span className="hidden md:inline">Group</span>
          </Button>
        )}

        {isGroupSelected && (
          <Button
            variant="outline"
            size="sm"
            onClick={onUngroup}
            className="px-2 md:px-3"
            title="Ungroup (Ctrl+Shift+G)"
          >
            <Ungroup className="w-4 h-4 md:mr-2" />
            <span className="hidden md:inline">Ungroup</span>
          </Button>
        )}

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

        <Link href="/guide">
          <Button
            variant="ghost"
            size="sm"
            className="px-2"
            title="Help & Guide"
          >
            <HelpCircle className="w-4 h-4" />
          </Button>
        </Link>

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
